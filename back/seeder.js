const mongoose = require('mongoose');
const dotenv = require('dotenv');
const MainCategory = require('./models/mainCategory.model');
const Category = require('./models/category.model');
const SubCategory = require('./models/subCategory.model');
const Product = require('./models/product.model');
const Review = require('./models/review.model');
const User = require('./models/user.model');

// Load env vars
dotenv.config();

// --- Configuration: Realistic Data Source ---

// 1. Image Library (High quality, category specific)
const imageLibrary = {
    // Men
    "T-Shirts": [
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80", // Black Tee
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80", // White Tee
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80"  // Graphic Tee
    ],
    "Casual Shirts": [
        "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80", // White Shirt
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80", // Checkered
        "https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=800&q=80"  // Blue Shirt
    ],
    "Formal Shirts": [
        "https://images.unsplash.com/photo-1620799140408-ed5341cd2431?w=800&q=80",
        "https://images.unsplash.com/photo-1594938298603-c8148c47e356?w=800&q=80"
    ],
    "Jeans": [
        "https://images.unsplash.com/photo-1542272617-08f08637533d?w=800&q=80", // Men Jeans
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80"  // Women/Unisex
    ],
    "Kurtas & Kurta Sets": [
        "https://images.unsplash.com/photo-1619551734325-81aaf323686c?w=800&q=80", // Men Kurta
        "https://images.unsplash.com/photo-1616885652514-ca0187c54178?w=800&q=80"  // Generic Ethnic
    ],

    // Women
    "Kurtis, Tunics & Tops": [
        "https://images.unsplash.com/photo-1583391733956-6c782a64b516?w=800&q=80",
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80"
    ],
    "Sarees": [
        "https://images.unsplash.com/photo-1610030488176-743539d48d0d?w=800&q=80", // Red Saree
        "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80"
    ],
    "Dresses": [
        "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80", // Floral Dress
        "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80"  // White Dress
    ],
    "Heels": [
        "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80"
    ],

    // Kids
    "Boys Clothing": [
        "https://images.unsplash.com/photo-1519238246290-20ebc56bc116?w=800&q=80",
        "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=800&q=80"
    ],

    // Footwear
    "Sneakers": [
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80", // White Nike
        "https://images.unsplash.com/photo-1607522370275-f14bc3a5d288?w=800&q=80", // Converse
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80"  // Sporty
    ],

    // Default
    "default": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80"
};

const categoryImages = {
    men: "https://images.unsplash.com/photo-1488161628813-99c974c5c88a?w=800&q=80",
    women: "https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?w=800&q=80",
    kids: "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?w=800&q=80",
    genz: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&q=80"
};

// 2. Real Brand Data
const brandDB = {
    "T-Shirts": ["Roadster", "HRX", "Nike", "Puma", "Tommy Hilfiger"],
    "Jeans": ["Levis", "Pepe Jeans", "Jack & Jones", "Wrangler"],
    "Kurtas & Kurta Sets": ["Manyavar", "FabIndia", "Ethnix"],
    "Kurtis, Tunics & Tops": ["W", "Biba", "Aurelia", "Global Desi"],
    "Sarees": ["Kalini", "Mitera", "Saree Mall"],
    "Dresses": ["Berrylush", "Athena", "Tokyo Talkies"],
    "Sneakers": ["Nike", "Puma", "Adidas", "Reebok", "Red Tape"],
    "default": ["H&M", "Zara", "Marks & Spencer"]
};

// 3. Real Descriptions (Plain Text)
const descriptions = {
    "Men": {
        "Short": "Premium quality fabric, regular fit.",
        "Long": "Updated your everyday essentials with this product. It is crafted from high-quality fabric that ensures comfort and durability. Style it with jeans and sneakers for a casual look. Features: Breathable Fabric, Machine Wash, Comfort Fit."
    },
    "Women": {
        "Short": "Elegant and trendy, perfect for any occasion.",
        "Long": "Add a touch of elegance to your wardrobe with this stylish piece. Designed with modern aesthetics in mind, it offers both comfort and style. Pair it with matching accessories to complete the look. Features: Soft Texture, Trendy Design, Easy Care."
    }
};



