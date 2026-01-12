const Order = require('../models/order.model');
const shiprocketAPI = require('../utils/shiprocketAPI');

// Create Shiprocket order after payment confirmation
exports.createShiprocketOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId).populate('user', 'email firstName lastName mobileNumber');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // If user is not populated, fetch it separately
        if (!order.user || !order.user.email) {
            const User = require('../models/user.model');
            const user = await User.findById(order.user).select('email firstName lastName mobileNumber');
            if (user) {
                order.user = user;
            }
        }

        if (order.paymentStatus !== 'Paid') {
            return res.status(400).json({
                success: false,
                message: 'Order payment not confirmed'
            });
        }

        if (order.shiprocketOrderId) {
            return res.status(400).json({
                success: false,
                message: 'Shiprocket order already created'
            });
        }

        if (!order.shippingAddress ||
            !order.shippingAddress.firstName ||
            !order.shippingAddress.pincode) {
            return res.status(400).json({
                success: false,
                message: 'Incomplete shipping address information. Required: firstName, pincode',
                receivedAddress: order.shippingAddress,
                validation: {
                    hasFirstName: !!order.shippingAddress?.firstName,
                    hasLastName: !!order.shippingAddress?.lastName,
                    hasCity: !!order.shippingAddress?.city,
                    hasState: !!order.shippingAddress?.state,
                    hasPincode: !!order.shippingAddress?.pincode,
                    hasPhone: !!(order.shippingAddress?.phone || order.shippingAddress?.mobileNo)
                }
            });
        }

        if (!order.user || !order.user.email) {
            return res.status(400).json({
                success: false,
                message: 'Customer email is required'
            });
        }

        // Validate pincode format (should be 6 digits)
        if (!/^\d{6}$/.test(order.shippingAddress.pincode)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid pincode format. Must be 6 digits.'
            });
        }

        // Prepare address fields - handle both old and new format
        const getAddressLine1 = (addr) => {
            const addressParts = [
                addr.addressLine1,
                addr.buildingName,
                addr.landmark,
                addr.locality
            ].filter(Boolean);

            if (addressParts.length > 0) {
                return addressParts.join(', ');
            }

            return 'Address Details Not Provided';
        };

        const getAddressLine2 = (addr) => {
            return addr.addressLine2 || '';
        };

        const getPhone = (addr, user) => {
            return addr.phone || addr.mobileNo || user?.mobileNumber || '9999999999'; // Fallback to user's mobile or default
        };

        // Try to get pickup locations and use the first one if "Primary" doesn't work
        let pickupLocation = "Primary";
        try {
            const pickupLocations = await shiprocketAPI.getPickupLocations();
            if (pickupLocations && pickupLocations.data && pickupLocations.data.length > 0) {
                // Use the first pickup location if available
                pickupLocation = pickupLocations.data[0].pickup_location || "Primary";
                console.log('Available pickup locations:', pickupLocations.data.map(p => p.pickup_location));
                console.log('Using pickup location:', pickupLocation);
            }
        } catch (pickupError) {
            console.log('Could not fetch pickup locations, using "Primary":', pickupError.message);
        }

        // Calculate dynamic weight and dimensions from order items
        let totalWeight = 0;
        let maxLength = 0;
        let maxWidth = 0;
        let totalHeight = 0;

        console.log('Calculating shipping dimensions for order items:', order.items.length);

        // Try to get product details for each item to calculate dimensions
        const Product = require('../models/product.model');
        
        for (const item of order.items) {
            try {
                const product = await Product.findById(item.product);
                if (product && product.packageInfo) {
                    const pkg = product.packageInfo;
                    const quantity = item.quantity || 1;
                    
                    // Add weight
                    if (pkg.weight) {
                        totalWeight += (pkg.weight * quantity);
                    }

                    // Calculate dimensions
                    if (pkg.dimensions) {
                        const { length = 0, width = 0, height = 0 } = pkg.dimensions;
                        
                        // For length and width, take the maximum
                        maxLength = Math.max(maxLength, length);
                        maxWidth = Math.max(maxWidth, width);
                        
                        // For height, stack items
                        totalHeight += (height * quantity);
                    }
                }
            } catch (error) {
                console.log(`Could not fetch product details for item ${item.product}:`, error.message);
            }
        }

        // Apply fallback values if no package info is available
        if (totalWeight === 0) {
            totalWeight = 0.5; // Default 500g
            console.log('Using default weight: 0.5kg');
        }

        if (maxLength === 0 || maxWidth === 0 || totalHeight === 0) {
            maxLength = maxLength || 25;
            maxWidth = maxWidth || 20;
            totalHeight = totalHeight || 5;
            console.log('Using default dimensions: 25x20x5 cm');
        }

        // Ensure minimum dimensions for shipping
        maxLength = Math.max(maxLength, 10);
        maxWidth = Math.max(maxWidth, 10);
        totalHeight = Math.max(totalHeight, 2);

        console.log('Calculated shipping parameters for order:', {
            weight: totalWeight + 'kg',
            dimensions: `${maxLength}x${maxWidth}x${totalHeight}cm`,
            itemCount: order.items.length
        });

        // Prepare Shiprocket order data
        const shiprocketOrderData = {
            order_id: order.orderId,
            order_date: order.placedAt.toISOString().split('T')[0],
            pickup_location: pickupLocation,

            // Billing Address (required)
            billing_customer_name: order.shippingAddress.firstName,
            billing_last_name: order.shippingAddress.lastName,
            billing_address: getAddressLine1(order.shippingAddress),
            billing_address_2: getAddressLine2(order.shippingAddress),
            billing_city: order.shippingAddress.city,
            billing_pincode: order.shippingAddress.pincode,
            billing_state: order.shippingAddress.state,
            billing_country: "India",
            billing_email: order.user.email,
            billing_phone: getPhone(order.shippingAddress, order.user),

            // Shipping same as billing
            shipping_is_billing: true,

            // Order items and details
            order_items: order.items.map(item => ({
                name: item.name,
                sku: item.sku,
                units: item.quantity,
                selling_price: item.price,
                discount: "",
                tax: "",
                hsn: 441122
            })),
            payment_method: order.paymentMethod === 'COD' ? 'COD' : 'Prepaid',
            shipping_charges: order.shippingFee || 0,
            giftwrap_charges: 0,
            transaction_charges: 0,
            total_discount: order.discountTotal || 0,
            sub_total: order.subTotal,
            length: Math.round(maxLength),
            breadth: Math.round(maxWidth),
            height: Math.round(totalHeight),
            weight: totalWeight
        };
        // Create order in Shiprocket
        console.log('Creating Shiprocket order with data:', JSON.stringify(shiprocketOrderData, null, 2));
        const shiprocketResponse = await shiprocketAPI.createOrder(shiprocketOrderData);

        if (shiprocketResponse.status_code === 1) {
            // Update order with Shiprocket details
            await Order.findByIdAndUpdate(orderId, {
                shiprocketOrderId: shiprocketResponse.order_id,
                shipmentId: shiprocketResponse.shipment_id,
                shiprocketResponse: shiprocketResponse,
                lastStatusUpdate: new Date()
            });

            res.status(200).json({
                success: true,
                message: 'Shiprocket order created successfully',
                data: {
                    shiprocketOrderId: shiprocketResponse.order_id,
                    shipmentId: shiprocketResponse.shipment_id
                }
            });
        } else {
            throw new Error(shiprocketResponse.message || 'Failed to create Shiprocket order');
        }

    } catch (error) {
        console.error('Create Shiprocket order error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create Shiprocket order'
        });
    }
};

