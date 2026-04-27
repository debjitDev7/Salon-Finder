const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    generateSlots,
    getSalonSlots,
    getMySlots,
    toggleSlot,
    bulkToggleSlots,
    deleteFutureSlots
} = require('../controllers/slotController');

// Public route - get available slots for a salon
router.get('/salon/:salonId', getSalonSlots);

// Salon owner routes
router.post('/generate', protect, authorize('salonOwner'), generateSlots);
router.get('/my', protect, authorize('salonOwner'), getMySlots);
router.put('/:id/toggle', protect, authorize('salonOwner'), toggleSlot);
router.put('/bulk-toggle', protect, authorize('salonOwner'), bulkToggleSlots);
router.delete('/future', protect, authorize('salonOwner'), deleteFutureSlots);

module.exports = router;
