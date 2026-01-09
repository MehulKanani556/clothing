const Order = require('../models/order.model');
const Cart = require('../models/cart.model');
const { Cashfree } = require('cashfree-pg');

// Configure Credentials
Cashfree.XClientId = process.env.CASHFREE_APP_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX; // Change to PRODUCTION for live

// Create Order
exports.createCashfreeOrder = async (req, res) => {
    try {
        const { orderAmount, customerId, customerPhone, customerName, customerEmail } = req.body;

        if (!orderAmount || !customerId || !customerPhone || !customerName || !customerEmail) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields for order creation"
            });
        }

        const request = {
            "order_amount": parseFloat(orderAmount),
            "order_currency": "INR",
            "order_id": req.body.orderId, // Use the DB Order ID
            "customer_details": {
                "customer_id": customerId,
                "customer_phone": customerPhone,
                "customer_name": customerName,
                "customer_email": customerEmail
            },
            "order_meta": {
                "return_url": `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/payment?order_id={order_id}`
            }
        };

        // Latest API version header: 2025-01-01
        const response = await Cashfree.PGCreateOrder("2023-08-01", request);

        res.status(200).json({
            success: true,
            orderId: response.data.order_id,
            paymentSessionId: response.data.payment_session_id
        });

    } catch (error) {
        console.error("Cashfree Create Order Error:", error.response?.data?.message || error.message);
        res.status(500).json({
            success: false,
            message: error.response?.data?.message || error.message,
            fullError: error.response?.data
        });
    }
};

