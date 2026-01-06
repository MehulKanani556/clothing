const Product = require('../models/product.model');
const Category = require('../models/category.model');
const { validationResult } = require('express-validator');
const Review = require('../models/review.model');

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
            .populate('category')
            .populate('subCategory');

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Fetch Reviews
        const reviews = await Review.find({ product: product._id, status: 'Published' })
            .populate('user')
            .sort({ createdAt: -1 });

        // Calculate Aggregates
        const totalReviews = reviews.length;
        const sumRatings = reviews.reduce((acc, r) => acc + r.rating, 0);
        const averageRating = totalReviews > 0 ? (sumRatings / totalReviews).toFixed(1) : 0;

        const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach(r => {
            if (breakdown[r.rating] !== undefined) breakdown[r.rating]++;
        });

        // Convert counts to percentages if needed by frontend, or just send counts
        // Frontend expects percentages in 'breakdown' array or object? 
        // Let's send raw counts and let frontend calc %, or send structure matching the user's mock:
        // "rating": { "breakdown": { "1": 0, ... }, "average": 0, "count": 0 }

        const productWithReviews = {
            ...product.toObject(),
            reviews,
            rating: {
                average: averageRating,
                count: totalReviews,
                breakdown
            }
        };

        res.status(200).json({
            success: true,
            data: productWithReviews
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

// --- DATA PARSING & VALIDATION HELPER ---
const parseProductData = (req) => {
    let productData = {};
    if (req.body.product) {
        try {
            productData = JSON.parse(req.body.product);
        } catch (e) {
            throw new Error('Invalid JSON product data');
        }
    } else {
        // If product data is not stringified but sent as fields (unlikely if using the FormData setup we made, but fallback)
        productData = { ...req.body };
    }

    if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
            const { fieldname, location } = file;

            if (fieldname === 'sizeChart') {
                productData.sizeChart = location;
            } else if (fieldname.startsWith('variants')) {
                // Expected format matches frontend: variants[0].images[0]
                const match = fieldname.match(/variants\[(\d+)\]\.images\[(\d+)\]/);
                if (match) {
                    const variantIndex = parseInt(match[1]);
                    const imageIndex = parseInt(match[2]);

                    if (!productData.variants) productData.variants = [];
                    if (!productData.variants[variantIndex]) productData.variants[variantIndex] = {};
                    if (!productData.variants[variantIndex].images) productData.variants[variantIndex].images = [];

                    productData.variants[variantIndex].images[imageIndex] = location;
                }
            }
        });
    }

    // Clean up to remove any undefined holes in arrays if indices weren't contiguous
    if (productData.variants) {
        productData.variants.forEach(variant => {
            if (variant && variant.images) {
                // Filter out nulls/undefined but keep valid strings (s3 urls)
                variant.images = variant.images.filter(img => img);
            }
        });
    }

    return productData;
};

const validateProduct = (data) => {
    const errors = [];
    if (!data.name) errors.push('Name is required');
    if (!data.brand) errors.push('Brand is required');
    if (!data.category) errors.push('Category is required');
    if (!data.gender) errors.push('Gender is required');
    if (data.gstPercentage === undefined || data.gstPercentage === null) errors.push('GST is required');
    if (!data.variants || data.variants.length === 0) {
        errors.push('At least one variant is required');
    } else {
        data.variants.forEach((v, i) => {
            if (!v.color) errors.push(`Variant ${i + 1}: Color is required`);
            if (!v.colorFamily) errors.push(`Variant ${i + 1}: Color Family is required`);
            // Images check might be tricky if partial update, but for create it's needed.
            if (!v.images || v.images.length === 0) errors.push(`Variant ${i + 1}: Image is required`);
            if (!v.options || v.options.length === 0) errors.push(`Variant ${i + 1}: Size Options are required`);
        });
    }
    return errors;
};

const generateSlug = (name) => {
    return name
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
};

// Create Product
exports.createProduct = async (req, res) => {
    try {
        const productData = parseProductData(req);

        const errors = validateProduct(productData);
        if (errors.length > 0) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors });
        }

        // Generate Slug
        if (!productData.slug && productData.name) {
            productData.slug = generateSlug(productData.name);
            // Append random string to ensure uniqueness collision handling (basic)
            productData.slug = productData.slug + '-' + Math.floor(1000 + Math.random() * 9000);
        }

        // Generate SKU
        if (productData.category && productData.variants) {
            const categoryDoc = await Category.findById(productData.category);
            const categoryPrefix = categoryDoc ? categoryDoc.name.substring(0, 3).toUpperCase() : 'GEN';

            productData.variants.forEach(variant => {
                if (variant.options) {
                    variant.options.forEach(option => {
                        if (!option.sku || option.sku.trim() === '') {
                            // "product category and uniq 7 digi number"
                            const random7 = Math.floor(1000000 + Math.random() * 9000000);
                            option.sku = `${categoryPrefix}-${random7}`;
                        }
                    });
                }
            });
        }

        const product = await Product.create(productData);
        res.status(201).json({
            success: true,
            data: product
        });
    } catch (error) {
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Duplicate field value entered (Slug, Name or SKU)' });
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

        const newData = parseProductData(req);

        // Handle Slug: preserve existing if not explicitly updating
        // Standard practice: don't auto-update slug on name change to save SEO links.
        // If needed, frontend should allow slug editing.

        // Auto-generate SKU for NEW options
        if (newData.variants) {
            const categoryId = newData.category || product.category;
            const categoryDoc = await Category.findById(categoryId);
            const categoryPrefix = categoryDoc ? categoryDoc.name.substring(0, 3).toUpperCase() : 'GEN';

            newData.variants.forEach(variant => {
                if (variant.options) {
                    variant.options.forEach(option => {
                        if (!option.sku || option.sku.trim() === '') {
                            const random7 = Math.floor(1000000 + Math.random() * 9000000);
                            option.sku = `${categoryPrefix}-${random7}`;
                        }
                    });
                }
            });
        }

        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, newData, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: updatedProduct
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Duplicate field value entered (Slug, Name or SKU)' });
        }
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
