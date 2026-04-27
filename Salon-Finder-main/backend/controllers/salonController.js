const { body } = require('express-validator');
const Salon = require('../models/Salon');
const Service = require('../models/Service');

/**
 * Salon Controller
 * Handles salon CRUD operations and geospatial queries
 */

// Validation rules
exports.createSalonValidation = [
    body('name').trim().notEmpty().withMessage('Salon name is required'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required')
];

/**
 * @desc    Create a new salon
 * @route   POST /api/salons
 * @access  Private (Salon Owner)
 */
exports.createSalon = async (req, res, next) => {
    try {
        const {
            name,
            description,
            phone,
            email,
            latitude,
            longitude,
            address,
            city,
            state,
            zipcode,
            country,
            workingHours,
            slotDuration,
            amenities
        } = req.body;

        // Check if owner already has a salon
        const existingSalon = await Salon.findOne({ owner: req.user.id });
        if (existingSalon) {
            return res.status(400).json({
                success: false,
                message: 'You already have a registered salon. Please edit your existing salon.'
            });
        }

        // Create salon
        const salon = await Salon.create({
            name,
            description,
            owner: req.user.id,
            phone,
            email,
            location: {
                type: 'Point',
                coordinates: [longitude, latitude],
                formattedAddress: address,
                city,
                state,
                zipcode,
                country
            },
            workingHours: workingHours || {
                monday: { open: '09:00', close: '20:00', isClosed: false },
                tuesday: { open: '09:00', close: '20:00', isClosed: false },
                wednesday: { open: '09:00', close: '20:00', isClosed: false },
                thursday: { open: '09:00', close: '20:00', isClosed: false },
                friday: { open: '09:00', close: '20:00', isClosed: false },
                saturday: { open: '09:00', close: '20:00', isClosed: false },
                sunday: { open: '10:00', close: '18:00', isClosed: true }
            },
            slotDuration: slotDuration || 30,
            amenities
        });

        res.status(201).json({
            success: true,
            message: 'Salon created successfully. Awaiting verification.',
            data: salon
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get nearby salons
 * @route   GET /api/salons/nearby
 * @access  Public
 */
exports.getNearbySalons = async (req, res, next) => {
    try {
        const { lat, lng, radius = 5, page = 1, limit = 10, sortBy = 'distance' } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        const maxDistance = parseFloat(radius) * 1000; // Convert km to meters

        // Aggregation pipeline for geospatial query
        const pipeline = [
            {
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: [longitude, latitude]
                    },
                    distanceField: 'distance',
                    maxDistance: maxDistance,
                    spherical: true
                }
            },
            {
                $match: {
                    isVerified: true,
                    isActive: true
                }
            }
        ];

        // Add sorting
        if (sortBy === 'rating') {
            pipeline.push({ $sort: { averageRating: -1, distance: 1 } });
        } else {
            pipeline.push({ $sort: { distance: 1 } });
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: parseInt(limit) });

        // Add distance in km
        pipeline.push({
            $addFields: {
                distanceKm: { $round: [{ $divide: ['$distance', 1000] }, 2] }
            }
        });

        const salons = await Salon.aggregate(pipeline);

        // Get total count for pagination
        const countPipeline = [
            {
                $geoNear: {
                    near: { type: 'Point', coordinates: [longitude, latitude] },
                    distanceField: 'distance',
                    maxDistance: maxDistance,
                    spherical: true
                }
            },
            { $match: { isVerified: true, isActive: true } },
            { $count: 'total' }
        ];

        const countResult = await Salon.aggregate(countPipeline);
        const total = countResult.length > 0 ? countResult[0].total : 0;

        res.status(200).json({
            success: true,
            count: salons.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: salons
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all salons (with filters)
 * @route   GET /api/salons
 * @access  Public
 */
exports.getSalons = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search, city } = req.query;

        const query = { isVerified: true, isActive: true };

        // Search by name or description
        if (search) {
            query.$text = { $search: search };
        }

        // Filter by city
        if (city) {
            query['location.city'] = new RegExp(city, 'i');
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const salons = await Salon.find(query)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ averageRating: -1, createdAt: -1 });

        const total = await Salon.countDocuments(query);

        res.status(200).json({
            success: true,
            count: salons.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: salons
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single salon
 * @route   GET /api/salons/:id
 * @access  Public
 */
exports.getSalon = async (req, res, next) => {
    try {
        const salon = await Salon.findById(req.params.id).populate('owner', 'name email');

        if (!salon) {
            return res.status(404).json({
                success: false,
                message: 'Salon not found'
            });
        }

        // Get services for this salon
        const services = await Service.find({ salon: salon._id, isActive: true });

        res.status(200).json({
            success: true,
            data: {
                salon,
                services
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get my salon (for salon owner)
 * @route   GET /api/salons/my
 * @access  Private (Salon Owner)
 */
exports.getMySalon = async (req, res, next) => {
    try {
        const salon = await Salon.findOne({ owner: req.user.id });

        if (!salon) {
            return res.status(404).json({
                success: false,
                message: 'You have not registered a salon yet'
            });
        }

        const services = await Service.find({ salon: salon._id });

        res.status(200).json({
            success: true,
            data: {
                salon,
                services
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update salon
 * @route   PUT /api/salons/:id
 * @access  Private (Salon Owner)
 */
exports.updateSalon = async (req, res, next) => {
    try {
        let salon = await Salon.findById(req.params.id);

        if (!salon) {
            return res.status(404).json({
                success: false,
                message: 'Salon not found'
            });
        }

        // Check ownership
        if (salon.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this salon'
            });
        }

        // Fields that can be updated
        const allowedUpdates = [
            'name', 'description', 'phone', 'email',
            'workingHours', 'slotDuration', 'amenities', 'coverImage', 'images'
        ];

        const updates = {};
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        // Handle location update
        if (req.body.latitude && req.body.longitude) {
            updates.location = {
                type: 'Point',
                coordinates: [req.body.longitude, req.body.latitude],
                formattedAddress: req.body.address,
                city: req.body.city,
                state: req.body.state,
                zipcode: req.body.zipcode,
                country: req.body.country
            };
        }

        salon = await Salon.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            message: 'Salon updated successfully',
            data: salon
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Add service to salon
 * @route   POST /api/salons/:id/services
 * @access  Private (Salon Owner)
 */
exports.addService = async (req, res, next) => {
    try {
        const salon = await Salon.findById(req.params.id);

        if (!salon) {
            return res.status(404).json({
                success: false,
                message: 'Salon not found'
            });
        }

        // Check ownership
        if (salon.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to add services to this salon'
            });
        }

        const { name, description, category, price, duration, gender } = req.body;

        const service = await Service.create({
            salon: salon._id,
            name,
            description,
            category,
            price,
            duration: duration || 30,
            gender: gender || 'unisex'
        });

        res.status(201).json({
            success: true,
            message: 'Service added successfully',
            data: service
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update service
 * @route   PUT /api/salons/:salonId/services/:serviceId
 * @access  Private (Salon Owner)
 */
exports.updateService = async (req, res, next) => {
    try {
        const salon = await Salon.findById(req.params.salonId);

        if (!salon) {
            return res.status(404).json({
                success: false,
                message: 'Salon not found'
            });
        }

        // Check ownership
        if (salon.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        const service = await Service.findOneAndUpdate(
            { _id: req.params.serviceId, salon: salon._id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        res.status(200).json({
            success: true,
            data: service
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete service
 * @route   DELETE /api/salons/:salonId/services/:serviceId
 * @access  Private (Salon Owner)
 */
exports.deleteService = async (req, res, next) => {
    try {
        const salon = await Salon.findById(req.params.salonId);

        if (!salon) {
            return res.status(404).json({
                success: false,
                message: 'Salon not found'
            });
        }

        // Check ownership
        if (salon.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        const service = await Service.findOneAndDelete({
            _id: req.params.serviceId,
            salon: salon._id
        });

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Service deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
