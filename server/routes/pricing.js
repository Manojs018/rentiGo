const express = require('express');
const router = express.Router();

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

module.exports = router;
