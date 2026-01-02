const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/category.model');
const SubCategory = require('./models/subCategory.model');
const Product = require('./models/product.model');

// Load env vars
dotenv.config();

const seedData = async () => {
    try {
        if (!process.env.MONGODB_PATH) {
            console.error("MONGODB_PATH is missing in .env");
            process.exit(1);
        }

        // Connect DB
        const uri = process.env.MONGODB_PATH.replace('clothing', 'Clothing');
        await mongoose.connect(uri);
        console.log('MongoDB Connected');

        // Clear existing data
        await Category.deleteMany({});
        await SubCategory.deleteMany({});
        await Product.deleteMany({});
        console.log('Data Cleared');

        // --- Categories ---
        const catWomenIndian = await Category.create({ name: "Women's Indian Wear", slug: "women-indian-wear", description: "Traditional Indian wear for women" });
        const catWomenWestern = await Category.create({ name: "Women's Western Wear", slug: "women-western-wear", description: "Western styles for women" });
        const catMenTop = await Category.create({ name: "Men's Topwear", slug: "men-topwear", description: "Upper wear for men" });
        const catMenBottom = await Category.create({ name: "Men's Bottomwear", slug: "men-bottomwear", description: "Bottom wear for men" });
        const catMenFestive = await Category.create({ name: "Men's Indian & Festive Wear", slug: "men-indian-festive", description: "Festive and ethnic wear for men" });

        console.log('Categories Created');

        // --- SubCategories ---
        // Women's Indian
        const subSarees = await SubCategory.create({ name: "Sarees", slug: "sarees", category: catWomenIndian._id });
        const subKurtis = await SubCategory.create({ name: "Kurtis & Suits", slug: "kurtis-suits", category: catWomenIndian._id });
        const subLehengas = await SubCategory.create({ name: "Lehenga Cholis", slug: "lehenga-cholis", category: catWomenIndian._id });

        // Women's Western
        const subDresses = await SubCategory.create({ name: "Dresses", slug: "dresses", category: catWomenWestern._id });
        const subTopsWomen = await SubCategory.create({ name: "Tops", slug: "tops-women", category: catWomenWestern._id });
        const subJeansWomen = await SubCategory.create({ name: "Jeans", slug: "jeans-women", category: catWomenWestern._id });

        // Men's Topwear
        const subTShirts = await SubCategory.create({ name: "T-Shirts", slug: "t-shirts-men", category: catMenTop._id });
        const subCasualShirts = await SubCategory.create({ name: "Casual Shirts", slug: "casual-shirts-men", category: catMenTop._id });
        const subFormalShirts = await SubCategory.create({ name: "Formal Shirts", slug: "formal-shirts-men", category: catMenTop._id });
        const subHoodies = await SubCategory.create({ name: "Hoodies", slug: "hoodies-men", category: catMenTop._id });

        // Men's Bottomwear
        const subJeansMen = await SubCategory.create({ name: "Jeans", slug: "jeans-men", category: catMenBottom._id });
        const subTrousers = await SubCategory.create({ name: "Casual Trousers", slug: "casual-trousers-men", category: catMenBottom._id });
        const subTrackPants = await SubCategory.create({ name: "Track Pants", slug: "track-pants-men", category: catMenBottom._id });

        // Men's Festive
        const subKurtaSets = await SubCategory.create({ name: "Kurta Sets", slug: "kurta-sets", category: catMenFestive._id });
        const subSherwanis = await SubCategory.create({ name: "Sherwanis", slug: "sherwanis", category: catMenFestive._id });

        console.log('SubCategories Created');

        // --- Products ---

        // 1. Black Oversized T-shirt (Men's Top)
        await Product.create({
            name: "Black Oversized T-shirt for Men",
            slug: "black-oversized-tshirt-men",
            brand: "Believe",
            shortDescription: "Graphic Print Cotton Round Neck Men's T-Shirt",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
            category: catMenTop._id,
            subCategory: subTShirts._id,
            gender: "Men",
            variants: [{
                color: "Black",
                colorFamily: "Black",
                colorCode: "#000000",
                images: ["https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80"],
                isDefault: true,
                options: [
                    { sku: "BLK-S", size: "S", price: 499, mrp: 899, stock: 50 },
                    { sku: "BLK-M", size: "M", price: 499, mrp: 899, stock: 50 },
                    { sku: "BLK-L", size: "L", price: 499, mrp: 899, stock: 50 },
                    { sku: "BLK-XL", size: "XL", price: 499, mrp: 899, stock: 50 }
                ]
            }],
            specifications: [
                {
                    group: "Product Details",
                    items: [{ key: "Fabric", value: "Cotton" }, { key: "Fit", value: "Oversized" }]
                }
            ],
            isActive: true
        });

        // 2. Elegant Silk Saree (Women's Indian)
        await Product.create({
            name: "Banarasi Silk Saree",
            slug: "banarasi-silk-saree-red",
            brand: "EthnoVibe",
            shortDescription: "Traditional Red Banarasi Silk Saree with Gold Zari Work",
            description: "Handwoven Banarasi silk saree perfect for weddings and festivals.",
            category: catWomenIndian._id,
            subCategory: subSarees._id,
            gender: "Women",
            variants: [{
                color: "Red",
                colorFamily: "Red",
                colorCode: "#FF0000",
                images: ["https://images.unsplash.com/photo-1610030488176-743539d48d0d?w=800&q=80"],
                isDefault: true,
                options: [
                    { sku: "SAR-RED-FREE", size: "Free Size", price: 3999, mrp: 7999, stock: 20 }
                ]
            }],
            specifications: [
                { group: "Product Details", items: [{ key: "Fabric", value: "Silk" }, { key: "Pattern", value: "Woven" }] }
            ],
            isActive: true
        });

        // 3. Floral Summer Dress (Women's Western)
        await Product.create({
            name: "Floral Maxi Dress",
            slug: "floral-maxi-dress-green",
            brand: "Zara",
            shortDescription: "Breezy floral print maxi dress for summer",
            description: "Lightweight and flowy, this dress is best for beach days and brunch.",
            category: catWomenWestern._id,
            subCategory: subDresses._id,
            gender: "Women",
            variants: [{
                color: "Green",
                colorFamily: "Green",
                colorCode: "#008000",
                images: ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80"],
                isDefault: true,
                options: [
                    { sku: "DRS-GRN-S", size: "S", price: 1499, mrp: 2999, stock: 30 },
                    { sku: "DRS-GRN-M", size: "M", price: 1499, mrp: 2999, stock: 30 },
                    { sku: "DRS-GRN-L", size: "L", price: 1499, mrp: 2999, stock: 30 }
                ]
            }],
            isActive: true
        });

        // 4. Men's Casual Checkered Shirt
        await Product.create({
            name: "Classic Checkered Shirt",
            slug: "checkered-shirt-navy",
            brand: "Roadster",
            shortDescription: "Navy Blue & White Checkered Casual Shirt",
            description: "100% Cotton regular fit shirt.",
            category: catMenTop._id,
            subCategory: subCasualShirts._id,
            gender: "Men",
            variants: [{
                color: "Navy Blue",
                colorFamily: "Blue",
                colorCode: "#000080",
                images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80"],
                isDefault: true,
                options: [
                    { sku: "SHIRT-NVY-M", size: "M", price: 899, mrp: 1499, stock: 100 },
                    { sku: "SHIRT-NVY-L", size: "L", price: 899, mrp: 1499, stock: 100 }
                ]
            }],
            isActive: true
        });

        // 5. Men's Fleece Hoodie
        await Product.create({
            name: "Urban Grey Hoodie",
            slug: "grey-hoodie-men",
            brand: "H&M",
            shortDescription: "Essential Grey Melange Hoodie",
            description: "Soft fleece lining for warmth and comfort.",
            category: catMenTop._id,
            subCategory: subHoodies._id,
            gender: "Men",
            variants: [{
                color: "Grey",
                colorFamily: "Grey",
                colorCode: "#808080",
                images: ["https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80"],
                isDefault: true,
                options: [
                    { sku: "HOOD-GRY-M", size: "M", price: 1299, mrp: 2499, stock: 40 },
                    { sku: "HOOD-GRY-L", size: "L", price: 1299, mrp: 2499, stock: 40 }
                ]
            }],
            isActive: true
        });

        // 6. Men's Kurta Set
        await Product.create({
            name: "Festive Teal Kurta Set",
            slug: "teal-kurta-set",
            brand: "Manyavar",
            shortDescription: "Teal Green Silk Blend Kurta with Pyjama",
            description: "Elegant kurta set for festive occasions.",
            category: catMenFestive._id,
            subCategory: subKurtaSets._id,
            gender: "Men",
            variants: [{
                color: "Teal",
                colorFamily: "Green",
                colorCode: "#008080",
                images: ["https://images.unsplash.com/photo-1619551734325-81aaf323686c?w=800&q=80"],
                isDefault: true,
                options: [
                    { sku: "KUR-TL-M", size: "M", price: 2999, mrp: 4999, stock: 15 },
                    { sku: "KUR-TL-L", size: "L", price: 2999, mrp: 4999, stock: 15 }
                ]
            }],
            isActive: true
        });

        // 7. Women's Skinny Jeans
        await Product.create({
            name: "High-Rise Skinny Jeans",
            slug: "skinny-jeans-women-blue",
            brand: "Levis",
            shortDescription: "Classic Blue High-Rise Skinny Jeans",
            description: "Stretchable denim for perfect fit.",
            category: catWomenWestern._id,
            subCategory: subJeansWomen._id,
            gender: "Women",
            variants: [{
                color: "Blue",
                colorFamily: "Blue",
                colorCode: "#0000FF",
                images: ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80"],
                isDefault: true,
                options: [
                    { sku: "JNS-WM-28", size: "28", price: 1999, mrp: 3499, stock: 50 },
                    { sku: "JNS-WM-30", size: "30", price: 1999, mrp: 3499, stock: 50 }
                ]
            }],
            isActive: true
        });

        // 8. Men's Slim Fit Jeans
        await Product.create({
            name: "Ripped Slim Fit Jeans",
            slug: "ripped-jeans-men-black",
            brand: "Jack & Jones",
            shortDescription: "Black Ripped Slim Fit Jeans",
            description: "Edgy style with distressed details.",
            category: catMenBottom._id,
            subCategory: subJeansMen._id,
            gender: "Men",
            variants: [{
                color: "Black",
                colorFamily: "Black",
                colorCode: "#000000",
                images: ["https://images.unsplash.com/photo-1542272617-08f08637533d?w=800&q=80"],
                isDefault: true,
                options: [
                    { sku: "JNS-MN-30", size: "30", price: 2199, mrp: 3999, stock: 30 },
                    { sku: "JNS-MN-32", size: "32", price: 2199, mrp: 3999, stock: 30 }
                ]
            }],
            isActive: true
        });

        console.log('Products Created');
        console.log('Seeding Complete');
        process.exit();

    } catch (error) {
        console.error("Error seeding data:", error);
        process.exit(1);
    }
};

seedData();
