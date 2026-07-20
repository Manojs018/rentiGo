/**
 * Database test runner for WhatsApp integration.
 * Fetches actual booking records from MongoDB and runs the template compiling + formatting flow.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const User = require('./models/User');
const Vehicle = require('./models/Vehicle');
const { formatToE164 } = require('./utils/whatsapp');
const { 
  getNewBookingTemplate, 
  getBookingConfirmedTemplate, 
  getBookingCancelledTemplate 
} = require('./utils/whatsappTemplates');

async function testWithDatabaseData() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/rentigo';
    console.log(`Connecting to MongoDB at: ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully!\n');

    // Fetch the latest booking
    const booking = await Booking.findOne()
      .populate('customer')
      .populate('owner')
      .populate('vehicle')
      .sort('-createdAt');

    if (!booking) {
      console.log('❌ No booking found in the database. Please run "npm run seed" first.');
      await mongoose.disconnect();
      return;
    }

    console.log('--- FOUND DATABASE BOOKING ---');
    console.log(`ID: ${booking._id}`);
    console.log(`Status: ${booking.status}`);
    console.log(`Customer: ${booking.customer ? booking.customer.name : 'N/A'} (Phone: ${booking.customer ? booking.customer.phone : 'N/A'})`);
    console.log(`Owner: ${booking.owner ? booking.owner.name : 'N/A'} (Phone: ${booking.owner ? booking.owner.phone : 'N/A'})`);
    console.log(`Vehicle: ${booking.vehicle ? `${booking.vehicle.brand} ${booking.vehicle.model}` : 'N/A'}`);
    console.log(`Dates: ${booking.pickupDate} to ${booking.returnDate}\n`);

    // Format dates
    const formatDate = (date) => {
      if (!date) return '';
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    const vehicleName = booking.vehicle ? `${booking.vehicle.brand} ${booking.vehicle.model}` : 'Unknown Vehicle';
    const startDate = formatDate(booking.pickupDate);
    const endDate = formatDate(booking.returnDate);

    // 1. Template: New Booking Request
    const customerName = booking.customerName || (booking.customer && booking.customer.name) || 'Customer';
    const ownerRawPhone = booking.owner ? booking.owner.phone : '';
    const ownerFormattedPhone = formatToE164(ownerRawPhone);
    const newBookingMessage = getNewBookingTemplate({
      customerName,
      vehicleName,
      startDate,
      endDate
    });

    console.log('================================================');
    console.log(`[1] NEW BOOKING NOTIFICATION (Sent to Owner)`);
    console.log(`Recipient (Owner Phone): whatsapp:${ownerFormattedPhone || 'MISSING'}`);
    console.log('--- MESSAGE CONTENT ---');
    console.log(newBookingMessage);
    console.log('================================================\n');

    // 2. Template: Booking Confirmed
    const customerRawPhone = booking.customer ? booking.customer.phone : '';
    const customerFormattedPhone = formatToE164(customerRawPhone);
    const ownerName = booking.owner ? booking.owner.name : 'Owner';
    const ownerPhone = ownerFormattedPhone || 'Not provided';
    const confirmedMessage = getBookingConfirmedTemplate({
      vehicleName,
      startDate,
      endDate,
      ownerName,
      ownerPhone
    });

    console.log('================================================');
    console.log(`[2] BOOKING CONFIRMED NOTIFICATION (Sent to Customer)`);
    console.log(`Recipient (Customer Phone): whatsapp:${customerFormattedPhone || 'MISSING'}`);
    console.log('--- MESSAGE CONTENT ---');
    console.log(confirmedMessage);
    console.log('================================================\n');

    // 3. Template: Booking Cancelled
    const cancelledMessage = getBookingCancelledTemplate({
      vehicleName,
      startDate,
      endDate,
      reason: booking.cancelReason
    });

    console.log('================================================');
    console.log(`[3] BOOKING CANCELLED NOTIFICATION (Sent to Customer)`);
    console.log(`Recipient (Customer Phone): whatsapp:${customerFormattedPhone || 'MISSING'}`);
    console.log('--- MESSAGE CONTENT ---');
    console.log(cancelledMessage);
    console.log('================================================\n');

  } catch (error) {
    console.error('Test script failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

testWithDatabaseData();
