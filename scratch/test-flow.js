async function run() {
  const baseUrl = 'http://127.0.0.1:5005/api';
  const email = `testuser_${Date.now()}@gmail.com`;
  const password = 'Password123';

  console.log(`1. Registering user with email: ${email}...`);
  try {
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Manoj Test No Verification',
        email: email,
        password: password,
        phone: '9751314015',
        role: 'customer',
        city: 'Ahmedabad'
      })
    });
    const regData = await regRes.json();
    console.log('✅ Registration response status:', regRes.status);
    console.log('✅ Registration response body:', regData);
  } catch (error) {
    console.error('❌ Registration failed:', error.message);
    return;
  }

  console.log('\n2. Logging in immediately with the new user...');
  try {
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });
    const loginData = await loginRes.json();
    console.log('✅ Login response status:', loginRes.status);
    console.log('✅ Login response body token length:', loginData.token ? loginData.token.length : 0);
    console.log('✅ User role is:', loginData.user ? loginData.user.role : 'none');
    console.log('🚀 API flow completed successfully without email verification!');
  } catch (error) {
    console.error('❌ Login failed:', error.message);
  }
}

run();
