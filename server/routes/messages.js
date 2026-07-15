const express = require('express');
const router = express.Router();
const { getMessages, sendMessage, updateHandover, updateDamagePins } = require('../controllers/messageController');
const protect = require('../middleware/auth');

router.get('/:bookingId', protect, getMessages);
router.post('/:bookingId', protect, sendMessage);
router.put('/:bookingId/handover', protect, updateHandover);
router.put('/:bookingId/damage-pins', protect, updateDamagePins);

module.exports = router;
