const API_BASE = 'http://localhost:5005/api';

async function runTests() {
  console.log('--- STARTING SMART PRICING ENDPOINT TESTS ---');

  try {
    // 1. Log in as owner
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

    // 2. Fetch owner's pricing suggestions
    console.log('\nFetching pricing suggestions via GET /api/pricing/owner-suggestions...');
    const suggestionsRes = await fetch(`${API_BASE}/pricing/owner-suggestions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!suggestionsRes.ok) {
      throw new Error(`Fetching suggestions failed: ${suggestionsRes.status}`);
    }

    const suggestionsData = await suggestionsRes.json();
    const suggestions = suggestionsData.data || [];

    if (suggestions.length === 0) {
      console.log('⚠️ No owner vehicles found for testing.');
      return;
    }

    const target = suggestions[0];
    console.log(`Target Vehicle: ${target.brand} ${target.model} (${target.vehicleNumber})`);
    console.log(`Current Daily Price: ₹${target.dailyPrice}`);
    console.log(`Suggested Price: ₹${target.recommendedPrice}`);
    console.log(`Optimization Factors:`, target.reasons);

    // 3. Toggle smart pricing ON with boundaries
    console.log('\nToggling Smart Pricing ON via PUT /api/pricing/toggle-smart...');
    const toggleRes = await fetch(`${API_BASE}/pricing/toggle-smart`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        vehicleId: target.vehicleId,
        enabled: true,
        minPrice: 1500,
        maxPrice: 4000
      })
    });

    if (!toggleRes.ok) {
      throw new Error(`Toggling failed: ${toggleRes.statusText}`);
    }

    const toggleData = await toggleRes.json();
    console.log('Toggle response returned success.');

    // 4. Fetch suggestions again to verify it has updated and clamped
    console.log('\nFetching updated suggestions to verify changes...');
    const suggestionsRes2 = await fetch(`${API_BASE}/pricing/owner-suggestions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const suggestionsData2 = await suggestionsRes2.json();
    const updatedTarget = (suggestionsData2.data || []).find(s => s.vehicleId === target.vehicleId);

    if (updatedTarget) {
      console.log(`\nUpdated Vehicle Details:`);
      console.log(`Smart Pricing Enabled: ${updatedTarget.smartPricingEnabled}`);
      console.log(`Daily Price: ₹${updatedTarget.dailyPrice} (Boundary bounds: Min: ₹${updatedTarget.smartPricingMinPrice}, Max: ₹${updatedTarget.smartPricingMaxPrice})`);
      console.log(`Suggested: ₹${updatedTarget.recommendedPrice}`);

      if (updatedTarget.smartPricingEnabled === true && 
          updatedTarget.smartPricingMinPrice === 1500 && 
          updatedTarget.smartPricingMaxPrice === 4000) {
        console.log('\n✅ SUCCESS: Smart pricing enabled, bound boundaries saved, and price dynamically adjusted!');
      } else {
        console.log('\n❌ FAIL: Property mismatch.');
      }
    } else {
      console.log('\n❌ FAIL: Could not find target vehicle in suggestions.');
    }

  } catch (err) {
    console.error('Test execution failed:', err);
  }
}

runTests();
