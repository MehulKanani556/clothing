const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    title: {
        type: String,
        // maxLength: 100
    },
    review: {
        type: String,
        required: true,
        // maxLength: 1000
    },
    status: {
        type: String,
        enum: ['Pending', 'Published', 'Rejected'],
        default: 'Pending'
    },
    isVerifiedPurchase: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

// Prevent duplicate reviews from same user on same product (optional, but good practice)
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
