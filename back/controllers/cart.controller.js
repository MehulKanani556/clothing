const Cart = require('../models/cart.model');
const Product = require('../models/product.model');

// Add item to cart
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity, size, color } = req.body;
        const userId = req.user._id;

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Find user's cart
        let cart = await Cart.findOne({ user: userId });

        // Calculate price for the item (assuming product has a straight price or we take it from variant)
        // For simplicity, using the base product price or passed price if needed. 
        // Ideally, price should be fetched from DB based on variant.
        // Let's assume the frontend sends the relevant variant price or we calculate it.
        // For security, it's better to fetch from DB.

        // Use a simple logic: find the variant matching color/size if possible, else use default price.
        let price = product.price;
        if (product.variants && product.variants.length > 0) {
            const variant = product.variants.find(v => v.color === color);
            if (variant && variant.options) {
                const option = variant.options.find(o => o.size === size);
                if (option) {
                    price = option.price;
                }
            }
        }

        if (!cart) {
            // Create new cart
            cart = new Cart({
                user: userId,
                items: [{ product: productId, quantity, size, color, price }],
                totalPrice: price * quantity
            });
        } else {
            // Check if item already exists in cart with same size and color
            const itemIndex = cart.items.findIndex(p =>
                p.product.toString() === productId && p.size === size && p.color === color
            );

            if (itemIndex > -1) {
                // Update quantity
                let productItem = cart.items[itemIndex];
                productItem.quantity += quantity;
                cart.items[itemIndex] = productItem;
            } else {
                // Add new item
                cart.items.push({ product: productId, quantity, size, color, price });
            }

            // Recalculate total price
            cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        }

        await cart.save();

        // Populate product details for the response
        const populatedCart = await Cart.findById(cart._id).populate('items.product', 'name images brand variants category');

        res.status(200).json(populatedCart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get user cart
exports.getCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const cart = await Cart.findOne({ user: userId }).populate('items.product', 'name images brand variants price category');

        if (!cart) {
            return res.status(200).json({ items: [], totalPrice: 0 });
        }

        res.status(200).json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const itemId = req.params.itemId;

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = cart.items.filter(item => item._id.toString() !== itemId);

        // Recalculate total price
        cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

        await cart.save();

        const populatedCart = await Cart.findById(cart._id).populate('items.product', 'name images brand variants category');

        res.status(200).json(populatedCart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update item quantity
exports.updateCartItem = async (req, res) => {
    try {
        const userId = req.user._id;
        const itemId = req.params.itemId;
        const { quantity } = req.body;

        let cart = await Cart.findOne({ user: userId });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);

        if (itemIndex > -1) {
            if (quantity <= 0) {
                cart.items.splice(itemIndex, 1);
            } else {
                cart.items[itemIndex].quantity = quantity;
            }
            // Recalculate total
            cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
            await cart.save();

            const populatedCart = await Cart.findById(cart._id).populate('items.product', 'name images brand variants category');
            res.status(200).json(populatedCart);
        } else {
            res.status(404).json({ message: 'Item not found in cart' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
