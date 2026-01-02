const ReturnRequest = require('../models/returnRequest.model');
const Order = require('../models/order.model');

// Request Return
exports.requestReturn = async (req, res) => {
    try {
        const { orderId, items, reason, type } = req.body; // items: [{ orderItemId, quantity }]
        const userId = req.user._id;

        const order = await Order.findOne({ _id: orderId, user: userId });
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (new Date() > new Date(order.returnWindowExpiresAt)) {
            return res.status(400).json({ message: 'Return window has expired' });
        }

        const returnReq = await ReturnRequest.create({
            requestId: `RET-${Date.now()}`,
            order: orderId,
            user: userId,
            items: items.map(i => ({
                orderItemId: i.orderItemId,
                reason: reason,
                quantity: i.quantity
            })),
            type,
            status: 'Pending'
        });

        res.status(201).json({ success: true, data: returnReq });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin Action
exports.processReturn = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminComments } = req.body;

        const ret = await ReturnRequest.findByIdAndUpdate(id, {
            status,
            adminComments
        }, { new: true });

        res.json({ success: true, data: ret });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get All Returns (Admin)
exports.getAllReturns = async (req, res) => {
    try {
        const returns = await ReturnRequest.find().sort({ createdAt: -1 });
        res.json({ success: true, data: returns });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
