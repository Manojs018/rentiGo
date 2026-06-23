require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const runTest = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rentigo');
    console.log('Connected!');

    // 1. Get or create a test user
    const email = 'customer@demo.com';
    let user = await User.findOne({ email });
    if (!user) {
      console.log('No seed user found. Seeding temp user...');
      user = await User.create({
        name: 'Test Customer',
        email,
        password: 'demo123',
        phone: '1234567890',
        city: 'Ahmedabad'
      });
    }

    console.log(`\n--- Test User Found: ${user.name} (${user.email}) ---`);

    // 2. Generate Reset Token
    console.log('Generating reset token...');
    const rawToken = user.getResetPasswordToken();
    console.log(`Generated Raw Token: ${rawToken}`);

    // Save token fields to DB
    await user.save({ validateBeforeSave: false });
    console.log('Token details saved to database.');

    // Fetch user from DB to verify fields are stored
    const updatedUser = await User.findOne({ email });
    console.log('Verifying stored fields:');
    console.log(`- resetPasswordToken stored: ${updatedUser.resetPasswordToken ? 'YES' : 'NO'}`);
    console.log(`- resetPasswordExpire stored: ${updatedUser.resetPasswordExpire}`);
    
    const timeDiff = updatedUser.resetPasswordExpire - Date.now();
    console.log(`- Token expires in: ${Math.round(timeDiff / 1000 / 60)} minutes`);

    if (!updatedUser.resetPasswordToken) {
      throw new Error('resetPasswordToken was not saved');
    }
    if (timeDiff <= 0) {
      throw new Error('resetPasswordExpire is not in the future');
    }

    // 3. Simulate resetting the password
    console.log('\n--- Simulating password reset using the token ---');
    const crypto = require('crypto');
    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    console.log(`Hashed verification token: ${hashedToken}`);
    console.log('Searching for user by hashed token and expiry...');
    
    const resetUser = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!resetUser) {
      throw new Error('Could not find user with the reset token or token expired!');
    }
    console.log(`User found: ${resetUser.name}. Updating password to "newsecurepassword123"...`);

    // Set new password and clear token fields
    resetUser.password = 'newsecurepassword123';
    resetUser.resetPasswordToken = undefined;
    resetUser.resetPasswordExpire = undefined;

    await resetUser.save();
    console.log('New password saved to DB, token fields cleared.');

    // 4. Verification
    console.log('\n--- Verifying final state ---');
    const finalUser = await User.findOne({ email }).select('+password');
    
    console.log('Checking token fields are cleared:');
    console.log(`- resetPasswordToken is undefined: ${finalUser.resetPasswordToken === undefined ? 'PASS' : 'FAIL'}`);
    console.log(`- resetPasswordExpire is undefined: ${finalUser.resetPasswordExpire === undefined ? 'PASS' : 'FAIL'}`);

    console.log('Checking if login works with the new password...');
    const isNewMatch = await finalUser.matchPassword('newsecurepassword123');
    console.log(`- Match "newsecurepassword123": ${isNewMatch ? 'PASS' : 'FAIL'}`);

    console.log('Checking if login fails with the old password...');
    const isOldMatch = await finalUser.matchPassword('demo123');
    console.log(`- Match "demo123" (old): ${!isOldMatch ? 'PASS' : 'FAIL'}`);

    if (isNewMatch && !isOldMatch && finalUser.resetPasswordToken === undefined) {
      console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉\n');
    } else {
      throw new Error('Test assertions failed.');
    }

    // Restore original password for safety of demo account
    console.log('Restoring original password for demo account safety...');
    finalUser.password = 'demo123';
    await finalUser.save();
    console.log('Original password restored.');

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

runTest();
