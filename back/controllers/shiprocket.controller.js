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

// Get detailed tracking information with history
exports.getDetailedTrackingInfo = async (req, res) => {
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
        let trackingHistory = [];

        try {
            if (order.shipmentId) {
                trackingData = await shiprocketAPI.getDetailedTracking(order.shipmentId);
            } else if (order.awbNumber) {
                trackingData = await shiprocketAPI.getTrackingByAWB(order.awbNumber);
            }

            // Process tracking data and extract history
            if (trackingData && trackingData.tracking_data) {
                const trackingInfo = trackingData.tracking_data;
                const activities = trackingInfo.shipment_track_activities || [];
                const shipmentTrack = trackingInfo.shipment_track || [];

                // Process activities into our tracking history format
                trackingHistory = activities.map(activity => ({
                    status: activity['sr-status-label'] || activity.status,
                    location: activity.location || 'Unknown',
                    timestamp: new Date(activity.date),
                    description: activity.activity || activity.status,
                    courierStatus: activity.status,
                    srStatus: activity['sr-status'],
                    srStatusLabel: activity['sr-status-label']
                })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

                // Get shipment details
                const shipmentDetails = shipmentTrack[0] || {};
                const latestActivity = trackingHistory[0];

                const updateData = {
                    trackingHistory: trackingHistory,
                    currentLocation: latestActivity?.location || shipmentDetails.destination,
                    shiprocketStatus: latestActivity?.srStatusLabel || shipmentDetails.current_status,
                    lastTrackingSync: new Date(),
                    lastStatusUpdate: new Date(),
                    // Update additional tracking info
                    trackingUrl: trackingInfo.track_url,
                    estimatedDeliveryDate: trackingInfo.etd ? new Date(trackingInfo.etd) : null,
                    courierName: shipmentDetails.courier_name,
                    awbNumber: shipmentDetails.awb_code,
                    trackingNumber: shipmentDetails.awb_code,
                    packages: shipmentDetails.packages,
                    weight: shipmentDetails.weight
                };

                // Update delivery status based on latest activity
                if (latestActivity?.srStatusLabel?.toLowerCase().includes('delivered') ||
                    shipmentDetails.current_status?.toLowerCase().includes('delivered')) {
                    updateData.status = 'Delivered';
                    updateData.deliveredAt = shipmentDetails.delivered_date ?
                        new Date(shipmentDetails.delivered_date) : latestActivity.timestamp;
                    updateData.returnWindowExpiresAt = new Date(updateData.deliveredAt.getTime() + 7 * 24 * 60 * 60 * 1000);
                } else if (latestActivity?.srStatusLabel?.toLowerCase().includes('shipped') ||
                    latestActivity?.srStatusLabel?.toLowerCase().includes('transit') ||
                    latestActivity?.srStatusLabel?.toLowerCase().includes('pickup')) {
                    updateData.status = 'Shipped';
                    if (!order.shippedAt && shipmentDetails.pickup_date) {
                        updateData.shippedAt = new Date(shipmentDetails.pickup_date);
                    }
                }

                await Order.findByIdAndUpdate(orderId, updateData);
            }

        } catch (trackingError) {
            console.error('Error fetching tracking data:', trackingError);
            // Return cached tracking data if API fails
            trackingHistory = order.trackingHistory || [];
        }

        res.status(200).json({
            success: true,
            data: {
                orderId: order.orderId,
                status: order.status,
                trackingNumber: order.trackingNumber || order.awbNumber,
                carrier: order.carrier,
                currentLocation: order.currentLocation,
                expectedDeliveryDate: order.expectedDeliveryDate,
                estimatedDeliveryDate: order.estimatedDeliveryDate,
                trackingHistory: trackingHistory,
                lastUpdated: order.lastTrackingSync || order.lastStatusUpdate
            }
        });
        console.log("trackingData", trackingData[order.shipmentId].tracking_data.shipment_track);

    } catch (error) {
        console.error('Get detailed tracking info error:', error);
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

        // Check if this is a Return Order Webhook
        const isReturnOrder = order.returnPickupDetails?.shiprocketOrderId == order_id;

        switch (current_status?.toLowerCase()) {
            case 'shipped':
            case 'in transit':
                if (isReturnOrder) {
                    orderStatus = 'Return Picked';
                    if (order.paymentStatus === 'Paid' && order.refundStatus === 'None') {
                        // Auto-refund for prepaid return pickup
                        try {
                            const paymentController = require('./payment.controller');
                            const refundId = `REF-${order.orderId}-${Date.now()}`;
                            await paymentController.initiateRefund(order.orderId, order.grandTotal, refundId, 'Auto-refund on Return Pickup');
                            order.refundStatus = 'Initiated';
                            order.refundId = refundId;
                            order.refundAmount = order.grandTotal;
                            order.refundDate = new Date();
                            order.paymentStatus = 'Refunded';
                        } catch (refErr) {
                            console.error("Auto-refund failed:", refErr.message);
                            order.refundStatus = 'Failed';
                        }
                    }
                } else {
                    orderStatus = 'Shipped';
                    if (!order.shippedAt) {
                        await Order.findByIdAndUpdate(order._id, { shippedAt: new Date() });
                    }
                }
                break;
            case 'picked up':
                if (isReturnOrder) {
                    orderStatus = 'Return Picked';
                    if (order.paymentStatus === 'Paid' && order.refundStatus === 'None') {
                        try {
                            const paymentController = require('./payment.controller');
                            const refundId = `REF-${order.orderId}-${Date.now()}`;
                            await paymentController.initiateRefund(order.orderId, order.grandTotal, refundId, 'Auto-refund on Return Pickup');
                            order.refundStatus = 'Initiated';
                            order.refundId = refundId;
                            order.refundAmount = order.grandTotal;
                            order.refundDate = new Date();
                            order.paymentStatus = 'Refunded';
                        } catch (refErr) {
                            console.error("Auto-refund failed:", refErr.message);
                            order.refundStatus = 'Failed';
                        }
                    }
                }
                break;
            case 'delivered':
                if (isReturnOrder) {
                    orderStatus = 'Return Completed'; // Returned to seller
                } else {
                    orderStatus = 'Delivered';
                    deliveredAt = new Date();
                }
                break;
            case 'rto':
            case 'cancelled':
                if (!isReturnOrder) orderStatus = 'Cancelled';
                break;
        }

        // Update order with latest tracking info
        const updateData = {
            shiprocketStatus: current_status,
            lastStatusUpdate: new Date(),
            status: orderStatus
        };

        if (order.refundStatus && order.refundStatus !== 'None') {
            updateData.refundStatus = order.refundStatus;
            updateData.refundId = order.refundId;
            updateData.refundAmount = order.refundAmount;
            updateData.refundDate = order.refundDate;
            updateData.paymentStatus = order.paymentStatus;
        }

        if (awb && !order.awbNumber && !isReturnOrder) {
            updateData.awbNumber = awb;
            updateData.trackingNumber = awb;
        }

        if (deliveredAt && !isReturnOrder) {
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

// Sync tracking data for all active shipments with detailed history
exports.syncAllTrackingData = async (req, res) => {
    try {
        const activeOrders = await Order.find({
            status: { $in: ['Processing', 'Shipped'] },
            $or: [
                { shipmentId: { $exists: true, $ne: null } },
                { awbNumber: { $exists: true, $ne: null } }
            ]
        });

        let syncedCount = 0;
        let errorCount = 0;
        const syncResults = [];

        for (const order of activeOrders) {
            try {
                let trackingData;

                if (order.shipmentId) {
                    trackingData = await shiprocketAPI.getDetailedTracking(order.shipmentId);
                } else if (order.awbNumber) {
                    trackingData = await shiprocketAPI.getTrackingByAWB(order.awbNumber);
                }

                if (trackingData && trackingData.tracking_data) {
                    const trackingInfo = trackingData.tracking_data;
                    const activities = trackingInfo.shipment_track_activities || [];
                    const shipmentTrack = trackingInfo.shipment_track || [];

                    const trackingHistory = activities.map(activity => ({
                        status: activity['sr-status-label'] || activity.status,
                        location: activity.location || 'Unknown',
                        timestamp: new Date(activity.date),
                        description: activity.activity || activity.status,
                        courierStatus: activity.status,
                        srStatus: activity['sr-status'],
                        srStatusLabel: activity['sr-status-label']
                    })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

                    const shipmentDetails = shipmentTrack[0] || {};
                    const latestActivity = trackingHistory[0];
                    let orderStatus = order.status;
                    let deliveredAt = order.deliveredAt;

                    // Update status based on latest activity
                    if (latestActivity?.srStatusLabel?.toLowerCase().includes('delivered') ||
                        shipmentDetails.current_status?.toLowerCase().includes('delivered')) {
                        orderStatus = 'Delivered';
                        deliveredAt = shipmentDetails.delivered_date ?
                            new Date(shipmentDetails.delivered_date) : latestActivity.timestamp;
                    } else if (latestActivity?.srStatusLabel?.toLowerCase().includes('shipped') ||
                        latestActivity?.srStatusLabel?.toLowerCase().includes('transit') ||
                        latestActivity?.srStatusLabel?.toLowerCase().includes('pickup')) {
                        orderStatus = 'Shipped';
                    }

                    const updateData = {
                        trackingHistory: trackingHistory,
                        currentLocation: latestActivity?.location || shipmentDetails.destination,
                        shiprocketStatus: latestActivity?.srStatusLabel || shipmentDetails.current_status,
                        lastTrackingSync: new Date(),
                        lastStatusUpdate: new Date(),
                        status: orderStatus,
                        // Update additional tracking info
                        trackingUrl: trackingInfo.track_url,
                        estimatedDeliveryDate: trackingInfo.etd ? new Date(trackingInfo.etd) : null,
                        courierName: shipmentDetails.courier_name,
                        awbNumber: shipmentDetails.awb_code,
                        trackingNumber: shipmentDetails.awb_code
                    };

                    if (deliveredAt && !order.deliveredAt) {
                        updateData.deliveredAt = deliveredAt;
                        updateData.returnWindowExpiresAt = new Date(deliveredAt.getTime() + 7 * 24 * 60 * 60 * 1000);
                    }

                    await Order.findByIdAndUpdate(order._id, updateData);

                    syncResults.push({
                        orderId: order.orderId,
                        status: 'success',
                        latestStatus: latestActivity?.srStatusLabel || shipmentDetails.current_status,
                        location: latestScan?.location
                    });

                    syncedCount++;
                }
            } catch (error) {
                console.error(`Failed to sync order ${order.orderId}:`, error.message);
                syncResults.push({
                    orderId: order.orderId,
                    status: 'error',
                    error: error.message
                });
                errorCount++;
            }

            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        res.status(200).json({
            success: true,
            message: `Sync completed. Updated: ${syncedCount}, Errors: ${errorCount}`,
            data: {
                synced: syncedCount,
                errors: errorCount,
                total: activeOrders.length,
                results: syncResults
            }
        });

    } catch (error) {
        console.error('Sync all tracking data error:', error);
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

// Get all pickup locations for admin management
exports.getPickupLocations = async (req, res) => {
    try {
        // For now, let's handle the case where Shiprocket API might not be accessible
        let locations = [];

        try {
            const pickupLocations = await shiprocketAPI.getPickupLocations();
            console.log('Shiprocket pickup locations response:', JSON.stringify(pickupLocations, null, 2));


            // Handle different response structures
            if (pickupLocations && pickupLocations.data) {
                locations = Array.isArray(pickupLocations.data.shipping_address) ? pickupLocations.data.shipping_address : [];
                console.log("aaaaaaa", locations, pickupLocations)
            } else if (Array.isArray(pickupLocations)) {
                locations = pickupLocations;
            }
        } catch (shiprocketError) {
            console.error('Shiprocket API error:', shiprocketError.message);

            // Return mock data for development/testing
            locations = [
                {
                    id: 1,
                    pickup_location: 'Main Warehouse',
                    nickname: 'Primary',
                    name: 'John Doe',
                    email: 'john@example.com',
                    phone: '9876543210',
                    address: '123 Main Street',
                    address_2: 'Near Central Mall',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    country: 'India',
                    pin_code: '400001',
                    vendor_name: 'Main Vendor',
                    gstin: '27AAAAA0000A1Z5',
                    is_first_mile_pickup: true
                },
                {
                    id: 2,
                    pickup_location: 'Secondary Warehouse',
                    nickname: 'Secondary',
                    name: 'Jane Smith',
                    email: 'jane@example.com',
                    phone: '9876543211',
                    address: '456 Second Street',
                    address_2: '',
                    city: 'Delhi',
                    state: 'Delhi',
                    country: 'India',
                    pin_code: '110001',
                    vendor_name: 'Second Vendor',
                    gstin: '07BBBBB1111B2Z6',
                    is_first_mile_pickup: false
                }
            ];

            console.log('Using mock pickup locations for development');
        }
        res.status(200).json({
            success: true,
            data: locations,
            message: locations.length === 0 ? 'No pickup locations found' : `Found ${locations.length} pickup locations`
        });
    } catch (error) {
        console.error('Get pickup locations error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get pickup locations',
            data: [] // Always return an empty array on error
        });
    }
};

// Add new pickup location
exports.addPickupLocation = async (req, res) => {
    try {
        const pickupData = req.body;

        // Validate required fields
        const requiredFields = ['pickup_location', 'name', 'email', 'phone', 'address', 'city', 'state', 'country', 'pin_code'];
        const missingFields = requiredFields.filter(field => !pickupData[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        const result = await shiprocketAPI.addPickupLocation(pickupData);

        if (result.success) {
            res.status(200).json({
                success: true,
                message: 'Pickup location added successfully',
                data: result
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message || 'Failed to add pickup location'
            });
        }
    } catch (error) {
        console.error('Add pickup location error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to add pickup location'
        });
    }
};

// Update pickup location
exports.updatePickupLocation = async (req, res) => {
    try {
        const { pickupId } = req.params;
        const pickupData = req.body;

        if (!pickupId) {
            return res.status(400).json({
                success: false,
                message: 'Pickup ID is required'
            });
        }

        const result = await shiprocketAPI.updatePickupLocation(pickupId, pickupData);

        if (result.success) {
            res.status(200).json({
                success: true,
                message: 'Pickup location updated successfully',
                data: result
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message || 'Failed to update pickup location'
            });
        }
    } catch (error) {
        console.error('Update pickup location error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update pickup location'
        });
    }
};

// Delete pickup location
exports.deletePickupLocation = async (req, res) => {
    try {
        const { pickupId } = req.params;

        if (!pickupId) {
            return res.status(400).json({
                success: false,
                message: 'Pickup ID is required'
            });
        }

        const result = await shiprocketAPI.deletePickupLocation(pickupId);

        if (result.success) {
            res.status(200).json({
                success: true,
                message: 'Pickup location deleted successfully'
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message || 'Failed to delete pickup location'
            });
        }
    } catch (error) {
        console.error('Delete pickup location error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete pickup location'
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
        console.log('Cart items structure:', JSON.stringify(cartItems, null, 2));

        if (cartItems.length > 0) {
            cartItems.forEach((item, index) => {
                console.log(`Processing item ${index}:`, {
                    hasProduct: !!item.product,
                    productId: item.product?._id,
                    hasPackageInfo: !!item.product?.packageInfo,
                    packageInfo: item.product?.packageInfo,
                    quantity: item.quantity
                });

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
