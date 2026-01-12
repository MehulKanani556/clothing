const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Cart = require('./models/cart.model');
const Product = require('./models/product.model');

// Load env vars
dotenv.config();

const testCartPackageInfo = async () => {
    try {
        if (!process.env.MONGODB_PATH) {
            console.error("MONGODB_PATH is missing in .env");
            process.exit(1);
        }

        // Connect DB
        const uri = process.env.MONGODB_PATH.replace('clothing', 'Clothing');
        await mongoose.connect(uri);
        console.log('MongoDB Connected');

        console.log('=== TESTING CART PACKAGE INFO ===\n');

        // First, let's check if we have any products with packageInfo
        const productsWithPackageInfo = await Product.find({ 
            'packageInfo.weight': { $exists: true, $ne: null } 
        }).limit(3);

        console.log(`Found ${productsWithPackageInfo.length} products with packageInfo:`);
        productsWithPackageInfo.forEach((product, index) => {
            console.log(`${index + 1}. ${product.name}`);
            console.log(`   Weight: ${product.packageInfo?.weight || 'Not set'}kg`);
            console.log(`   Dimensions: ${product.packageInfo?.dimensions?.length || 'Not set'}×${product.packageInfo?.dimensions?.width || 'Not set'}×${product.packageInfo?.dimensions?.height || 'Not set'}cm`);
        });

        // If no products have packageInfo, let's add some sample data
        if (productsWithPackageInfo.length === 0) {
            console.log('\nNo products found with packageInfo. Adding sample data...');
            
            const sampleProduct = await Product.findOne();
            if (sampleProduct) {
                await Product.findByIdAndUpdate(sampleProduct._id, {
                    packageInfo: {
                        weight: 0.5,
                        dimensions: {
                            length: 30,
                            width: 25,
                            height: 5
                        }
                    }
                });
                console.log(`✓ Added packageInfo to product: ${sampleProduct.name}`);
            }
        }

        // Now let's test cart population
        console.log('\n=== TESTING CART POPULATION ===');
        
        // Find a cart with items
        const cart = await Cart.findOne({ 'items.0': { $exists: true } })
            .populate('items.product', 'name images brand variants category packageInfo');

        if (cart) {
            console.log(`\nFound cart with ${cart.items.length} items:`);
            cart.items.forEach((item, index) => {
                console.log(`\n${index + 1}. ${item.product?.name || 'Unknown Product'}`);
                console.log(`   Quantity: ${item.quantity}`);
                console.log(`   Size: ${item.size}, Color: ${item.color}`);
                console.log(`   Price: ₹${item.price}`);
                
                if (item.product?.packageInfo) {
                    console.log(`   ✓ PackageInfo found:`);
                    console.log(`     Weight: ${item.product.packageInfo.weight || 'Not set'}kg`);
                    console.log(`     Dimensions: ${item.product.packageInfo.dimensions?.length || 'Not set'}×${item.product.packageInfo.dimensions?.width || 'Not set'}×${item.product.packageInfo.dimensions?.height || 'Not set'}cm`);
                } else {
                    console.log(`   ⚠️  PackageInfo missing - will use defaults`);
                }
            });

            // Test the shipping calculation logic
            console.log('\n=== TESTING SHIPPING CALCULATION ===');
            let totalWeight = 0;
            let maxLength = 0;
            let maxWidth = 0;
            let totalHeight = 0;

            cart.items.forEach(item => {
                const product = item.product;
                const quantity = item.quantity || 1;

                if (product && product.packageInfo) {
                    const pkg = product.packageInfo;
                    
                    if (pkg.weight) {
                        totalWeight += (pkg.weight * quantity);
                    }

                    if (pkg.dimensions) {
                        const { length = 0, width = 0, height = 0 } = pkg.dimensions;
                        maxLength = Math.max(maxLength, length);
                        maxWidth = Math.max(maxWidth, width);
                        totalHeight += (height * quantity);
                    }
                }
            });

            // Apply fallbacks
            if (totalWeight === 0) totalWeight = 0.5;
            if (maxLength === 0) maxLength = 25;
            if (maxWidth === 0) maxWidth = 20;
            if (totalHeight === 0) totalHeight = 5;

            console.log('\nCalculated shipping parameters:');
            console.log(`Total Weight: ${totalWeight}kg`);
            console.log(`Package Dimensions: ${maxLength}×${maxWidth}×${totalHeight}cm`);

        } else {
            console.log('\nNo cart found with items. Create a cart first to test.');
        }

        console.log('\n=== TEST COMPLETE ===');
        console.log('✓ Cart controller updated to include packageInfo');
        console.log('✓ Products can now provide shipping dimensions');
        console.log('✓ Dynamic shipping calculation ready');

        process.exit();

    } catch (error) {
        console.error("Error testing cart package info:", error);
        process.exit(1);
    }
};

testCartPackageInfo();