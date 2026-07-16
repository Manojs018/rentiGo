const express = require('express');
const router = express.Router();
const { register, login, googleLogin, getMe, updateProfile, forgotPassword, resetPassword, getFavorites, toggleFavorite, verifyEmail, verifyDocuments } = require('../controllers/authController');
const protect = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resettoken', resetPassword);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/verify-documents', protect, verifyDocuments);
router.get('/favorites', protect, getFavorites);
router.post('/favorites/:vehicleId', protect, toggleFavorite);


module.exports = router;
