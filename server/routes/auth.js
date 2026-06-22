const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, forgotPassword, getFavorites, toggleFavorite } = require('../controllers/authController');
const protect = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/favorites', protect, getFavorites);
router.post('/favorites/:vehicleId', protect, toggleFavorite);


module.exports = router;
