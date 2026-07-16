require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const API_BASE = 'http://localhost:5005/api';
const TEST_EMAIL = 'verify_test_customer@gmail.com';

async function runTests() {
  console.log('=== STARTING DOCUMENT VERIFICATION BACKEND TESTS ===\n');

  try {
    // 1. Connect to DB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rentigo');
    console.log('Connected successfully!');

    // 2. Setup Test User
    console.log(`\nSetting up test user: ${TEST_EMAIL}...`);
    let user = await User.findOne({ email: TEST_EMAIL });
    if (user) {
      await User.deleteOne({ email: TEST_EMAIL });
    }
    
    user = await User.create({
      name: 'Rahul Sharma',
      email: TEST_EMAIL,
      password: 'password123',
      phone: '9876543210',
      role: 'customer',
      city: 'Ahmedabad',
      isVerified: true // Email verified
    });
    console.log('Test user created & verified!');

    // 3. Generate JWT Token
    const secret = process.env.JWT_SECRET || 'rentigo_dev_secret_2026_change_me';
    const token = jwt.sign({ id: user._id }, secret, { expiresIn: '1h' });
    console.log('Generated JWT token for test requests.');

    // 4. Test Case 1: Valid Driving License & Aadhaar
    console.log('\n----------------------------------------');
    console.log('TEST CASE 1: Valid DL (Future Expiry) & Valid Aadhaar');
    console.log('----------------------------------------');
    
    const validPayload = {
      drivingLicense: {
        number: 'GJ0120250012345',
        nameOnDoc: 'Rahul Sharma',
        expiryDate: '2035-12-31', // Future date
        imageUrl: 'data:image/jpeg;base64,mockeddlbase64'
      },
      aadhaar: {
        number: '123456789012', // 12 digits
        nameOnDoc: 'Rahul Sharma',
        imageUrl: 'data:image/jpeg;base64,mockedaadhaarbase64'
      }
    };

    let response = await fetch(`${API_BASE}/auth/verify-documents`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(validPayload)
    });

    let resData = await response.json();
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(resData, null, 2));

    if (response.status === 200 && resData.user?.verificationStatus === 'verified') {
      console.log('✅ TEST CASE 1 PASSED: Documents validated and verified successfully!');
    } else {
      throw new Error(`TEST CASE 1 FAILED: Status code: ${response.status}, Status text: ${resData.message}`);
    }

    // 5. Test Case 2: Expired Driving License
    console.log('\n----------------------------------------');
    console.log('TEST CASE 2: Expired Driving License (Date in past)');
    console.log('----------------------------------------');

    const expiredPayload = {
      drivingLicense: {
        number: 'GJ0120250012345',
        nameOnDoc: 'Rahul Sharma',
        expiryDate: '2020-01-01', // Past date (Expired)
        imageUrl: 'data:image/jpeg;base64,mockeddlbase64'
      },
      aadhaar: {
        number: '123456789012',
        nameOnDoc: 'Rahul Sharma',
        imageUrl: 'data:image/jpeg;base64,mockedaadhaarbase64'
      }
    };

    response = await fetch(`${API_BASE}/auth/verify-documents`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(expiredPayload)
    });

    resData = await response.json();
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(resData, null, 2));

    const dlDetails = resData.user?.verificationDetails?.drivingLicense;
    if (resData.user?.verificationStatus === 'rejected' && dlDetails?.status === 'rejected' && dlDetails?.validationMessage?.includes('expired')) {
      console.log('✅ TEST CASE 2 PASSED: Expired Driving License flagged and verification status rejected!');
    } else {
      throw new Error(`TEST CASE 2 FAILED: Driver license was not flagged as expired or verification was not rejected properly.`);
    }

    // 6. Test Case 3: Invalid Aadhaar number length
    console.log('\n----------------------------------------');
    console.log('TEST CASE 3: Invalid Aadhaar format (Short number)');
    console.log('----------------------------------------');

    const invalidAadhaarPayload = {
      drivingLicense: {
        number: 'GJ0120250012345',
        nameOnDoc: 'Rahul Sharma',
        expiryDate: '2035-12-31',
        imageUrl: 'data:image/jpeg;base64,mockeddlbase64'
      },
      aadhaar: {
        number: '12345', // Short
        nameOnDoc: 'Rahul Sharma',
        imageUrl: 'data:image/jpeg;base64,mockedaadhaarbase64'
      }
    };

    response = await fetch(`${API_BASE}/auth/verify-documents`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(invalidAadhaarPayload)
    });

    resData = await response.json();
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(resData, null, 2));

    const aadhaarDetails = resData.user?.verificationDetails?.aadhaar;
    if (resData.user?.verificationStatus === 'rejected' && aadhaarDetails?.status === 'rejected' && aadhaarDetails?.validationMessage?.includes('12-digit')) {
      console.log('✅ TEST CASE 3 PASSED: Short Aadhaar number format flagged and rejected!');
    } else {
      throw new Error(`TEST CASE 3 FAILED: Invalid Aadhaar was not flagged or verification was not rejected properly.`);
    }

    // Clean up test user
    console.log('\nCleaning up test database records...');
    await User.deleteOne({ email: TEST_EMAIL });
    console.log('Cleaned up successfully.');

  } catch (error) {
    console.error('\n❌ ERROR RUNNING TESTS:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
    console.log('\n=== TESTS COMPLETED ===');
  }
}

runTests();
