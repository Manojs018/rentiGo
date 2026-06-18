const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');

// @desc    Create booking
// @route   POST /api/bookings
// @access  Customer
exports.createBooking = async (req, res) => {
  try {
    const { vehicleId, pickupDate, returnDate, city, rentalPlan, specialRequests, customerName, customerPhone } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
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

    const taxAmount = Math.round(baseAmount * 0.18); // 18% GST
    const totalAmount = baseAmount + taxAmount;

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
      taxAmount,
      totalAmount,
      specialRequests,
      customerName,
      customerPhone,
      customerEmail: req.user.email,
    });

    await booking.populate(['vehicle', 'owner']);
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
      .populate('vehicle', 'brand model type thumbnail city dailyPrice')
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

    booking.status = status;
    if (status === 'cancelled') { booking.cancelReason = cancelReason; booking.cancelledAt = Date.now(); }
    if (status === 'confirmed') booking.confirmedAt = Date.now();
    if (status === 'completed') booking.completedAt = Date.now();
    await booking.save();

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
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
