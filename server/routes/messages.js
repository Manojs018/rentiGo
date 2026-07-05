const express = require('express');
const router = express.Router();
const { getMessages, sendMessage, updateHandover } = require('../controllers/messageController');
const protect = require('../middleware/auth');

router.get('/:bookingId', protect, getMessages);
router.post('/:bookingId', protect, sendMessage);
router.put('/:bookingId/handover', protect, updateHandover);

module.exports = router;