// --- Helper Functions ---

function getImagesForSubCategory(subCatName) {
    // Try exact match
    if (imageLibrary[subCatName]) return imageLibrary[subCatName];

    // Try partial match
    for (const key in imageLibrary) {
        if (subCatName.includes(key) || key.includes(subCatName)) {
            return imageLibrary[key];
        }
    }

    return [imageLibrary.default];
}

function getBrandForSubCategory(subCatName) {
    if (brandDB[subCatName]) return brandDB[subCatName];
    for (const key in brandDB) {
        if (subCatName.includes(key)) return brandDB[key];
    }
    return brandDB.default;
}

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateRealProduct(mainCatName, subCatName, categoryId, subCategoryId, index) {
    const brandsList = getBrandForSubCategory(subCatName);
    const brand = brandsList[index % brandsList.length];

    const possibleImages = getImagesForSubCategory(subCatName);
    // Ensure we cycle through images if available, else random
    const primaryImage = possibleImages[index % possibleImages.length];

    // Construct Name: "Brand + Color + SubCat Name"
    const colors = ["Black", "White", "Blue", "Red", "Navy", "Green", "Maroon"];
    const color = colors[index % colors.length];

    const name = `${brand} ${color} ${subCatName}`;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 10000);

    // Determine Gender
    let gender = "Unisex";
    if (mainCatName === "Men") gender = "Men";
    else if (mainCatName === "Women") gender = "Women";
    else if (mainCatName === "Kids") gender = "Kids";
    else if (mainCatName === "GenZ") gender = "Unisex"; // GenZ is not in Enum

    // Description
    const descData = (mainCatName === "Men") ? descriptions.Men : descriptions.Women; // Fallback to Women for others

    // Pricing
    const isPremium = ["Nike", "Levis", "Biba", "Manyavar"].includes(brand);
    const basePrice = isPremium ? 2000 : 800;
    const price = basePrice + Math.floor(Math.random() * 500); // 800-1300 or 2000-2500
    const mrp = Math.floor(price * 1.5);

    // SKU
    const skuBase = `${brand.substring(0, 3).toUpperCase()}-${subCatName.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 10000)}`;

    return {
        name: name,
        slug: slug,
        brand: brand,
        shortDescription: `${brand} ${color} ${subCatName}. ${descData.Short}`,
        description: descData.Long,
        highlights: ["100% Original Products", "Pay on delivery might be available", "Easy 14 days returns and exchanges"],
        category: categoryId,
        subCategory: subCategoryId,
        gender: gender,
        gstPercentage: 12,
        sizeChart: "https://constant.myntassets.com/web/assets/img/size_charts/size_chart_men_tshirt.png", // Generic placeholder URL
        isExchangeOnly: false,
        variants: [
            {
                color: color,
                colorFamily: color, // Simplified
                colorCode: color === "Black" ? "#000000" : (color === "White" ? "#FFFFFF" : "#808080"),
                images: [primaryImage, primaryImage], // Add side/back view if we had them
                isDefault: true,
                options: ["S", "M", "L", "XL"].map(size => ({
                    sku: `${skuBase}-${size}`,
                    size: size,
                    price: price,
                    mrp: mrp,
                    stock: 50
                }))
            }
        ],
        specifications: [{
            group: "Product Details",
            items: [
                { key: "Material", value: "Cotton Blend" },
                { key: "Occasion", value: "Casual" },
                { key: "Wash Care", value: "Machine Wash" }
            ]
        }],
        rating: {
            average: (3.5 + Math.random() * 1.5).toFixed(1),
            count: Math.floor(Math.random() * 500),
            breakdown: { 5: 100, 4: 50, 3: 20, 2: 5, 1: 0 }
        },
        tags: [subCatName, brand, "Trending"],
        deliveryInfo: { dispatchDays: 2, returnPolicy: "14 Days Return" },
        isActive: true
    };
}


