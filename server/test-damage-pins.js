const API_BASE = 'http://localhost:5005/api';

async function runTests() {
  console.log('--- STARTING VEHICLE DAMAGE PINS ENDPOINT TESTS ---');

  try {
    // 1. Log in as customer
    console.log('\nLogging in...');
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'customer@gmail.com', password: 'demo123' })
    });
    
    if (!loginRes.ok) {
      throw new Error(`Login failed with status ${loginRes.status}`);
    }
    
    const { token } = await loginRes.json();
    console.log('Login successful!');

    // 2. Fetch customer bookings to find one
    console.log('\nFetching customer bookings...');
    const bookingsRes = await fetch(`${API_BASE}/bookings/my`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!bookingsRes.ok) {
      throw new Error(`Fetching bookings failed: ${bookingsRes.status}`);
    }
    
    const bookingsData = await bookingsRes.json();
    const bookings = bookingsData.data || [];
    
    if (bookings.length === 0) {
      console.log('⚠️ No active customer bookings found for testing. Please ensure seed script has run.');
      return;
    }
    
    const targetBooking = bookings[0];
    const bookingId = targetBooking._id;
    console.log(`Target Booking ID: ${bookingId}`);
    console.log(`Vehicle Details: ${targetBooking.vehicle?.brand} ${targetBooking.vehicle?.model} (${targetBooking.vehicle?.type})`);

    // 3. Update damage pins on target booking
    console.log('\nUpdating damage pins on target booking via PUT /api/messages/:id/damage-pins...');
    const samplePins = [
      {
        id: `pin_test_1`,
        x: 45.5,
        y: 12.3,
        part: 'Front Bumper',
        type: 'scratch',
        notes: 'Small cosmetic scratch from parking curb',
        reportedBy: 'customer',
        photo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' // 1x1 pixel image
      },
      {
        id: `pin_test_2`,
        x: 82.1,
        y: 66.8,
        part: 'Right Rear Wheel',
        type: 'dent',
        notes: 'Minor scuff on rim edge',
        reportedBy: 'customer',
        photo: ''
      }
    ];

    const damagePinsRes = await fetch(`${API_BASE}/messages/${bookingId}/damage-pins`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ damagePins: samplePins })
    });

    if (!damagePinsRes.ok) {
      throw new Error(`Failed to update damage pins: ${damagePinsRes.statusText}`);
    }

    const responseData = await damagePinsRes.json();
    const updatedBooking = responseData.data;
    console.log('Damage pins endpoint returned success.');

    // 4. Verify pins persisted correctly in response
    if (updatedBooking && updatedBooking.damagePins && updatedBooking.damagePins.length === 2) {
      const pin1 = updatedBooking.damagePins.find(p => p.id === 'pin_test_1');
      const pin2 = updatedBooking.damagePins.find(p => p.id === 'pin_test_2');

      if (pin1 && pin1.part === 'Front Bumper' && pin1.type === 'scratch' && pin2 && pin2.type === 'dent') {
        console.log('\n✅ SUCCESS: Damage pins successfully saved, verified, and fetched!');
        console.log(`Pin 1: ${pin1.part} -> x:${pin1.x}%, y:${pin1.y}% (${pin1.notes})`);
        console.log(`Pin 2: ${pin2.part} -> x:${pin2.x}%, y:${pin2.y}% (${pin2.notes})`);
      } else {
        console.log('\n❌ FAIL: Damage pin property mismatch.');
      }
    } else {
      console.log('\n❌ FAIL: Damage pins list size mismatch or missing properties.');
    }

  } catch (err) {
    console.error('Test execution failed:', err);
  }
}

runTests();
