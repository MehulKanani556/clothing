const Review = require('../models/review.model');
const Product = require('../models/product.model');
const Order = require('../models/order.model');

// Add a Review
exports.addReview = async (req, res) => {
    try {
        const { product, rating, title, review } = req.body;
        const userId = req.user._id;

        // Ensure rating is a number
        const parsedRating = Number(rating);

        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            imageUrls = req.files.map(file => file.location);
        }

        console.log(product, "newReview");
        // For now, simple create
        const newReview = await Review.create({
            user: userId,
            product,
            rating: parsedRating,
            title,
            review,
            images: imageUrls,
            // isVerifiedPurchase: !!hasPurchased,
            status: 'Pending' // Default to pending moderation
        });


        // Update Product aggregate rating
        const allReviews = await Review.find({ product: product, status: { $in: ['Pending', 'Published'] } });

        let totalRating = 0;
        const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

        allReviews.forEach(rev => {
            totalRating += rev.rating;
            // Categorize half-ratings into the integer buckets (e.g., 4.5 goes into the 4-star bucket)
            const ratingBucket = Math.floor(rev.rating);
            if (breakdown[ratingBucket] !== undefined) {
                breakdown[ratingBucket] += 1;
            }
        });

        const avgRating = allReviews.length > 0 ? (totalRating / allReviews.length) : 0;

        await Product.findByIdAndUpdate(product, {
            rating: {
                average: Number(avgRating.toFixed(1)),
                count: allReviews.length,
                breakdown
            }
        });

        res.status(201).json({
            success: true,
            data: newReview
        });

    } catch (error) {
        console.log(error, "error");
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
        const reviews = await Review.find({ product: productId, status: 'Published', deletedAt: null })
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
        const reviews = await Review.find({ deletedAt: null })
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
        const review = await Review.findByIdAndUpdate(req.params.id, { deletedAt: new Date() }, { new: true });
        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

        res.status(200).json({ success: true, message: 'Review deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
