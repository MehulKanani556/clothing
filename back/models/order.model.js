const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    sku: { type: String, required: true },
    name: { type: String, required: true }, // Store snapshot
    size: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }, // Unit price at time of purchase
    gstPercentage: { type: Number, required: true },
    gstAmount: { type: Number, required: true }, // Total GST for this line item
    totalPrice: { type: Number, required: true }, // (Price * Qty) + GST (or inclusive depending on logic, let's assume inclusive for simplicity, but explicit split is better for reports)
    image: { type: String },
    returnStatus: { type: String, enum: ['None', 'Requested', 'Approved', 'Rejected', 'Completed'], default: 'None' }
});

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true }, // Human readable ID e.g. ORD-12345
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    items: [orderItemSchema],

    // Financials
    subTotal: { type: Number, required: true }, // Pre-tax
    taxTotal: { type: Number, required: true }, // Total GST
    cgstTotal: { type: Number, default: 0 },
    sgstTotal: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    discountTotal: { type: Number, default: 0 },
    appliedCoupon: {
        code: { type: String },
        discount: { type: Number, default: 0 }
    },
    grandTotal: { type: Number, required: true }, // Payable

    // Payment
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending' },
    paymentMethod: { type: String, enum: ['COD', 'Online'], required: true },
    transactionId: { type: String },
    paymentGatewayDetails: { type: Object }, // Store Cashfree/Gateway response

    // Fulfillment
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    shippingAddress: {
        firstName: String,
        lastName: String,
        addressLine1: String,
        addressLine2: String,
        city: String,
        state: String,
        pincode: String,
        phone: String,
        buildingName: String,
        landmark: String,
        locality: String,
        

    },

    // Shipping & Tracking
    shiprocketOrderId: { type: String },
    shipmentId: { type: String },
    trackingNumber: { type: String },
    awbNumber: { type: String },
    carrier: { type: String },
    trackingUrl: { type: String },
    shiprocketResponse: { type: Object },
    shippingLabel: { type: String },
    estimatedDeliveryDate: { type: Date },
    actualDeliveryDate: { type: Date },
    shiprocketStatus: { type: String },
    lastStatusUpdate: { type: Date },
    courierCompanyId: { type: String },
    
    // Dates
    placedAt: { type: Date, default: Date.now },
    confirmedAt: { type: Date },
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
    returnWindowExpiresAt: { type: Date } // Set upon delivery

}, { timestamps: true });

// Optimize for User Orders & Admin Reports
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'items.product': 1 });

module.exports = mongoose.model('Order', orderSchema);
