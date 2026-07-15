const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');

// Pricing plans are static / seeded data
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      plans: [
        { id: 'daily', name: 'Daily Plan', tagline: 'Best for short city rides or quick errands.', from: 250, unit: 'day', features: ['Cars, Bikes, Activas, Taxis', 'Flexible pickup & drop', 'Fuel not included'] },
        { id: 'weekly', name: 'Weekly Plan', tagline: 'Perfect for tourists and business trips.', from: 1500, unit: 'week', features: ['Discounted rates', 'Unlimited kilometers option', '24/7 support'], recommended: true },
        { id: 'monthly', name: 'Monthly Plan', tagline: 'Ideal for long-term rental needs.', from: 4500, unit: 'month', features: ['Best value pricing', 'Free service & maintenance', 'Option to swap vehicles'] },
      ],
      table: [
        { type: 'Cars', daily: 1200, weekly: 7000, monthly: 20000 },
        { type: 'Bikes', daily: 300, weekly: 1500, monthly: 4500 },
        { type: 'Activas', daily: 280, weekly: 1400, monthly: 4000 },
        { type: 'Taxis (with driver)', daily: '₹15/km', weekly: 'Custom', monthly: 'Custom' },
      ],
    },
  });
});

// GET /owner-suggestions - Fetch pricing suggestions for owner vehicles
router.get('/owner-suggestions', protect, roleGuard('owner', 'admin'), async (req, res) => {
  try {
    const ownerId = req.user.id;
    const vehicles = await Vehicle.find({ owner: ownerId });
    const suggestions = [];

    const isWeekend = [0, 6].includes(new Date().getDay());
    const currentMonth = new Date().getMonth();
    const holidayMonths = [4, 9, 11]; // May, Oct, Dec

    for (let vehicle of vehicles) {
      let multiplier = 1.0;
      let reasons = [];

      // 1. Weekend surge
      if (isWeekend) {
        multiplier += 0.10;
        reasons.push("Weekend demand (+10%)");
      }

      // 2. City demand
      if (vehicle.city === 'surat') {
        multiplier += 0.15;
        reasons.push("Surat high demand (+15%)");
      } else if (vehicle.city === 'ahmedabad') {
        multiplier += 0.10;
        reasons.push("Ahmedabad demand (+10%)");
      } else if (vehicle.city === 'rajkot') {
        multiplier -= 0.05;
        reasons.push("Rajkot lower demand (-5%)");
      }

      // 3. Occupancy calculation
      const cityVehicles = await Vehicle.find({ city: vehicle.city });
      const cityVehicleIds = cityVehicles.map(v => v._id);
      const activeBookingsCount = await Booking.countDocuments({
        vehicle: { $in: cityVehicleIds },
        status: { $in: ['confirmed', 'active'] }
      });
      const occupancyRate = cityVehicles.length > 0 ? (activeBookingsCount / cityVehicles.length) : 0.4;
      if (occupancyRate > 0.6) {
        multiplier += 0.15;
        reasons.push(`High city fleet occupancy (${Math.round(occupancyRate * 100)}%) (+15%)`);
      } else if (occupancyRate < 0.25) {
        multiplier -= 0.10;
        reasons.push(`Low city fleet occupancy (${Math.round(occupancyRate * 100)}%) (-10%)`);
      } else {
        reasons.push(`Stable occupancy levels (${Math.round(occupancyRate * 100)}%)`);
      }

      // 4. Seasonal holiday surge
      if (holidayMonths.includes(currentMonth)) {
        multiplier += 0.10;
        reasons.push("Seasonal holiday travel (+10%)");
      }

      // Calculate suggested price
      const basePrice = vehicle.smartPricingEnabled 
        ? Math.round((vehicle.smartPricingMinPrice + vehicle.smartPricingMaxPrice) / 2) 
        : vehicle.dailyPrice;
      
      let recommendedPrice = Math.round((basePrice || 1000) * multiplier);

      // If smart pricing is active, automatically adjust the price in db within min and max boundaries
      if (vehicle.smartPricingEnabled) {
        const min = vehicle.smartPricingMinPrice || 0;
        const max = vehicle.smartPricingMaxPrice || Infinity;
        const clampedPrice = Math.min(Math.max(recommendedPrice, min), max);
        if (clampedPrice !== vehicle.dailyPrice) {
          vehicle.dailyPrice = clampedPrice;
          await vehicle.save();
        }
      }

      suggestions.push({
        vehicleId: vehicle._id,
        brand: vehicle.brand,
        model: vehicle.model,
        vehicleNumber: vehicle.vehicleNumber,
        city: vehicle.city,
        dailyPrice: vehicle.dailyPrice,
        recommendedPrice,
        reasons,
        smartPricingEnabled: vehicle.smartPricingEnabled,
        smartPricingMinPrice: vehicle.smartPricingMinPrice,
        smartPricingMaxPrice: vehicle.smartPricingMaxPrice,
        occupancyRate: Math.round(occupancyRate * 100)
      });
    }

    res.json({
      success: true,
      data: suggestions
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// PUT /toggle-smart - Update Smart Pricing settings for a vehicle
router.put('/toggle-smart', protect, roleGuard('owner', 'admin'), async (req, res) => {
  try {
    const { vehicleId, enabled, minPrice, maxPrice } = req.body;
    const vehicle = await Vehicle.findOne({ _id: vehicleId, owner: req.user.id });

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    vehicle.smartPricingEnabled = enabled;
    vehicle.smartPricingMinPrice = minPrice || 0;
    vehicle.smartPricingMaxPrice = maxPrice || Infinity;

    // Run one check of recommendation to update price immediately if enabled
    if (enabled) {
      let multiplier = 1.0;
      const isWeekend = [0, 6].includes(new Date().getDay());
      const currentMonth = new Date().getMonth();
      const holidayMonths = [4, 9, 11];

      if (isWeekend) multiplier += 0.10;
      if (vehicle.city === 'surat') multiplier += 0.15;
      else if (vehicle.city === 'ahmedabad') multiplier += 0.10;
      else if (vehicle.city === 'rajkot') multiplier -= 0.05;

      const cityVehicles = await Vehicle.find({ city: vehicle.city });
      const cityVehicleIds = cityVehicles.map(v => v._id);
      const activeBookingsCount = await Booking.countDocuments({
        vehicle: { $in: cityVehicleIds },
        status: { $in: ['confirmed', 'active'] }
      });
      const occupancyRate = cityVehicles.length > 0 ? (activeBookingsCount / cityVehicles.length) : 0.4;
      if (occupancyRate > 0.6) multiplier += 0.15;
      else if (occupancyRate < 0.25) multiplier -= 0.10;

      if (holidayMonths.includes(currentMonth)) multiplier += 0.10;

      const basePrice = Math.round((minPrice + maxPrice) / 2);
      const recommendedPrice = Math.round(basePrice * multiplier);
      vehicle.dailyPrice = Math.min(Math.max(recommendedPrice, minPrice), maxPrice);
    }

    await vehicle.save();

    res.json({
      success: true,
      data: vehicle,
      message: enabled ? 'Smart Pricing activated successfully!' : 'Smart Pricing deactivated.'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
