const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    attempts: {
        type: Number,
        default: 0
    },
    userData: {
        type: Object
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // 5 minutes in seconds (300)
    }
});

module.exports = mongoose.model("Otp", otpSchema);
