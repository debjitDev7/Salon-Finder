const mongoose = require('mongoose');

/**
 * Review Schema
 * Customer reviews and ratings for salons
 * Automatically updates salon's average rating
 */
const ReviewSchema = new mongoose.Schema({
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
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    },
    rating: {
        type: Number,
        required: [true, 'Please add a rating'],
        min: 1,
        max: 5
    },
    title: {
        type: String,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    comment: {
        type: String,
        maxlength: [500, 'Comment cannot be more than 500 characters']
    },
    // Salon owner can respond to reviews
    response: {
        text: String,
        respondedAt: Date
    },
    // For moderation
    isApproved: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent duplicate reviews (one review per customer per salon)
ReviewSchema.index({ customer: 1, salon: 1 }, { unique: true });

// Static method to calculate average rating
ReviewSchema.statics.calculateAverageRating = async function (salonId) {
    const result = await this.aggregate([
        { $match: { salon: salonId, isApproved: true } },
        {
            $group: {
                _id: '$salon',
                averageRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 }
            }
        }
    ]);

    try {
        const Salon = mongoose.model('Salon');
        if (result.length > 0) {
            await Salon.findByIdAndUpdate(salonId, {
                averageRating: Math.round(result[0].averageRating * 10) / 10,
                totalReviews: result[0].totalReviews
            });
        } else {
            await Salon.findByIdAndUpdate(salonId, {
                averageRating: undefined,
                totalReviews: 0
            });
        }
    } catch (err) {
        console.error('Error updating salon rating:', err);
    }
};

// Update average rating after save
ReviewSchema.post('save', function () {
    this.constructor.calculateAverageRating(this.salon);
});

// Update average rating after remove
ReviewSchema.post('remove', function () {
    this.constructor.calculateAverageRating(this.salon);
});

module.exports = mongoose.model('Review', ReviewSchema);
