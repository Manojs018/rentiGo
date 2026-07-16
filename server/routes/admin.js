const express = require('express');
const router = express.Router();
const {
  getAnalytics, getUsers, toggleUser,
  getAdminVehicles, approveVehicle, getAdminBookings,
  verifyUser
} = require('../controllers/adminController');
const protect = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

router.use(protect, roleGuard('admin'));

router.get('/analytics', getAnalytics);
router.get('/users', getUsers);
router.put('/users/:id/toggle', toggleUser);
router.put('/users/:id/verify', verifyUser);
router.get('/vehicles', getAdminVehicles);
router.put('/vehicles/:id/status', approveVehicle);
router.get('/bookings', getAdminBookings);

module.exports = router;
