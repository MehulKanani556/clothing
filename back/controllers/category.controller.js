const Category = require('../models/category.model');
const Product = require('../models/product.model');
const Order = require('../models/order.model');

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

// Get single category by ID with its products
exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findOne({ _id: req.params.id, deletedAt: null });

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        const products = await Product.find({ category: req.params.id, isActive: true })
            .populate('category')
            .populate('subCategory');

        res.status(200).json({
            success: true,
            data: {
                category,
                products
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a category (Soft Delete)
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, {
            deletedAt: new Date()
        }, { new: true });

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create a category
exports.createCategory = async (req, res) => {
    try {
        const categoryData = { ...req.body };
        if (req.file) {
            categoryData.image = req.file.location || req.file.path;
        }

        const category = await Category.create(categoryData);
        res.status(201).json({
            success: true,
            data: category
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
// Update a category
exports.updateCategory = async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.file) {
            updateData.image = req.file.location || req.file.path;
        }

        const category = await Category.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};


// Get all admin categories with stats
exports.getAlladminCategories = async (req, res) => {
    try {
        const categories = await Category.find({ deletedAt: null });

        // 1. Get Product Counts per Category
        const productCounts = await Product.aggregate([
            { $match: { isActive: true } }, // Optional: only count active products? Or all? User likely wants all valid products.
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        // 2. Get Order Stats per Category (Earnings & Order Count)
        // We aggregate on Orders -> Unwind Items -> Lookup Product -> Group by Category
        const orderStats = await Order.aggregate([
            { $match: { paymentStatus: 'Paid' } }, // Only count paid orders for earnings usually
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "products",
                    localField: "items.product",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            {
                $group: {
                    _id: "$productDetails.category",
                    totalEarnings: { $sum: "$items.totalPrice" },
                    uniqueOrders: { $addToSet: "$_id" }
                }
            },
            {
                $project: {
                    totalEarnings: 1,
                    orderCount: { $size: "$uniqueOrders" }
                }
            }
        ]);

        // 3. Map stats to categories
        const categoryStats = categories.map(cat => {
            const pCount = productCounts.find(p => p._id.toString() === cat._id.toString());
            const oStat = orderStats.find(o => o._id.toString() === cat._id.toString());

            return {
                ...cat.toObject(),
                productCount: pCount ? pCount.count : 0,
                orderCount: oStat ? oStat.orderCount : 0,
                totalEarnings: oStat ? oStat.totalEarnings : 0
            };
        });

        res.status(200).json({
            success: true,
            count: categoryStats.length,
            data: categoryStats
        });
    } catch (error) {
        console.error("Error in getAlladminCategories:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};