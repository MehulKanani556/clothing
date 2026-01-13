const mongoose = require('mongoose');

const LegalPageSchema = new mongoose.Schema({
    slug: {
        type: String,
        required: true,
        unique: true, // e.g., 'privacy-policy', 'terms-conditions'
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String, // HTML content from rich text editor for public display
        required: true
    },
    structure: {
        type: Array, // JSON structure of blocks for the editor
        default: []
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('LegalPage', LegalPageSchema);
