const User = require('../models/User');
const Salon = require('../models/Salon');
const Booking = require('../models/Booking');

/**
 * Admin Controller - Handles moderation and monitoring
 */

// Get all salons (Admin)
exports.getAllSalons = async (req, res, next) => {
    try {
        const { isVerified, isActive, page = 1, limit = 10 } = req.query;
        const query = {};
        if (isVerified !== undefined) query.isVerified = isVerified === 'true';
        if (isActive !== undefined) query.isActive = isActive === 'true';

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const salons = await Salon.find(query)
            .populate('owner', 'name email phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

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

// Verify a salon
exports.verifySalon = async (req, res, next) => {
    try {
        const salon = await Salon.findById(req.params.id);
        if (!salon) {
            return res.status(404).json({ success: false, message: 'Salon not found' });
        }
        salon.isVerified = true;
        salon.verifiedAt = new Date();
        salon.verifiedBy = req.user.id;
        await salon.save();
        res.status(200).json({ success: true, message: 'Salon verified', data: salon });
    } catch (error) {
        next(error);
    }
};

// Block a salon
exports.blockSalon = async (req, res, next) => {
    try {
        const salon = await Salon.findById(req.params.id);
        if (!salon) {
            return res.status(404).json({ success: false, message: 'Salon not found' });
        }
        salon.isActive = false;
        salon.isVerified = false;
        await salon.save();
        res.status(200).json({ success: true, message: 'Salon blocked', data: salon });
    } catch (error) {
        next(error);
    }
};

// Unblock a salon
exports.unblockSalon = async (req, res, next) => {
    try {
        const salon = await Salon.findById(req.params.id);
        if (!salon) {
            return res.status(404).json({ success: false, message: 'Salon not found' });
        }
        salon.isActive = true;
        await salon.save();
        res.status(200).json({ success: true, message: 'Salon unblocked', data: salon });
    } catch (error) {
        next(error);
    }
};

// Get all users
exports.getAllUsers = async (req, res, next) => {
    try {
        const { role, isActive, page = 1, limit = 10 } = req.query;
        const query = {};
        if (role) query.role = role;
        if (isActive !== undefined) query.isActive = isActive === 'true';

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);
        res.status(200).json({
            success: true,
            count: users.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: users
        });
    } catch (error) {
        next(error);
    }
};

// Toggle user active status
exports.toggleUserActive = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (user.role === 'admin') {
            return res.status(400).json({ success: false, message: 'Cannot deactivate admin' });
        }
        user.isActive = !user.isActive;
        await user.save();
        res.status(200).json({
            success: true,
            message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// Get all bookings
exports.getAllBookings = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const query = {};
        if (status) query.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const bookings = await Booking.find(query)
            .populate('customer', 'name email')
            .populate('salon', 'name')
            .sort({ createdAt: -1 })
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

// Dashboard stats
exports.getDashboardStats = async (req, res, next) => {
    try {
        const stats = {
            users: {
                customers: await User.countDocuments({ role: 'customer' }),
                salonOwners: await User.countDocuments({ role: 'salonOwner' })
            },
            salons: {
                total: await Salon.countDocuments(),
                verified: await Salon.countDocuments({ isVerified: true }),
                pending: await Salon.countDocuments({ isVerified: false, isActive: true })
            },
            bookings: {
                total: await Booking.countDocuments(),
                completed: await Booking.countDocuments({ status: 'completed' }),
                cancelled: await Booking.countDocuments({ status: 'cancelled' })
            }
        };
        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        next(error);
    }
};
