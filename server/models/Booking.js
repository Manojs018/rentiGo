const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Booking details
  pickupDate: {
    type: Date,
    required: [true, 'Pickup date is required'],
  },
  returnDate: {
    type: Date,
    required: [true, 'Return date is required'],
    validate: {
      validator: function (value) {
        return !this.pickupDate || value > this.pickupDate;
      },
      message: 'Return date must be after pickup date',
    },
  },
  pickupLocation: String,
  dropLocation: String,
  city: String,

  // Plan
  rentalPlan: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'per-km'],
    default: 'daily',
  },
  durationDays: Number,

  // Pricing
  baseAmount: Number,
  taxAmount: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  totalAmount: {
    type: Number,
    required: true,
  },

  // Customer info (snapshot at booking time)
  customerName: String,
  customerPhone: String,
  customerEmail: String,

  // Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
    default: 'pending',
  },
  cancelReason: String,
  cancelledAt: Date,
  confirmedAt: Date,
  completedAt: Date,

  // Driver (for taxi)
  driverRequired: { type: Boolean, default: false },
  driverName: String,
  driverPhone: String,

  // Notes
  specialRequests: String,
  adminNote: String,
}, { timestamps: true });

// Auto-calculate duration in days
BookingSchema.pre('save', function () {
  if (this.pickupDate && this.returnDate) {
    const diff = this.returnDate - this.pickupDate;
    this.durationDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
});


module.exports = mongoose.model('Booking', BookingSchema);