// --- Main Data Structure ---
const data = [
    {
        name: "Men",
        image: categoryImages.men,
        categories: [
            {
                name: "Topwear",
                image: categoryImages.men,
                subCategories: ["T-Shirts", "Casual Shirts", "Formal Shirts", "Sweatshirts", "Jackets", "Blazers & Coats", "Suits", "Rain Jackets"]
            },
            {
                name: "Bottomwear",
                image: categoryImages.men,
                subCategories: ["Jeans", "Casual Trousers", "Formal Trousers", "Shorts", "Track Pants & Joggers"]
            },
            {
                name: "Indian & Festive Wear",
                image: categoryImages.men,
                subCategories: ["Kurtas & Kurta Sets", "Sherwanis", "Nehru Jackets", "Dhotis"]
            }
        ]
    },
    {
        name: "Women",
        image: categoryImages.women,
        categories: [
            {
                name: "Indian & Fusion Wear",
                image: categoryImages.women,
                subCategories: ["Kurtis, Tunics & Tops", "Sarees", "Ethnic Wear", "Leggings, Salwars & Churidars", "Skirts & Palazzos", "Dress Materials", "Lehenga Cholis", "Dupattas & Shawls"]
            },
            {
                name: "Women's Western Wear",
                image: categoryImages.women,
                subCategories: ["Dresses", "Tops", "Tshirts", "Jeans", "Trousers & Capris", "Shorts & Skirts", "Co-ords", "Playsuits", "Jumpsuits", "Shrugs", "Sweaters & Sweatshirts", "Jackets & Coats"]
            }
        ]
    },
    {
        name: "Kids",
        image: categoryImages.kids,
        categories: [
            {
                name: "Boys Clothing",
                image: categoryImages.kids,
                subCategories: ["T-Shirts", "Shirts", "Shorts", "Jeans", "Trousers", "Clothing Sets", "Ethnic Wear", "Track Pants & Pyjamas", "Jacket, Sweater & Sweatshirts", "Party Wear", "Innerwear & Thermals", "Nightwear & Loungewear"]
            },
            {
                name: "Girls Clothing",
                image: categoryImages.kids,
                subCategories: ["Dresses", "Tops", "Tshirts", "Clothing Sets", "Lehenga Choli", "Kurta Sets", "Party Wear", "Dungarees & Jumpsuits", "Skirts & shorts", "Tights & Leggings", "Jeans, Trousers & Capris", "Jacket, Sweater & Sweatshirts", "Innerwear & Thermals", "Nightwear & Loungewear"]
            }
        ]
    },
    {
        name: "GenZ",
        image: categoryImages.genz,
        categories: [
            {
                name: "Campus Collection",
                image: categoryImages.genz,
                subCategories: ["Graphic Tees", "Oversized T-Shirts", "Baggy Jeans", "Hoodies", "Cargo Pants", "Varsity Jackets"]
            },
            {
                name: "Streetwear",
                image: categoryImages.genz,
                subCategories: ["Joggers"]
            },
            {
                name: "Party & Clubbing",
                image: categoryImages.women,
                subCategories: ["Bodycon Dresses", "Crop Tops", "Mini Skirts", "Shimmer Tops"]
            }
        ]
    }
];

