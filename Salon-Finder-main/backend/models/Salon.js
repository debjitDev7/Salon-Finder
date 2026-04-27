const mongoose = require('mongoose');

/**
 * Salon Schema
 * Contains salon details, location (GeoJSON), working hours, and verification status
 * Uses 2dsphere index for geospatial queries
 */
const SalonSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a salon name'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    email: {
        type: String,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    phone: {
        type: String,
        required: [true, 'Please add a contact number'],
        maxlength: [15, 'Phone number cannot be longer than 15 characters']
    },
    // GeoJSON location for geospatial queries
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        },
        formattedAddress: String,
        street: String,
        city: String,
        state: String,
        zipcode: String,
        country: String
    },
    // Working hours for each day of the week
    workingHours: {
        monday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
        tuesday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
        wednesday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
        thursday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
        friday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
        saturday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
        sunday: { open: String, close: String, isClosed: { type: Boolean, default: true } }
    },
    // Slot duration in minutes (e.g., 30, 45, 60)
    slotDuration: {
        type: Number,
        default: 30,
        enum: [15, 30, 45, 60, 90, 120]
    },
    images: [{
        type: String
    }],
    coverImage: {
        type: String,
        default: 'default-salon.jpg'
    },
    amenities: [{
        type: String,
        enum: ['wifi', 'parking', 'ac', 'card-payment', 'wheelchair-accessible']
    }],
    // Ratings (calculated from reviews)
    averageRating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot be more than 5']
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    // Status flags
    isVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // For admin moderation
    verifiedAt: Date,
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create geospatial index
SalonSchema.index({ location: '2dsphere' });

// Create text index for search
SalonSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Salon', SalonSchema);
