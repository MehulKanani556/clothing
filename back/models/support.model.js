const mongoose = require('mongoose');

const supportSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['Open', 'In Progress', 'Closed'], default: 'Open' },
    adminResponse: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Support', supportSchema);
