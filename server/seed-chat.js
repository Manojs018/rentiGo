require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const Message = require('./models/Message');
const Vehicle = require('./models/Vehicle');
const User = require('./models/User');

const seedChat = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/verent';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for chat seeding...');

    // Find the confirmed WagonR CNG booking
    const booking = await Booking.findOne({ status: 'confirmed' }).populate('vehicle');
    if (!booking) {
      console.log('No confirmed bookings found. Please seed the main DB first by running "npm run seed" inside the server directory.');
      process.exit(1);
    }

    console.log(`Found booking ${booking._id} for vehicle: ${booking.vehicle?.brand} ${booking.vehicle?.model}`);

    // Clear old messages for this booking
    await Message.deleteMany({ booking: booking._id });

    // Set handoverDetails state: Location shared
    booking.handoverDetails = {
      locationShared: true,
      location: {
        lat: 23.0225,
        lng: 72.5714,
        address: 'Ahmedabad Central Mall, Gate 2, Ahmedabad'
      },
      keysDelivered: false,
      vehicleInspected: false,
      handoverCompleted: false
    };
    await booking.save();
    console.log('Updated handover details state: Location Shared.');

    // Seed Messages
    const messages = [
      {
        booking: booking._id,
        sender: booking.customer,
        content: "Hi! I just confirmed my booking for the WagonR CNG. When and where can we meet for the handover?",
        type: 'text',
        createdAt: new Date(Date.now() - 15 * 60 * 1000) // 15 mins ago
      },
      {
        booking: booking._id,
        sender: booking.owner,
        content: "Hello! Yes, the vehicle is ready and clean. I will share the exact pickup location with you right now.",
        type: 'text',
        createdAt: new Date(Date.now() - 12 * 60 * 1000) // 12 mins ago
      },
      {
        booking: booking._id,
        sender: booking.owner,
        content: "📍 Pickup Location: Ahmedabad Central Mall, Gate 2, Ahmedabad",
        type: 'location',
        meta: {
          lat: 23.0225,
          lng: 72.5714,
          address: 'Ahmedabad Central Mall, Gate 2, Ahmedabad'
        },
        createdAt: new Date(Date.now() - 10 * 60 * 1000) // 10 mins ago
      },
      {
        booking: booking._id,
        sender: booking.customer,
        content: "Awesome, that's very convenient. I'll reach there in 15 minutes. See you soon!",
        type: 'text',
        createdAt: new Date(Date.now() - 5 * 60 * 1000) // 5 mins ago
      }
    ];

    await Message.insertMany(messages);
    console.log('Seeded 4 conversation messages successfully!');
    
    mongoose.disconnect();
    console.log('Chat seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed chat:', error);
    process.exit(1);
  }
};

seedChat();
