const API_BASE = 'http://localhost:5005/api';

async function runTests() {
  console.log('--- STARTING DATE VALIDATION TESTS ---');

  try {
    // 1. Log in
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
    console.log('Login successful! Token acquired.');

    // 2. Fetch an approved vehicle
    console.log('\nFetching vehicles...');
    const vehiclesRes = await fetch(`${API_BASE}/vehicles`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const vehiclesData = await vehiclesRes.json();
    const vehicles = vehiclesData.data || [];
    
    if (vehicles.length === 0) {
      throw new Error('No vehicles found to run booking tests.');
    }
    
    const vehicle = vehicles[0];
    console.log(`Found vehicle for booking: ${vehicle.brand} ${vehicle.model} (${vehicle._id})`);

    // 3. Attempt to create booking with returnDate BEFORE pickupDate
    console.log('\nTest Case 1: Creating booking with returnDate BEFORE pickupDate...');
    const badBookingRes1 = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        vehicleId: vehicle._id,
        pickupDate: '2026-06-20T10:00:00',
        returnDate: '2026-06-19T10:00:00', // 1 day before pickup
        city: 'Ahmedabad',
        rentalPlan: 'daily'
      })
    });

    console.log('Response Status:', badBookingRes1.status);
    const badBookingData1 = await badBookingRes1.json();
    console.log('Response Body:', JSON.stringify(badBookingData1, null, 2));

    if (badBookingRes1.status === 400 && badBookingData1.message === 'Return date must be after pickup date') {
      console.log('✅ SUCCESS: Invalid date order rejected with 400 Bad Request!');
    } else {
      console.log('❌ FAIL: Invalid date order was not correctly rejected!');
    }

    // 4. Attempt to create booking with returnDate EQUAL TO pickupDate
    console.log('\nTest Case 2: Creating booking with returnDate EQUAL TO pickupDate...');
    const badBookingRes2 = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        vehicleId: vehicle._id,
        pickupDate: '2026-06-20T10:00:00',
        returnDate: '2026-06-20T10:00:00', // same as pickup
        city: 'Ahmedabad',
        rentalPlan: 'daily'
      })
    });

    console.log('Response Status:', badBookingRes2.status);
    const badBookingData2 = await badBookingRes2.json();
    console.log('Response Body:', JSON.stringify(badBookingData2, null, 2));

    if (badBookingRes2.status === 400 && badBookingData2.message === 'Return date must be after pickup date') {
      console.log('✅ SUCCESS: Equal pickup and return dates rejected with 400 Bad Request!');
    } else {
      console.log('❌ FAIL: Equal pickup and return dates was not correctly rejected!');
    }

    // 5. Create booking with VALID dates
    console.log('\nTest Case 3: Creating booking with VALID dates (returnDate AFTER pickupDate)...');
    const goodBookingRes = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        vehicleId: vehicle._id,
        pickupDate: '2026-06-20T10:00:00',
        returnDate: '2026-06-22T10:00:00', // 2 days after pickup
        city: 'Ahmedabad',
        rentalPlan: 'daily'
      })
    });

    console.log('Response Status:', goodBookingRes.status);
    const goodBookingData = await goodBookingRes.json();
    console.log('Response Body:', JSON.stringify(goodBookingData, null, 2));

    if (goodBookingRes.status === 201 && goodBookingData.success === true) {
      console.log('✅ SUCCESS: Valid booking created successfully!');
      console.log(`Duration in Days: ${goodBookingData.data.durationDays}`);
      console.log(`Base Amount: ₹${goodBookingData.data.baseAmount}`);
      console.log(`Total Amount: ₹${goodBookingData.data.totalAmount}`);
    } else {
      console.log('❌ FAIL: Valid booking was rejected!');
    }

  } catch (err) {
    console.error('An unexpected error occurred during testing:', err);
  }
}

runTests();
