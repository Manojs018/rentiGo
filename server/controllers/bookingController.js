const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { updateUserEcoStats, getDiscountPercentage } = require('../utils/ecoHelper');
const { sendBookingWhatsAppNotification } = require('../utils/whatsapp');


// @desc    Create booking
// @route   POST /api/bookings
// @access  Customer
exports.createBooking = async (req, res) => {
  try {
    const { vehicleId, pickupDate, returnDate, city, rentalPlan, specialRequests, customerName, customerPhone } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    if (vehicle.status === 'In Maintenance') {
      return res.status(400).json({ success: false, message: 'This vehicle is currently in maintenance and cannot be rented.' });
    }
    if (!vehicle.isAvailable) return res.status(400).json({ success: false, message: 'Vehicle is not available' });

    // Calculate pricing
    const pickup = new Date(pickupDate);
    const returnD = new Date(returnDate);

    if (isNaN(pickup.getTime()) || isNaN(returnD.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid pickup or return date' });
    }

    if (returnD <= pickup) {
      return res.status(400).json({ success: false, message: 'Return date must be after pickup date' });
    }

    const durationDays = Math.ceil((returnD - pickup) / (1000 * 60 * 60 * 24)) || 1;

    let baseAmount;
    if (rentalPlan === 'monthly' && vehicle.monthlyPrice) {
      baseAmount = vehicle.monthlyPrice * Math.ceil(durationDays / 30);
    } else if (rentalPlan === 'weekly' && vehicle.weeklyPrice) {
      baseAmount = vehicle.weeklyPrice * Math.ceil(durationDays / 7);
    } else {
      baseAmount = vehicle.dailyPrice * durationDays;
    }

    // Calculate loyalty discount based on customer's eco points
    const userObj = await User.findById(req.user.id);
    const discountPercent = getDiscountPercentage(userObj?.ecoPoints || 0);
    const discountAmount = discountPercent > 0 ? Math.round(baseAmount * (discountPercent / 100)) : 0;
    const netBaseAmount = baseAmount - discountAmount;

    const taxAmount = Math.round(netBaseAmount * 0.18); // 18% GST on discounted amount
    const totalAmount = netBaseAmount + taxAmount;

    const booking = await Booking.create({
      customer: req.user.id,
      vehicle: vehicleId,
      owner: vehicle.owner,
      pickupDate,
      returnDate,
      city,
      rentalPlan,
      durationDays,
      baseAmount,
      discountAmount,
      taxAmount,
      totalAmount,
      specialRequests,
      customerName,
      customerPhone,
      customerEmail: req.user.email,
    });

    await booking.populate(['vehicle', 'owner']);

    // Create notifications
    try {
      await Notification.create({
        user: req.user.id,
        title: 'Booking Requested',
        message: `Your booking request for ${vehicle.brand} ${vehicle.model} has been submitted.`,
        type: 'booking',
        link: '/dashboard'
      });

      await Notification.create({
        user: vehicle.owner,
        title: 'New Booking Request',
        message: `${customerName || req.user.name} has requested to book your ${vehicle.brand} ${vehicle.model}.`,
        type: 'booking',
        link: '/dashboard'
      });
    } catch (err) {
      console.error('Failed to create booking notifications:', err);
    }

    // Trigger non-blocking WhatsApp notification to the vehicle owner
    sendBookingWhatsAppNotification(booking._id, 'requested');

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get customer bookings
// @route   GET /api/bookings/my
// @access  Customer
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user.id })
      .populate('vehicle', 'brand model type fuelType thumbnail city dailyPrice')
      .sort('-createdAt');
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get owner bookings
// @route   GET /api/bookings/owner
// @access  Owner
exports.getOwnerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ owner: req.user.id })
      .populate('vehicle', 'brand model type thumbnail')
      .populate('customer', 'name email phone avatar')
      .sort('-createdAt');
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Owner/Admin
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, cancelReason } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const oldStatus = booking.status;
    booking.status = status;
    if (status === 'cancelled') { booking.cancelReason = cancelReason; booking.cancelledAt = Date.now(); }
    if (status === 'confirmed') booking.confirmedAt = Date.now();
    if (status === 'completed') booking.completedAt = Date.now();
    await booking.save();

    // Trigger non-blocking WhatsApp notification on status change
    if (oldStatus !== status) {
      if (status === 'confirmed') {
        sendBookingWhatsAppNotification(booking._id, 'confirmed');
      } else if (status === 'cancelled') {
        sendBookingWhatsAppNotification(booking._id, 'cancelled');
      }
    }

    // Sync eco stats if status transitioned to/from completed
    if (oldStatus === 'completed' || status === 'completed') {
      await updateUserEcoStats(booking.customer);
    }

    // Sync vehicle availability based on booking status
    const vehicle = await Vehicle.findById(booking.vehicle);
    if (vehicle) {
      const isNowAvailable = ['completed', 'cancelled'].includes(status);
      vehicle.isAvailable = isNowAvailable;
      await vehicle.save();

      const io = req.app.get('io');
      if (io) {
        io.emit('vehicle:availability_changed', { vehicleId: vehicle._id, isAvailable: isNowAvailable });
      }

      // Create notifications based on status change
      try {
        if (status === 'confirmed') {
          await Notification.create({
            user: booking.customer,
            title: 'Booking Confirmed! 🎉',
            message: `Your booking request for ${vehicle.brand} ${vehicle.model} has been approved by the owner.`,
            type: 'booking',
            link: '/dashboard'
          });
        } else if (status === 'cancelled') {
          await Notification.create({
            user: booking.customer,
            title: 'Booking Cancelled',
            message: `Your booking request for ${vehicle.brand} ${vehicle.model} was cancelled. Reason: ${cancelReason || 'Not specified'}.`,
            type: 'booking',
            link: '/dashboard'
          });
        } else if (status === 'completed') {
          await Notification.create({
            user: booking.customer,
            title: 'Booking Completed! 🏁',
            message: `Your ride with ${vehicle.brand} ${vehicle.model} is completed. Hope you had a great experience!`,
            type: 'booking',
            link: '/dashboard'
          });
        }
      } catch (err) {
        console.error('Failed to create status update notification:', err);
      }
    }


    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel booking (by customer)
// @route   PUT /api/bookings/:id/cancel
// @access  Customer
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.customer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel this booking' });
    }
    booking.status = 'cancelled';
    booking.cancelReason = req.body.reason || 'Cancelled by customer';
    booking.cancelledAt = Date.now();
    await booking.save();

    // Trigger non-blocking WhatsApp notification to customer
    sendBookingWhatsAppNotification(booking._id, 'cancelled');

    // Make vehicle available again on customer cancellation
    const vehicle = await Vehicle.findById(booking.vehicle);
    if (vehicle) {
      vehicle.isAvailable = true;
      await vehicle.save();

      const io = req.app.get('io');
      if (io) {
        io.emit('vehicle:availability_changed', { vehicleId: vehicle._id, isAvailable: true });
      }

      // Notify owner about customer cancellation
      try {
        await Notification.create({
          user: booking.owner,
          title: 'Booking Cancelled By Customer',
          message: `The booking request for your ${vehicle.brand} ${vehicle.model} was cancelled by the customer.`,
          type: 'booking',
          link: '/dashboard'
        });
      } catch (err) {
        console.error('Failed to create customer cancellation notification:', err);
      }
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
