const mongoose = require('mongoose');
const Order = require('../models/order.model');
const shiprocketAPI = require('../utils/shiprocketAPI');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_PATH);
        console.log('MongoDB connected for tracking sync');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Sync tracking data for all active orders
const syncTrackingData = async () => {
    try {
        console.log('Starting tracking data sync...');
        
        const activeOrders = await Order.find({
            status: { $in: ['Processing', 'Shipped'] },
            shipmentId: { $exists: true, $ne: null }
        });

        console.log(`Found ${activeOrders.length} active orders to sync`);

        let syncedCount = 0;
        let errorCount = 0;

        for (const order of activeOrders) {
            try {
                console.log(`Syncing order ${order.orderId}...`);
                
                const trackingData = await shiprocketAPI.getTracking(order.shipmentId);
                
                if (trackingData && trackingData.tracking_data) {
                    const latestScan = trackingData.tracking_data.track_status;
                    let orderStatus = order.status;
                    let deliveredAt = order.deliveredAt;

                    // Update status based on latest scan
                    if (latestScan?.toLowerCase().includes('delivered')) {
                        orderStatus = 'Delivered';
                        deliveredAt = new Date();
                    } else if (latestScan?.toLowerCase().includes('shipped') || 
                               latestScan?.toLowerCase().includes('transit')) {
                        orderStatus = 'Shipped';
                        if (!order.shippedAt) {
                            await Order.findByIdAndUpdate(order._id, { shippedAt: new Date() });
                        }
                    }

                    const updateData = {
                        shiprocketStatus: latestScan,
                        lastStatusUpdate: new Date(),
                        status: orderStatus
                    };

                    if (deliveredAt && !order.deliveredAt) {
                        updateData.deliveredAt = deliveredAt;
                        updateData.returnWindowExpiresAt = new Date(deliveredAt.getTime() + 7 * 24 * 60 * 60 * 1000);
                    }

                    await Order.findByIdAndUpdate(order._id, updateData);
                    syncedCount++;
                    console.log(`✓ Synced order ${order.orderId} - Status: ${latestScan}`);
                } else {
                    console.log(`⚠ No tracking data for order ${order.orderId}`);
                }

                // Add delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));

            } catch (error) {
                console.error(`✗ Failed to sync order ${order.orderId}:`, error.message);
                errorCount++;
            }
        }

        console.log(`\nSync completed:`);
        console.log(`- Total orders: ${activeOrders.length}`);
        console.log(`- Successfully synced: ${syncedCount}`);
        console.log(`- Errors: ${errorCount}`);

        return {
            total: activeOrders.length,
            synced: syncedCount,
            errors: errorCount
        };

    } catch (error) {
        console.error('Sync tracking data error:', error);
        throw error;
    }
};

// Main function
const main = async () => {
    try {
        await connectDB();
        const result = await syncTrackingData();
        
        console.log('\nTracking sync completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Tracking sync failed:', error);
        process.exit(1);
    }
};

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { syncTrackingData };