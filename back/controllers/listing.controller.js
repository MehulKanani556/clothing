const Product = require('../models/product.model');
const Category = require('../models/category.model');
const SubCategory = require('../models/subCategory.model');
const MainCategory = require('../models/mainCategory.model');

exports.getProductsBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const {
            brand,
            minPrice,
            maxPrice,
            search,
            sort,
            page = 1,
            limit = 12,
            gender,
            color,
            size
        } = req.query;

        let query = { isActive: true };
        let categoryDetails = {};
        let breadcrumbs = [];

        // 1. Resolve Slug Level (Main -> Category -> SubCategory)
        const mainCat = await MainCategory.findOne({ slug });
        if (mainCat) {
            // Found Main Category (e.g. "Men")
            query.gender = mainCat.name;
            const relatedCats = await Category.find({ mainCategory: mainCat._id });
            const relatedCatIds = relatedCats.map(c => c._id);
            query.category = { $in: relatedCatIds };

            categoryDetails = {
                type: 'MainCategory',
                name: mainCat.name,
                _id: mainCat._id,
                description: 'Shop the latest ' + mainCat.name + ' collection.'
            };
            breadcrumbs = [
                { name: 'Home', slug: '/' },
                { name: mainCat.name, slug: `/${mainCat.slug}` }
            ];
        } else {
            const cat = await Category.findOne({ slug }).populate('mainCategory');
            if (cat) {
                // Found Category (e.g. "Topwear")
                query.category = cat._id;
                categoryDetails = {
                    type: 'Category',
                    name: cat.name,
                    _id: cat._id,
                    description: cat.description
                };

                const mainCatName = cat.mainCategory ? cat.mainCategory.name : 'Category';
                const mainCatSlug = cat.mainCategory ? cat.mainCategory.slug : '';

                breadcrumbs = [
                    { name: 'Home', slug: '/' },
                    { name: mainCatName, slug: `/${mainCatSlug}` },
                    { name: cat.name, slug: `/${cat.slug}` }
                ];

            } else {
                const subCat = await SubCategory.findOne({ slug }).populate({
                    path: 'category',
                    populate: { path: 'mainCategory' }
                });

                if (subCat) {
                    // Found SubCategory (e.g. "T-Shirts")
                    query.subCategory = subCat._id;
                    categoryDetails = {
                        type: 'SubCategory',
                        name: subCat.name,
                        _id: subCat._id,
                        description: subCat.description
                    };

                    const parentCat = subCat.category;
                    const parentMain = parentCat && parentCat.mainCategory;

                    breadcrumbs = [
                        { name: 'Home', slug: '/' },
                        { name: parentMain ? parentMain.name : 'Main', slug: parentMain ? `/${parentMain.slug}` : '#' },
                        { name: parentCat ? parentCat.name : 'Category', slug: parentCat ? `/${parentCat.slug}` : '#' },
                        { name: subCat.name, slug: `/${subCat.slug}` }
                    ];

                } else if (slug === 'all-products') {
                    // Special keyword
                    categoryDetails = { name: 'All Products', breadcrumbs: [] };
                    breadcrumbs = [
                        { name: 'Home', slug: '/' },
                        { name: 'All Products', slug: '/all-products' }
                    ];
                } else if (slug === 'best-sellers') {
                    breadcrumbs = [
                        { name: 'Home', slug: '/' },
                        { name: 'Best Sellers', slug: '/best-sellers' }
                    ];
                } else if (slug === 'new-arrivals') {
                    categoryDetails = { name: 'New Arrivals', description: 'Check out our latest additions.' };
                    breadcrumbs = [
                        { name: 'Home', slug: '/' },
                        { name: 'New Arrivals', slug: '/new-arrivals' }
                    ];
                    // Enforce newest sort if not specified, or just let the default sort handle it (which is date desc)
                    if (!sort) sort = 'newest';
                } else if (slug === 'most-popular') {
                    categoryDetails = { name: 'Most Popular', description: 'Our top reviewed products.' };
                    breadcrumbs = [
                        { name: 'Home', slug: '/' },
                        { name: 'Most Popular', slug: '/most-popular' }
                    ];
                } else {
                    return res.status(404).json({ success: false, message: 'Category not found' });
                }
            }
        }

        // Add breadcrumbs to categoryDetails
        categoryDetails.breadcrumbs = breadcrumbs;

        // 2. Apply Filters
        if (gender) {
            query.gender = { $regex: gender, $options: 'i' };
        }

        if (brand) {
            const brands = brand.split(',');
            query.brand = { $in: brands.map(b => new RegExp(b, 'i')) };
        }

        if (color) {
            const colors = color.split(',');
            query['variants.colorFamily'] = { $in: colors.map(c => new RegExp(c, 'i')) };
        }

        if (size) {
            const sizes = size.split(',');
            query['variants.options.size'] = { $in: sizes };
        }

        if (minPrice || maxPrice) {
            query['variants.options.price'] = {};
            if (minPrice) query['variants.options.price'].$gte = Number(minPrice);
            if (maxPrice) query['variants.options.price'].$lte = Number(maxPrice);
        }

        if (search) {
            // Smart Search: Match Text OR Category Names OR SubCategory Names OR Brand
            const searchRegex = new RegExp(search, 'i');

            // Find categories/subcategories that match the search term
            const matchedCats = await Category.find({ name: searchRegex }).select('_id');
            const matchedSubCats = await SubCategory.find({ name: searchRegex }).select('_id');

            const catIds = matchedCats.map(c => c._id);
            const subCatIds = matchedSubCats.map(c => c._id);

            query.$or = [
                { $text: { $search: search } }, // Indexed text search (Name, Desc, Tags, Brand)
                { name: { $regex: searchRegex } }, // Partial name match (slower but covers "t-shir" matches "t-shirt")
                { category: { $in: catIds } },
                { subCategory: { $in: subCatIds } },
                { brand: { $regex: searchRegex } }
            ];
        }

        // 3. Sorting
        let sortOption = {};
        if (sort === 'price-low-high') sortOption['variants.options.price'] = 1;
        else if (sort === 'price-high-low') sortOption['variants.options.price'] = -1;
        else if (sort === 'newest') sortOption.createdAt = -1;
        else sortOption.createdAt = -1;

        // 4. Pagination
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
            categoryDetails,
            data: products
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getProductBySlug = async (req, res) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug })
            .populate({
                path: 'category',
                populate: {
                    path: 'mainCategory'
                }
            })
            .populate('subCategory');

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const reviews = []; // Mock reviews or fetch from Review model if available

        res.status(200).json({
            success: true,
            data: { ...product.toObject(), reviews }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
