const mongoose = require('mongoose');
const Product = require('./models/product.model');
const Cart = require('./models/cart.model');
require('dotenv').config();

async function testPackageInfo() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_PATH);
        console.log('Connected to MongoDB');

        // Test 1: Check if products have packageInfo
        console.log('\n=== Testing Product Package Info ===');
        const products = await Product.find({}).limit(3);
        
        products.forEach((product, index) => {
            console.log(`Product ${index + 1}:`, {
                name: product.name,
                hasPackageInfo: !!product.packageInfo,
                packageInfo: product.packageInfo
            });
        });

        // Test 2: Check cart population
        console.log('\n=== Testing Cart Population ===');
        const cart = await Cart.findOne({}).populate('items.product', 'name packageInfo');
        
        if (cart) {
            console.log('Cart found with items:', cart.items.length);
            cart.items.forEach((item, index) => {
                console.log(`Cart Item ${index + 1}:`, {
                    productName: item.product?.name,
                    hasPackageInfo: !!item.product?.packageInfo,
                    packageInfo: item.product?.packageInfo,
                    quantity: item.quantity
                });
            });
        } else {
            console.log('No cart found');
        }

        // Test 3: Simulate cart items structure sent to API
        console.log('\n=== Simulating API Payload ===');
        if (cart) {
            const cartItems = cart.items.map(item => ({
                product: {
                    _id: item.product._id,
                    name: item.product.name,
                    packageInfo: item.product.packageInfo
                },
                quantity: item.quantity,
                size: item.size,
                color: item.color,
                price: item.price
            }));

            console.log('Simulated cart items for API:', JSON.stringify(cartItems, null, 2));

            // Test weight calculation
            let totalWeight = 0;
            cartItems.forEach(item => {
                if (item.product?.packageInfo?.weight) {
                    totalWeight += (item.product.packageInfo.weight * item.quantity);
                }
            });
            console.log('Calculated total weight:', totalWeight, 'kg');
        }

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

testPackageInfo();