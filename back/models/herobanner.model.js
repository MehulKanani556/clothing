const mongoose = require('mongoose');

const heroBannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    subtitle: {
        type: String,
        trim: true
    },
    description: {
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
        enum: ['left', 'right'],
        default: 'left'
    },
    textColor: {
        type: String,
        default: '#000000' // Black
    },
    backgroundColor: {
        type: String,
        default: '#ffffff' // White
    },
    titleHighlightColor: {
        type: String, // For the "Exclusive" or highlighted part
        default: '#DC2626' // Red-600
    },
    subtitleHighlightColor: {
        type: String,
        default: '#ECA72C' // Gold/Orange
    },
    buttonColor: {
        type: String,
        default: '#000000' // Black
    },
    descriptionColor: {
        type: String,
        default: '#000000' // Black
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

module.exports = mongoose.model('heroBanner', heroBannerSchema);
