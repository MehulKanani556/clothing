const Order = require('../models/order.model');

// GSTR-1 Style Report
exports.getGstReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date();

        const report = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: start, $lte: end },
                    status: { $ne: 'Cancelled' } // Only valid orders
                }
            },
            {
                $group: {
                    _id: null,
                    totalTaxableValue: { $sum: "$subTotal" },
                    totalCGST: { $sum: "$cgstTotal" },
                    totalSGST: { $sum: "$sgstTotal" },
                    totalTax: { $sum: "$taxTotal" },
                    totalRevenue: { $sum: "$grandTotal" },
                    count: { $sum: 1 }
                }
            }
        ]);

        const details = await Order.find({
            createdAt: { $gte: start, $lte: end },
            status: { $ne: 'Cancelled' }
        }).select('orderId createdAt subTotal taxTotal cgstTotal sgstTotal grandTotal user');

        res.json({
            success: true,
            summary: report[0] || {},
            details
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getNetPayout = async (req, res) => {
    // Logic: Total Sales - Returns = Net Payout
    // Needs integration with Return Service fully, simplified here
    try {
        const { startDate, endDate } = req.query;
        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date();

        const sales = await Order.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end }, status: 'Delivered' } },
            { $group: { _id: null, total: { $sum: "$grandTotal" } } }
        ]);

        // Mock Returns
        const returns = 0;

        res.json({
            success: true,
            sales: sales[0]?.total || 0,
            returns: returns,
            netPayout: (sales[0]?.total || 0) - returns
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