// Verify Payment
exports.verifyPayment = async (req, res) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "Order ID is required"
            });
        }

        const response = await Cashfree.PGOrderFetchPayments("2023-08-01", orderId);
        const transactions = response.data || [];
        const successTransaction = transactions.find(t => t.payment_status === 'SUCCESS');

        if (successTransaction) {
            // Update Order Status in DB
            const updatedOrder = await Order.findOneAndUpdate(
                { orderId: orderId },
                {
                    status: 'Confirmed',
                    paymentStatus: 'Paid',
                    paymentGatewayDetails: successTransaction,
                    confirmedAt: new Date()
                },
                { new: true }
            );
            const updateCart = await Cart.findOneAndUpdate(
                { user: updatedOrder.user },
                { items: [] },
                { new: true }
            );

            // Auto-create Shiprocket order for paid orders
            try {
                const shiprocketAPI = require('../utils/shiprocketAPI');

                // Fetch user data if not populated
                let userEmail = updatedOrder.user?.email;
                let userMobile = null;
                if (!userEmail) {
                    const User = require('../models/user.model');
                    const user = await User.findById(updatedOrder.user).select('email mobileNumber');
                    userEmail = user?.email || 'customer@example.com';
                    userMobile = user?.mobileNumber;
                }


                // Validate required fields before creating Shiprocket order
                if (!updatedOrder.shippingAddress?.firstName ||
                    !updatedOrder.shippingAddress?.pincode) {
                    console.log('Skipping Shiprocket order creation - incomplete address:', {
                        hasFirstName: !!updatedOrder.shippingAddress?.firstName,
                        hasLastName: !!updatedOrder.shippingAddress?.lastName,
                        hasCity: !!updatedOrder.shippingAddress?.city,
                        hasState: !!updatedOrder.shippingAddress?.state,
                        hasPincode: !!updatedOrder.shippingAddress?.pincode,
                        hasPhone: !!(updatedOrder.shippingAddress?.phone || updatedOrder.shippingAddress?.mobileNo),
                        address: updatedOrder.shippingAddress
                    });
                } else {
                    // Helper functions for address handling
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

                        // Fallback if absolutely no address line is provided
                        // Avoid just using "City, State" as it might trigger validation errors
                        return 'Address Details Not Provided';
                    };

                    const getAddressLine2 = (addr) => {
                        return addr.addressLine2 || addr.landmark || addr.locality || '';
                    };

                    const getPhone = (addr) => {
                        return addr.phone || addr.mobileNo || userMobile || '9999999999'; // Default phone if missing
                    };

                    console.log('Creating Shiprocket order with processed address:', {
                        firstName: updatedOrder.shippingAddress.firstName,
                        lastName: updatedOrder.shippingAddress.lastName || updatedOrder.shippingAddress.firstName,
                        addressLine1: getAddressLine1(updatedOrder.shippingAddress),
                        city: updatedOrder.shippingAddress.city,
                        state: updatedOrder.shippingAddress.state,
                        pincode: updatedOrder.shippingAddress.pincode,
                        phone: getPhone(updatedOrder.shippingAddress)
                    });

                    // Try to get pickup locations and use the first one if "Primary" doesn't work
                    let pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION;
                    try {
                        const pickupLocations = await shiprocketAPI.getPickupLocations();
                        if (pickupLocations && pickupLocations.data && pickupLocations.data.length > 0) {
                            pickupLocation = pickupLocations.data[0].pickup_location || "Primary";
                            console.log('Using pickup location:', pickupLocation);
                        }
                    } catch (pickupError) {
                        console.log('Could not fetch pickup locations, using "Primary"');
                    }

                    // Prepare Shiprocket order data
                    const shiprocketOrderData = {
                        order_id: updatedOrder.orderId,
                        order_date: updatedOrder.placedAt.toISOString().split('T')[0],
                        pickup_location: pickupLocation,

                        // Billing Address (required)
                        billing_customer_name: updatedOrder.shippingAddress.firstName,
                        billing_last_name: updatedOrder.shippingAddress.lastName || updatedOrder.shippingAddress.firstName,
                        billing_address: getAddressLine1(updatedOrder.shippingAddress),
                        billing_address_2: getAddressLine2(updatedOrder.shippingAddress),
                        billing_city: updatedOrder.shippingAddress.city,
                        billing_pincode: updatedOrder.shippingAddress.pincode,
                        billing_state: updatedOrder.shippingAddress.state,
                        billing_country: "India",
                        billing_email: userEmail,
                        billing_phone: getPhone(updatedOrder.shippingAddress),

                        // Shipping same as billing
                        shipping_is_billing: true,

                        // Order items and other details
                        order_items: updatedOrder.items.map(item => ({
                            name: item.name,
                            sku: item.sku,
                            units: item.quantity,
                            selling_price: item.price,
                            discount: "",
                            tax: "",
                            hsn: 441122
                        })),
                        payment_method: updatedOrder.paymentMethod === 'COD' ? 'COD' : 'Prepaid',
                        shipping_charges: updatedOrder.shippingFee || 0,
                        giftwrap_charges: 0,
                        transaction_charges: 0,
                        total_discount: updatedOrder.discountTotal || 0,
                        sub_total: updatedOrder.subTotal,
                        length: 10,
                        breadth: 10,
                        height: 10,
                        weight: 0.5
                    };

                    // const shiprocketResponse = await shiprocketAPI.createOrder(shiprocketOrderData);

                    // if (shiprocketResponse.status_code === 1) {
                    //     await Order.findByIdAndUpdate(updatedOrder._id, {
                    //         shiprocketOrderId: shiprocketResponse.order_id,
                    //         shipmentId: shiprocketResponse.shipment_id,
                    //         shiprocketResponse: shiprocketResponse,
                    //         lastStatusUpdate: new Date()
                    //     });
                    //     console.log(`Shiprocket order created for ${updatedOrder.orderId}`);
                    // }
                }
            } catch (shiprocketError) {
                console.error('Failed to create Shiprocket order:', shiprocketError.message);
                // Don't fail the payment verification if Shiprocket fails
            }

            res.status(200).json({
                success: true,
                message: "Payment Verified",
                data: successTransaction,
                order: updatedOrder
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Payment Not Completed or Failed"
            });
        }

    } catch (error) {
        console.error("Cashfree Verify Error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Process Payment via S2S
exports.processPayment = async (req, res) => {
    try {
        const { paymentSessionId, card_number, card_holder_name, expiry_mm, expiry_yy, cvv } = req.body;

        if (!paymentSessionId) {
            return res.status(400).json({
                success: false,
                message: "Payment Session ID is required"
            });
        }

        const createPayRequest = (channel) => ({
            "payment_session_id": paymentSessionId,
            "payment_method": {
                "card": {
                    "channel": channel,
                    "card_number": card_number,
                    "card_holder_name": card_holder_name,
                    "card_expiry_mm": expiry_mm,
                    "card_expiry_yy": expiry_yy,
                    "card_cvv": cvv
                }
            }
        });

        let response;
        try {
            // Try with channel 'post' first
            response = await Cashfree.PGPayOrder("2023-08-01", createPayRequest("post"));
        } catch (error) {
            const errMessage = error.response?.data?.message || "";
            // Check for specific error indicating 'post' is not enabled
            if (errMessage.includes("mode not enabled") || error.response?.data?.code === "payment_method_not_allowed") {
                console.log("Channel 'post' not enabled, retrying with 'link'...");
                // Retry with channel 'link'
                response = await Cashfree.PGPayOrder("2023-08-01", createPayRequest("link"));
            } else {
                throw error;
            }
        }

        console.log("Payment Response:", response.data);

        const responseData = response.data;

        // Handle Action: Most S2S card payments require an OTP (Redirection)
        if (responseData.action === "link" || (responseData.data && responseData.data.url)) {
            res.status(200).json({
                success: true,
                url: responseData.data?.url || responseData.data?.payload?.url || responseData.data?.url,
                data: responseData
            });
        } else {
            res.status(200).json({
                success: true,
                data: responseData
            });
        }

    } catch (error) {
        console.error("Cashfree Pay Error:", error.response?.data || error.message);
        res.status(400).json({
            success: false,
            message: error.response?.data?.message || error.message,
            details: error.response?.data
        });
    }
};

// Get Payment Methods
exports.getPaymentMethods = async (req, res) => {
    try {
        const { orderId } = req.query;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "Order ID is required"
            });
        }

        // Using 2025-01-01 version
        const response = await Cashfree.PGOrderFetchPaymentMethods("2025-01-01", orderId);

        res.status(200).json({
            success: true,
            data: response.data
        });

    } catch (error) {
        console.error("Fetch Payment Methods Error:", error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Webhook Handler
exports.handleWebhook = async (req, res) => {
    try {
        const { data, type } = req.body;
        console.log("Webhook received:", type, data);

        if (type === 'PAYMENT_SUCCESS_WEBHOOK') {
            console.log("Payment successful for order:", data?.order?.order_id);
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Webhook Error:", error);
        res.status(500).json({ success: false });
    }
};