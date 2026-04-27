const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const Salon = require('../models/Salon');
const Service = require('../models/Service');

/**
 * Booking Controller
 * Handles booking creation, management, and cancellation
 */

/**
 * @desc    Create a new booking
 * @route   POST /api/bookings
 * @access  Private (Customer)
 */
exports.createBooking = async (req, res, next) => {
    try {
        const { slotId, serviceIds, customerNotes } = req.body;

        // Validate slot
        if (!slotId) {
            return res.status(400).json({
                success: false,
                message: 'Slot ID is required'
            });
        }

        // Validate services
        if (!serviceIds || !serviceIds.length) {
            return res.status(400).json({
                success: false,
                message: 'At least one service is required'
            });
        }

        // Atomic operation: Find and update slot to prevent double booking
        const slot = await Slot.findOneAndUpdate(
            {
                _id: slotId,
                isAvailable: true,
                isEnabled: true
            },
            {
                isAvailable: false,
                bookedBy: req.user.id
            },
            { new: true }
        );

        if (!slot) {
            return res.status(400).json({
                success: false,
                message: 'Slot is not available or already booked'
            });
        }

        // Get salon
        const salon = await Salon.findById(slot.salon);
        if (!salon || !salon.isActive || !salon.isVerified) {
            // Rollback slot
            await Slot.findByIdAndUpdate(slotId, {
                isAvailable: true,
                bookedBy: null
            });

            return res.status(400).json({
                success: false,
                message: 'Salon is not available'
            });
        }

        // Get services and calculate total
        const services = await Service.find({
            _id: { $in: serviceIds },
            salon: salon._id,
            isActive: true
        });

        if (services.length === 0) {
            // Rollback slot
            await Slot.findByIdAndUpdate(slotId, {
                isAvailable: true,
                bookedBy: null
            });

            return res.status(400).json({
                success: false,
                message: 'No valid services found'
            });
        }

        // Prepare service details for booking
        const bookingServices = services.map(service => ({
            service: service._id,
            name: service.name,
            price: service.price,
            duration: service.duration
        }));

        const totalAmount = services.reduce((sum, service) => sum + service.price, 0);

        // Create booking
        const booking = await Booking.create({
            customer: req.user.id,
            salon: salon._id,
            slot: slot._id,
            services: bookingServices,
            bookingDate: slot.date,
            bookingTime: slot.startTime,
            totalAmount,
            customerNotes,
            status: 'confirmed' // Auto-confirm for now
        });

        // Update slot with booking reference
        await Slot.findByIdAndUpdate(slotId, { booking: booking._id });

        // Populate booking for response
        const populatedBooking = await Booking.findById(booking._id)
            .populate('salon', 'name phone location')
            .populate('slot', 'date startTime endTime');

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: populatedBooking
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get my bookings (customer)
 * @route   GET /api/bookings/my
 * @access  Private (Customer)
 */
exports.getMyBookings = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;

        const query = { customer: req.user.id };

        if (status) {
            query.status = status;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const bookings = await Booking.find(query)
            .populate('salon', 'name phone location coverImage')
            .populate('slot', 'date startTime endTime')
            .sort({ bookingDate: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Booking.countDocuments(query);

        res.status(200).json({
            success: true,
            count: bookings.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: bookings
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get upcoming bookings (customer)
 * @route   GET /api/bookings/upcoming
 * @access  Private (Customer)
 */
exports.getUpcomingBookings = async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const bookings = await Booking.find({
            customer: req.user.id,
            bookingDate: { $gte: today },
            status: { $in: ['pending', 'confirmed'] }
        })
            .populate('salon', 'name phone location coverImage')
            .populate('slot', 'date startTime endTime')
            .sort({ bookingDate: 1, bookingTime: 1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single booking
 * @route   GET /api/bookings/:id
 * @access  Private
 */
exports.getBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('customer', 'name email phone')
            .populate('salon', 'name phone location coverImage')
            .populate('slot', 'date startTime endTime');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check access
        const salon = await Salon.findById(booking.salon._id);
        const isOwner = salon && salon.owner.toString() === req.user.id;
        const isCustomer = booking.customer._id.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isCustomer && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this booking'
            });
        }

        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Cancel booking
 * @route   PUT /api/bookings/:id/cancel
 * @access  Private
 */
exports.cancelBooking = async (req, res, next) => {
    try {
        const { reason } = req.body;

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if booking can be cancelled
        if (['completed', 'cancelled'].includes(booking.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel a ${booking.status} booking`
            });
        }

        // Check cancellation eligibility
        const salon = await Salon.findById(booking.salon);
        const isOwner = salon && salon.owner.toString() === req.user.id;
        const isCustomer = booking.customer.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isCustomer && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this booking'
            });
        }

        // Check cancellation time (e.g., 2 hours before)
        const bookingDateTime = new Date(booking.bookingDate);
        const [hours, minutes] = booking.bookingTime.split(':').map(Number);
        bookingDateTime.setHours(hours, minutes, 0, 0);

        const now = new Date();
        const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60);

        if (isCustomer && hoursUntilBooking < 2) {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel booking less than 2 hours before the appointment'
            });
        }

        // Update booking
        booking.status = 'cancelled';
        booking.cancelledBy = isAdmin ? 'admin' : isOwner ? 'salon' : 'customer';
        booking.cancellationReason = reason;
        booking.cancelledAt = new Date();
        await booking.save();

        // Release the slot
        await Slot.findByIdAndUpdate(booking.slot, {
            isAvailable: true,
            bookedBy: null,
            booking: null
        });

        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully',
            data: booking
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get salon bookings (for salon owner)
 * @route   GET /api/bookings/salon
 * @access  Private (Salon Owner)
 */
exports.getSalonBookings = async (req, res, next) => {
    try {
        const { date, status, page = 1, limit = 10 } = req.query;

        const salon = await Salon.findOne({ owner: req.user.id });

        if (!salon) {
            return res.status(404).json({
                success: false,
                message: 'You must create a salon first'
            });
        }

        const query = { salon: salon._id };

        if (date) {
            const queryDate = new Date(date);
            queryDate.setHours(0, 0, 0, 0);
            const nextDay = new Date(queryDate);
            nextDay.setDate(nextDay.getDate() + 1);
            query.bookingDate = { $gte: queryDate, $lt: nextDay };
        }

        if (status) {
            query.status = status;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const bookings = await Booking.find(query)
            .populate('customer', 'name email phone')
            .populate('slot', 'date startTime endTime')
            .sort({ bookingDate: -1, bookingTime: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Booking.countDocuments(query);

        res.status(200).json({
            success: true,
            count: bookings.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: bookings
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update booking status (for salon owner)
 * @route   PUT /api/bookings/:id/status
 * @access  Private (Salon Owner)
 */
exports.updateBookingStatus = async (req, res, next) => {
    try {
        const { status, salonNotes } = req.body;

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        const salon = await Salon.findById(booking.salon);

        if (!salon || salon.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Validate status transition
        const validTransitions = {
            'pending': ['confirmed', 'cancelled'],
            'confirmed': ['completed', 'cancelled', 'no-show']
        };

        if (!validTransitions[booking.status]?.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot change status from ${booking.status} to ${status}`
            });
        }

        booking.status = status;
        if (salonNotes) {
            booking.salonNotes = salonNotes;
        }

        if (status === 'cancelled') {
            booking.cancelledBy = 'salon';
            booking.cancelledAt = new Date();

            // Release the slot
            await Slot.findByIdAndUpdate(booking.slot, {
                isAvailable: true,
                bookedBy: null,
                booking: null
            });
        }

        await booking.save();

        res.status(200).json({
            success: true,
            message: `Booking ${status}`,
            data: booking
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get today's bookings for salon owner
 * @route   GET /api/bookings/today
 * @access  Private (Salon Owner)
 */
exports.getTodayBookings = async (req, res, next) => {
    try {
        const salon = await Salon.findOne({ owner: req.user.id });

        if (!salon) {
            return res.status(404).json({
                success: false,
                message: 'You must create a salon first'
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const bookings = await Booking.find({
            salon: salon._id,
            bookingDate: { $gte: today, $lt: tomorrow },
            status: { $in: ['pending', 'confirmed'] }
        })
            .populate('customer', 'name email phone')
            .populate('slot', 'date startTime endTime')
            .sort({ bookingTime: 1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        next(error);
    }
};