const seedData = async () => {
    try {
        if (!process.env.MONGODB_PATH) {
            console.error("MONGODB_PATH is missing in .env");
            process.exit(1);
        }

        const uri = process.env.MONGODB_PATH.replace('clothing', 'Clothing').replace('clothing', 'Clothing');
        await mongoose.connect(uri);
        console.log('MongoDB Connected');

        // Clear All Data
        await MainCategory.deleteMany({});
        await Category.deleteMany({});
        await SubCategory.deleteMany({});
        await Product.deleteMany({});

        console.log('Cleared existing data...');

        const allProducts = [];

        for (const mainCatData of data) {
            // Create Main Category
            const slug = mainCatData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const mainCat = await MainCategory.create({
                name: mainCatData.name,
                slug: slug,
                image: mainCatData.image,
                isActive: true
            });
            console.log(`Created Main: ${mainCat.name}`);

            for (const catData of mainCatData.categories) {
                // Create Category
                const catSlug = catData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                const fullCatSlug = `${slug}-${catSlug}`;

                const category = await Category.create({
                    mainCategory: mainCat._id,
                    name: catData.name,
                    slug: fullCatSlug,
                    image: catData.image,
                    description: catData.name,
                    isActive: true
                });
                console.log(`  -> Created Cat: ${category.name}`);

                for (const subName of catData.subCategories) {
                    // Create SubCategory
                    const subSlug = subName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    const fullSubSlug = `${fullCatSlug}-${subSlug}`;

                    // Placeholder image logic for subcategory if needed, or inherit
                    const subCategory = await SubCategory.create({
                        category: category._id,
                        name: subName,
                        slug: fullSubSlug,
                        image: category.image,
                        description: subName,
                        isActive: true
                    });

                    // --- Create Realistic Products ---
                    // Create 1 product per subcategory
                    for (let i = 0; i < 1; i++) {
                        const productData = generateRealProduct(
                            mainCatData.name,
                            subName,
                            category._id,
                            subCategory._id,
                            i
                        );
                        allProducts.push(productData);
                    }
                }
            }
        }

        // Batch insert all products
        const insertedProducts = await Product.insertMany(allProducts);
        console.log(`Seeding Complete! Added ${allProducts.length} realistic products.`);

        // --- Add Review Logic ---
        console.log("Preparing Reviewers...");

        // Ensure we have 2 users for reviews to avoid unique constraint (user+product)
        const user1Email = `reviewer1_${Date.now()}@example.com`;
        const user2Email = `reviewer2_${Date.now()}@example.com`;

        let user1 = await User.findOne();
        let user2 = null;

        if (!user1) {
            user1 = await User.create({
                firstName: 'Reviewer',
                lastName: 'One',
                email: user1Email,
                password: 'password123',
                role: 'customer',
                mobileNumber: '9999999001'
            });
            console.log("Created Reviewer 1");
        }

        // Find a second user that is different
        user2 = await User.findOne({ _id: { $ne: user1._id } });
        if (!user2) {
            user2 = await User.create({
                firstName: 'Reviewer',
                lastName: 'Two',
                email: user2Email,
                password: 'password123',
                role: 'customer',
                mobileNumber: '9999999002'
            });
            console.log("Created Reviewer 2");
        }

        if (user1 && user2) {
            console.log("Adding Reviews...");
            const dummyReviews = [
                { rating: 5, title: 'Excellent!', review: 'Really loved this product. Great quality.', status: 'Published' },
                { rating: 4, title: 'Good Purchase', review: 'Worth the money, fit is good.', status: 'Published' },
                { rating: 5, title: 'Amazing', review: 'Best purchase I made this month.', status: 'Published' },
                { rating: 3, title: 'Decent', review: 'Quality is okay.', status: 'Published' },
            ];

            const reviewsToInsert = [];
            for (const prod of insertedProducts) {
                // Add 2 reviews per product, using different users
                for (let i = 0; i < 2; i++) {
                    reviewsToInsert.push({
                        user: (i % 2 === 0) ? user1._id : user2._id,
                        product: prod._id,
                        rating: dummyReviews[i % dummyReviews.length].rating,
                        title: dummyReviews[i % dummyReviews.length].title,
                        review: dummyReviews[i % dummyReviews.length].review,
                        status: 'Published',
                        isVerifiedPurchase: true
                    });
                }
            }
            if (reviewsToInsert.length > 0) {
                try {
                    await Review.insertMany(reviewsToInsert, { ordered: false });
                    console.log(`Added ${reviewsToInsert.length} reviews successfully.`);
                } catch (err) {
                    console.warn(`Review insertion completed with some errors (likely duplicates): ${err.insertedDocs ? err.insertedDocs.length : 0} inserted.`);
                }
            }
        }

        process.exit();

    } catch (error) {
        console.error("Error seeding data:", error);
        process.exit(1);
    }
};

seedData();
