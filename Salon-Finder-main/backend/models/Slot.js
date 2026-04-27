const mongoose = require('mongoose');

/**
 * Slot Schema
 * Represents time slots for a salon on a specific date
 * Slots are generated based on salon's working hours
 */
const SlotSchema = new mongoose.Schema({
    salon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon',
        required: true
    },
    date: {
        type: Date,
        required: [true, 'Please add a date']
    },
    startTime: {
        type: String, // Format: "HH:MM" (24-hour)
        required: [true, 'Please add start time']
    },
    endTime: {
        type: String, // Format: "HH:MM" (24-hour)
        required: [true, 'Please add end time']
    },
    // Is the slot available for booking?
    isAvailable: {
        type: Boolean,
        default: true
    },
    // Has the salon owner enabled this slot?
    isEnabled: {
        type: Boolean,
        default: true
    },
    // Who booked this slot (if booked)
    bookedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Reference to the booking
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index for efficient slot queries
SlotSchema.index({ salon: 1, date: 1, startTime: 1 });
SlotSchema.index({ salon: 1, date: 1, isAvailable: 1, isEnabled: 1 });

// Prevent duplicate slots (same salon, date, start time)
SlotSchema.index(
    { salon: 1, date: 1, startTime: 1 },
    { unique: true }
);

module.exports = mongoose.model('Slot', SlotSchema);
