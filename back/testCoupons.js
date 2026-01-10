const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Offer = require('./models/offer.model');
const User = require('./models/user.model');
const Order = require('./models/order.model');

// Load env vars
dotenv.config();

const testCoupons = async () => {
    try {
        if (!process.env.MONGODB_PATH) {
            console.error("MONGODB_PATH is missing in .env");
            process.exit(1);
        }

        // Connect DB
        const uri = process.env.MONGODB_PATH.replace('clothing', 'Clothing');
        await mongoose.connect(uri);
        console.log('MongoDB Connected');

        // Test scenarios
        console.log('\n=== COUPON TESTING SCENARIOS ===\n');

        // Scenario 1: New user should see first-order coupons
        console.log('1. Testing first-order coupons for new user:');
        const firstOrderOffers = await Offer.find({ 
            isActive: true, 
            isFirstOrderOnly: true,
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
        });
        console.log(`   Found ${firstOrderOffers.length} first-order coupons:`);
        firstOrderOffers.forEach(offer => {
            console.log(`   - ${offer.code}: ${offer.title}`);
        });

        // Scenario 2: Regular offers for all users
        console.log('\n2. Testing regular offers for all users:');
        const regularOffers = await Offer.find({ 
            isActive: true, 
            isFirstOrderOnly: false,
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
        });
        console.log(`   Found ${regularOffers.length} regular coupons:`);
        regularOffers.forEach(offer => {
            console.log(`   - ${offer.code}: ${offer.title} (Usage limit per user: ${offer.userUsageLimit})`);
        });

        // Scenario 3: Simulate user with existing orders
        console.log('\n3. Simulating user with existing orders:');
        console.log('   - First-order coupons should NOT be available');
        console.log('   - Regular coupons should be available');

        // Scenario 4: Check expired coupons
        console.log('\n4. Testing expired coupons:');
        const expiredOffers = await Offer.find({ 
            $or: [
                { isActive: false },
                { endDate: { $lt: new Date() } }
            ]
        });
        console.log(`   Found ${expiredOffers.length} expired/inactive coupons:`);
        expiredOffers.forEach(offer => {
            console.log(`   - ${offer.code}: ${offer.title} (Expired: ${offer.endDate < new Date()})`);
        });

        console.log('\n=== TEST COMPLETE ===');
        console.log('\nTo test the functionality:');
        console.log('1. Run: node seedOffers.js (to create test coupons)');
        console.log('2. Create a new user account');
        console.log('3. Add items to cart and try applying "FIRST50" or "WELCOME20"');
        console.log('4. Complete an order');
        console.log('5. Try applying the same first-order coupons again (should fail)');
        console.log('6. Try applying "SAVE100" or "REPEAT15" (should work)');

        process.exit();

    } catch (error) {
        console.error("Error testing coupons:", error);
        process.exit(1);
    }
};

testCoupons();