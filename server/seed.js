require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Vehicle = require('./models/Vehicle');
const Booking = require('./models/Booking');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/verent');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Vehicle.deleteMany();
    await Booking.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('demo123', salt);

    // Create Users
    const users = await User.insertMany([
      { name: 'Admin User', email: 'admin@demo.com', password: hashedPassword, role: 'admin', phone: '9876543210', city: 'Ahmedabad' },
      { name: 'Owner User', email: 'owner@demo.com', password: hashedPassword, role: 'owner', phone: '9876543211', city: 'Surat' },
      { name: 'Customer User', email: 'customer@demo.com', password: hashedPassword, role: 'customer', phone: '9876543212', city: 'Ahmedabad' },
    ]);

    const ownerId = users[1]._id;
    const customerId = users[2]._id;

    // Create Vehicles
    const vehicles = await Vehicle.insertMany([
      { owner: ownerId, brand: 'Honda', model: 'City', type: 'car', vehicleNumber: 'GJ01AB1234', dailyPrice: 2500, fuelType: 'petrol', transmission: 'manual', city: 'ahmedabad', status: 'approved', isAvailable: true, emoji: '🚗' },
      { owner: ownerId, brand: 'Hyundai', model: 'Creta', type: 'suv', vehicleNumber: 'GJ05CD5678', dailyPrice: 3500, fuelType: 'diesel', transmission: 'automatic', city: 'surat', status: 'approved', isAvailable: true, emoji: '🚙' },
      { owner: ownerId, brand: 'Honda', model: 'Activa 6G', type: 'activa', vehicleNumber: 'GJ03EF9012', dailyPrice: 450, fuelType: 'petrol', transmission: 'automatic', city: 'vadodara', status: 'approved', isAvailable: true, emoji: '🛵' },
      { owner: ownerId, brand: 'Royal Enfield', model: 'Classic 350', type: 'bike', vehicleNumber: 'GJ01GH3456', dailyPrice: 800, fuelType: 'petrol', transmission: 'manual', city: 'ahmedabad', status: 'approved', isAvailable: true, emoji: '🏍️' },
    ]);

    // Create a Booking
    await Booking.create({
      customer: customerId,
      vehicle: vehicles[0]._id,
      owner: ownerId,
      pickupDate: new Date(),
      returnDate: new Date(Date.now() + 86400000 * 2),
      city: 'Ahmedabad',
      totalAmount: 5000,
      status: 'confirmed',
      paymentStatus: 'paid'
    });

    console.log('Seeding completed successfully!');
    process.exit();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
