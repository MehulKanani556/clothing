// const mongoose = require('mongoose');

// const otpSchema = new mongoose.Schema({
//     email: {
//         type: String,
//         required: true
//     },
//     otp: {
//         type: String,
//         required: true
//     },
//     attempts: {
//         type: Number,
//         default: 0
//     },
//     userData: {
//         type: Object
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now,
//         expires: 100 // 5 minutes in seconds (300)
//     }
// });

// module.exports = mongoose.model("Otp", otpSchema);

const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    otp: {
        type: String,
        required: true
    },
    attempts: {
        type: Number,
        default: 0,
        max: 5
    },
    userData: {
        type: Object
    },
    // This field controls the automatic deletion
    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: 300 } 
    }
});

otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

module.exports = mongoose.model("Otp", otpSchema);