// Get tracking information
exports.getTrackingInfo = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (!order.shipmentId && !order.awbNumber) {
            return res.status(400).json({
                success: false,
                message: 'No tracking information available'
            });
        }

        let trackingData;

        if (order.shipmentId) {
            trackingData = await shiprocketAPI.getTracking(order.shipmentId);
        } else if (order.awbNumber) {
            trackingData = await shiprocketAPI.getTrackingByAWB(order.awbNumber);
        }

        res.status(200).json({
            success: true,
            data: trackingData
        });

    } catch (error) {
        console.error('Get tracking info error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get tracking information'
        });
    }
};

// Generate shipping label
exports.generateShippingLabel = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (!order.shipmentId) {
            return res.status(400).json({
                success: false,
                message: 'No shipment ID available'
            });
        }

        const labelResponse = await shiprocketAPI.generateLabel([order.shipmentId]);

        if (labelResponse.label_url) {
            // Update order with label URL
            await Order.findByIdAndUpdate(orderId, {
                shippingLabel: labelResponse.label_url
            });

            res.status(200).json({
                success: true,
                data: {
                    labelUrl: labelResponse.label_url
                }
            });
        } else {
            throw new Error('Failed to generate shipping label');
        }

    } catch (error) {
        console.error('Generate shipping label error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate shipping label'
        });
    }
};

