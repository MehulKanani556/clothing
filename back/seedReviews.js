const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Review = require('./models/review.model');
const Product = require('./models/product.model');

dotenv.config();

// USAGE: node seedReviews.js <SourceProductId> <TargetProductId>
// Example: node seedReviews.js 64af... 64bf...

// If you want to just add GENERIC dummy reviews to a target product without copying:
// USAGE: node seedReviews.js DUMMY <TargetProductId>

const arg1 = process.argv[2];
const arg2 = process.argv[3];

if (!arg1 || !arg2) {
    console.error("Usage: node seedReviews.js <SourceProductId|DUMMY> <TargetProductId>");
    process.exit(1);
}

const updateProductStats = async (productId) => {
    try {
        console.log(`Updating stats for product: ${productId}`);
        const stats = await Review.aggregate([
            {
                $match: {
                    product: new mongoose.Types.ObjectId(productId),
                    status: 'Published',
                    deletedAt: null
                }
            },
            {
                $facet: {
                    overall: [
                        {
                            $group: {
                                _id: '$product',
                                avgRating: { $avg: '$rating' },
                                nRating: { $sum: 1 }
                            }
                        }
                    ],
                    breakdown: [
                        {
                            $group: {
                                _id: '$rating',
                                count: { $sum: 1 }
                            }
                        }
                    ]
                }
            }
        ]);

        let avgRating = 0;
        let nRating = 0;
        let breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

        if (stats[0].overall.length > 0) {
            avgRating = stats[0].overall[0].avgRating;
            nRating = stats[0].overall[0].nRating;
        }

        if (stats[0].breakdown.length > 0) {
            stats[0].breakdown.forEach(item => {
                if (breakdown[item._id] !== undefined) {
                    breakdown[item._id] = item.count;
                }
            });
        }

        await Product.findByIdAndUpdate(productId, {
            rating: {
                average: avgRating.toFixed(1),
                count: nRating,
                breakdown: breakdown
            }
        });
        console.log(`Stats updated: ${nRating} reviews, Avg: ${avgRating.toFixed(1)}`);

    } catch (error) {
        console.error("Error updating product stats:", error);
    }
};

const seedReviews = async () => {
    try {
        if (process.env.MONGODB_PATH) {
            const uri = process.env.MONGODB_PATH.replace('clothing', 'Clothing').replace('clothing', 'Clothing'); // Ensure proper case
            await mongoose.connect(uri);
            console.log('MongoDB Connected');
        } else {
            throw new Error("MONGODB_PATH not found in .env");
        }

        const targetProductId = arg2;

        if (arg1 === 'DUMMY') {
            console.log("Adding GENERIC dummy reviews...");
            // Generic dummy reviews
            // We need valid User IDs. We'll fetch a few users.
            const User = require('./models/user.model'); // Adjust path if needed, assuming standard user model
            let users = await mongoose.model('User').find().limit(5);

            if (users.length === 0) {
                console.log("No users found to assign reviews to. Creating a dummy user is required manually or provide users.");
                // Fallback to not setting user or error? Review model requires user.
                // We can't proceed without users.
                console.log("Cannot add dummy reviews without users in DB.");
                process.exit(1);
            }

            const dummyTexts = [
                { rating: 5, title: 'Excellent!', review: 'Really loved this product. Great quality.' },
                { rating: 4, title: 'Good Purchase', review: 'Worth the money, fit is good.' },
                { rating: 5, title: 'Amazing', review: 'Best purchase I made this month.' },
                { rating: 3, title: 'Decent', review: 'Quality is okay, but delivery was late.' },
                { rating: 4, title: 'Nice', review: 'Looks exactly like the picture.' }
            ];

            const newReviews = dummyTexts.map((text, index) => ({
                user: users[index % users.length]._id,
                product: targetProductId,
                rating: text.rating,
                title: text.title,
                review: text.review,
                status: 'Published',
                isVerifiedPurchase: true
            }));

            await Review.insertMany(newReviews, { ordered: false });
            console.log(`Added ${newReviews.length} dummy reviews.`);

        } else {
            console.log(`Duplicating reviews from ${arg1} to ${targetProductId}...`);
            const sourceProductId = arg1;

            const sourceReviews = await Review.find({ product: sourceProductId, deletedAt: null });

            if (sourceReviews.length === 0) {
                console.log("No reviews found for source product.");
                process.exit(0);
            }

            const newReviews = sourceReviews.map(r => ({
                user: r.user,
                product: targetProductId,
                rating: r.rating,
                title: r.title,
                review: r.review,
                status: r.status,
                isVerifiedPurchase: r.isVerifiedPurchase,
                createdAt: new Date(), // Reset dates
                updatedAt: new Date()
            }));

            try {
                await Review.insertMany(newReviews, { ordered: false });
                console.log(`Successfully duplicated ${newReviews.length} reviews.`);
            } catch (err) {
                if (err.code === 11000) {
                    console.log("Partial success: Some reviews were skipped because the user already reviewed the target product.");
                } else {
                    throw err;
                }
            }
        }

        // Update stats
        await updateProductStats(targetProductId);

        console.log("Done.");
        process.exit(0);

    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
};

seedReviews();
