const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/product.model');

dotenv.config();

const products = [
    // --- Streetwear ---
    {
        name: "Urban Oversized Hoodie",
        brand: "StreetKing",
        category: "Streetwear",
        price: 4500,
        originalPrice: 6000,
        discount: "25% OFF",
        rating: 4.8,
        reviewsCount: 120,
        description: "Heavyweight cotton fleece hoodie with a relaxed, oversized fit. Perfect for layering and streetwear looks.",
        images: ["https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80"],
        colors: [{ name: "Black", hex: "#000000" }, { name: "Grey", hex: "#808080" }],
        sizes: ["M", "L", "XL", "XXL"],
        isNewArrival: true,
        isBestSeller: true
    },
    {
        name: "Distressed Denim Jacket",
        brand: "UrbanSoul",
        category: "Streetwear",
        price: 6500,
        originalPrice: 8000,
        discount: "18% OFF",
        rating: 4.6,
        reviewsCount: 85,
        description: "Vintage wash denim jacket with distressed details and a modern silhouette.",
        images: ["https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=800&q=80"],
        colors: [{ name: "Light Blue", hex: "#ADD8E6" }],
        sizes: ["S", "M", "L", "XL"],
        isNewArrival: false,
        isBestSeller: true
    },
    {
        name: "Graffiti Print Joggers",
        brand: "RebelThreads",
        category: "Streetwear",
        price: 3800,
        rating: 4.2,
        reviewsCount: 40,
        description: "Comfortable joggers featuring bold graffiti graphics for a standout look.",
        images: ["https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&q=80"],
        colors: [{ name: "Black", hex: "#000000" }],
        sizes: ["S", "M", "L", "XL"],
        isNewArrival: true
    },

    // --- Cargo & Utility ---
    {
        name: "Tactical Cargo Pants",
        brand: "UtilityGear",
        category: "Cargo & Utility",
        price: 4200,
        originalPrice: 5500,
        discount: "23% OFF",
        rating: 4.7,
        reviewsCount: 156,
        description: "Durable cargo pants with multiple pockets and reinforced stitching. Ideal for functional style.",
        images: ["https://images.unsplash.com/photo-1661110546807-4c1ce22ceced?w=800&q=80"],
        colors: [{ name: "Olive", hex: "#808000" }, { name: "Black", hex: "#000000" }, { name: "Khaki", hex: "#F0E68C" }],
        sizes: ["30", "32", "34", "36", "38"],
        isNewArrival: false,
        isBestSeller: true
    },
    {
        name: "Multi-Pocket Vest",
        brand: "UtilityGear",
        category: "Cargo & Utility",
        price: 3500,
        rating: 4.3,
        reviewsCount: 30,
        description: "Functional vest with ample storage for all your essentials. breathable mesh lining.",
        images: ["https://images.unsplash.com/photo-1504198458649-3128b932f49e?w=800&q=80"],
        colors: [{ name: "Black", hex: "#000000" }],
        sizes: ["M", "L", "XL"],
    },
    {
        name: "Techwear Cargo Shorts",
        brand: "FutureFit",
        category: "Cargo & Utility",
        price: 2800,
        originalPrice: 3500,
        discount: "20% OFF",
        rating: 4.5,
        reviewsCount: 65,
        description: "Modern cargo shorts made from water-repellent fabric. Futuristic design.",
        images: ["https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80"],
        colors: [{ name: "Dark Grey", hex: "#A9A9A9" }],
        sizes: ["S", "M", "L"],
        isNewArrival: true
    },

    // --- Graphic Tees ---
    {
        name: "Retro band Tee",
        brand: "VintageVibes",
        category: "Graphic Tees",
        price: 1500,
        rating: 4.9,
        reviewsCount: 200,
        description: "Soft cotton tee with a vintage-inspired band graphic. Pre-shrunk for perfect fit.",
        images: ["https://images.unsplash.com/photo-1503341338985-c0477be52513?w=800&q=80"],
        colors: [{ name: "White", hex: "#FFFFFF" }, { name: "Charcoal", hex: "#36454F" }],
        sizes: ["XS", "S", "M", "L", "XL"],
        isNewArrival: true,
        isBestSeller: true
    },
    {
        name: "Abstract Art T-Shirt",
        brand: "ArtWear",
        category: "Graphic Tees",
        price: 1800,
        originalPrice: 2200,
        discount: "18% OFF",
        rating: 4.4,
        reviewsCount: 50,
        description: "Featuring unique abstract art prints. A conversation starter piece.",
        images: ["https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80"],
        colors: [{ name: "Black", hex: "#000000" }],
        sizes: ["S", "M", "L", "XL"],
        isNewArrival: true
    },
    {
        name: "Minimalist Logo Tee",
        brand: "Basics+",
        category: "Graphic Tees",
        price: 1200,
        rating: 4.6,
        reviewsCount: 90,
        description: "Clean and simple design with a small logo on the chest. Everyday essential.",
        images: ["https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80"],
        colors: [{ name: "White", hex: "#FFFFFF" }, { name: "Navy", hex: "#000080" }],
        sizes: ["S", "M", "L", "XL"],
    },

    // --- Outerwear ---
    {
        name: "Classic Trench Coat",
        brand: "LondonFog",
        category: "Outerwear",
        price: 12000,
        originalPrice: 15000,
        discount: "20% OFF",
        rating: 4.9,
        reviewsCount: 75,
        description: "Timeless trench coat in water-resistant gabardine. Belted waist and double-breasted front.",
        images: ["https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800&q=80"],
        colors: [{ name: "Beige", hex: "#F5F5DC" }],
        sizes: ["S", "M", "L"],
        isNewArrival: false,
        isBestSeller: true
    },
    {
        name: "Puffer Down The Jacket",
        brand: "North Face",
        category: "Outerwear",
        price: 15000,
        rating: 4.8,
        reviewsCount: 110,
        description: "Warm down jacket for extreme cold. Lightweight yet incredibly insulating.",
        images: ["https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80"],
        colors: [{ name: "Orange", hex: "#FFA500" }, { name: "Black", hex: "#000000" }],
        sizes: ["M", "L", "XL"],
        isNewArrival: true
    },
    {
        name: "Wool Blend Peacoat",
        brand: "Gentleman's Choice",
        category: "Outerwear",
        price: 9500,
        originalPrice: 11000,
        discount: "13% OFF",
        rating: 4.7,
        reviewsCount: 40,
        description: "Sophisticated wool blend peacoat. Sharp tailoring for a refined seasonal look.",
        images: ["https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&q=80"],
        colors: [{ name: "Navy", hex: "#000080" }, { name: "Grey", hex: "#808080" }],
        sizes: ["M", "L", "XL"],
    },

    // --- Accessories ---
    {
        name: "Leather Messenger Bag",
        brand: "Fossil",
        category: "Accessories",
        price: 8500,
        rating: 4.8,
        reviewsCount: 120,
        description: "Premium leather messenger bag with multiple compartments. Perfect for carrying laptops and documents.",
        images: ["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80"],
        colors: [{ name: "Brown", hex: "#8B4513" }],
        sizes: ["One Size"],
        isNewArrival: false,
        isBestSeller: true
    },
    {
        name: "Summer Straw Hat",
        brand: "H&M",
        category: "Accessories",
        price: 1200,
        rating: 4.3,
        reviewsCount: 60,
        description: "Stylish straw hat to protect you from the sun. Adds a chic touch to any summer outfit.",
        images: ["https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800&q=80"],
        colors: [{ name: "Beige", hex: "#F5F5DC" }],
        sizes: ["One Size"]
    },
    {
        name: "Minimalist Watch",
        brand: "Timeless",
        category: "Accessories",
        price: 4500,
        originalPrice: 6000,
        discount: "25% OFF",
        rating: 4.5,
        reviewsCount: 88,
        description: "Sleek wristwatch with a genuine leather strap and minimalist dial.",
        images: ["https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80"],
        colors: [{ name: "Black", hex: "#000000" }, { name: "Rose Gold", hex: "#B76E79" }],
        sizes: ["One Size"],
        isNewArrival: true
    },

    // --- Footwear ---
    {
        name: "Classic White Sneakers",
        brand: "Nike",
        category: "Footwear",
        price: 5500,
        originalPrice: 7000,
        discount: "21% OFF",
        rating: 4.7,
        reviewsCount: 500,
        description: "Iconic white sneakers that go with everything. Comfortable cushioning for all-day wear.",
        images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80"],
        colors: [{ name: "White", hex: "#FFFFFF" }],
        sizes: ["7", "8", "9", "10", "11"],
        isBestSeller: true
    },
    {
        name: "High-Top Canvas Shoes",
        brand: "Converse",
        category: "Footwear",
        price: 3200,
        rating: 4.6,
        reviewsCount: 350,
        description: "Timeless high-top canvas shoes. Durable canvas upper and rubber sole.",
        images: ["https://images.unsplash.com/photo-1607522370275-f14bc3a5d288?w=800&q=80"],
        colors: [{ name: "Red", hex: "#FF0000" }, { name: "Black", hex: "#000000" }],
        sizes: ["7", "8", "9", "10", "11"],
        isNewArrival: false
    },
    {
        name: "Running Sport Shoes",
        brand: "Puma",
        category: "Footwear",
        price: 3200,
        originalPrice: 4500,
        discount: "28% OFF",
        rating: 4.2,
        reviewsCount: 110,
        description: "Lightweight running shoes with breathable mesh and superior grip.",
        images: ["https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80"],
        colors: [{ name: "Green", hex: "#008000" }],
        sizes: ["8", "9", "10"],
        isNewArrival: true
    }
];

const seedData = async () => {
    try {
        if (process.env.MONGODB_PATH) {
            // Fix case sensitivity issue (Clothing vs clothing) for Windows
            const uri = process.env.MONGODB_PATH.replace('clothing', 'Clothing');
            await mongoose.connect(uri);
            console.log('MongoDB Connected');
        } else {
            console.error("MONGODB_PATH not found in .env");
        }

        await Product.deleteMany({}); // Clear existing products
        console.log('Old products removed');

        await Product.insertMany(products);
        console.log('Data Imported!');

        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

seedData();
