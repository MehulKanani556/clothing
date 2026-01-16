import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist, removeFromWishlist } from '../redux/slice/wishlist.slice';
import { addToCart, fetchCart } from '../redux/slice/cart.slice';
import { Link } from 'react-router-dom';
import { FiTrash2, FiShoppingCart } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function WishlistPage() {
    const dispatch = useDispatch();
    const { items, loading } = useSelector((state) => state.wishlist);
    const { isAuthenticated } = useSelector((state) => state.auth);
    const { items: cartItems } = useSelector((state) => state.cart);

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchWishlist());
            dispatch(fetchCart());
        }
    }, [dispatch, isAuthenticated]);

    const handleRemove = (productId) => {
        dispatch(removeFromWishlist(productId))
            .unwrap()
            .then(() => toast.success("Removed from wishlist"))
            .catch(() => toast.error("Failed to remove"));
    };

    const handleMoveToCart = (product) => {
        // Default logic for quick add
        let selectedSize = '';
        let selectedColor = '';

        if (product?.variants?.length > 0) {
            const defaultVariant = product.variants[0];
            selectedColor = defaultVariant.color;
            if (defaultVariant.options?.length > 0) {
                selectedSize = defaultVariant.options[0].size;
            }
        }

        // Check if this specific variant is already in cart
        const existingItem = cartItems && cartItems.find(item =>
            (item.product._id === product._id || item.product === product._id) &&
            item.size === selectedSize &&
            item.color === selectedColor
        );

        if (existingItem) {
            toast.error("This item is already in your cart!");
            return;
        }

        dispatch(addToCart({
            productId: product._id,
            quantity: 1,
            size: selectedSize,
            color: selectedColor
        })).unwrap()
            .then(() => {
                toast.success("Added to Bag");
                // Optional: Remove from wishlist after moving to cart
                // dispatch(removeFromWishlist(product._id)); 
            })
            .catch((err) => {
                if (err.message && err.message.includes('already')) {
                    toast.error("This item is already in your cart!");
                } else {
                    toast.error(err.message || "Failed to add to cart");
                }
            });
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold mb-4">Please Login to View Wishlist</h2>
                <Link to="/" className="text-blue-600 underline">Go Home</Link>
            </div>
        );
    }

    if (loading && items.length === 0) {
        return <div className="min-h-screen flex items-center justify-center">Loading Wishlist...</div>;
    }

    if (items.length === 0) {
        return (
            <div className="bg-white min-h-screen font-sans pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-2xl font-bold mb-8 uppercase tracking-wider">My Wishlist</h1>
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="mb-6 relative">
                            <div className="relative">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-24 h-24 text-gray-300">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Your wishlist is empty</h2>
                        <p className="text-gray-500 mb-8">Save items that you like in your wishlist. Review them anytime and easily move them to the bag.</p>
                        <Link to="/" className="px-8 py-3 bg-black text-white font-bold uppercase tracking-wide rounded-[4px] hover:bg-gray-800 transition-colors">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white min-h-screen font-sans pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-bold mb-8 uppercase tracking-wider">My Wishlist ({items.length})</h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {items.map((product) => {
                        let displayImage = product.variants?.[0]?.images?.[0] || '';
                        // Basic Price Logic
                        let price = product.price || 0;
                        let mrp = null;
                        if (product.variants?.[0]?.options?.[0]) {
                            price = product.variants[0].options[0].price;
                            mrp = product.variants[0].options[0].mrp;
                        }

                        // Check if this item is already in cart
                        let selectedSize = '';
                        let selectedColor = '';
                        if (product?.variants?.length > 0) {
                            const defaultVariant = product.variants[0];
                            selectedColor = defaultVariant.color;
                            if (defaultVariant.options?.length > 0) {
                                selectedSize = defaultVariant.options[0].size;
                            }
                        }
                        const isInCart = cartItems && cartItems.some(item =>
                            (item.product._id === product._id || item.product === product._id) &&
                            item.size === selectedSize &&
                            item.color === selectedColor
                        );

                        return (
                            <div key={product._id} className="group relative border border-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white">
                                {/* Remove Button */}
                                <button
                                    onClick={() => handleRemove(product._id)}
                                    className="absolute top-2 right-2 z-10 p-2 bg-white/80 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <FiTrash2 size={16} />
                                </button>

                                {/* Image */}
                                <div className="aspect-[3/4] overflow-hidden bg-gray-100 relative">
                                    <Link to={`/product/${product._id}`}>
                                        <img
                                            src={displayImage}
                                            alt={product.name}
                                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </Link>

                                    {/* Move to Cart Overlay */}
                                    <button
                                        onClick={() => handleMoveToCart(product)}
                                        disabled={isInCart}
                                        className={`absolute bottom-0 left-0 right-0 py-3 font-semibold uppercase text-sm translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-2 ${isInCart
                                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                                : 'bg-white/95 text-black hover:bg-black hover:text-white'
                                            }`}
                                    >
                                        <FiShoppingCart size={16} />
                                        {isInCart ? 'Already in Cart' : 'Add to Bag'}
                                    </button>
                                </div>

                                {/* Details */}
                                <div className="p-4">
                                    <h3 className="text-sm font-bold text-gray-900 mb-1">{product.brand}</h3>
                                    <p className="text-sm text-gray-600 truncate mb-2">{product.name}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-gray-900">₹{price.toLocaleString()}</span>
                                        {mrp && <span className="text-xs text-gray-400 line-through">₹{mrp.toLocaleString()}</span>}
                                        {mrp && <span className="text-xs text-green-600 font-bold">
                                            {Math.round(((mrp - price) / mrp) * 100)}% OFF
                                        </span>}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
