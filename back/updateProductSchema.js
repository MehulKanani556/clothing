const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/product.model');

// Load env vars
dotenv.config();

const updateProductSchema = async () => {
    try {
        if (!process.env.MONGODB_PATH) {
            console.error("MONGODB_PATH is missing in .env");
            process.exit(1);
        }

        // Connect DB
        const uri = process.env.MONGODB_PATH.replace('clothing', 'Clothing');
        await mongoose.connect(uri);
        console.log('MongoDB Connected');

        // Update all existing products to include packageInfo field
        const result = await Product.updateMany(
            { packageInfo: { $exists: false } }, // Only update products that don't have packageInfo
            {
                $set: {
                    packageInfo: {
                        weight: null,
                        dimensions: {
                            length: null,
                            width: null,
                            height: null
                        }
                    }
                }
            }
        );

        console.log(`Updated ${result.modifiedCount} products with packageInfo field`);

        // Sample update for demonstration (you can customize these values)
        const sampleUpdates = [
            {
                filter: { name: /t-shirt/i },
                update: {
                    'packageInfo.weight': 0.2, // 200 grams = 0.2 kg
                    'packageInfo.dimensions.length': 25,
                    'packageInfo.dimensions.width': 20,
                    'packageInfo.dimensions.height': 3
                }
            },
            {
                filter: { name: /jeans/i },
                update: {
                    'packageInfo.weight': 0.5, // 500 grams = 0.5 kg
                    'packageInfo.dimensions.length': 35,
                    'packageInfo.dimensions.width': 25,
                    'packageInfo.dimensions.height': 5
                }
            },
            {
                filter: { name: /dress/i },
                update: {
                    'packageInfo.weight': 0.3, // 300 grams = 0.3 kg
                    'packageInfo.dimensions.length': 40,
                    'packageInfo.dimensions.width': 30,
                    'packageInfo.dimensions.height': 4
                }
            },
            {
                filter: { name: /saree/i },
                update: {
                    'packageInfo.weight': 0.6, // 600 grams = 0.6 kg
                    'packageInfo.dimensions.length': 45,
                    'packageInfo.dimensions.width': 35,
                    'packageInfo.dimensions.height': 6
                }
            }
        ];

        console.log('\nApplying sample package information...');
        for (const { filter, update } of sampleUpdates) {
            const updateResult = await Product.updateMany(filter, { $set: update });
            console.log(`Updated ${updateResult.modifiedCount} products matching filter:`, filter);
        }

        console.log('\n=== SCHEMA UPDATE COMPLETE ===');
        console.log('All products now have packageInfo field structure');
        console.log('You can now use the admin panel to edit package dimensions and weight');

        process.exit();

    } catch (error) {
        console.error("Error updating product schema:", error);
        process.exit(1);
    }
};

updateProductSchema();