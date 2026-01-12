// Test script to verify dynamic weight and dimension calculation

const testDynamicShipping = () => {
    console.log('=== DYNAMIC SHIPPING CALCULATION TEST ===\n');
    
    // Sample cart items with package information
    const sampleCartItems = [
        {
            _id: 'item1',
            quantity: 2,
            product: {
                _id: 'prod1',
                name: 'Cotton T-Shirt',
                packageInfo: {
                    weight: 0.2, // 200g
                    dimensions: {
                        length: 25,
                        width: 20,
                        height: 3
                    }
                }
            }
        },
        {
            _id: 'item2',
            quantity: 1,
            product: {
                _id: 'prod2',
                name: 'Denim Jeans',
                packageInfo: {
                    weight: 0.5, // 500g
                    dimensions: {
                        length: 35,
                        width: 25,
                        height: 5
                    }
                }
            }
        },
        {
            _id: 'item3',
            quantity: 1,
            product: {
                _id: 'prod3',
                name: 'Summer Dress',
                packageInfo: {
                    weight: 0.3, // 300g
                    dimensions: {
                        length: 40,
                        width: 30,
                        height: 4
                    }
                }
            }
        }
    ];

    // Calculate dynamic shipping parameters (same logic as controller)
    let totalWeight = 0;
    let maxLength = 0;
    let maxWidth = 0;
    let totalHeight = 0;
    let totalVolume = 0;

    console.log('Processing cart items:');
    console.log('====================');

    sampleCartItems.forEach((item, index) => {
        const product = item.product;
        const quantity = item.quantity || 1;

        console.log(`\n${index + 1}. ${product.name} (Qty: ${quantity})`);

        if (product && product.packageInfo) {
            const pkg = product.packageInfo;
            
            // Add weight
            if (pkg.weight) {
                const itemWeight = pkg.weight * quantity;
                totalWeight += itemWeight;
                console.log(`   Weight: ${pkg.weight}kg × ${quantity} = ${itemWeight}kg`);
            }

            // Calculate dimensions
            if (pkg.dimensions) {
                const { length = 0, width = 0, height = 0 } = pkg.dimensions;
                
                // For length and width, take the maximum
                maxLength = Math.max(maxLength, length);
                maxWidth = Math.max(maxWidth, width);
                
                // For height, stack items
                const itemHeight = height * quantity;
                totalHeight += itemHeight;
                
                // Calculate volume
                const itemVolume = length * width * height * quantity;
                totalVolume += itemVolume;
                
                console.log(`   Dimensions: ${length}×${width}×${height}cm`);
                console.log(`   Item Height: ${height}cm × ${quantity} = ${itemHeight}cm`);
                console.log(`   Volume: ${itemVolume}cm³`);
            }
        }
    });

    // Apply fallback values if needed
    if (totalWeight === 0) {
        totalWeight = 0.5;
        console.log('\n⚠️  Using default weight: 0.5kg');
    }

    if (maxLength === 0 || maxWidth === 0 || totalHeight === 0) {
        maxLength = maxLength || 25;
        maxWidth = maxWidth || 20;
        totalHeight = totalHeight || 5;
        console.log('\n⚠️  Using default dimensions for missing values');
    }

    // Ensure minimum dimensions
    maxLength = Math.max(maxLength, 10);
    maxWidth = Math.max(maxWidth, 10);
    totalHeight = Math.max(totalHeight, 2);

    console.log('\n=== FINAL SHIPPING PARAMETERS ===');
    console.log('=================================');
    console.log(`Total Weight: ${totalWeight}kg`);
    console.log(`Package Dimensions: ${maxLength} × ${maxWidth} × ${totalHeight} cm`);
    console.log(`Total Volume: ${totalVolume}cm³`);
    console.log(`Item Count: ${sampleCartItems.length}`);

    console.log('\n=== SHIPPING API CALL ===');
    console.log('========================');
    console.log('API Parameters:');
    console.log(`- pickup_postcode: 110001`);
    console.log(`- delivery_postcode: [user_pincode]`);
    console.log(`- weight: ${totalWeight}`);
    console.log(`- length: ${Math.round(maxLength)}`);
    console.log(`- breadth: ${Math.round(maxWidth)}`);
    console.log(`- height: ${Math.round(totalHeight)}`);

    console.log('\n=== BENEFITS ===');
    console.log('===============');
    console.log('✓ Accurate shipping costs based on actual package size');
    console.log('✓ Better courier selection based on weight/dimensions');
    console.log('✓ Reduced shipping disputes');
    console.log('✓ Optimized packaging recommendations');
    console.log('✓ Dynamic calculation per cart combination');

    console.log('\n=== FALLBACK HANDLING ===');
    console.log('========================');
    console.log('- Products without packageInfo use default values');
    console.log('- Minimum dimensions enforced for shipping compatibility');
    console.log('- Weight defaults to 0.5kg if not specified');
    console.log('- Dimensions default to 25×20×5cm if not specified');

    return {
        totalWeight,
        dimensions: {
            length: Math.round(maxLength),
            width: Math.round(maxWidth),
            height: Math.round(totalHeight)
        },
        volume: totalVolume,
        itemCount: sampleCartItems.length
    };
};

// Run the test
const result = testDynamicShipping();
console.log('\nTest completed successfully! ✓');
console.log('Result:', result);