// Request pickup
exports.requestPickup = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (!order.shipmentId) {
            return res.status(400).json({
                success: false,
                message: 'No shipment ID available'
            });
        }

        const pickupResponse = await shiprocketAPI.requestPickup(order.shipmentId);

        if (pickupResponse.awb_assign_status === 1) {
            // Update order with AWB and tracking details
            await Order.findByIdAndUpdate(orderId, {
                awbNumber: pickupResponse.response.data.awb_code,
                trackingNumber: pickupResponse.response.data.awb_code,
                carrier: pickupResponse.response.data.courier_name,
                courierCompanyId: pickupResponse.response.data.courier_company_id,
                status: 'Processing',
                lastStatusUpdate: new Date()
            });

            res.status(200).json({
                success: true,
                message: 'Pickup requested successfully',
                data: {
                    awbNumber: pickupResponse.response.data.awb_code,
                    carrier: pickupResponse.response.data.courier_name
                }
            });
        } else {
            throw new Error(pickupResponse.message || 'Failed to request pickup');
        }

    } catch (error) {
        console.error('Request pickup error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to request pickup'
        });
    }
};

// Webhook handler for Shiprocket status updates
exports.handleWebhook = async (req, res) => {
    try {
        const webhookData = req.body;

        // Verify webhook signature if configured
        // const signature = req.headers['x-shiprocket-signature'];

        const { order_id, current_status, awb, scans } = webhookData;

        if (!order_id) {
            return res.status(400).json({
                success: false,
                message: 'Invalid webhook data'
            });
        }

        // Find order by Shiprocket order ID
        const order = await Order.findOne({ shiprocketOrderId: order_id });

        if (!order) {
            console.log(`Order not found for Shiprocket ID: ${order_id}`);
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Map Shiprocket status to our order status
        let orderStatus = order.status;
        let deliveredAt = order.deliveredAt;

        switch (current_status?.toLowerCase()) {
            case 'shipped':
            case 'in transit':
                orderStatus = 'Shipped';
                if (!order.shippedAt) {
                    await Order.findByIdAndUpdate(order._id, { shippedAt: new Date() });
                }
                break;
            case 'delivered':
                orderStatus = 'Delivered';
                deliveredAt = new Date();
                break;
            case 'rto':
            case 'cancelled':
                orderStatus = 'Cancelled';
                break;
        }

        // Update order with latest tracking info
        const updateData = {
            shiprocketStatus: current_status,
            lastStatusUpdate: new Date(),
            status: orderStatus
        };

        if (awb && !order.awbNumber) {
            updateData.awbNumber = awb;
            updateData.trackingNumber = awb;
        }

        if (deliveredAt) {
            updateData.deliveredAt = deliveredAt;
            updateData.returnWindowExpiresAt = new Date(deliveredAt.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
        }

        await Order.findByIdAndUpdate(order._id, updateData);

        res.status(200).json({
            success: true,
            message: 'Webhook processed successfully'
        });

    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process webhook'
        });
    }
};

// Sync tracking data for all active shipments
exports.syncTrackingData = async (req, res) => {
    try {
        const activeOrders = await Order.find({
            status: { $in: ['Processing', 'Shipped'] },
            shipmentId: { $exists: true, $ne: null }
        });

        let syncedCount = 0;
        let errorCount = 0;

        for (const order of activeOrders) {
            try {
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
                }
            } catch (error) {
                console.error(`Failed to sync order ${order.orderId}:`, error.message);
                errorCount++;
            }
        }

        res.status(200).json({
            success: true,
            message: `Sync completed. Updated: ${syncedCount}, Errors: ${errorCount}`,
            data: {
                synced: syncedCount,
                errors: errorCount,
                total: activeOrders.length
            }
        });

    } catch (error) {
        console.error('Sync tracking data error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to sync tracking data'
        });
    }
};

