/**
 * WhatsApp Message Templates for RentiGo
 */

/**
 * Template for New Booking Request sent to the vehicle owner
 * @param {Object} params
 * @param {string} params.customerName - Name of the customer requesting the booking
 * @param {string} params.vehicleName - Brand and model of the vehicle
 * @param {string} params.startDate - Booking start date
 * @param {string} params.endDate - Booking end date
 * @returns {string}
 */
function getNewBookingTemplate({ customerName, vehicleName, startDate, endDate }) {
  return `*New Booking Request* 🚗
Customer: ${customerName}
Vehicle: ${vehicleName}
Dates: ${startDate} - ${endDate}
Please confirm or reject this booking in the RentiGo app.`;
}

/**
 * Template for Booking Confirmed sent to the customer
 * @param {Object} params
 * @param {string} params.vehicleName - Brand and model of the vehicle
 * @param {string} params.startDate - Booking start date
 * @param {string} params.endDate - Booking end date
 * @param {string} params.ownerName - Name of the vehicle owner
 * @param {string} params.ownerPhone - Phone number of the vehicle owner
 * @returns {string}
 */
function getBookingConfirmedTemplate({ vehicleName, startDate, endDate, ownerName, ownerPhone }) {
  return `*Booking Confirmed* ✅
Vehicle: ${vehicleName}
Dates: ${startDate} - ${endDate}
Owner: ${ownerName}, ${ownerPhone}
Enjoy your ride!`;
}

/**
 * Template for Booking Cancelled sent to the customer
 * @param {Object} params
 * @param {string} params.vehicleName - Brand and model of the vehicle
 * @param {string} params.startDate - Booking start date
 * @param {string} params.endDate - Booking end date
 * @param {string} [params.reason] - Reason for cancellation (optional)
 * @returns {string}
 */
function getBookingCancelledTemplate({ vehicleName, startDate, endDate, reason }) {
  const reasonText = reason ? reason : 'Not specified';
  return `*Booking Cancelled* ❌
Vehicle: ${vehicleName}
Dates: ${startDate} - ${endDate}
Reason: ${reasonText}`;
}

module.exports = {
  getNewBookingTemplate,
  getBookingConfirmedTemplate,
  getBookingCancelledTemplate
};
