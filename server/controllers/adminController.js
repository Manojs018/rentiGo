const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Notification = require('../models/Notification');


// @desc    Get platform analytics
// @route   GET /api/admin/analytics
// @access  Admin
exports.getAnalytics = async (req, res) => {
  try {
    const [
      totalUsers, totalOwners, totalVehicles, totalBookings,
      pendingVehicles, activeBookings, completedBookings,
      recentBookings, revenueData
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'owner' }),
      Vehicle.countDocuments({ status: 'approved' }),
      Booking.countDocuments(),
      Vehicle.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: { $in: ['confirmed', 'active'] } }),
      Booking.countDocuments({ status: 'completed' }),
      Booking.find().populate('vehicle', 'brand model type').populate('customer', 'name email').sort('-createdAt').limit(10),
      Booking.aggregate([
        { $match: { status: { $in: ['confirmed', 'completed'] } } },
        { $group: { _id: { $month: '$createdAt' }, revenue: { $sum: '$totalAmount' }, bookings: { $sum: 1 } } },
        { $sort: { '_id': 1 } },
      ]),
    ]);

    const totalRevenue = await Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    res.json({
      success: true,
      data: {
        kpis: {
          totalUsers,
          totalOwners,
          totalVehicles,
          totalBookings,
          pendingVehicles,
          activeBookings,
          completedBookings,
          totalRevenue: totalRevenue[0]?.total || 0,
        },
        recentBookings,
        revenueData,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
exports.getUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const query = role ? { role } : {};
    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(query).sort('-createdAt').skip(skip).limit(Number(limit)),
      User.countDocuments(query),
    ]);
    res.json({ success: true, data: users, pagination: { total, page: Number(page) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle
// @access  Admin
exports.toggleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all vehicles for admin (including pending)
// @route   GET /api/admin/vehicles
// @access  Admin
exports.getAdminVehicles = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const skip = (Number(page) - 1) * Number(limit);
    const [vehicles, total] = await Promise.all([
      Vehicle.find(query).populate('owner', 'name email phone').sort('-createdAt').skip(skip).limit(Number(limit)),
      Vehicle.countDocuments(query),
    ]);
    res.json({ success: true, data: vehicles, pagination: { total } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve/reject vehicle
// @route   PUT /api/admin/vehicles/:id/status
// @access  Admin
exports.approveVehicle = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { status, adminNote },
      { new: true }
    );
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });

    // Notify owner
    try {
      await Notification.create({
        user: vehicle.owner,
        title: `Vehicle ${status === 'approved' ? 'Approved' : 'Rejected'}`,
        message: `Your vehicle ${vehicle.brand} ${vehicle.model} (${vehicle.vehicleNumber}) has been ${status} by the administrator.${adminNote ? ' Note: ' + adminNote : ''}`,
        type: 'approval',
        link: '/dashboard'
      });
    } catch (err) {
      console.error('Failed to notify owner of vehicle status update:', err);
    }

    res.json({ success: true, data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all bookings for admin
// @route   GET /api/admin/bookings
// @access  Admin
exports.getAdminBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const skip = (Number(page) - 1) * Number(limit);
    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('vehicle', 'brand model type thumbnail')
        .populate('customer', 'name email phone')
        .populate('owner', 'name email phone')
        .sort('-createdAt').skip(skip).limit(Number(limit)),
      Booking.countDocuments(query),
    ]);
    res.json({ success: true, data: bookings, pagination: { total } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve/reject user document verification
// @route   PUT /api/admin/users/:id/verify
// @access  Admin
exports.verifyUser = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.verificationStatus = status;
    if (user.verificationDetails) {
      if (user.verificationDetails.drivingLicense) {
        user.verificationDetails.drivingLicense.status = status;
        if (remarks) user.verificationDetails.drivingLicense.validationMessage = remarks;
      }
      if (user.verificationDetails.aadhaar) {
        user.verificationDetails.aadhaar.status = status;
        if (remarks) user.verificationDetails.aadhaar.validationMessage = remarks;
      }
    }
    await user.save();

    // Create verification notification
    try {
      await Notification.create({
        user: user._id,
        title: `Verification ${status === 'verified' ? 'Approved' : 'Rejected'}`,
        message: `Your identity documents have been ${status} by the administrator.${remarks ? ' Remarks: ' + remarks : ''}`,
        type: 'approval',
        link: '/dashboard'
      });
    } catch (err) {
      console.error('Failed to notify user of verification status update:', err);
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
