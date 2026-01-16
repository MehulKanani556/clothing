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
