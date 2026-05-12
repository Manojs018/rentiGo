const express = require('express');
const router = express.Router();
const {
  createBooking, getMyBookings, getOwnerBookings, updateBookingStatus, cancelBooking
} = require('../controllers/bookingController');
const protect = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

router.post('/', protect, roleGuard('customer', 'admin'), createBooking);
router.get('/my', protect, roleGuard('customer'), getMyBookings);
router.get('/owner', protect, roleGuard('owner', 'admin'), getOwnerBookings);
router.put('/:id/status', protect, roleGuard('owner', 'admin'), updateBookingStatus);
router.put('/:id/cancel', protect, roleGuard('customer'), cancelBooking);

module.exports = router;
