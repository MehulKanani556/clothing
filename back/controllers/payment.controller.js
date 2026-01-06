const { Cashfree } = require('cashfree-pg');
const crypto = require('crypto');

// Configure Credentials
Cashfree.XClientId = process.env.CASHFREE_APP_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;

// Explicitly set the base URL if needed, although XEnvironment.SANDBOX should handle it.
// The error 'endpoint or method is not valid' usually means the SDK couldn't resolve the correct endpoint.
// Let's verify environment loading.
console.log("Cashfree Config:", {
    clientId: Cashfree.XClientId ? 'SET' : 'MISSING',
    environment: Cashfree.XEnvironment
});

// Create Order (Renamed to avoid conflict)
// Create Order (Renamed to avoid conflict)
exports.createCashfreeOrder = async (req, res) => {
    try {
        const { orderAmount, customerId, customerPhone, customerName, customerEmail } = req.body;

        if (!orderAmount || !customerId || !customerPhone || !customerName || !customerEmail) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields for order creation"
            });
        }

        const amount = parseFloat(orderAmount);
        const orderId = `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        // Environment URL
        const CASHFREE_URL = "https://sandbox.cashfree.com/pg"; // Change to api.cashfree.com for prod

        const payload = {
            order_amount: amount,
            order_currency: "INR",
            order_id: orderId,
            customer_details: {
                customer_id: customerId,
                customer_phone: customerPhone,
                customer_name: customerName,
                customer_email: customerEmail
            },
            order_meta: {
                return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/cart`
            }
        };

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'x-client-id': process.env.CASHFREE_APP_ID,
                'x-client-secret': process.env.CASHFREE_SECRET_KEY,
                'x-api-version': '2023-08-01'
            }
        };

        const axios = require('axios');
        const response = await axios.post(`${CASHFREE_URL}/orders`, payload, config);

        console.log("Cashfree Create Order Response:", response.data);

        res.status(200).json({
            success: true,
            orderId: response.data.order_id,
            paymentSessionId: response.data.payment_session_id
        });

    } catch (error) {
        console.error("Cashfree Create Order Error:", error.response?.data?.message || error.message);
        console.error("Full Error:", error.response?.data);

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
            res.status(200).json({
                success: true,
                message: "Payment Verified",
                data: successTransaction
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

// Process Payment with Card Details (S2S)
exports.processPayment = async (req, res) => {
    try {
        const { paymentSessionId, paymentMethod } = req.body;

        console.log("ProcessPayment Request:", JSON.stringify(req.body, null, 2));

        if (!paymentSessionId) {
            throw new Error("Payment Session ID is missing");
        }

        // Environment URL
        const CASHFREE_URL = "https://sandbox.cashfree.com/pg"; // Change to api.cashfree.com for prod

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'x-client-id': process.env.CASHFREE_APP_ID,
                'x-client-secret': process.env.CASHFREE_SECRET_KEY,
                'x-api-version': '2023-08-01'
            }
        };

        const payload = {
            payment_session_id: paymentSessionId,
            payment_method: paymentMethod
        };

        const axios = require('axios');
        const response = await axios.post(`${CASHFREE_URL}/orders/pay`, payload, config);

        console.log("Cashfree Pay Response:", response.data);

        res.status(200).json({
            success: true,
            data: response.data
        });

    } catch (error) {
        console.error("Cashfree Pay Error:", error.response?.data);

        const errorData = error.response?.data || {};

        res.status(500).json({
            success: false,
            message: errorData.message || "Payment Processing Failed",
            details: errorData,
            code: errorData.code || errorData.type // specific code mapping
        });
    }
};

// NEW: Get Payment Methods
exports.getPaymentMethods = async (req, res) => {
    try {
        const { orderId } = req.query;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "Order ID is required"
            });
        }

        const response = await Cashfree.PGOrderFetchPaymentMethods("2023-08-01", orderId);

        res.status(200).json({
            success: true,
            data: response.data
        });

    } catch (error) {
        console.error("Fetch Payment Methods Error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// NEW: Handle Webhook for Payment Status
exports.handleWebhook = async (req, res) => {
    try {
        const { data, type } = req.body;

        console.log("Webhook received:", type, data);

        // Verify webhook signature
        const signature = req.headers['x-webhook-signature'];
        const timestamp = req.headers['x-webhook-timestamp'];

        // Implement signature verification here
        // const isValid = verifyWebhookSignature(signature, timestamp, req.body);

        if (type === 'PAYMENT_SUCCESS_WEBHOOK') {
            // Handle successful payment
            // Update order status in database
            console.log("Payment successful for order:", data.order.order_id);
        } else if (type === 'PAYMENT_FAILED_WEBHOOK') {
            // Handle failed payment
            console.log("Payment failed for order:", data.order.order_id);
        }

        res.status(200).json({ success: true });

    } catch (error) {
        console.error("Webhook Error:", error);
        res.status(500).json({ success: false });
    }
};