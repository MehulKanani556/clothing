const SubCategory = require('../models/subCategory.model');

// Get all subcategories
exports.getAllSubCategories = async (req, res) => {
    try {
        const subCategories = await SubCategory.find({ deletedAt: null }).populate('category', 'name');
        res.status(200).json({
            success: true,
            count: subCategories.length,
            data: subCategories
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all admin subcategories (can include logic to see deleted ones if needed, but for now standard list)
exports.getAllAdminSubCategories = async (req, res) => {
    try {
        const subCategories = await SubCategory.find().populate('category', 'name');
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
        const subCategories = await SubCategory.find({ category: categoryId, deletedAt: null, isActive: true });
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

// Update subcategory
exports.updateSubCategory = async (req, res) => {
    try {
        const subCategory = await SubCategory.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!subCategory) {
            return res.status(404).json({ success: false, message: 'Subcategory not found' });
        }

        res.status(200).json({
            success: true,
            data: subCategory
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Soft delete subcategory
exports.deleteSubCategory = async (req, res) => {
    try {
        const subCategory = await SubCategory.findByIdAndUpdate(req.params.id, {
            deletedAt: Date.now(),
            isActive: false
        }, { new: true });

        if (!subCategory) {
            return res.status(404).json({ success: false, message: 'Subcategory not found' });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
