const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 2592000 // 30 days in seconds (60 * 60 * 24 * 30)
    }
});

module.exports = mongoose.model("Session", sessionSchema);
