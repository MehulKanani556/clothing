const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Offer = require('./models/offer.model');

// Load env vars
dotenv.config();

const seedOffers = async () => {
    try {
        if (!process.env.MONGODB_PATH) {
            console.error("MONGODB_PATH is missing in .env");
            process.exit(1);
        }

        // Connect DB
        const uri = process.env.MONGODB_PATH.replace('clothing', 'Clothing');
        await mongoose.connect(uri);
        console.log('MongoDB Connected');

        // Clear existing offers
        await Offer.deleteMany({});
        console.log('Existing offers cleared');

        // Create test offers
        const offers = [
            {
                code: "FIRST50",
                title: "Get Flat ₹50 Off on your first order",
                description: "Special discount for first-time customers",
                type: "FLAT",
                value: 50,
                minOrderValue: 500,
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                isActive: true,
                isFirstOrderOnly: true, // Only for first-time customers
                userUsageLimit: 1,
                usageLimit: 1000
            },
            {
                code: "SAVE100",
                title: "Get Flat ₹100 Off",
                description: "Save ₹100 on orders above ₹1000",
                type: "FLAT",
                value: 100,
                minOrderValue: 1000,
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                isActive: true,
                isFirstOrderOnly: false, // Available for all customers
                userUsageLimit: 3, // Each user can use 3 times
                usageLimit: 500
            },
            {
                code: "WELCOME20",
                title: "20% Off for New Customers",
                description: "Get 20% discount on your first purchase",
                type: "PERCENTAGE",
                value: 20,
                maxDiscount: 200,
                minOrderValue: 800,
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                isActive: true,
                isFirstOrderOnly: true, // Only for first-time customers
                userUsageLimit: 1,
                usageLimit: 200
            },
            {
                code: "REPEAT15",
                title: "15% Off for Returning Customers",
                description: "Special discount for loyal customers",
                type: "PERCENTAGE",
                value: 15,
                maxDiscount: 300,
                minOrderValue: 1200,
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                isActive: true,
                isFirstOrderOnly: false, // Available for all customers
                userUsageLimit: 2,
                usageLimit: 100
            },
            {
                code: "EXPIRED10",
                title: "Expired Coupon",
                description: "This coupon has expired",
                type: "FLAT",
                value: 10,
                minOrderValue: 100,
                startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
                endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
                isActive: false,
                isFirstOrderOnly: false,
                userUsageLimit: 1,
                usageLimit: 50
            }
        ];

        await Offer.insertMany(offers);
        console.log('Test offers created successfully!');
        
        console.log('\nCreated offers:');
        offers.forEach(offer => {
            console.log(`- ${offer.code}: ${offer.title} (First Order Only: ${offer.isFirstOrderOnly})`);
        });

        process.exit();

    } catch (error) {
        console.error("Error seeding offers:", error);
        process.exit(1);
    }
};

seedOffers();