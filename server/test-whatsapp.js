/**
 * Test script for Twilio WhatsApp integration.
 * Tests phone formatting, templates, and safety wrapping.
 */

// Import formatting and helper functions from our utils using absolute paths
const { formatToE164 } = require('c:/Users/Manoj/OneDrive/Documents/veRent/server/utils/whatsapp');
const { 
  getNewBookingTemplate, 
  getBookingConfirmedTemplate, 
  getBookingCancelledTemplate 
} = require('c:/Users/Manoj/OneDrive/Documents/veRent/server/utils/whatsappTemplates');

console.log('--- Testing Phone Formatting to E.164 ---');

const testPhones = [
  { input: '9876543210', expected: '+919876543210' },      // 10-digit Indian
  { input: '+919876543210', expected: '+919876543210' },   // Already E.164
  { input: '09876543210', expected: '+919876543210' },     // Indian with leading 0
  { input: '00919876543210', expected: '+919876543210' },  // Leading double zero
  { input: '+14155238886', expected: '+14155238886' },     // US E.164
  { input: '14155238886', expected: '+14155238886' },       // US number (no +)
  { input: '  987-654-3210 ', expected: '+919876543210' }, // Messy spaces/hyphens
  { input: null, expected: null },                         // Missing
  { input: '', expected: null },                           // Empty
  { input: '123', expected: null },                        // Too short
];

let allPhonesPassed = true;
for (const test of testPhones) {
  const result = formatToE164(test.input);
  const passed = result === test.expected;
  console.log(`Input: "${test.input}" | Result: "${result}" | Expected: "${test.expected}" | ${passed ? '✅ PASS' : '❌ FAIL'}`);
  if (!passed) allPhonesPassed = false;
}

console.log(`\nPhone formatting status: ${allPhonesPassed ? '✅ ALL PASSED' : '❌ SOME FAILED'}`);

console.log('\n--- Testing Template Outputs ---');

const mockParams = {
  customerName: 'Alice Smith',
  vehicleName: 'Honda City',
  startDate: 'Jul 20, 2026',
  endDate: 'Jul 25, 2026',
  ownerName: 'Bob Owner',
  ownerPhone: '+919876543211',
  reason: 'Maintenance issue'
};

const newBookingMsg = getNewBookingTemplate(mockParams);
console.log('\n[New Booking Template Message]:\n' + newBookingMsg);

const confirmedMsg = getBookingConfirmedTemplate(mockParams);
console.log('\n[Booking Confirmed Template Message]:\n' + confirmedMsg);

const cancelledMsg = getBookingCancelledTemplate(mockParams);
console.log('\n[Booking Cancelled Template Message]:\n' + cancelledMsg);

const cancelledNoReasonMsg = getBookingCancelledTemplate({ ...mockParams, reason: null });
console.log('\n[Booking Cancelled (No Reason) Template Message]:\n' + cancelledNoReasonMsg);

console.log('\n--- Testing Complete ---');
