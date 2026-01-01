const mongoose = require('mongoose');

// Schema for individual sellable units (SKUs)
const skuSchema = new mongoose.Schema({
    sku: {
        type: String,
        required: true,
        unique: true
    }, // Unique identifier (e.g., "NIKE-BLK-M")
    size: {
        type: String,
        required: true
    }, // "M", "L", "42", "10"

    // Pricing at SKU level is critical for scalable systems where larger sizes might cost more
    price: {
        type: Number,
        required: true
    }, // Selling Price
    mrp: {
        type: Number,
        required: true
    }, // Maximum Retail Price (for calculating discount)

    stock: {
        type: Number,
        default: 0,
        min: 0
    },

    // Optional: Physical attributes for shipping calculation
    weight: { type: String },
});

const productSchema = new mongoose.Schema({
    // --- Basic Info ---
    name: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true
    },
    brand: {
        type: String,
        trim: true,
        index: true
    }, // e.g., "Puma", "Zara", "Roadster"

    // --- Description & Content ---
    shortDescription: {
        type: String,
        trim: true
    },
    description: {
        type: String
    }, // Detailed HTML/Markdown description
    highlights: [{
        type: String
    }], // Bullet points for quick scanning (Flipkart style)

    // --- Categorization ---
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
        index: true
    },
    subCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCategory',
        index: true
    }, // Specific type (e.g. T-Shirts)
    gender: {
        type: String,
        enum: ['Men', 'Women', 'Unisex', 'Boys', 'Girls', 'Kids'],
        required: true,
        index: true
    },

    // --- Visual Variants (Color Families) ---
    // This structure supports "Group by Color" which is standard for apparel.
    variants: [{
        color: {
            type: String,
            required: true
        }, // Display name: "Midnight Blue"
        colorFamily: {
            type: String,
            index: true
        }, // Filterable name: "Blue" (maps multiple shades to one filter)
        colorCode: {
            type: String
        }, // #000080 (Hex for UI swatch)
        images: [{
            type: String
        }], // [Front, Back, Side, Detail] - First image is usually the thumbnail
        isDefault: {
            type: Boolean,
            default: false
        }, // Which color variant to show as the main card in listings

        // SKUs for this specific color
        options: [skuSchema]
    }],

    // --- Technical Specifications ---
    // Grouped specifications allow for sectioned display (e.g., "Product Details", "Material & Care")
    specifications: [{
        group: {
            type: String, // "General", "Dimensions", "Material"
            default: "General"
        },
        items: [{
            key: { type: String, required: true }, // "Fabric"
            value: { type: String, required: true } // "100% Cotton"
        }]
    }],

    // --- Ratings & Reviews ---
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
            index: true
        },
        count: {
            type: Number,
            default: 0
        },
        breakdown: {
            5: { type: Number, default: 0 },
            4: { type: Number, default: 0 },
            3: { type: Number, default: 0 },
            2: { type: Number, default: 0 },
            1: { type: Number, default: 0 }
        }
    },

    // --- SEO & Search ---
    tags: [{
        type: String,
        index: true
    }], // ["Summer", "Trending", "Casual"]

    // --- Policy & Services ---
    warranty: {
        summary: { type: String }, // "1 Year Manufacturing Warranty"
        covered: { type: String }, // "Manufacturing Defects"
        notCovered: { type: String } // "Physical Damage"
    },

    deliveryInfo: {
        dispatchDays: { type: Number, default: 2 },
        returnPolicy: { type: String, default: "7 Day Replacement" }
    },

    isActive: {
        type: Boolean,
        default: true,
        index: true
    } // Soft delete support

}, { timestamps: true });

// --- Compound Indexes for Efficient Filtering/Sorting ---
// Optimize for: "Shop by Category + Filter by Gender + Filter by Color + Sort by Price"
productSchema.index({ category: 1, gender: 1, 'variants.colorFamily': 1, 'variants.options.price': 1 });
productSchema.index({ name: 'text', description: 'text', 'tags': 'text', brand: 'text' });

module.exports = mongoose.model('Product', productSchema);
