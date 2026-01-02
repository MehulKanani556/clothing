const SubCategory = require('../models/subCategory.model');

// Get all subcategories
exports.getAllSubCategories = async (req, res) => {
    try {
        const subCategories = await SubCategory.find({ isActive: true }).populate('category', 'name');
        res.status(200).json({
            success: true,
            count: subCategories.length,
            data: subCategories
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get subcategories by category ID
exports.getSubCategoriesByCategoryId = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const subCategories = await SubCategory.find({ category: categoryId, isActive: true });
        res.status(200).json({
            success: true,
            count: subCategories.length,
            data: subCategories
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create a subcategory
exports.createSubCategory = async (req, res) => {
    try {
        const subCategory = await SubCategory.create(req.body);
        res.status(201).json({
            success: true,
            data: subCategory
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
