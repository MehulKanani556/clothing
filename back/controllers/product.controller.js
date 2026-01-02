const Product = require('../models/product.model');

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
            featured // for "home" specific filters like new arrivals etc
        } = req.query;

        const query = {};

        // Filtering
        if (category) query.category = { $regex: category, $options: 'i' }; // Case-insensitive partial match
        if (brand) query.brand = { $regex: brand, $options: 'i' };

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        if (featured === 'new-arrivals') query.isNewArrival = true;
        if (featured === 'best-sellers') query.isBestSeller = true;

        if (search) {
            query.$text = { $search: search };
        }

        // Sorting
        let sortOption = {};
        if (sort === 'price-low-high') sortOption.price = 1;
        else if (sort === 'price-high-low') sortOption.price = -1;
        else if (sort === 'newest') sortOption.createdAt = -1;
        else sortOption.createdAt = -1; // Default new to old

        // Pagination
        const skip = (Number(page) - 1) * Number(limit);
        const pp = await Product.find();

        console.log(pp);

        const products = await Product.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(Number(limit));

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
        const product = await Product.findById(req.params.id);

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

// Get related products (simple implementation: same category)
exports.getRelatedProducts = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const related = await Product.find({
            category: product.category,
            _id: { $ne: product._id } // Exclude current product
        }).limit(4);

        res.status(200).json({
            success: true,
            data: related
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create Product (for seeding/testing)
exports.createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
