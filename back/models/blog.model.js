const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true, index: true },
    content: { type: String, required: true }, // HTML/Markdown
    author: { type: String, default: "Admin" },

    // Media
    bannerImage: { type: String },

    // SEO
    metaTitle: { type: String },
    metaDescription: { type: String },
    tags: [{ type: String }],

    isActive: { type: Boolean, default: true },
    publishedAt: { type: Date, default: Date.now }

}, { timestamps: true });

blogSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Blog', blogSchema);
