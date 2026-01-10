const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    title: { type: String, required: true },
    description: String,

    // Image content
    bannerImage: { type: String }, // AWS S3 URL

    // Discount Logic
    type: { type: String, enum: ['PERCENTAGE', 'FLAT'], required: true },
    value: { type: Number, required: true }, // 10% or 100rs
    maxDiscount: { type: Number }, // Max cap for % off
    minOrderValue: { type: Number, default: 0 },

    // Targeting
    applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

    // Scheduling
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    usageLimit: { type: Number }, // Total times coupon can be used
    usageCount: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null }

}, { timestamps: true });

offerSchema.index({ code: 1 });
offerSchema.index({ isActive: 1, endDate: 1 });

module.exports = mongoose.model('Offer', offerSchema);
