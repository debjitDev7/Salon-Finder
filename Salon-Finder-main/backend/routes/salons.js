const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
    createSalon,
    getNearbySalons,
    getSalons,
    getSalon,
    getMySalon,
    updateSalon,
    addService,
    updateService,
    deleteService,
    createSalonValidation
} = require('../controllers/salonController');

// Public routes
router.get('/nearby', getNearbySalons);
router.get('/', getSalons);
router.get('/:id', getSalon);

// Salon owner routes
router.get('/owner/my', protect, authorize('salonOwner'), getMySalon);
router.post('/', protect, authorize('salonOwner'), createSalonValidation, validate, createSalon);
router.put('/:id', protect, authorize('salonOwner', 'admin'), updateSalon);

// Service management
router.post('/:id/services', protect, authorize('salonOwner'), addService);
router.put('/:salonId/services/:serviceId', protect, authorize('salonOwner'), updateService);
router.delete('/:salonId/services/:serviceId', protect, authorize('salonOwner'), deleteService);

module.exports = router;
