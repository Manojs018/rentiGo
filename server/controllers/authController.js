const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role, city } = req.body;

    // Validate if it is a Google email account
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|googlemail\.com)$/i;
    if (!gmailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Only Google email accounts (@gmail.com or @googlemail.com) are allowed' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password, phone, role: role || 'customer', city, isVerified: false });
    
    // Generate verification token
    const verificationToken = user.getVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Create verification URL
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const verifyUrl = `${clientUrl}/verify-email/${verificationToken}`;

    const message = `Welcome to RentiGo, ${user.name}!\n\nPlease verify your email by clicking the link below:\n\n${verifyUrl}\n\nThis link is valid for 24 hours.`;
    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #0b0b0f; color: #f8fafc;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #f97316; margin: 0; font-size: 24px; font-weight: bold;">RentiGo</h2>
        </div>
        <p style="font-size: 16px; line-height: 1.5; color: #cbd5e1;">Hello ${user.name},</p>
        <p style="font-size: 16px; line-height: 1.5; color: #cbd5e1;">Welcome to RentiGo! To finalize your registration and activate your account, please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #f97316; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 15px; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.2);">Verify Email Address</a>
        </div>
        <p style="font-size: 14px; color: #94a3b8; line-height: 1.5;">This link is valid for 24 hours. If you did not sign up for a RentiGo account, you can safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #334155; margin: 25px 0;" />
        <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">Need help? Contact support at support@rentigo.in</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Verify your RentiGo Account',
        message,
        html: htmlMessage,
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful! Verification email sent. Please check your inbox.',
      });
    } catch (err) {
      console.error('Email verification sending failed:', err);
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({ success: false, message: 'Verification email could not be sent. Please try registering again.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account has been deactivated' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: 'Please verify your email address before logging in' });
    }

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        city: user.city,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const { updateUserEcoStats } = require('../utils/ecoHelper');
    await updateUserEcoStats(req.user.id);

    const user = await User.findById(req.user.id).populate('favoriteVehicles');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, city, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, city, avatar },
      { new: true, runValidators: true }
    ).populate('favoriteVehicles');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found with that email' });
    }

    // Generate reset token
    const resetToken = user.getResetPasswordToken();

    // Save user with token fields
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) have requested the reset of a password. Please use the link below to reset your password:\n\n${resetUrl}\n\nThis link is valid for 10 minutes. If you did not request this, please ignore this email.`;

    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #0b0b0f; color: #f8fafc;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #f97316; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 0.5px;">RentiGo</h2>
        </div>
        <p style="font-size: 16px; line-height: 1.5; color: #cbd5e1;">Hello ${user.name},</p>
        <p style="font-size: 16px; line-height: 1.5; color: #cbd5e1;">We received a request to reset the password for your account. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #f97316; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 15px; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.2);">Reset Password</a>
        </div>
        <p style="font-size: 14px; color: #94a3b8; line-height: 1.5;">This link is valid for 10 minutes. If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
        <hr style="border: 0; border-top: 1px solid #334155; margin: 25px 0;" />
        <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">Need help? Contact support at support@rentigo.in</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'RentiGo Password Reset Request',
        message,
        html: htmlMessage,
      });

      res.json({ success: true, message: 'Password reset instructions sent to your email' });
    } catch (err) {
      console.error(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: 'Please provide a password' });
    }

    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        city: user.city,
        avatar: user.avatar,
      },
      message: 'Password reset successful',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's favorites
// @route   GET /api/auth/favorites
// @access  Private
exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favoriteVehicles');
    res.json({ success: true, data: user.favoriteVehicles || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle favorite vehicle
// @route   POST /api/auth/favorites/:vehicleId
// @access  Private
exports.toggleFavorite = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const index = user.favoriteVehicles.indexOf(vehicleId);
    let isFavorite = false;
    if (index === -1) {
      user.favoriteVehicles.push(vehicleId);
      isFavorite = true;
    } else {
      user.favoriteVehicles.splice(index, 1);
    }

    await user.save();
    res.json({
      success: true,
      message: isFavorite ? 'Added to favorites' : 'Removed from favorites',
      isFavorite,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Google login / register
// @route   POST /api/auth/google
// @access  Public
exports.googleLogin = async (req, res) => {
  try {
    const { idToken, role } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'Please provide Google idToken' });
    }

    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      let needsSave = false;
      // If user exists, but doesn't have a googleId, link it
      if (!user.googleId) {
        user.googleId = sub;
        user.authProvider = 'google';
        needsSave = true;
        if (!user.avatar && picture) {
          user.avatar = picture;
        }
      }
      // If they successfully logged in via Google OAuth, they own this email
      if (!user.isVerified) {
        user.isVerified = true;
        needsSave = true;
      }
      if (needsSave) {
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        googleId: sub,
        authProvider: 'google',
        avatar: picture || '',
        role: role || 'customer',
        isVerified: true,
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account has been deactivated' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        city: user.city,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify email address using token
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    console.log('[VerifyEmail] Received raw token from client:', req.params.token);

    // Hash token
    const verificationToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    console.log('[VerifyEmail] Hashed token to query:', verificationToken);

    const user = await User.findOne({
      verificationToken,
      verificationTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      console.log('[VerifyEmail] No user found with this token or token has expired.');
      const userWithExpiredToken = await User.findOne({ verificationToken });
      if (userWithExpiredToken) {
        console.log('[VerifyEmail] User found but token is EXPIRED. Expiration time:', userWithExpiredToken.verificationTokenExpire);
      } else {
        console.log('[VerifyEmail] No user matched the token at all.');
      }
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }

    console.log('[VerifyEmail] User found! Verifying email for:', user.email);

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email address verified successfully. You can now log in.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


