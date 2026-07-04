const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  vehicleNumber: {
    type: String,
    required: [true, 'Vehicle number is required'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true,
  },
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['car', 'bike', 'activa', 'taxi', 'suv'],
    required: [true, 'Vehicle type is required'],
  },
  fuelType: {
    type: String,
    enum: ['petrol', 'diesel', 'electric', 'cng', 'hybrid'],
    default: 'petrol',
  },
  transmission: {
    type: String,
    enum: ['manual', 'automatic'],
    default: 'manual',
  },
  // Pricing
  dailyPrice: { type: Number, required: true },
  weeklyPrice: { type: Number },
  monthlyPrice: { type: Number },
  pricePerKm: { type: Number }, // For taxis

  // Location
  city: {
    type: String,
    required: [true, 'City is required'],
    enum: ['ahmedabad', 'surat', 'vadodara', 'rajkot', 'other'],
  },
  address: String,

  // Details
  year: Number,
  seats: Number,
  color: String,
  description: String,
  features: [String],

  // Images
  images: [String],
  thumbnail: String,

  // Status
  isAvailable: { type: Boolean, default: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'In Maintenance'],
    default: 'pending',
  },
  adminNote: String,

  // Stats
  totalBookings: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },

  // Maintenance & Diagnostics
  lastService: Date,
  nextService: Date,
  tirePressure: { type: Number, default: 32 },
  batteryCharge: { type: Number, default: 100 },
  fuelLevel: { type: Number, default: 100 },
  serviceLogs: [{
    serviceType: { type: String, required: true },
    date: { type: Date, default: Date.now },
    notes: String,
  }],
}, { timestamps: true });

// Text search index
VehicleSchema.index({ brand: 'text', model: 'text', description: 'text' });

module.exports = mongoose.model('Vehicle', VehicleSchema);
