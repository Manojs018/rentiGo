const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const protect = require('../middleware/auth');

router.get('/vehicle/:vehicleId', async (req, res) => {
  try {
    const reviews = await Review.find({ vehicle: req.params.vehicleId, isApproved: true })
      .populate('customer', 'name avatar city').sort('-createdAt');
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { vehicleId, rating, comment } = req.body;
    const review = await Review.create({ customer: req.user.id, vehicle: vehicleId, rating, comment });
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
