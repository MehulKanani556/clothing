const SubCategory = require('../models/subCategory.model');
const Category = require('../models/category.model');
const { generateSlug } = require('../utils/skuSlugGenerator');

// Get all subcategories
exports.getAllSubCategories = async (req, res) => {
    try {
        const subCategories = await SubCategory.find({ deletedAt: null })
            .populate('category', 'name slug')
            .populate({
                path: 'category',
                populate: {
                    path: 'mainCategory',
                    select: 'name slug'
                }
            });
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
        const subCategories = await SubCategory.find()
            .populate('category', 'name slug')
            .populate({
                path: 'category',
                populate: {
                    path: 'mainCategory',
                    select: 'name slug'
                }
            });
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

        const query = {
            category: categoryId,
            deletedAt: null,
            isActive: true
        };

        const subCategories = await SubCategory.find(query)
            .populate('category', 'name slug')
            .populate({
                path: 'category',
                populate: {
                    path: 'mainCategory',
                    select: 'name slug'
                }
            });
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
        const subCategoryData = { ...req.body };
        if (req.file) {
            subCategoryData.image = req.file.location || req.file.path;
        }

        // // Auto-generate slug based on hierarchy: mainCategory-category-subCategory
        // if (!subCategoryData.slug && subCategoryData.name && subCategoryData.category) {
        //     const category = await Category.findById(subCategoryData.category)
        //         .populate('mainCategory', 'name slug');

        //     if (category) {
        //         const slugParts = [];

        //         // Add main category slug
        //         if (category.mainCategory) {
        //             slugParts.push(category.mainCategory.slug || generateSlug(category.mainCategory.name));
        //         }

        //         // Add category slug
        //         slugParts.push(category.slug || generateSlug(category.name));

        //         // Add subcategory slug
        //         slugParts.push(generateSlug(subCategoryData.name));

        //         subCategoryData.slug = slugParts.join('-');
        //     }
        // }

        const subCategory = await SubCategory.create(subCategoryData);
        const populated = await SubCategory.findById(subCategory._id)
            .populate('category', 'name slug')
            .populate({
                path: 'category',
                populate: {
                    path: 'mainCategory',
                    select: 'name slug'
                }
            });

        res.status(201).json({
            success: true,
            data: populated
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Update subcategory
exports.updateSubCategory = async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.file) {
            updateData.image = req.file.location || req.file.path;
        }

        // Auto-regenerate slug if name or category changed
        const existingSubCategory = await SubCategory.findById(req.params.id)
            .populate({
                path: 'category',
                populate: {
                    path: 'mainCategory',
                    select: 'name slug'
                }
            });

        if (existingSubCategory && (updateData.name || updateData.category)) {
            const name = updateData.name || existingSubCategory.name;
            let category = existingSubCategory.category;

            if (updateData.category && updateData.category !== existingSubCategory.category?.toString()) {
                category = await Category.findById(updateData.category)
                    .populate('mainCategory', 'name slug');
            }

            if (category) {
                const slugParts = [];

                // Add main category slug
                if (category.mainCategory) {
                    slugParts.push(category.mainCategory.slug || generateSlug(category.mainCategory.name));
                }

                // Add category slug
                slugParts.push(category.slug || generateSlug(category.name));

                // Add subcategory slug
                slugParts.push(generateSlug(name));

                updateData.slug = slugParts.join('-');
            }
        }

        const subCategory = await SubCategory.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        })
            .populate('category', 'name slug')
            .populate({
                path: 'category',
                populate: {
                    path: 'mainCategory',
                    select: 'name slug'
                }
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
