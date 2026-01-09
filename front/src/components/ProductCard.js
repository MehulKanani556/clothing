import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/slice/cart.slice';
import { addToWishlist } from '../redux/slice/wishlist.slice';
import { FiShoppingCart, FiHeart, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { FaStar } from 'react-icons/fa';

export default function ProductCard({ product }) {
    const navigate = useNavigate();
    const {
        _id,
        name = "Classic T-Shirt",
        price = product?.variants?.[0]?.options?.[0]?.price,
        oldPrice = product?.variants?.[0]?.options?.[0]?.mrp,
        image = product?.variants?.[0]?.images?.[0],
        category = "Brand Name",
        rating,
        tag = null
    } = product || {};

    const ratingValue = typeof rating === 'object' && rating !== null ? rating.average : (rating || 4.5);


    const handleQuickView = (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/product/${_id}`, { state: { product } });
    };

    const dispatch = useDispatch();
    const { isAuthenticated } = useSelector((state) => state.auth);
    const { items: cartItems } = useSelector((state) => state.cart);
    const { items: wishlistItems } = useSelector((state) => state.wishlist);

    const isInCart = cartItems?.some(item => (item.product?._id === _id) || (item.product === _id));
    const isInWishlist = wishlistItems?.some(item => (item._id === _id) || (item === _id));

    const handleAddToWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            toast.error("Please login to add to wishlist");
            return;
        }

        dispatch(addToWishlist(_id))
            .unwrap()
            .then(() => {
                toast.success("Added to wishlist");
            })
            .catch((err) => {
                toast.error(err.message || "Failed to add to wishlist");
            });
    };

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            alert("Please login to add items to cart");
            return;
        }

        // Default to first variant if available
        let selectedSize = '';
        let selectedColor = '';

        if (product?.variants?.length > 0) {
            const defaultVariant = product.variants[0];
            selectedColor = defaultVariant.color;
            if (defaultVariant.options?.length > 0) {
                selectedSize = defaultVariant.options[0].size;
            }
        }

        dispatch(addToCart({
            productId: _id,
            quantity: 1,
            size: selectedSize,
            color: selectedColor
        })).unwrap()
            .then(() => {
                toast.success("Added to cart successfully!"); // Changed alert to toast.success
            })
            .catch((err) => {
                toast.error(err.message || "Failed to add to cart"); // Changed alert to toast.error
            });
    };

    return (
        <div className="group flex flex-col items-start w-full">
            {/* Image Container */}
            <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-100 mb-3 rounded-sm">
                <Link to={`/product/${_id || 1}`} state={{ product }}>
                    <img
                        src={image}
                        alt={name}
                        loading="lazy"
                        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                </Link>

                {/* Tag */}
                {tag && (
                    <div className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wide">
                        {tag}
                    </div>
                )}

                {/* Hover Actions */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <button
                        onClick={isInCart ? (e) => { e.preventDefault(); navigate('/cart'); } : handleAddToCart}
                        className={`p-2.5 rounded-full shadow-lg transition-colors ${isInCart ? 'bg-black text-white' : 'bg-white hover:bg-black hover:text-white'}`}
                        title={isInCart ? "Go to Cart" : "Add to Cart"}>
                        <FiShoppingCart size={18} fill={isInCart ? "currentColor" : "none"} />
                    </button>
                    <button
                        onClick={isInWishlist ? (e) => { e.preventDefault(); navigate('/wishlist'); } : handleAddToWishlist}
                        className={`p-2.5 rounded-full shadow-lg transition-colors ${isInWishlist ? 'bg-red-50 text-red-500' : 'bg-white hover:bg-black hover:text-white'}`}
                        title={isInWishlist ? "Go to Wishlist" : "Wishlist"}>
                        <FiHeart size={18} fill={isInWishlist ? "currentColor" : "none"} />
                    </button>
                    <button
                        onClick={handleQuickView}
                        className="p-2.5 bg-white rounded-full shadow-lg hover:bg-black hover:text-white transition-colors"
                        title="Quick View"
                    >
                        <FiEye size={18} />
                    </button>
                </div>
            </div>

            {/* Details */}
            <div className="w-full">
                <div className="flex items-center space-x-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={`w-3 h-3 ${i < Math.floor(ratingValue) ? 'text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">({ratingValue})</span>
                </div>
                <h3 className="text-sm font-medium text-gray-900 truncate mb-1">
                    <Link to={`/product/${_id}`} state={{ product }} className="hover:text-black transition-colors">
                        {name}
                    </Link>
                </h3>
                {/* <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">{category}</p> */}
                <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-green-600">₹{price}</span>
                    {oldPrice && <span className="text-sm text-gray-400 line-through">₹{oldPrice}</span>}
                </div>
            </div>
        </div>
    );
}
