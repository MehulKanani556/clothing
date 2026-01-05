
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    photo: {
        type: String,
        default: "" // Made optional or default empty as user might not upload immediately on register? Actually registration uses upload, so it might be required. Keeping it as is but careful with updates.
    },
    mobileNumber: {
        type: String,
        default: ""
    },
    dateOfBirth: {
        type: Date,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    updatedAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    addresses: [
        {
            firstName: { type: String, required: true },
            lastName: { type: String, required: true },
            mobileNo: { type: String, required: true },
            email: { type: String },
            buildingName: { type: String },
            landmark: { type: String },
            locality: { type: String },
            pincode: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            country: { type: String, default: 'India' },
            addressType: { type: String, enum: ['Home', 'Office', 'Other'], default: 'Home' },
            isDefault: { type: Boolean, default: false }
        }
    ]

});

module.exports = mongoose.model('User', userSchema);
