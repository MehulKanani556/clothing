const mongoose = require('mongoose');

const returnRequestSchema = new mongoose.Schema({
    requestId: { type: String, unique: true, required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Which items?
    items: [{
        orderItemId: { type: mongoose.Schema.Types.ObjectId, required: true }, // ID from Order.items
        sku: String,
        quantity: Number,
        reason: { type: String, required: true },
        condition: { type: String, enum: ['Unopened', 'Opened', 'Damaged'], default: 'Opened' }
    }],

    type: { type: String, enum: ['Return', 'Exchange'], required: true },
    exchangePreference: {
        newSize: String // If exchange
    },

    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Pickup_Scheduled', 'Received', 'QC_Pass', 'QC_Fail', 'RefundED', 'Rejected'],
        default: 'Pending'
    },

    // Financials
    refundAmount: { type: Number, default: 0 },
    gstReversalAmount: { type: Number, default: 0 }, // For GST Reports
    refundTransactionId: String,

    adminComments: String,
    pickupDate: Date

}, { timestamps: true });

module.exports = mongoose.model('ReturnRequest', returnRequestSchema);
