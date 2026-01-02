const Category = require('../models/category.model');

// Get all categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true });
        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create a category
exports.createCategory = async (req, res) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json({
            success: true,
            data: category
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
