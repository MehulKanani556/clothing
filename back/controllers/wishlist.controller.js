const Wishlist = require('../models/wishlist.model');
const Product = require('../models/product.model');

// Add to Wishlist
exports.addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.user._id;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        let wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {
            wishlist = new Wishlist({
                user: userId,
                products: [productId]
            });
        } else {
            if (!wishlist.products.includes(productId)) {
                wishlist.products.push(productId);
            } else {
                return res.status(400).json({ message: 'Product already in wishlist' });
            }
        }

        await wishlist.save();
        const populatedWishlist = await Wishlist.findById(wishlist._id).populate('products', 'name images brand price variants');
        res.status(200).json(populatedWishlist);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get Wishlist
exports.getWishlist = async (req, res) => {
    try {
        const userId = req.user._id;
        let wishlist = await Wishlist.findOne({ user: userId }).populate('products', 'name images brand price variants');

        if (!wishlist) {
            return res.status(200).json({ products: [] });
        }

        res.status(200).json(wishlist);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Remove from Wishlist
exports.removeFromWishlist = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.params;

        let wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found' });
        }

        wishlist.products = wishlist.products.filter(p => p.toString() !== productId);
        await wishlist.save();

        const populatedWishlist = await Wishlist.findById(wishlist._id).populate('products', 'name images brand price variants');
        res.status(200).json(populatedWishlist);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
