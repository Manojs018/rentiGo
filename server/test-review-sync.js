const API_BASE = 'http://localhost:5005/api';

async function runTests() {
  console.log('--- STARTING VEHICLE RATING & REVIEW SYNC TESTS ---');

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
    console.log('Login successful!');

    // 2. Fetch all vehicles to pick one
    console.log('\nFetching vehicles to inspect initial stats...');
    const vehiclesRes1 = await fetch(`${API_BASE}/vehicles`);
    const vehiclesData1 = await vehiclesRes1.json();
    const vehicles1 = vehiclesData1.data || [];
    
    if (vehicles1.length === 0) {
      throw new Error('No vehicles found.');
    }
    
    const targetVehicle = vehicles1[0];
    const vehicleId = targetVehicle._id;
    console.log(`Target Vehicle: ${targetVehicle.brand} ${targetVehicle.model}`);
    console.log(`Initial Stats -> Rating: ${targetVehicle.rating}, Review Count: ${targetVehicle.reviewCount}`);

    // 3. Post first review (Rating: 5)
    console.log('\nPosting first review (Rating: 5)...');
    const reviewRes1 = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        vehicleId,
        rating: 5,
        comment: 'Absolutely amazing ride!'
      })
    });
    
    if (!reviewRes1.ok) {
      throw new Error(`Failed to post first review: ${reviewRes1.statusText}`);
    }
    console.log('First review posted successfully.');

    // 4. Fetch the vehicle again to check stats after 1st review
    console.log('\nFetching vehicle stats after first review...');
    const vehicleRes2 = await fetch(`${API_BASE}/vehicles`);
    const vehiclesData2 = await vehicleRes2.json();
    const vehicleAfter1 = (vehiclesData2.data || []).find(v => v._id === vehicleId);
    
    console.log(`Stats after 1st review -> Rating: ${vehicleAfter1.rating}, Review Count: ${vehicleAfter1.reviewCount}`);
    
    // 5. Post second review (Rating: 3)
    console.log('\nPosting second review (Rating: 3)...');
    const reviewRes2 = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        vehicleId,
        rating: 3,
        comment: 'Decent, but could be cleaner.'
      })
    });
    
    if (!reviewRes2.ok) {
      throw new Error(`Failed to post second review: ${reviewRes2.statusText}`);
    }
    console.log('Second review posted successfully.');

    // 6. Fetch the vehicle again to check stats after 2nd review
    console.log('\nFetching vehicle stats after second review...');
    const vehicleRes3 = await fetch(`${API_BASE}/vehicles`);
    const vehiclesData3 = await vehicleRes3.json();
    const vehicleAfter2 = (vehiclesData3.data || []).find(v => v._id === vehicleId);
    
    console.log(`Stats after 2nd review -> Rating: ${vehicleAfter2.rating}, Review Count: ${vehicleAfter2.reviewCount}`);

    // Verify correct mathematical updates
    // Expected Rating: (5 + 3) / 2 = 4
    // Expected Review Count: 2
    if (vehicleAfter2.reviewCount === 2 && vehicleAfter2.rating === 4) {
      console.log('\n✅ SUCCESS: Vehicle rating and review count are perfectly in sync!');
    } else {
      console.log('\n❌ FAIL: Stats mismatch. Expected Rating: 4, Review Count: 2.');
    }

  } catch (err) {
    console.error('Test execution failed:', err);
  }
}

runTests();
