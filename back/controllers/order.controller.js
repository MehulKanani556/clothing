const Order = require('../models/order.model');
const Product = require('../models/product.model');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Helper: Calculate tax
const calculateTax = (price, percent) => {
    return (price * percent) / 100;
};

exports.createOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { items, shippingAddress, paymentMethod, paymentInfo } = req.body;
        const userId = req.user._id;

        let grandTotal = 0;
        let subTotal = 0;
        let taxTotal = 0;
        let cgstTotal = 0;
        let sgstTotal = 0;
        let shippingFee = 0; // Logic for free shipping can be added here

        const finalItems = [];

        for (const item of items) {
            const product = await Product.findOne({ _id: item.productId }).session(session);
            if (!product) throw new Error(`Product ${item.productId} not found`);

            // Find variant/size stock
            // This is a simplified lookup. In real life, need to traverse variants array.
            // Assuming simplified structure for this prompt where we just check "stock" on the variant if possible, 
            // or we assume the frontend sends the correct SKU details and we blindly trust/verify.
            // Let's implement robust check.
            let variantOption = null;
            product.variants.forEach(v => {
                const opt = v.options.find(o => o.sku === item.sku);
                if (opt) variantOption = opt;
            });

            if (!variantOption) throw new Error(`SKU ${item.sku} not found`);
            if (variantOption.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name} (${item.sku})`);

            // Deduct Stock
            // MongoDB array update is tricky, easier to pull, modify, save or use arrayFilters
            // Using logic: we need to update the specific sub-document in array
            await Product.findOneAndUpdate(
                { _id: product._id, "variants.options.sku": item.sku },
                { $inc: { "variants.$[].options.$[opt].stock": -item.quantity } },
                {
                    arrayFilters: [{ "opt.sku": item.sku }],
                    session: session
                }
            );

            // Price Calculation
            const price = variantOption.price; // Sell Price
            const gst = product.gstPercentage || 0;
            const lineGst = (price * item.quantity * gst) / 100; // Simplified Exclusive Tax logic
            // If price is inclusive: tax = (price * gst) / (100 + gst)
            // User requested "GST Breakup", usually implies derived from base price. 
            // Let's assume Price is Taxable Value for simplicity in B2B or clearer B2C. 
            // OR Price is MRP (Inclusive). Let's assume Inclusive for B2C Clothing.

            // Re-calc for Inclusive:
            const taxableValue = (price * item.quantity) / (1 + (gst / 100));
            const gstAmount = (price * item.quantity) - taxableValue;

            // Split CGST/SGST (50-50)
            const cgst = gstAmount / 2;
            const sgst = gstAmount / 2;

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
                price: price, // Unit Price (MRP/Sell Price)
                gstPercentage: gst,
                gstAmount: gstAmount,
                totalPrice: price * item.quantity,
                image: product.variants.find(v => v.options.some(o => o.sku === item.sku))?.images[0]
            });
        }

        grandTotal = subTotal + taxTotal + shippingFee;

        const orderId = `ORD-${Date.now()}`;

        const order = await Order.create([{
            orderId,
            user: userId,
            items: finalItems,
            subTotal: Math.round(subTotal * 100) / 100,
            taxTotal: Math.round(taxTotal * 100) / 100,
            cgstTotal: Math.round(cgstTotal * 100) / 100,
            sgstTotal: Math.round(sgstTotal * 100) / 100,
            grandTotal: Math.round(grandTotal * 100) / 100,
            shippingAddress,
            paymentMethod,
            paymentStatus: 'Pending',
            status: 'Pending'
        }], { session });

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
        const { status, page = 1, limit = 20 } = req.query;
        const query = {};
        if (status) query.status = status;

        const orders = await Order.find(query)
            .populate('user', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);


        const total = await Order.countDocuments(query);

        res.json({ success: true, total, pages: Math.ceil(total / limit), data: orders });
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
