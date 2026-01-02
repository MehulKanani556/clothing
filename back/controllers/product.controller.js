const Product = require('../models/product.model');
const { validationResult } = require('express-validator');

// Upload Image Helper Endpoint
exports.uploadProductImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        // req.file.location is available if using multer-s3 (and public-read)
        // If the S3 bucket is private, you might need to use the Key and generate a signed URL, 
        // but for now, we assume public read or formatted URL usage.

        // Ensure consistent protocol
        const location = req.file.location || req.file.path || '';

        res.status(200).json({
            success: true,
            imageUrl: location
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all products (with filters, search, pagination)
exports.getAllProducts = async (req, res) => {
    try {
        const {
            category,
            brand,
            minPrice,
            maxPrice,
            search,
            sort,
            page = 1,
            limit = 12,
            featured,
            gender
        } = req.query;

        const query = { isActive: true }; // Only active products

        // Filtering
        if (category) query.category = category; // Assuming ID is passed, check frontend
        if (gender) query.gender = { $regex: gender, $options: 'i' };
        if (brand) query.brand = { $regex: brand, $options: 'i' };

        if (minPrice || maxPrice) {
            query['variants.options.price'] = {};
            if (minPrice) query['variants.options.price'].$gte = Number(minPrice);
            if (maxPrice) query['variants.options.price'].$lte = Number(maxPrice);
        }

        if (featured === 'new-arrivals') {
            // Logic to determine new arrivals, e.g., created recently
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            query.createdAt = { $gte: thirtyDaysAgo };
        }
        // Best sellers would need Order data aggregation, skipping for now unless 'isBestSeller' flag exists

        if (search) {
            // Text search requires text index on Model
            query.$text = { $search: search };
        }

        // Sorting
        let sortOption = {};
        if (sort === 'price-low-high') sortOption['variants.options.price'] = 1;
        else if (sort === 'price-high-low') sortOption['variants.options.price'] = -1;
        else if (sort === 'newest') sortOption.createdAt = -1;
        else sortOption.createdAt = -1; // Default new to old

        // Pagination
        const skip = (Number(page) - 1) * Number(limit);

        const products = await Product.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(Number(limit))
            .populate('category', 'name slug')
            .populate('subCategory', 'name slug');

        const total = await Product.countDocuments(query);

        res.status(200).json({
            success: true,
            count: products.length,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            data: products
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single product by ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name slug')
            .populate('subCategory', 'name slug');

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get related products
exports.getRelatedProducts = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const related = await Product.find({
            category: product.category,
            _id: { $ne: product._id },
            isActive: true
        }).limit(4);

        res.status(200).json({
            success: true,
            data: related
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create Product
exports.createProduct = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const product = await Product.create(req.body);
        res.status(201).json({
            success: true,
            data: product
        });
    } catch (error) {
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Duplicate field value entered (Slug or Name)' });
        }
        res.status(400).json({ success: false, message: error.message });
    }
};

// Update Product
exports.updateProduct = async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Soft Delete Product
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Soft delete
        product.isActive = false;
        await product.save();

        res.status(200).json({
            success: true,
            message: 'Product soft deleted'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
