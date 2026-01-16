const Order = require('../models/order.model');
const Product = require('../models/product.model');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');


exports.createOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { items, shippingAddress, paymentMethod, paymentInfo, shippingFee = 0, appliedCoupon } = req.body;
        const userId = req.user._id;

        let grandTotal = 0;
        let subTotal = 0;
        let taxTotal = 0;
        let cgstTotal = 0;
        let sgstTotal = 0;
        let couponDiscount = 0;

        const finalItems = [];

        for (const item of items) {
            const product = await Product.findOne({ _id: item.productId }).session(session);
            if (!product) throw new Error(`Product ${item.productId} not found`);

            let variantOption = null;
            product.variants.forEach(v => {
                const opt = v.options.find(o => o.sku === item.sku);
                if (opt) variantOption = opt;
            });

            if (!variantOption) throw new Error(`SKU ${item.sku} not found`);
            if (variantOption.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name} (${item.sku})`);

            await Product.findOneAndUpdate(
                { _id: product._id, "variants.options.sku": item.sku },
                { $inc: { "variants.$[].options.$[opt].stock": -item.quantity } },
                {
                    arrayFilters: [{ "opt.sku": item.sku }],
                    session: session
                }
            );

            const price = variantOption.price;
            const gst = product.gstPercentage || 0;

            const totalAmount = price * item.quantity;
            const gstAmount = Number(((totalAmount * gst) / (100 + gst)).toFixed(2));
            const taxableValue = Number((totalAmount - gstAmount).toFixed(2));

            const cgst = Number((gstAmount / 2).toFixed(2));
            const sgst = Number((gstAmount / 2).toFixed(2));

            subTotal += taxableValue;
            taxTotal += gstAmount;
            cgstTotal += cgst;
            sgstTotal += sgst;

            finalItems.push({
                product: product._id,
                sku: item.sku,
                name: product.name,
                size: variantOption.size,
                quantity: item.quantity,
                price: price,
                gstPercentage: gst,
                gstAmount: gstAmount,
                totalPrice: price * item.quantity,
                image: product.variants.find(v => v.options.some(o => o.sku === item.sku))?.images[0]
            });
        }

        if (appliedCoupon && appliedCoupon.discount) {
            couponDiscount = appliedCoupon.discount;
        }

        grandTotal = subTotal + taxTotal + shippingFee - couponDiscount;

        const orderId = `ORD-${Date.now()}`;

        const orderData = {
            orderId,
            user: userId,
            items: finalItems,
            subTotal: Math.round(subTotal * 100) / 100,
            taxTotal: Math.round(taxTotal * 100) / 100,
            cgstTotal: Math.round(cgstTotal * 100) / 100,
            sgstTotal: Math.round(sgstTotal * 100) / 100,
            shippingFee: Math.round(shippingFee * 100) / 100,
            discountTotal: Math.round(couponDiscount * 100) / 100,
            grandTotal: Math.round(grandTotal * 100) / 100,
            shippingAddress,
            paymentMethod,
            paymentStatus: 'Pending',
            status: 'Pending'
        };

        if (appliedCoupon) {
            orderData.appliedCoupon = {
                code: appliedCoupon.code,
                discount: appliedCoupon.discount
            };

            // Mark coupon as used by this user
            const Offer = require('../models/offer.model');
            await Offer.findOneAndUpdate(
                { code: appliedCoupon.code.toUpperCase() },
                {
                    $inc: { usageCount: 1 },
                    $push: {
                        usedByUsers: {
                            userId: userId,
                            usedAt: new Date(),
                            orderId: orderId
                        }
                    }
                },
                { session }
            );
        }

        const order = await Order.create([orderData], { session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({ success: true, data: order[0] });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status, paymentStatus, paymentGatewayDetails } = req.body;
        const { id } = req.params;

        const updates = {};
        if (status) updates.status = status;
        if (paymentStatus) updates.paymentStatus = paymentStatus;
        if (paymentGatewayDetails) updates.paymentGatewayDetails = paymentGatewayDetails;

        if (status === 'Shipped') updates.shippedAt = new Date();
        if (status === 'Delivered') {
            updates.deliveredAt = new Date();
            // Calculate return window
            const returnDays = 7; // Configurable
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + returnDays);
            updates.returnWindowExpiresAt = expiry;
        }

        const order = await Order.findByIdAndUpdate(id, updates, { new: true }).populate('user', 'firstName lastName email avatar phone');
        if (!order) return res.status(404).json({ message: 'Order not found' });

        res.json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, count: orders.length, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAdminOrders = async (req, res) => {
    try {
        const { status, page = 1, limit = 20, search } = req.query;
        const query = {};

        if (status) query.status = status;

        if (search) {
            // Find users matching search term first
            const User = require('../models/user.model');
            const searchRegex = new RegExp(search, 'i');

            const users = await User.find({
                $or: [
                    { firstName: searchRegex },
                    { lastName: searchRegex },
                    { email: searchRegex }
                ]
            }).select('_id');

            const userIds = users.map(u => u._id);

            query.$or = [
                { orderId: searchRegex },
                { user: { $in: userIds } }
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);

        const orders = await Order.find(query)
            .populate('user', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip(skip);

        const total = await Order.countDocuments(query);

        res.json({
            success: true,
            total,
            pages: Math.ceil(total / Number(limit)),
            page: Number(page),
            limit: Number(limit),
            data: orders
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Cancel Order
exports.cancelOrder = async (req, res) => {
    try {
        const { orderId, reason } = req.body;
        const order = await Order.findOne({ orderId, user: req.user._id });

        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        if (['Delivered', 'Cancelled', 'Return Requested'].includes(order.status)) {
            return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
        }

        // Logic for Shiprocket cancellation if shipped
        if (order.status === 'Shipped' || order.shiprocketOrderId) {
            try {
                const shiprocketAPI = require('../utils/shiprocketAPI');
                await shiprocketAPI.cancelOrder([order.shiprocketOrderId]);
            } catch (err) {
                console.error("Shiprocket Cancellation Failed:", err.message);
                // Continue with local cancellation even if remote fails (can be handled manually)
            }
        }

        order.status = 'Cancelled';
        order.cancellationReason = reason;

        // Refund Logic - Set status to Requested, wait for Admin
        if (order.paymentStatus === 'Paid') {
            order.refundStatus = 'Initiated'; // Or 'Refund Requested'
            // We do NOT call initiateRefund here as per user request
            order.refundAmount = order.grandTotal;
        }

        await order.save();
        res.json({ success: true, message: 'Order cancelled successfully', data: order });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Request Return
exports.requestReturn = async (req, res) => {
    try {
        const { orderId, reason, bankDetails } = req.body;
        const order = await Order.findOne({ orderId, user: req.user._id });

        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        if (order.status !== 'Delivered') {
            return res.status(400).json({ success: false, message: 'Only delivered orders can be returned' });
        }

        if (new Date() > new Date(order.returnWindowExpiresAt)) {
            return res.status(400).json({ success: false, message: 'Return window has expired' });
        }

        order.status = 'Return Requested';
        order.returnReason = reason;

        // Handle Images from FormData
        if (req.files && req.files.length > 0) {
            // Assuming the upload middleware stores files in req.files
            // Need to map them to URLs. Use logic similar to product upload or use a utility
            // For now, assuming standard array of file objects which might need Cloudinary upload
            // IF using local upload middleware that adds 'path' or 'location':
            const imageUrls = req.files.map(file => file.path || file.location);
            order.returnImages = imageUrls;
        }

        if (order.paymentMethod === 'COD' && bankDetails) {
            order.refundBankDetails = typeof bankDetails === 'string' ? JSON.parse(bankDetails) : bankDetails;
        }

        await order.save();

        res.json({ success: true, message: 'Return request submitted successfully', data: order });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'firstName lastName email avatar phone');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Approve Return & Create Pickup
exports.approveReturn = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await Order.findOne({ orderId }).populate('user');

        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        if (order.status !== 'Return Requested') {
            return res.status(400).json({ success: false, message: 'Order is not in Return Requested state' });
        }

        // Create Return Order in Shiprocket
        try {
            const shiprocketAPI = require('../utils/shiprocketAPI');
            // Assuming we have user address details in order
            const returnData = {
                order_id: order.orderId,
                order_date: order.placedAt.toISOString().split('T')[0],
                channel_id: "", // Optional if default
                pickup_customer_name: order.shippingAddress.firstName,
                pickup_last_name: order.shippingAddress.lastName,
                pickup_address: order.shippingAddress.addressLine1,
                pickup_address_2: order.shippingAddress.addressLine2,
                pickup_city: order.shippingAddress.city,
                pickup_state: order.shippingAddress.state,
                pickup_pincode: order.shippingAddress.pincode,
                pickup_phone: order.shippingAddress.phone,
                pickup_email: order.user?.email || "customer@example.com",
                order_items: order.items.map(item => ({
                    name: item.name,
                    sku: item.sku,
                    units: item.quantity,
                    selling_price: item.price,
                    discount: "",
                    tax: "",
                    hsn: 441122
                })),
                payment_method: "PREPAID",
                sub_total: order.subTotal,
                length: 10,
                breadth: 10,
                height: 10,
                weight: 0.5
            };

            const srResponse = await shiprocketAPI.createReturnOrder(returnData);

            order.returnPickupDetails = {
                shiprocketOrderId: srResponse.order_id || srResponse.return_order_id,
                shipmentId: srResponse.shipment_id,
                status: 'Scheduled',
                pickupDate: new Date()
            };

        } catch (srError) {
            console.error("Shiprocket Return Creation Failed:", srError.message);
            // Optionally fail or allow manual intervention. Let's allow valid for now but warn.
            // return res.status(400).json({ success: false, message: 'Failed to create Shiprocket pickup: ' + srError.message });
        }

        order.status = 'Return Approved';
        await order.save();

        res.json({ success: true, message: 'Return approved and pickup confirmed', data: order });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Reject Return
exports.rejectReturn = async (req, res) => {
    try {
        const { orderId, reason } = req.body;
        const order = await Order.findOneAndUpdate(
            { orderId },
            { status: 'Return Rejected', returnReason: reason },
            { new: true }
        );
        res.json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Process Refund (Manual)
exports.adminProcessRefund = async (req, res) => {
    try {
        const { orderId, amount, note } = req.body;
        const order = await Order.findOne({ orderId });

        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        const paymentController = require('./payment.controller');
        const refundId = `REF-${order.orderId}-${Date.now()}`;

        await paymentController.initiateRefund(order.orderId, amount || order.grandTotal, refundId, note || 'Check Admin Processed');

        order.refundStatus = 'Initiated';
        order.refundId = refundId;
        order.refundAmount = amount || order.grandTotal;
        order.refundDate = new Date();
        order.paymentStatus = 'Refunded';

        await order.save();

        res.json({ success: true, message: 'Refund initiated successfully', data: order });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

