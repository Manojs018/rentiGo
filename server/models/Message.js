const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['text', 'location', 'key_delivery', 'inspection', 'handover_complete'],
    default: 'text',
  },
  meta: {
    type: mongoose.Schema.Types.Mixed, // e.g. location details: { lat, lng, address }
  }
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
