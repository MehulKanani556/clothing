const Review = require('../models/review.model');
const Product = require('../models/product.model');
const Order = require('../models/order.model');

// Add a Review
exports.addReview = async (req, res) => {
    try {
        const { product, rating, title, review } = req.body;
        const userId = req.user._id;

        // Check if verified purchase
        // (Assuming you have logic to check if user bought product)
        // const hasPurchased = await Order.findOne({ user: userId, "items.product": product, paymentStatus: 'Paid' });

        // For now, simple create
        const newReview = await Review.create({
            user: userId,
            product,
            rating,
            title,
            review,
            // isVerifiedPurchase: !!hasPurchased,
            status: 'Pending' // Default to pending moderation
        });

        // Update Product aggregate rating (optional here, usually done effectively via aggregation on fetch)

        res.status(201).json({
            success: true,
            data: newReview
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Reviews for a Product
exports.getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const reviews = await Review.find({ product: productId, status: 'Published' })
            .populate('user')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Get All Reviews
exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('user')
            .populate('product')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Update Status
exports.updateReviewStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

        res.status(200).json({ success: true, data: review });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Delete Review
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

        res.status(200).json({ success: true, message: 'Review deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
