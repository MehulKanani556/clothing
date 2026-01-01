const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema({
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    description: {
        type: String
    },
    image: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('SubCategory', subCategorySchema);
