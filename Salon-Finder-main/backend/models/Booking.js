const mongoose = require('mongoose');

/**
 * Booking Schema
 * Represents a customer's booking at a salon
 * Tracks status from pending to completed
 */
const BookingSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    salon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon',
        required: true
    },
    slot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Slot',
        required: true
    },
    services: [{
        service: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service',
            required: true
        },
        name: String,
        price: Number,
        duration: Number
    }],
    // Booking date and time (denormalized for easier queries)
    bookingDate: {
        type: Date,
        required: true
    },
    bookingTime: {
        type: String, // Format: "HH:MM"
        required: true
    },
    // Total price of all services
    totalAmount: {
        type: Number,
        required: true
    },
    // Booking status
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
        default: 'pending'
    },
    // Who cancelled and why
    cancelledBy: {
        type: String,
        enum: ['customer', 'salon', 'admin']
    },
    cancellationReason: String,
    cancelledAt: Date,
    // Notes from customer or salon
    customerNotes: {
        type: String,
        maxlength: [300, 'Notes cannot be more than 300 characters']
    },
    salonNotes: {
        type: String,
        maxlength: [300, 'Notes cannot be more than 300 characters']
    },
    // Payment info (for future payment integration)
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
    },
    paymentMethod: String,
    transactionId: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
BookingSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Indexes for common queries
BookingSchema.index({ customer: 1, status: 1 });
BookingSchema.index({ salon: 1, bookingDate: 1 });
BookingSchema.index({ salon: 1, status: 1 });
BookingSchema.index({ bookingDate: 1 });

module.exports = mongoose.model('Booking', BookingSchema);
