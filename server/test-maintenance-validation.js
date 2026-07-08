const API_BASE = 'http://localhost:5005/api';

async function runTests() {
  console.log('--- STARTING DIAGNOSTICS & MAINTENANCE VALIDATION TESTS ---');

  try {
    // 1. Log in as Owner
    console.log('\n1. Logging in as Owner...');
    const ownerLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@gmail.com', password: 'demo123' })
    });
    
    if (!ownerLoginRes.ok) {
      throw new Error(`Owner login failed with status ${ownerLoginRes.status}`);
    }
    
    const { token: ownerToken } = await ownerLoginRes.json();
    console.log('Owner login successful!');

    // 2. Fetch Owner's Vehicles
    console.log('\n2. Fetching owner vehicles...');
    const myVehiclesRes = await fetch(`${API_BASE}/vehicles/my`, {
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    const myVehiclesData = await myVehiclesRes.json();
    const vehicles = myVehiclesData.data || [];
    
    if (vehicles.length === 0) {
      throw new Error('No owner vehicles found to run tests.');
    }
    
    const targetVehicle = vehicles.find(v => v.status === 'approved') || vehicles[0];
    const vehicleId = targetVehicle._id;
    console.log(`Using vehicle: ${targetVehicle.brand} ${targetVehicle.model} (${vehicleId})`);

    // 3. Update diagnostics as Owner
    console.log('\n3. Updating diagnostics and service logs as Owner...');
    const testDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
    const updateRes = await fetch(`${API_BASE}/vehicles/${vehicleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`
      },
      body: JSON.stringify({
        tirePressure: 34,
        batteryCharge: 98,
        fuelLevel: 85,
        nextService: testDate,
        status: 'approved',
        isAvailable: true,
        serviceLogs: [
          { serviceType: 'Oil Change', date: new Date(), notes: 'Integration test log entry.' }
        ]
      })
    });

    if (!updateRes.ok) {
      throw new Error(`Updating vehicle diagnostics failed: ${updateRes.status}`);
    }
    
    const updatedVehicleData = await updateRes.json();
    const updatedVehicle = updatedVehicleData.data;
    console.log('Diagnostics update confirmed!');
    console.log(`- Tire Pressure: ${updatedVehicle.tirePressure} PSI (Expected: 34)`);
    console.log(`- Battery Charge: ${updatedVehicle.batteryCharge}% (Expected: 98)`);
    console.log(`- Fuel Level: ${updatedVehicle.fuelLevel}% (Expected: 85)`);
    console.log(`- Service Logs Count: ${updatedVehicle.serviceLogs.length} (Expected: 1)`);

    if (updatedVehicle.tirePressure !== 34 || updatedVehicle.batteryCharge !== 98 || updatedVehicle.fuelLevel !== 85) {
      throw new Error('Diagnostics values did not update correctly!');
    }
    console.log('✅ PASS: Diagnostics and logs updated successfully.');

    // 4. Mark Vehicle as "In Maintenance"
    console.log('\n4. Putting vehicle into In Maintenance status...');
    const maintenanceRes = await fetch(`${API_BASE}/vehicles/${vehicleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`
      },
      body: JSON.stringify({
        status: 'In Maintenance',
        isAvailable: false
      })
    });

    if (!maintenanceRes.ok) {
      throw new Error(`Putting vehicle in maintenance failed: ${maintenanceRes.status}`);
    }
    console.log('Vehicle successfully marked as In Maintenance.');

    // 5. Log in as Customer
    console.log('\n5. Logging in as Customer...');
    const customerLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'customer@gmail.com', password: 'demo123' })
    });
    
    if (!customerLoginRes.ok) {
      throw new Error(`Customer login failed with status ${customerLoginRes.status}`);
    }
    
    const { token: customerToken } = await customerLoginRes.json();
    console.log('Customer login successful!');

    // 6. Attempt to book vehicle in maintenance
    console.log('\n6. Attempting to book vehicle under maintenance as Customer...');
    const today = new Date();
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const bookingRes = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        vehicleId,
        pickupDate: today.toISOString(),
        returnDate: tomorrow.toISOString(),
        city: 'Ahmedabad',
        rentalPlan: 'daily'
      })
    });

    console.log('Response Status:', bookingRes.status);
    const bookingData = await bookingRes.json();
    console.log('Response Message:', bookingData.message);

    if (bookingRes.status === 400 && bookingData.message === 'This vehicle is currently in maintenance and cannot be rented.') {
      console.log('✅ PASS: Booking correctly blocked with 400 Bad Request and maintenance notice!');
    } else {
      throw new Error(`FAIL: Expected 400 Bad Request, got status ${bookingRes.status} with message: ${bookingData.message}`);
    }

    // 7. Restore vehicle to Approved
    console.log('\n7. Restoring vehicle to approved / available status...');
    const restoreRes = await fetch(`${API_BASE}/vehicles/${vehicleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`
      },
      body: JSON.stringify({
        status: 'approved',
        isAvailable: true
      })
    });

    if (!restoreRes.ok) {
      throw new Error(`Restoring vehicle status failed: ${restoreRes.status}`);
    }
    console.log('Vehicle successfully restored to Approved.');

    // 8. Attempt to book vehicle again (should pass or at least not block on status)
    console.log('\n8. Attempting to book restored vehicle as Customer...');
    const bookingRes2 = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        vehicleId,
        pickupDate: today.toISOString(),
        returnDate: tomorrow.toISOString(),
        city: 'Ahmedabad',
        rentalPlan: 'daily'
      })
    });

    console.log('Response Status:', bookingRes2.status);
    const bookingData2 = await bookingRes2.json();

    if (bookingRes2.status === 201) {
      console.log('✅ PASS: Booking created successfully!');
      
      // Clean up by cancelling the created booking so we don't mess up DB
      console.log('Cleaning up booking...');
      await fetch(`${API_BASE}/bookings/${bookingData2.data._id}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${customerToken}`
        },
        body: JSON.stringify({ reason: 'Integration test cleanup' })
      });
      console.log('Test booking cleaned up.');
    } else {
      throw new Error(`FAIL: Restored vehicle could not be booked, got status ${bookingRes2.status} with message: ${bookingData2.message}`);
    }

    console.log('\n--- ALL MAINTENANCE TESTS COMPLETED SUCCESSFULLY ---');
  } catch (error) {
    console.error('\n❌ TEST RUN FAILED:', error.message);
    process.exit(1);
  }
}

runTests();
