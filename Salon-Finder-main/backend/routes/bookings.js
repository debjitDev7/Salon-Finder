const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    createBooking,
    getMyBookings,
    getUpcomingBookings,
    getBooking,
    cancelBooking,
    getSalonBookings,
    updateBookingStatus,
    getTodayBookings
} = require('../controllers/bookingController');

// Customer routes
router.post('/', protect, authorize('customer'), createBooking);
router.get('/my', protect, getMyBookings);
router.get('/upcoming', protect, authorize('customer'), getUpcomingBookings);
router.get('/:id', protect, getBooking);
router.put('/:id/cancel', protect, cancelBooking);

// Salon owner routes
router.get('/salon/all', protect, authorize('salonOwner'), getSalonBookings);
router.get('/salon/today', protect, authorize('salonOwner'), getTodayBookings);
router.put('/:id/status', protect, authorize('salonOwner'), updateBookingStatus);

module.exports = router;
