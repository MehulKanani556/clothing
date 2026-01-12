const mongoose = require('mongoose');
const Order = require('./models/order.model');
require('dotenv').config();

async function createTestTrackingOrder() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_PATH);
        console.log('Connected to MongoDB');

        // Find an existing order to update with tracking data
        const existingOrder = await Order.findOne({ status: 'Shipped' });
        
        if (existingOrder) {
            console.log('Found existing shipped order:', existingOrder.orderId);
            
            // Update with mock tracking data
            const mockTrackingData = {
                shiprocketOrderId: 'SR123456789',
                shipmentId: 'SH987654321',
                trackingNumber: 'TRK123456789',
                awbNumber: 'AWB123456789',
                carrier: 'Delhivery',
                currentLocation: 'Mumbai Hub',
                shiprocketStatus: 'In Transit',
                trackingHistory: [
                    {
                        status: 'Shipped',
                        location: 'Surat Hub',
                        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                        description: 'Package shipped from origin',
                        courierStatus: 'SHP'
                    },
                    {
                        status: 'In Transit',
                        location: 'Ahmedabad Hub',
                        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
                        description: 'Package in transit',
                        courierStatus: 'IT'
                    },
                    {
                        status: 'In Transit',
                        location: 'Mumbai Hub',
                        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
                        description: 'Package reached Mumbai hub',
                        courierStatus: 'IT'
                    }
                ],
                expectedDeliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
                lastTrackingSync: new Date(),
                lastStatusUpdate: new Date()
            };

            await Order.findByIdAndUpdate(existingOrder._id, mockTrackingData);
            console.log('✅ Updated order with mock tracking data');
            
            // Verify the update
            const updatedOrder = await Order.findById(existingOrder._id);
            console.log('Updated order tracking info:', {
                orderId: updatedOrder.orderId,
                trackingNumber: updatedOrder.trackingNumber,
                currentLocation: updatedOrder.currentLocation,
                trackingHistoryCount: updatedOrder.trackingHistory?.length || 0
            });
            
            console.log('\n🧪 Test this order with:');
            console.log(`GET /api/shiprocket/orders/${existingOrder._id}/tracking/detailed`);
            
        } else {
            console.log('No shipped orders found. Creating a new test order...');
            
            // Create a new test order with tracking data
            const testOrder = new Order({
                orderId: `ORD-TEST-${Date.now()}`,
                user: new mongoose.Types.ObjectId(), // Mock user ID
                items: [{
                    product: new mongoose.Types.ObjectId(),
                    sku: 'TEST-SKU-001',
                    name: 'Test Product for Tracking',
                    size: 'M',
                    quantity: 1,
                    price: 999,
                    gstPercentage: 18,
                    gstAmount: 179.82,
                    totalPrice: 1178.82,
                    image: 'https://via.placeholder.com/300'
                }],
                subTotal: 999,
                taxTotal: 179.82,
                shippingFee: 50,
                grandTotal: 1228.82,
                paymentStatus: 'Paid',
                paymentMethod: 'Online',
                status: 'Shipped',
                shippingAddress: {
                    firstName: 'Test',
                    lastName: 'User',
                    addressLine1: 'Test Address',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    pincode: '400001',
                    phone: '9999999999'
                },
                // Mock tracking data
                shiprocketOrderId: 'SR123456789',
                shipmentId: 'SH987654321',
                trackingNumber: 'TRK123456789',
                awbNumber: 'AWB123456789',
                carrier: 'Delhivery',
                currentLocation: 'Mumbai Hub',
                shiprocketStatus: 'In Transit',
                trackingHistory: [
                    {
                        status: 'Shipped',
                        location: 'Surat Hub',
                        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                        description: 'Package shipped from origin',
                        courierStatus: 'SHP'
                    },
                    {
                        status: 'In Transit',
                        location: 'Mumbai Hub',
                        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
                        description: 'Package reached Mumbai hub',
                        courierStatus: 'IT'
                    }
                ],
                expectedDeliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
                lastTrackingSync: new Date(),
                placedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
                shippedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
            });

            await testOrder.save();
            console.log('✅ Created new test order with tracking data');
            console.log('Test order ID:', testOrder._id);
            console.log('Test order orderId:', testOrder.orderId);
            
            console.log('\n🧪 Test this order with:');
            console.log(`GET /api/shiprocket/orders/${testOrder._id}/tracking/detailed`);
        }

    } catch (error) {
        console.error('Failed to create test tracking order:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

createTestTrackingOrder();