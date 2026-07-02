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
      { owner: ownerId, brand: 'Tata', model: 'Nexon EV', type: 'suv', vehicleNumber: 'GJ01EV1111', dailyPrice: 3000, fuelType: 'electric', transmission: 'automatic', city: 'ahmedabad', status: 'approved', isAvailable: true, emoji: '⚡' },
      { owner: ownerId, brand: 'Toyota', model: 'Camry Hybrid', type: 'car', vehicleNumber: 'GJ01HY2222', dailyPrice: 5000, fuelType: 'hybrid', transmission: 'automatic', city: 'ahmedabad', status: 'approved', isAvailable: true, emoji: '🔋' },
      { owner: ownerId, brand: 'Maruti Suzuki', model: 'WagonR CNG', type: 'car', vehicleNumber: 'GJ01CN3333', dailyPrice: 1200, fuelType: 'cng', transmission: 'manual', city: 'ahmedabad', status: 'approved', isAvailable: true, emoji: '🍃' },
    ]);

    // Create Bookings
    const today = new Date();
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const sixDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

    // Completed EV Booking (Tata Nexon EV)
    await Booking.create({
      customer: customerId,
      vehicle: vehicles[4]._id,
      owner: ownerId,
      pickupDate: tenDaysAgo,
      returnDate: new Date(tenDaysAgo.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days
      city: 'Ahmedabad',
      rentalPlan: 'daily',
      baseAmount: 9000,
      taxAmount: 1620,
      totalAmount: 10620,
      status: 'completed',
      completedAt: new Date(tenDaysAgo.getTime() + 3 * 24 * 60 * 60 * 1000)
    });

    // Completed Hybrid Booking (Toyota Camry Hybrid)
    await Booking.create({
      customer: customerId,
      vehicle: vehicles[5]._id,
      owner: ownerId,
      pickupDate: sixDaysAgo,
      returnDate: new Date(sixDaysAgo.getTime() + 4 * 24 * 60 * 60 * 1000), // 4 days
      city: 'Ahmedabad',
      rentalPlan: 'daily',
      baseAmount: 20000,
      taxAmount: 3600,
      totalAmount: 23600,
      status: 'completed',
      completedAt: new Date(sixDaysAgo.getTime() + 4 * 24 * 60 * 60 * 1000)
    });

    // Completed Petrol Booking (Honda City)
    await Booking.create({
      customer: customerId,
      vehicle: vehicles[0]._id,
      owner: ownerId,
      pickupDate: threeDaysAgo,
      returnDate: new Date(threeDaysAgo.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days
      city: 'Ahmedabad',
      rentalPlan: 'daily',
      baseAmount: 5000,
      taxAmount: 900,
      totalAmount: 5900,
      status: 'completed',
      completedAt: new Date(threeDaysAgo.getTime() + 2 * 24 * 60 * 60 * 1000)
    });

    // Active (Confirmed) CNG Booking (WagonR CNG)
    await Booking.create({
      customer: customerId,
      vehicle: vehicles[6]._id,
      owner: ownerId,
      pickupDate: today,
      returnDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days
      city: 'Ahmedabad',
      rentalPlan: 'daily',
      baseAmount: 2400,
      taxAmount: 432,
      totalAmount: 2832,
      status: 'confirmed'
    });

    // Sync eco stats for user
    const { updateUserEcoStats } = require('./utils/ecoHelper');
    await updateUserEcoStats(customerId);

    console.log('Seeding completed successfully!');
    process.exit();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
