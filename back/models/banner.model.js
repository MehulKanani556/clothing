const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    subtitle: {
        type: String,
        trim: true
    },
    image: {
        type: String,
        required: true
    },
    link: {
        type: String,
        default: '#'
    },
    buttonText: {
        type: String,
        default: 'Shop Now'
    },
    textPosition: {
        type: String,
        enum: ['left', 'right', 'center'],
        default: 'left'
    },
    textColor: {
        type: String,
        default: '#000000' // Black
    },
    highlightColor: {
        type: String, // For the "Exclusive" or highlighted part
        default: '#DC2626' // Red-600
    },
    subtitleHighlightColor: {
        type: String,
        default: '#ECA72C' // Gold/Orange
    },
    backgroundColor: {
        type: String,
        default: '#F3F4F6' // Gray-100
    },
    buttonColor: {
        type: String,
        default: '#000000' // Black
    },
    order: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
