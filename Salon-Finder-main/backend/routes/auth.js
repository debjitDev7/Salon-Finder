const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
    register,
    login,
    getMe,
    updateProfile,
    updateLocation,
    changePassword,
    registerValidation,
    loginValidation
} = require('../controllers/authController');

// @route   POST /api/auth/register
router.post('/register', registerValidation, validate, register);

// @route   POST /api/auth/login
router.post('/login', loginValidation, validate, login);

// @route   GET /api/auth/me
router.get('/me', protect, getMe);

// @route   PUT /api/auth/profile
router.put('/profile', protect, updateProfile);

// @route   PUT /api/auth/location
router.put('/location', protect, updateLocation);

// @route   PUT /api/auth/password
router.put('/password', protect, changePassword);

module.exports = router;
