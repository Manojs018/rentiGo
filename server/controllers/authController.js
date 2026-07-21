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

    const user = await User.create({ name, email, password, phone, role: role || 'customer', city, isVerified: true });
    
    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        city: user.city,
        isVerified: true,
      },
      message: 'Registration successful!',
    });
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
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.authProvider === 'google') {
      return res.status(401).json({ success: false, message: 'This email is registered using Google OAuth. Please log in with Google.' });
    }

    if (!(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account has been deactivated' });
    }

    if (!user.isVerified) {
      user.isVerified = true;
      await user.save({ validateBeforeSave: false });
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

    if (user.authProvider === 'google') {
      return res.status(400).json({ success: false, message: 'This email is registered using Google OAuth. Please log in with Google.' });
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

    // Verify Google ID token claims
    if (!payload.email_verified) {
      return res.status(400).json({ success: false, message: 'Google account email is not verified' });
    }

    if (payload.aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(400).json({ success: false, message: 'Audience mismatch: invalid client ID' });
    }

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

// @desc    Verify Driving License and Aadhaar documents
// @route   PUT /api/auth/verify-documents
// @access  Private
exports.verifyDocuments = async (req, res) => {
  try {
    const { drivingLicense, aadhaar } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const currentDateStr = new Date().toISOString().split('T')[0];
    let dlStatus = 'verified';
    let dlMsg = 'Validated successfully.';
    let aadhaarStatus = 'verified';
    let aadhaarMsg = 'Validated successfully.';

    // Check if Gemini API key is available
    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey) {
      try {
        console.log('[AI Verification] Running Gemini document validation...');
        const prompt = `
          You are an AI document verification bot for a premium vehicle rental platform called RentiGo.
          Verify the following document details submitted by the user.
          Current date: ${currentDateStr}
          Registered user profile name: ${user.name}

          Driving License Details:
          - License Number: ${drivingLicense?.number || 'Not provided'}
          - Name on License: ${drivingLicense?.nameOnDoc || 'Not provided'}
          - Expiry Date: ${drivingLicense?.expiryDate || 'Not provided'}

          Aadhaar Details:
          - Aadhaar Number: ${aadhaar?.number || 'Not provided'}
          - Name on Aadhaar: ${aadhaar?.nameOnDoc || 'Not provided'}

          Analyze these details. You must:
          1. Flag the Driving License as invalid if it is expired compared to the current date (${currentDateStr}).
          2. Check if the name on the DL and Aadhaar match the registered user name (${user.name}) within reasonable tolerance (e.g., match if initials are used or minor spelling/spacing variations, but reject if completely different name).
          3. Validate that the license number is valid (e.g. Indian driving licenses have formats like State Code followed by numbers).
          4. Validate that the Aadhaar number is a valid 12-digit format.

          Respond with a JSON object in this EXACT format:
          {
            "dl": {
              "isValid": true,
              "reason": "Verified successfully"
            },
            "aadhaar": {
              "isValid": true,
              "reason": "Verified successfully"
            }
          }
        `;

        const parts = [{ text: prompt }];

        // Extract base64 image data for DL and Aadhaar if provided
        if (drivingLicense?.imageUrl && drivingLicense.imageUrl.startsWith('data:')) {
          const match = drivingLicense.imageUrl.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            parts.push({
              inlineData: {
                mimeType: match[1],
                data: match[2]
              }
            });
          }
        }

        if (aadhaar?.imageUrl && aadhaar.imageUrl.startsWith('data:')) {
          const match = aadhaar.imageUrl.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            parts.push({
              inlineData: {
                mimeType: match[1],
                data: match[2]
              }
            });
          }
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: { responseMimeType: 'application/json' }
          })
        });

        if (response.ok) {
          const resData = await response.json();
          const responseText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
          const parsed = JSON.parse(responseText.trim());

          if (parsed.dl) {
            dlStatus = parsed.dl.isValid ? 'verified' : 'rejected';
            dlMsg = parsed.dl.reason;
          }
          if (parsed.aadhaar) {
            aadhaarStatus = parsed.aadhaar.isValid ? 'verified' : 'rejected';
            aadhaarMsg = parsed.aadhaar.reason;
          }
        } else {
          console.warn('[AI Verification] Gemini API responded with error status:', response.status);
          throw new Error('Gemini API request failed');
        }
      } catch (err) {
        console.error('[AI Verification] Gemini verification failed, falling back to rule-based verification:', err);
        runRuleBasedValidation();
      }
    } else {
      runRuleBasedValidation();
    }

    function runRuleBasedValidation() {
      // 1. Driving License Verification
      if (drivingLicense) {
        if (!drivingLicense.number || drivingLicense.number.trim().length < 5) {
          dlStatus = 'rejected';
          dlMsg = 'Invalid Driving License number format.';
        } else if (drivingLicense.expiryDate) {
          const expiryDate = new Date(drivingLicense.expiryDate);
          const today = new Date();
          // Reset hours for comparison
          today.setHours(0, 0, 0, 0);
          if (expiryDate < today) {
            dlStatus = 'rejected';
            dlMsg = `Driving License expired on ${drivingLicense.expiryDate.split('T')[0]}.`;
          }
        }

        // Compare Name
        if (drivingLicense.nameOnDoc && dlStatus !== 'rejected') {
          const userWords = user.name.toLowerCase().split(/\s+/);
          const docWords = drivingLicense.nameOnDoc.toLowerCase().split(/\s+/);
          const hasMatch = userWords.some(w => docWords.includes(w)) || docWords.some(w => userWords.includes(w));
          if (!hasMatch) {
            dlStatus = 'rejected';
            dlMsg = `Document name "${drivingLicense.nameOnDoc}" does not match profile name "${user.name}".`;
          }
        }
      } else {
        dlStatus = 'unverified';
        dlMsg = 'Driving License not provided.';
      }

      // 2. Aadhaar Verification
      if (aadhaar) {
        // Aadhaar number formatting (12 digits, strip spaces)
        const rawAadhaar = aadhaar.number?.replace(/\s+/g, '') || '';
        if (!/^\d{12}$/.test(rawAadhaar)) {
          aadhaarStatus = 'rejected';
          aadhaarMsg = 'Aadhaar must be a 12-digit number.';
        }

        // Compare Name
        if (aadhaar.nameOnDoc && aadhaarStatus !== 'rejected') {
          const userWords = user.name.toLowerCase().split(/\s+/);
          const docWords = aadhaar.nameOnDoc.toLowerCase().split(/\s+/);
          const hasMatch = userWords.some(w => docWords.includes(w)) || docWords.some(w => userWords.includes(w));
          if (!hasMatch) {
            aadhaarStatus = 'rejected';
            aadhaarMsg = `Document name "${aadhaar.nameOnDoc}" does not match profile name "${user.name}".`;
          }
        }
      } else {
        aadhaarStatus = 'unverified';
        aadhaarMsg = 'Aadhaar document not provided.';
      }
    }

    // Set overall verificationStatus
    let overallStatus = 'unverified';
    if (dlStatus === 'verified' && aadhaarStatus === 'verified') {
      overallStatus = 'verified';
    } else if (dlStatus === 'rejected' || aadhaarStatus === 'rejected') {
      overallStatus = 'rejected';
    } else if (dlStatus === 'pending' || aadhaarStatus === 'pending') {
      overallStatus = 'pending';
    }

    // Update user profile fields
    user.verificationStatus = overallStatus;
    user.verificationDetails = {
      drivingLicense: {
        number: drivingLicense?.number,
        nameOnDoc: drivingLicense?.nameOnDoc,
        expiryDate: drivingLicense?.expiryDate,
        imageUrl: drivingLicense?.imageUrl,
        status: dlStatus,
        validationMessage: dlMsg
      },
      aadhaar: {
        number: aadhaar?.number,
        nameOnDoc: aadhaar?.nameOnDoc,
        imageUrl: aadhaar?.imageUrl,
        status: aadhaarStatus,
        validationMessage: aadhaarMsg
      }
    };

    await user.save();

    res.json({
      success: true,
      message: overallStatus === 'verified' ? 'Identity verified successfully!' : 'Document validation complete.',
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


