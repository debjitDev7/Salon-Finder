const Slot = require('../models/Slot');
const Salon = require('../models/Salon');
const { generateSlotsForRange } = require('../utils/slotGenerator');

/**
 * Slot Controller
 * Handles slot generation and management
 */

/**
 * @desc    Generate slots for a date range
 * @route   POST /api/slots/generate
 * @access  Private (Salon Owner)
 */
exports.generateSlots = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.body;

        // Find salon owned by user
        const salon = await Salon.findOne({ owner: req.user.id });

        if (!salon) {
            return res.status(404).json({
                success: false,
                message: 'You must create a salon first'
            });
        }

        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (start < today) {
            return res.status(400).json({
                success: false,
                message: 'Start date cannot be in the past'
            });
        }

        if (end < start) {
            return res.status(400).json({
                success: false,
                message: 'End date must be after start date'
            });
        }

        // Limit to 30 days maximum
        const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        if (diffDays > 30) {
            return res.status(400).json({
                success: false,
                message: 'Cannot generate slots for more than 30 days at once'
            });
        }

        // Generate slots
        const slotsToCreate = generateSlotsForRange(salon, start, end);

        if (slotsToCreate.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No slots to generate. Check your working hours.'
            });
        }

        // Insert slots (skip duplicates)
        const result = await Slot.insertMany(slotsToCreate, { ordered: false })
            .catch(err => {
                // Handle duplicate key errors
                if (err.code === 11000) {
                    return { insertedCount: err.result?.nInserted || 0 };
                }
                throw err;
            });

        res.status(201).json({
            success: true,
            message: `${result.insertedCount || slotsToCreate.length} slots generated`,
            data: {
                totalGenerated: slotsToCreate.length,
                inserted: result.insertedCount || slotsToCreate.length
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get available slots for a salon on a specific date
 * @route   GET /api/slots/salon/:salonId
 * @access  Public
 */
exports.getSalonSlots = async (req, res, next) => {
    try {
        const { salonId } = req.params;
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Date is required'
            });
        }

        const queryDate = new Date(date);
        queryDate.setHours(0, 0, 0, 0);

        const nextDay = new Date(queryDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const slots = await Slot.find({
            salon: salonId,
            date: {
                $gte: queryDate,
                $lt: nextDay
            },
            isEnabled: true
        }).sort({ startTime: 1 });

        res.status(200).json({
            success: true,
            count: slots.length,
            data: slots
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get my salon's slots (for salon owner)
 * @route   GET /api/slots/my
 * @access  Private (Salon Owner)
 */
exports.getMySlots = async (req, res, next) => {
    try {
        const { date, startDate, endDate } = req.query;

        const salon = await Salon.findOne({ owner: req.user.id });

        if (!salon) {
            return res.status(404).json({
                success: false,
                message: 'You must create a salon first'
            });
        }

        let query = { salon: salon._id };

        if (date) {
            const queryDate = new Date(date);
            queryDate.setHours(0, 0, 0, 0);
            const nextDay = new Date(queryDate);
            nextDay.setDate(nextDay.getDate() + 1);
            query.date = { $gte: queryDate, $lt: nextDay };
        } else if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const slots = await Slot.find(query)
            .populate('bookedBy', 'name email phone')
            .sort({ date: 1, startTime: 1 });

        res.status(200).json({
            success: true,
            count: slots.length,
            data: slots
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Enable/disable a slot
 * @route   PUT /api/slots/:id/toggle
 * @access  Private (Salon Owner)
 */
exports.toggleSlot = async (req, res, next) => {
    try {
        const slot = await Slot.findById(req.params.id);

        if (!slot) {
            return res.status(404).json({
                success: false,
                message: 'Slot not found'
            });
        }

        const salon = await Salon.findOne({ _id: slot.salon, owner: req.user.id });

        if (!salon) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to modify this slot'
            });
        }

        // Cannot disable a booked slot
        if (!slot.isAvailable) {
            return res.status(400).json({
                success: false,
                message: 'Cannot disable a booked slot'
            });
        }

        slot.isEnabled = !slot.isEnabled;
        await slot.save();

        res.status(200).json({
            success: true,
            message: `Slot ${slot.isEnabled ? 'enabled' : 'disabled'}`,
            data: slot
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Bulk enable/disable slots
 * @route   PUT /api/slots/bulk-toggle
 * @access  Private (Salon Owner)
 */
exports.bulkToggleSlots = async (req, res, next) => {
    try {
        const { slotIds, isEnabled } = req.body;

        const salon = await Salon.findOne({ owner: req.user.id });

        if (!salon) {
            return res.status(404).json({
                success: false,
                message: 'You must create a salon first'
            });
        }

        // Update only available slots (not booked ones)
        const result = await Slot.updateMany(
            {
                _id: { $in: slotIds },
                salon: salon._id,
                isAvailable: true
            },
            { isEnabled }
        );

        res.status(200).json({
            success: true,
            message: `${result.modifiedCount} slots updated`,
            data: { modifiedCount: result.modifiedCount }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete future slots
 * @route   DELETE /api/slots/future
 * @access  Private (Salon Owner)
 */
exports.deleteFutureSlots = async (req, res, next) => {
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

        // Only delete available (unbooked) future slots
        const result = await Slot.deleteMany({
            salon: salon._id,
            date: { $gte: today },
            isAvailable: true
        });

        res.status(200).json({
            success: true,
            message: `${result.deletedCount} future slots deleted`
        });
    } catch (error) {
        next(error);
    }
};
