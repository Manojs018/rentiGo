const API_BASE = 'http://localhost:5005/api';

async function runTests() {
  console.log('--- STARTING DUPLICATE VEHICLE ERROR HANDLING TESTS ---');

  try {
    // 1. Log in as Owner
    console.log('\nLogging in as Owner...');
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@gmail.com', password: 'demo123' })
    });
    
    if (!loginRes.ok) {
      throw new Error(`Login failed with status ${loginRes.status}`);
    }
    
    const { token } = await loginRes.json();
    console.log('Owner login successful!');

    // 2. Attempt to add vehicle with duplicate vehicleNumber (GJ01AB1234)
    console.log('\nTest Case 1: Attempting to create vehicle with duplicate number...');
    const duplicateAddRes = await fetch(`${API_BASE}/vehicles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        vehicleNumber: 'GJ01AB1234', // Already exists in seed
        brand: 'Hyundai',
        model: 'Verna',
        type: 'car',
        fuelType: 'petrol',
        transmission: 'manual',
        dailyPrice: 2000,
        city: 'ahmedabad'
      })
    });

    console.log('Response Status:', duplicateAddRes.status);
    const addData = await duplicateAddRes.json();
    console.log('Response Body:', JSON.stringify(addData, null, 2));

    if (duplicateAddRes.status === 400 && addData.message === 'Vehicle number already registered') {
      console.log('✅ SUCCESS: Duplicate vehicle addition rejected with 400 Bad Request and clean message!');
    } else {
      console.log('❌ FAIL: Duplicate vehicle addition was not correctly rejected!');
    }

    // 3. Create vehicle with UNIQUE vehicleNumber (GJ99XX9999)
    console.log('\nTest Case 2: Creating vehicle with UNIQUE number...');
    const uniqueAddRes = await fetch(`${API_BASE}/vehicles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        vehicleNumber: 'GJ99XX9999', // Unique
        brand: 'Hyundai',
        model: 'Verna',
        type: 'car',
        fuelType: 'petrol',
        transmission: 'manual',
        dailyPrice: 2000,
        city: 'ahmedabad'
      })
    });

    console.log('Response Status:', uniqueAddRes.status);
    const uniqueAddData = await uniqueAddRes.json();
    console.log('Response Body:', JSON.stringify(uniqueAddData, null, 2));

    if (uniqueAddRes.status === 201 && uniqueAddData.success === true) {
      console.log('✅ SUCCESS: Unique vehicle registered successfully!');
    } else {
      throw new Error('Unique vehicle registration failed.');
    }

    const newVehicleId = uniqueAddData.data._id;

    // 4. Attempt to UPDATE the vehicle to a duplicate number (GJ01AB1234)
    console.log('\nTest Case 3: Attempting to update new vehicle to a duplicate number...');
    const duplicateUpdateRes = await fetch(`${API_BASE}/vehicles/${newVehicleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        vehicleNumber: 'GJ01AB1234' // Duplicate
      })
    });

    console.log('Response Status:', duplicateUpdateRes.status);
    const updateData = await duplicateUpdateRes.json();
    console.log('Response Body:', JSON.stringify(updateData, null, 2));

    if (duplicateUpdateRes.status === 400 && updateData.message === 'Vehicle number already registered') {
      console.log('✅ SUCCESS: Duplicate vehicle update rejected with 400 Bad Request and clean message!');
    } else {
      console.log('❌ FAIL: Duplicate vehicle update was not correctly rejected!');
    }

  } catch (err) {
    console.error('An unexpected error occurred during testing:', err);
  }
}

runTests();
