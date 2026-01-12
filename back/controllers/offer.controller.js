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
        const userId = req.user?._id; // Get user ID from auth middleware

        const offer = await Offer.findOne({ code: code.toUpperCase(), isActive: true });

        if (!offer) return res.status(404).json({ message: 'Invalid Coupon' });

        const now = new Date();
        if (now < offer.startDate) return res.status(400).json({ message: 'Offer has not started yet' });
        if (now > offer.endDate) {
            offer.isActive = false;
            await offer.save();
            return res.status(400).json({ message: 'Coupon Expired', offer });
        }
        if (cartValue < offer.minOrderValue) return res.status(400).json({ message: `Min order value is ₹${offer.minOrderValue}` });

        // Check total usage limit
        if (offer.usageLimit && offer.usageCount >= offer.usageLimit) {
            return res.status(400).json({ message: 'Coupon usage limit exceeded' });
        }

        // User-specific validations (only if user is logged in)
        if (userId) {
            // Check if user has already used this coupon
            const userUsage = offer.usedByUsers.filter(usage => usage.userId.toString() === userId.toString());
            if (userUsage.length >= offer.userUsageLimit) {
                return res.status(400).json({ message: 'You have already used this coupon' });
            }

            // Check if this is a first-order-only coupon
            if (offer.isFirstOrderOnly) {
                const Order = require('../models/order.model');
                const userOrderCount = await Order.countDocuments({
                    user: userId,
                    status: { $in: ['Confirmed', 'Processing', 'Shipped', 'Delivered'] }
                });

                if (userOrderCount > 0) {
                    return res.status(400).json({ message: 'This coupon is only valid for first-time customers' });
                }
            }

            // Check Applicable Categories & Products (Requires Cart)
            if ((offer.applicableCategories && offer.applicableCategories.length > 0) ||
                (offer.applicableProducts && offer.applicableProducts.length > 0)) {

                const Cart = require('../models/cart.model');
                // Ensure we select 'category' field from product
                const userCart = await Cart.findOne({ user: userId }).populate('items.product', 'category');

                if (!userCart) return res.status(400).json({ message: 'Cart not found' });

                if (offer.applicableCategories && offer.applicableCategories.length > 0) {
                    const hasCategory = userCart.items.some(item => {
                        if (!item.product) return false;
                        // item.product.category is ObjectId or String ID
                        const catId = item.product.category ? item.product.category.toString() : null;
                        return catId && offer.applicableCategories.includes(catId);
                    });
                    if (!hasCategory) return res.status(400).json({ message: 'Coupon not applicable for items in cart' });
                }

                if (offer.applicableProducts && offer.applicableProducts.length > 0) {
                    const hasProduct = userCart.items.some(item => {
                        if (!item.product) return false;
                        const prodId = item.product._id ? item.product._id.toString() : item.product.toString();
                        return offer.applicableProducts.includes(prodId);
                    });
                    if (!hasProduct) return res.status(400).json({ message: 'Coupon not applicable for items in cart' });
                }
            }
        }

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
        const userId = req.user?._id; // Get user ID if authenticated

        // Auto-expire logic: Set isActive=false for offers where endDate < now
        await Offer.updateMany(
            { isActive: true, endDate: { $lt: new Date() } },
            { $set: { isActive: false } }
        );

        // Get all active offers
        let offers = await Offer.find({
            deletedAt: null,
            isActive: true,
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
        }).sort({ createdAt: -1 });

        // Filter offers based on user eligibility (only if user is authenticated)
        if (userId) {
            const Order = require('../models/order.model');

            // Get user's order count for first-order validation
            const userOrderCount = await Order.countDocuments({
                user: userId,
                status: { $in: ['Confirmed', 'Processing', 'Shipped', 'Delivered'] }
            });

            offers = offers.filter(offer => {
                // Check if user has already used this coupon
                const userUsage = offer.usedByUsers.filter(usage => usage.userId.toString() === userId.toString());
                if (userUsage.length >= offer.userUsageLimit) {
                    return false; // User has exceeded usage limit for this coupon
                }

                // Check first-order-only condition
                if (offer.isFirstOrderOnly && userOrderCount > 0) {
                    return false; // Not eligible for first-order-only coupons
                }

                // Check total usage limit
                if (offer.usageLimit && offer.usageCount >= offer.usageLimit) {
                    return false; // Coupon usage limit exceeded
                }

                return true; // Offer is eligible for this user
            });
        }

        res.json({ success: true, data: offers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin endpoint to get all offers (without user filtering)
exports.getAllOffersAdmin = async (req, res) => {
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
