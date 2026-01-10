const Offer = require('../models/offer.model');
const { validationResult } = require('express-validator');

exports.createOffer = async (req, res) => {
    try {
        // Enforce logic: If endDate is in the past, it cannot be active
        if (new Date(req.body.endDate) < new Date()) {
            req.body.isActive = false;
        }

        const offer = await Offer.create(req.body);
        res.status(201).json({ success: true, data: offer });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Check if valid
exports.validateCoupon = async (req, res) => {
    try {
        const { code, cartValue } = req.body;
        const offer = await Offer.findOne({ code: code.toUpperCase(), isActive: true });

        if (!offer) return res.status(404).json({ message: 'Invalid Coupon' });

        const now = new Date();
        if (now < offer.startDate) return res.status(400).json({ message: 'Offer has not started yet' });
        if (now > offer.endDate) {
            offer.isActive = false;
            await offer.save();
            return res.status(400).json({ message: 'Coupon Expired', offer });
        }
        if (cartValue < offer.minOrderValue) return res.status(400).json({ message: `Min order value is ${offer.minOrderValue}` });

        // Calculate Discount
        let discount = 0;
        if (offer.type === 'FLAT') discount = offer.value;
        else {
            discount = (cartValue * offer.value) / 100;
            if (offer.maxDiscount && discount > offer.maxDiscount) discount = offer.maxDiscount;
        }

        res.json({ success: true, discount, offerCode: code });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Offer
exports.updateOffer = async (req, res) => {
    try {
        const now = new Date();

        // 1. If user is updating endDate
        if (req.body.endDate) {
            const newEndDate = new Date(req.body.endDate);

            if (newEndDate < now) {
                // If new end date is in the past, force inactive
                req.body.isActive = false;
            } else {
                // If new end date is in the future, REACTIVATE it (unless user explicitly sent isActive: false)
                if (req.body.isActive === undefined) {
                    req.body.isActive = true;
                }
            }
        }

        const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
        res.json({ success: true, data: offer });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Soft Delete Offer
exports.deleteOffer = async (req, res) => {
    try {
        const offer = await Offer.findByIdAndUpdate(req.params.id, { deletedAt: new Date() }, { new: true });
        if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
        res.json({ success: true, message: 'Offer deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getOffers = async (req, res) => {
    try {
        // Auto-expire logic: Set isActive=false for offers where endDate < now
        await Offer.updateMany(
            { isActive: true, endDate: { $lt: new Date() } },
            { $set: { isActive: false } }
        );

        // Admin needs to see all offers except deleted ones
        const offers = await Offer.find({ deletedAt: null }).sort({ createdAt: -1 });
        res.json({ success: true, data: offers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Upload Banner
exports.uploadBanner = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file' });
    res.json({ success: true, url: req.file.location || req.file.path });
};
