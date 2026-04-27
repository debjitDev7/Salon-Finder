const mongoose = require('mongoose');

/**
 * Service Schema
 * Represents services offered by a salon (haircut, beard trim, spa, etc.)
 * Each service has a name, description, price, and duration
 */
const ServiceSchema = new mongoose.Schema({
    salon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please add a service name'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    description: {
        type: String,
        maxlength: [300, 'Description cannot be more than 300 characters']
    },
    category: {
        type: String,
        required: [true, 'Please add a category'],
        enum: [
            'haircut',
            'beard',
            'shave',
            'facial',
            'spa',
            'massage',
            'hair-color',
            'hair-treatment',
            'manicure',
            'pedicure',
            'waxing',
            'threading',
            'makeup',
            'bridal',
            'other'
        ]
    },
    price: {
        type: Number,
        required: [true, 'Please add a price']
    },
    // Duration in minutes
    duration: {
        type: Number,
        required: [true, 'Please add service duration'],
        default: 30
    },
    // For gender-specific services
    gender: {
        type: String,
        enum: ['male', 'female', 'unisex'],
        default: 'unisex'
    },
    image: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
ServiceSchema.index({ salon: 1, category: 1 });
ServiceSchema.index({ salon: 1, isActive: 1 });

module.exports = mongoose.model('Service', ServiceSchema);
