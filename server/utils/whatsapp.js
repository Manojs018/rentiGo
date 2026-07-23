const twilio = require('twilio');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const {
  getNewBookingTemplate,
  getBookingConfirmedTemplate,
  getBookingCancelledTemplate
} = require('./whatsappTemplates');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

let client;
if (accountSid && authToken && accountSid.startsWith('AC')) {
  client = twilio(accountSid, authToken);
}

/**
 * Format phone number to E.164 (+countrycode number) format.
 * Defaults to Indian country code (+91) for 10-digit numbers.
 * Returns null if the number is invalid or cannot be formatted.
 * @param {string} phone
 * @returns {string|null}
 */
function formatToE164(phone) {
  if (!phone) return null;
  
  // Clean all characters except digits and plus sign
  let cleaned = phone.toString().replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+')) {
    if (/^\+[1-9]\d{7,14}$/.test(cleaned)) {
      return cleaned;
    }
    return null;
  }

  // Handle double zero country code prefix (e.g. 0091...)
  if (cleaned.startsWith('00')) {
    const prefixed = '+' + cleaned.slice(2);
    if (/^\+[1-9]\d{7,14}$/.test(prefixed)) {
      return prefixed;
    }
    return null;
  }

  // Handle 10-digit Indian numbers with a leading 0 (e.g. 09876543210 -> +919876543210)
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return '+91' + cleaned.slice(1);
  }

  // Handle 10-digit Indian numbers directly (e.g. 9876543210 -> +919876543210)
  if (cleaned.length === 10) {
    return '+91' + cleaned;
  }

  // If it starts with 91 and is 12 digits, prepend '+'
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return '+' + cleaned;
  }

  // Fallback check: prepend '+' if it is numeric and check compliance
  const formatted = '+' + cleaned;
  if (/^\+[1-9]\d{7,14}$/.test(formatted)) {
    return formatted;
  }

  return null;
}

/**
 * Helper to format date objects/strings to readable text (e.g., Jul 16, 2026)
 * @param {Date|string} date 
 * @returns {string}
 */
