const mongoose = require('mongoose');
const Order = require('./models/order.model');
require('dotenv').config();

async function testTrackingAPI() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_PATH);
        console.log('Connected to MongoDB');

        // Find orders with different statuses
        console.log('\n=== Testing Order Status Distribution ===');
        const statusCounts = await Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        console.log('Order status distribution:');
        statusCounts.forEach(status => {
            console.log(`- ${status._id}: ${status.count} orders`);
        });

        // Find orders that should have tracking
        console.log('\n=== Orders with Tracking Potential ===');
        const trackableOrders = await Order.find({
            status: { $in: ['Processing', 'Shipped', 'Delivered'] }
        }).limit(5).select('orderId status shiprocketOrderId shipmentId trackingNumber awbNumber currentLocation');

        trackableOrders.forEach((order, index) => {
            console.log(`Order ${index + 1}:`, {
                orderId: order.orderId,
                status: order.status,
                hasShiprocketOrderId: !!order.shiprocketOrderId,
                hasShipmentId: !!order.shipmentId,
                hasTrackingNumber: !!order.trackingNumber,
                hasAwbNumber: !!order.awbNumber,
                currentLocation: order.currentLocation
            });
        });

        // Test API endpoint structure
        console.log('\n=== API Endpoint Test Structure ===');
        if (trackableOrders.length > 0) {
            const testOrder = trackableOrders[0];
            console.log('Test order for API call:', {
                orderId: testOrder._id,
                endpoint: `/api/shiprocket/orders/${testOrder._id}/tracking/detailed`,
                expectedResponse: 'Should return tracking data with history'
            });
        }

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

testTrackingAPI();