// Get available couriers for order
exports.getAvailableCouriers = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Default pickup pincode (should be configured)
        const pickupPincode = process.env.PICKUP_PINCODE || '110001';
        const deliveryPincode = order.shippingAddress.pincode;
        const weight = 0.5; // Default weight, should be calculated
        const codAmount = order.paymentMethod === 'COD' ? order.grandTotal : 0;

        const couriers = await shiprocketAPI.getAvailableCouriers(
            pickupPincode,
            deliveryPincode,
            weight,
            codAmount
        );

        res.status(200).json({
            success: true,
            data: couriers
        });

    } catch (error) {
        console.error('Get available couriers error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get available couriers'
        });
    }
};

// Debug endpoint to check order data structure
exports.debugOrderData = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId).populate('user', 'email firstName lastName');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // If user is not populated, fetch it separately
        if (!order.user || !order.user.email) {
            const User = require('../models/user.model');
            const user = await User.findById(order.user).select('email firstName lastName');
            if (user) {
                order.user = user;
            }
        }

        // Helper functions for address handling
        const getAddressLine1 = (addr) => {
            return addr.addressLine1 ||
                [addr.buildingName, addr.landmark, addr.locality].filter(Boolean).join(', ') ||
                'Address not provided';
        };

        const getAddressLine2 = (addr) => {
            return addr.addressLine2 || '';
        };

        const getPhone = (addr) => {
            return addr.phone || addr.mobileNo || '';
        };

        res.status(200).json({
            success: true,
            data: {
                orderId: order.orderId,
                user: order.user,
                shippingAddress: order.shippingAddress,
                processedAddress: {
                    firstName: order.shippingAddress?.firstName,
                    lastName: order.shippingAddress?.lastName,
                    addressLine1: getAddressLine1(order.shippingAddress || {}),
                    addressLine2: getAddressLine2(order.shippingAddress || {}),
                    city: order.shippingAddress?.city,
                    state: order.shippingAddress?.state,
                    pincode: order.shippingAddress?.pincode,
                    phone: getPhone(order.shippingAddress || {})
                },
                items: order.items,
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus,
                subTotal: order.subTotal,
                grandTotal: order.grandTotal,
                shippingFee: order.shippingFee,
                discountTotal: order.discountTotal
            }
        });

    } catch (error) {
        console.error('Debug order data error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get order data'
        });
    }
};
// Check pickup locations
exports.checkPickupLocations = async (req, res) => {
    try {
        const pickupLocations = await shiprocketAPI.getPickupLocations();
        res.status(200).json({
            success: true,
            data: pickupLocations
        });
    } catch (error) {
        console.error('Check pickup locations error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get pickup locations'
        });
    }
};
// Add this temporary endpoint to your shiprocket.routes.js
// GET /api/shiprocket/test-pickup

exports.testPickupLocations = async (req, res) => {
    try {
        const shiprocketAPI = require('../utils/shiprocketAPI');
        
        // Test 1: Check authentication
        console.log('Testing Shiprocket authentication...');
        const token = await shiprocketAPI.authenticate();
        console.log('✓ Authentication successful');
        
        // Test 2: Get pickup locations
        console.log('\nFetching pickup locations...');
        const pickupLocations = await shiprocketAPI.getPickupLocations();
        
        if (!pickupLocations.data || pickupLocations.data.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'NO PICKUP LOCATIONS FOUND - This is the problem!',
                solution: 'You need to add a pickup address in your Shiprocket account',
                steps: [
                    '1. Login to https://app.shiprocket.in',
                    '2. Go to Settings > Company Profile',
                    '3. Add a pickup location',
                    '4. Make sure to mark it as "Primary" or note the exact name',
                    '5. Save and verify the location is active'
                ]
            });
        }
        
        console.log('✓ Pickup locations found:', pickupLocations.data.length);
        
        // Test 3: Show all pickup location names
        const locationNames = pickupLocations.data.map(loc => ({
            name: loc.pickup_location,
            nickname: loc.nickname,
            address: loc.address,
            city: loc.city,
            state: loc.state,
            pincode: loc.pin_code,
            isDefault: loc.is_first_mile_pickup || false
        }));
        
        res.status(200).json({
            success: true,
            message: 'Shiprocket connection successful',
            pickupLocations: locationNames,
            recommendation: locationNames.length > 0 
                ? `Use pickup_location: "${locationNames[0].name}"` 
                : 'Add a pickup location in Shiprocket dashboard first'
        });
        
    } catch (error) {
        console.error('Shiprocket test failed:', error);
        res.status(500).json({
            success: false,
            message: error.message,
            details: error.response?.data || null,
            troubleshooting: {
                if_auth_failed: 'Check SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD in .env',
                if_no_locations: 'Add pickup address in Shiprocket dashboard',
                if_other_error: 'Check the error details above'
            }
        });
    }
};

