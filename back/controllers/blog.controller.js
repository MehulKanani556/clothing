const Blog = require('../models/blog.model');
const { validationResult } = require('express-validator');

exports.createBlogPost = async (req, res) => {
    try {
        const { title, content, tags, metaDescription } = req.body;
        // Generate basic slug
        const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

        const blog = await Blog.create({
            title,
            slug: `${slug}-${Date.now()}`,
            content,
            tags,
            metaDescription,
            bannerImage: req.file ? req.file.location : null
        });

        res.status(201).json({ success: true, data: blog });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({ isActive: true }).sort({ publishedAt: -1 });
        res.json({ success: true, count: blogs.length, data: blogs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getBlogBySlug = async (req, res) => {
    try {
        const blog = await Blog.findOne({ slug: req.params.slug });
        if (!blog) return res.status(404).json({ message: 'Post not found' });
        res.json({ success: true, data: blog });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteBlog = async (req, res) => {
    try {
        await Blog.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
