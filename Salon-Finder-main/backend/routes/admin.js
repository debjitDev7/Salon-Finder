const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getAllSalons,
    verifySalon,
    blockSalon,
    unblockSalon,
    getAllUsers,
    toggleUserActive,
    getAllBookings,
    getDashboardStats
} = require('../controllers/adminController');

// All routes require admin access
router.use(protect, authorize('admin'));

// Dashboard
router.get('/stats', getDashboardStats);

// Salon management
router.get('/salons', getAllSalons);
router.put('/salons/:id/verify', verifySalon);
router.put('/salons/:id/block', blockSalon);
router.put('/salons/:id/unblock', unblockSalon);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-active', toggleUserActive);

// Booking management
router.get('/bookings', getAllBookings);

module.exports = router;
