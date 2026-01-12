const MainCategory = require('../models/mainCategory.model');
const Category = require('../models/category.model');
const Product = require('../models/product.model');
const Order = require('../models/order.model');
const { generateSlug } = require('../utils/skuSlugGenerator');

// Get all main categories
exports.getAllMainCategories = async (req, res) => {
    try {
        const mainCategories = await MainCategory.find({ isActive: true, deletedAt: null });
        res.status(200).json({
            success: true,
            count: mainCategories.length,
            data: mainCategories
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all admin main categories with stats
exports.getAllAdminMainCategories = async (req, res) => {
    try {
        const mainCategories = await MainCategory.find({ deletedAt: null });

        // Get stats for each main category
        const mainCategoryStats = await Promise.all(mainCategories.map(async (mainCat) => {
            // Count categories under this main category
            const categoryCount = await Category.countDocuments({ mainCategory: mainCat._id, deletedAt: null });
            
            // Count products (through categories)
            const categories = await Category.find({ mainCategory: mainCat._id, deletedAt: null }).select('_id');
            const categoryIds = categories.map(c => c._id);
            const productCount = await Product.countDocuments({ 
                category: { $in: categoryIds }, 
                isActive: true 
            });

            return {
                ...mainCat.toObject(),
                categoryCount,
                productCount
            };
        }));

        res.status(200).json({
            success: true,
            count: mainCategoryStats.length,
            data: mainCategoryStats
        });
    } catch (error) {
        console.error("Error in getAllAdminMainCategories:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single main category by ID with its categories
exports.getMainCategoryById = async (req, res) => {
    try {
        const mainCategory = await MainCategory.findOne({ _id: req.params.id, deletedAt: null });

        if (!mainCategory) {
            return res.status(404).json({ success: false, message: 'Main category not found' });
        }

        const categories = await Category.find({ mainCategory: req.params.id, deletedAt: null, isActive: true })
            .populate('mainCategory', 'name slug');

        res.status(200).json({
            success: true,
            data: {
                mainCategory,
                categories
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create a main category
exports.createMainCategory = async (req, res) => {
    try {
        const mainCategoryData = { ...req.body };
        if (req.file) {
            mainCategoryData.image = req.file.location || req.file.path;
        }

        // // Auto-generate slug if not provided
        // if (!mainCategoryData.slug && mainCategoryData.name) {
        //     mainCategoryData.slug = generateSlug(mainCategoryData.name);
        // }

        const mainCategory = await MainCategory.create(mainCategoryData);
        res.status(201).json({
            success: true,
            data: mainCategory
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Update a main category
exports.updateMainCategory = async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.file) {
            updateData.image = req.file.location || req.file.path;
        }

        // Auto-regenerate slug if name changed
        const existingMainCategory = await MainCategory.findById(req.params.id);
        // if (existingMainCategory && updateData.name) {
        //     updateData.slug = generateSlug(updateData.name);
        // }

        const mainCategory = await MainCategory.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });

        if (!mainCategory) {
            return res.status(404).json({ success: false, message: 'Main category not found' });
        }

        res.status(200).json({
            success: true,
            data: mainCategory
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Delete a main category (Soft Delete)
exports.deleteMainCategory = async (req, res) => {
    try {
        const mainCategory = await MainCategory.findByIdAndUpdate(req.params.id, {
            deletedAt: new Date()
        }, { new: true });

        if (!mainCategory) {
            return res.status(404).json({ success: false, message: 'Main category not found' });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