function formatDateString(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Sends a WhatsApp message using Twilio API.
 * Wrapped in try/catch to ensure exceptions never crash the calling flow.
 * @param {Object} params
 * @param {string} params.to - Recipient phone number in format 'whatsapp:+<countrycode><number>'
 * @param {string} params.message - Content of the message
 * @returns {Promise<Object|null>}
 */
async function sendWhatsApp({ to, message }) {
  try {
    if (!accountSid || !authToken) {
      console.log('\n================================================');
      console.log('--- SIMULATED WHATSAPP NOTIFICATION ---');
      console.log(`To: ${to}`);
      console.log(`From: ${whatsappFrom}`);
      console.log('Message Content:');
      console.log(message);
      console.log('================================================\n');
      return { sid: 'SMOCK_dev_mode', status: 'simulated' };
    }

    if (!client) {
      client = twilio(accountSid, authToken);
    }

    console.log(`[WhatsApp] Sending message to ${to}...`);
    const response = await client.messages.create({
      body: message,
      from: whatsappFrom,
      to: to
    });
    console.log(`[WhatsApp] Message sent successfully. SID: ${response.sid}`);
    return response;
  } catch (error) {
    console.error(`[WhatsApp Error] Failed to send WhatsApp message to ${to}:`, error.message);
    return null;
  }
}

/**
 * Asynchronously orchestrates sending the WhatsApp notification for a booking status/event change.
 * Fetches the booking details and populated models before dispatching.
 * Non-blocking, error-safe.
 * @param {string} bookingId 
 * @param {'requested'|'confirmed'|'cancelled'} eventType 
 */
async function sendBookingWhatsAppNotification(bookingId, eventType) {
  try {
    const booking = await Booking.findById(bookingId)
      .populate('customer')
      .populate('owner')
      .populate('vehicle');

    if (!booking) {
      console.warn(`[WhatsApp Notification Warning] Booking ${bookingId} not found. Skipping notification.`);
      return;
    }

    if (!booking.vehicle) {
      console.warn(`[WhatsApp Notification Warning] Vehicle not found for booking ${bookingId}. Skipping notification.`);
      return;
    }

    const vehicleName = `${booking.vehicle.brand} ${booking.vehicle.model}`;
    const startDate = formatDateString(booking.pickupDate);
    const endDate = formatDateString(booking.returnDate);

    if (eventType === 'requested') {
      const owner = booking.owner;
      if (!owner) {
        console.warn(`[WhatsApp Notification Warning] Owner not found for booking ${bookingId}. Skipping.`);
        return;
      }
      
      const rawPhone = owner.phone;
      if (!rawPhone) {
        console.warn(`[WhatsApp Notification Warning] Owner phone number is missing for owner ID: ${owner._id}. Skipping.`);
        return;
      }

      const formattedPhone = formatToE164(rawPhone);
      if (!formattedPhone) {
        console.warn(`[WhatsApp Notification Warning] Owner phone number "${rawPhone}" is invalid and cannot be formatted to E.164. Skipping.`);
        return;
      }

      const customerName = booking.customerName || (booking.customer && booking.customer.name) || 'Customer';
      const message = getNewBookingTemplate({
        customerName,
        vehicleName,
        startDate,
        endDate
      });

      await sendWhatsApp({
        to: `whatsapp:${formattedPhone}`,
        message
      });

    } else if (eventType === 'confirmed') {
      const customer = booking.customer;
      if (!customer) {
        console.warn(`[WhatsApp Notification Warning] Customer not found for booking ${bookingId}. Skipping.`);
        return;
      }

      const rawPhone = customer.phone;
      if (!rawPhone) {
        console.warn(`[WhatsApp Notification Warning] Customer phone number is missing for customer ID: ${customer._id}. Skipping.`);
        return;
      }

      const formattedPhone = formatToE164(rawPhone);
      if (!formattedPhone) {
        console.warn(`[WhatsApp Notification Warning] Customer phone number "${rawPhone}" is invalid and cannot be formatted to E.164. Skipping.`);
        return;
      }

      const ownerName = booking.owner ? booking.owner.name : 'Owner';
      const rawOwnerPhone = booking.owner ? booking.owner.phone : null;
      let ownerPhone = 'Not provided';
      if (rawOwnerPhone) {
        const formattedOwnerPhone = formatToE164(rawOwnerPhone);
        if (formattedOwnerPhone) {
          ownerPhone = formattedOwnerPhone;
        }
      }

      const message = getBookingConfirmedTemplate({
        vehicleName,
        startDate,
        endDate,
        ownerName,
        ownerPhone
      });

      await sendWhatsApp({
        to: `whatsapp:${formattedPhone}`,
        message
      });

    } else if (eventType === 'cancelled') {
      const customer = booking.customer;
      if (!customer) {
        console.warn(`[WhatsApp Notification Warning] Customer not found for booking ${bookingId}. Skipping.`);
        return;
      }

      const rawPhone = customer.phone;
      if (!rawPhone) {
        console.warn(`[WhatsApp Notification Warning] Customer phone number is missing for customer ID: ${customer._id}. Skipping.`);
        return;
      }

      const formattedPhone = formatToE164(rawPhone);
      if (!formattedPhone) {
        console.warn(`[WhatsApp Notification Warning] Customer phone number "${rawPhone}" is invalid and cannot be formatted to E.164. Skipping.`);
        return;
      }

      const message = getBookingCancelledTemplate({
        vehicleName,
        startDate,
        endDate,
        reason: booking.cancelReason
      });

      await sendWhatsApp({
        to: `whatsapp:${formattedPhone}`,
        message
      });
    }
  } catch (error) {
    console.error(`[WhatsApp Notification Error] Failed to process notification for booking ${bookingId}:`, error);
  }
}

module.exports = {
  formatToE164,
  sendWhatsApp,
  sendBookingWhatsAppNotification
};