// Check pincode serviceability with dynamic weight and dimensions
exports.checkPincodeServiceability = async (req, res) => {
    try {
        const { pincode } = req.params;
        const { cartItems = [] } = req.body;
        
        // Validate pincode format
        if (!pincode || !/^\d{6}$/.test(pincode)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid pincode. Please enter a valid 6-digit pincode.'
            });
        }

        // Calculate dynamic weight and dimensions from cart items
        let totalWeight = 0;
        let totalVolume = 0;
        let maxLength = 0;
        let maxWidth = 0;
        let totalHeight = 0;

        console.log('Calculating shipping for cart items:', cartItems.length);

        if (cartItems.length > 0) {
            cartItems.forEach(item => {
                const product = item.product;
                const quantity = item.quantity || 1;

                if (product && product.packageInfo) {
                    const pkg = product.packageInfo;
                    
                    // Add weight (convert to kg if needed, assuming it's already in kg)
                    if (pkg.weight) {
                        totalWeight += (pkg.weight * quantity);
                    }

                    // Calculate dimensions
                    if (pkg.dimensions) {
                        const { length = 0, width = 0, height = 0 } = pkg.dimensions;
                        
                        // For length and width, take the maximum (assuming items are packed side by side)
                        maxLength = Math.max(maxLength, length);
                        maxWidth = Math.max(maxWidth, width);
                        
                        // For height, stack items (add heights for multiple quantities)
                        totalHeight += (height * quantity);
                        
                        // Calculate volume for reference
                        totalVolume += (length * width * height * quantity);
                    }
                }
            });
        }

        // Apply fallback values if no package info is available
        if (totalWeight === 0) {
            totalWeight = 0.5; // Default 500g
            console.log('Using default weight: 0.5kg');
        }

        if (maxLength === 0 || maxWidth === 0 || totalHeight === 0) {
            maxLength = maxLength || 25;
            maxWidth = maxWidth || 20;
            totalHeight = totalHeight || 5;
            console.log('Using default dimensions: 25x20x5 cm');
        }

        // Ensure minimum dimensions for shipping
        maxLength = Math.max(maxLength, 10);
        maxWidth = Math.max(maxWidth, 10);
        totalHeight = Math.max(totalHeight, 2);

        console.log('Calculated shipping parameters:', {
            weight: totalWeight + 'kg',
            dimensions: `${maxLength}x${maxWidth}x${totalHeight}cm`,
            volume: totalVolume + 'cm³',
            itemCount: cartItems.length
        });

        // Get pickup pincode from environment or use default
        const pickupPincode = process.env.PICKUP_PINCODE || '110001';

        // Check serviceability with calculated parameters
        const serviceabilityData = await shiprocketAPI.checkPincodeServiceabilityWithDimensions(
            pickupPincode,
            pincode,
            totalWeight,
            maxLength,
            maxWidth,
            totalHeight
        );

        res.status(200).json({
            success: true,
            data: {
                ...serviceabilityData,
                calculatedParams: {
                    weight: totalWeight,
                    length: maxLength,
                    width: maxWidth,
                    height: totalHeight,
                    volume: totalVolume
                }
            }
        });

    } catch (error) {
        console.error('Check pincode serviceability error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to check pincode serviceability'
        });
    }
};

// Add to your router:
// router.get('/test-pickup', testPickupLocations);
