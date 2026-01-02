const Offer = require('../models/offer.model');
const { validationResult } = require('express-validator');

exports.createOffer = async (req, res) => {
    try {
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

        if (new Date() > offer.endDate) return res.status(400).json({ message: 'Coupon Expired' });
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

exports.getOffers = async (req, res) => {
    const offers = await Offer.find({ isActive: true, endDate: { $gte: new Date() } });
    res.json({ success: true, data: offers });
};

// Upload Banner
exports.uploadBanner = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file' });
    res.json({ success: true, url: req.file.location || req.file.path });
};
