import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, removeFromCart, updateCartItem } from '../redux/slice/cart.slice';
import { Link } from 'react-router-dom';
import { FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';
import { useState } from 'react';

export default function CartPage() {
    const dispatch = useDispatch();
    const { items, totalPrice, loading } = useSelector((state) => state.cart);
    const { isAuthenticated } = useSelector((state) => state.auth);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToRemove, setItemToRemove] = useState(null);

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchCart());
        }
    }, [dispatch, isAuthenticated]);

    const confirmRemove = (itemId) => {
        setItemToRemove(itemId);
        setIsModalOpen(true);
    };

    const handleRemove = () => {
        if (itemToRemove) {
            dispatch(removeFromCart(itemToRemove))
                .unwrap()
                .then(() => {
                    toast.success("Item removed from bag");
                })
                .catch(() => {
                    toast.error("Failed to remove item");
                });
        }
    };

    const handleQuantityChange = (itemId, currentQty, change) => {
        const newQty = currentQty + change;
        if (newQty < 1) return;
        dispatch(updateCartItem({ itemId, quantity: newQty }));
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold mb-4">Please Login to View Cart</h2>
                <Link to="/" className="text-blue-600 underline">Go Home</Link>
            </div>
        );
    }

    if (loading && items.length === 0) {
        return <div className="min-h-screen flex items-center justify-center">Loading Cart...</div>;
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <h2 className="text-2xl font-bold">Your Bag is Empty</h2>
                <Link to="/" className="px-6 py-2 bg-black text-white rounded-md">Start Shopping</Link>
            </div>
        )
    }

    // Calculate totals (approximate if not precise from backend)
    let totalMRP = 0;
    let totalDiscount = 0;

    items.forEach(item => {
        const product = item.product;
        // Find variant MRP if possible
        // item.price is the selling price stored in cart

        let mrp = item.price; // Fallback

        if (product && product.variants) {
            const variant = product.variants.find(v => v.color === item.color) || product.variants[0];
            if (variant && variant.options) {
                const option = variant.options.find(o => o.size === item.size) || variant.options[0];
                if (option && option.mrp) {
                    mrp = option.mrp;
                }
            }
        }

        totalMRP += (mrp * item.quantity);
        totalDiscount += ((mrp - item.price) * item.quantity);
    });

    // In case logic mismatches, ensure positive
    if (totalDiscount < 0) totalDiscount = 0;


    return (
        <div className="bg-white min-h-screen font-sans pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-bold mb-8 uppercase tracking-wider">My Bag</h1>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Cart Items List */}
                    <div className="lg:col-span-8 flex flex-col gap-4">
                        {items.map((item) => {
                            const product = item.product;
                            if (!product) return null; // Safety check

                            // Determine Image
                            let displayImage = product.variants?.[0]?.images?.[0] || 'https://via.placeholder.com/150'; // Default
                            if (product.variants) {
                                const variant = product.variants.find(v => v.color === item.color);
                                if (variant && variant.images && variant.images.length > 0) {
                                    displayImage = variant.images[0];
                                }
                            }

                            // Determine Discount %
                            let mrp = item.price;
                            if (product.variants) {
                                const variant = product.variants.find(v => v.color === item.color) || product.variants[0];
                                if (variant && variant.options) {
                                    const option = variant.options.find(o => o.size === item.size) || variant.options[0];
                                    if (option && option.mrp) {
                                        mrp = option.mrp;
                                    }
                                }
                            }

                            const discountPercent = mrp > item.price ? Math.round(((mrp - item.price) / mrp) * 100) : 0;

                            return (
                                <div key={item._id} className="flex gap-4 p-4 border border-gray-100 rounded-lg shadow-sm bg-white relative hover:shadow-md transition-shadow">
                                    {/* Delete Button */}
                                    <button
                                        onClick={() => confirmRemove(item._id)}
                                        className="absolute top-4 right-4 text-red-500 hover:text-red-700 p-1"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>

                                    {/* Image */}
                                    <div className="w-24 h-32 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                                        <img src={displayImage} alt={product.name} className="w-full h-full object-cover" />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-base font-semibold text-gray-900 leading-tight mb-1">{product.brand}</h3>
                                            <p className="text-sm text-gray-700 mb-1">{product.name}</p>
                                            <p className="text-xs text-gray-500 mb-2">Ships in 1-2 days</p>

                                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-gray-400">Color:</span>
                                                    <span className="font-medium text-gray-900">{item.color}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-gray-400">Size:</span>
                                                    <div className="font-medium text-gray-900 flex items-center gap-1">
                                                        {item.size} <span className="text-xs">▼</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-4">
                                            {/* Quantity */}
                                            <div className="flex items-center border border-gray-200 rounded">
                                                <button
                                                    onClick={() => handleQuantityChange(item._id, item.quantity, -1)}
                                                    className="px-2 py-1 hover:bg-gray-50 text-gray-600 disabled:opacity-50"
                                                    disabled={item.quantity <= 1}
                                                >-</button>
                                                <span className="px-2 py-1 text-sm font-semibold min-w-[1.5rem] text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => handleQuantityChange(item._id, item.quantity, 1)}
                                                    className="px-2 py-1 hover:bg-gray-50 text-gray-600"
                                                >+</button>
                                            </div>

                                            {/* Price */}
                                            <div className="text-right">
                                                <div className="flex items-center gap-2 justify-end">
                                                    <span className="font-bold text-gray-900">₹{item.price.toLocaleString()}</span>
                                                    {mrp > item.price && (
                                                        <span className="text-xs text-gray-400 line-through">₹{mrp.toLocaleString()}</span>
                                                    )}
                                                </div>
                                                {discountPercent > 0 && (
                                                    <div className="text-xs text-green-600 font-bold text-right">{discountPercent}% OFF</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Right Column - Summary */}
                    <div className="lg:col-span-4 space-y-4">
                        {/* Address Placeholder */}
                        <div className="bg-white p-4 border border-gray-100 rounded-lg shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                {/* Simple User Icon if needed */}
                                <span>No Address</span>
                            </div>
                            <button className="text-sm font-bold text-blue-600 hover:underline">+Add Address</button>
                        </div>

                        {/* Coupon Placeholder */}
                        <div className="bg-white p-4 border border-gray-100 rounded-lg shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-900 font-medium">
                                <span>% Apply Coupon</span>
                            </div>
                            <button className="text-sm font-bold text-blue-600 hover:underline">View</button>
                        </div>

                        {/* Price Summary */}
                        <div className="bg-white p-6 border border-gray-100 rounded-lg shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4 text-sm">Price Summary</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total MRP (Inc. of taxes)</span>
                                    <span className="font-medium">₹{totalMRP.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Discount</span>
                                    <span className="font-medium text-green-600">-₹{totalDiscount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Delivery Fee</span>
                                    <span className="font-medium text-green-600">FREE</span>
                                </div>
                                <hr className="border-gray-100 my-2" />
                                <div className="flex justify-between text-base font-bold text-gray-900">
                                    <span>Subtotal</span>
                                    <span>₹{totalPrice.toLocaleString()}</span>
                                </div>
                            </div>

                            <button className="w-full bg-black text-white py-3 rounded-lg font-bold text-sm mt-6 hover:bg-gray-900 transition-colors uppercase tracking-widest">
                                Proceed to pay
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            <ConfirmationModal
                isOpen={isModalOpen}
                closeModal={() => setIsModalOpen(false)}
                title="Remove Item"
                message="Are you sure you want to remove this item from your bag?"
                onConfirm={handleRemove}
                confirmText="Remove"
            />
        </div>
    );
}
