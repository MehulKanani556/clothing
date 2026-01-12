import { useEffect, useState } from 'react';
import { fetchCart, removeFromCart, updateCartItem } from '../redux/slice/cart.slice';
import { checkPincodeServiceability } from '../redux/slice/delivery.slice';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiMapPin, FiTag, FiTruck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';
import AddAddressModal from '../components/profile/AddAddressModal';
import AddressSelectionModal from '../components/profile/AddressSelectionModal';
import CouponModal from '../components/cart/CouponModal';
import { removeCoupon } from '../redux/slice/offer.slice';

export default function CartPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items, totalPrice, loading } = useSelector((state) => state.cart);
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const { appliedCoupon } = useSelector((state) => state.offers);
    const { deliveryFee, deliveryInfo, loading: loadingDeliveryFee, error: deliveryError } = useSelector((state) => state.delivery);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [showSelectionModal, setShowSelectionModal] = useState(false);
    const [showCouponModal, setShowCouponModal] = useState(false);
    const [itemToRemove, setItemToRemove] = useState(null);

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchCart());
        }
    }, [dispatch, isAuthenticated]);

    // Show error toast when delivery check fails
    useEffect(() => {
        if (deliveryError) {
            toast.error(deliveryError);
        }
    }, [deliveryError]);

    // Check delivery fee when user has address
    useEffect(() => {
        const checkDeliveryFee = async () => {
            if (!user?.addresses?.length) {
                return;
            }

            const activeAddress = user.addresses.find(a => a.isDefault) || user.addresses[0];
            if (!activeAddress?.pincode) {
                return;
            }

            console.log('Checking delivery fee for pincode:', activeAddress.pincode);
            dispatch(checkPincodeServiceability(activeAddress.pincode))
                .unwrap()
                .then((result) => {
                    if (result.success && result.data.serviceable) {
                        console.log('Original shipping charge:', result.data.shippingCharge);
                        console.log('Rounded delivery fee:', Math.ceil(result.data.shippingCharge / 5) * 5);
                    }
                })
                .catch((error) => {
                    console.error('Delivery check failed:', error);
                });
        };

        if (isAuthenticated && user?.addresses?.length) {
            checkDeliveryFee();
        }
    }, [dispatch, isAuthenticated, user?.addresses, user?.addresses?.find(a => a.isDefault)?._id]);

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

    // Function to refresh delivery fee (called when address changes)
    const refreshDeliveryFee = (pincode) => {
        if (!pincode) {
            return;
        }
        console.log('Refreshing delivery fee for pincode:', pincode);
        dispatch(checkPincodeServiceability(pincode))
            .unwrap()
            .then((result) => {
                if (result.success && result.data.serviceable) {
                    console.log('Original shipping charge:', result.data.shippingCharge);
                    console.log('Rounded delivery fee:', Math.ceil(result.data.shippingCharge / 5) * 5);
                }
            })
            .catch((error) => {
                console.error('Delivery check failed:', error);
            });
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

    if (items.length === 0 && !loading) {
        return (
            <div className="bg-white min-h-screen font-sans pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-2xl font-bold mb-8 uppercase tracking-wider">My Bag</h1>
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="mb-6 relative">
                            {/* Placeholder generic empty bag icon - or we can use an image if provided, for now using styled icons */}
                            <div className="relative">
                                <svg xmlns="http://www.w3.org/2000/svg" width="187" height="149" viewBox="0 0 187 149" fill="none">
                                    <g clip-path="url(#clip0_1_14383)">
                                        <path d="M101.321 47.6855C104.201 47.6857 106.536 50.0204 106.536 52.9004C106.536 55.7805 104.201 58.1151 101.321 58.1152H149.001C151.881 58.1152 154.216 60.4501 154.216 63.3301C154.216 66.2102 151.881 68.5459 149.001 68.5459H165.391C168.271 68.5459 170.606 70.8806 170.606 73.7607C170.606 76.6408 168.271 78.9756 165.391 78.9756H151.236C148.356 78.9756 146.022 81.3103 146.021 84.1904C146.021 87.0706 148.356 89.4053 151.236 89.4053H155.706C158.586 89.4053 160.921 91.7402 160.921 94.6201C160.921 97.5003 158.586 99.8359 155.706 99.8359H116.966C116.582 99.8359 116.209 99.7944 115.849 99.7158C115.489 99.7944 115.115 99.8359 114.731 99.8359H46.9355C44.0556 99.8357 41.7207 97.5001 41.7207 94.6201C41.7209 91.7403 44.0557 89.4055 46.9355 89.4053H17.8809C15.0008 89.4052 12.666 87.0705 12.666 84.1904C12.6661 81.3104 15.0008 78.9757 17.8809 78.9756H47.6807C50.5608 78.9756 52.8964 76.6408 52.8965 73.7607C52.8965 70.8806 50.5608 68.5459 47.6807 68.5459H29.0557C26.1757 68.5457 23.8408 66.2101 23.8408 63.3301C23.8411 60.4502 26.1758 58.1154 29.0557 58.1152H58.8564C55.9763 58.1152 53.6406 55.7806 53.6406 52.9004C53.6407 50.0203 55.9763 47.6855 58.8564 47.6855H101.321ZM168.369 89.4043C171.249 89.4043 173.584 91.739 173.584 94.6191C173.584 97.4993 171.249 99.834 168.369 99.834C165.489 99.8339 163.154 97.4993 163.154 94.6191C163.154 91.7391 165.489 89.4044 168.369 89.4043Z" fill="#141414" fill-opacity="0.1" />
                                        <path d="M124.409 110.266H141.117M47.6737 110.266H63.657H47.6737ZM38.084 110.266H43.2037H38.084ZM144.619 110.266H146.759H144.619Z" stroke="#141414" stroke-width="1.8625" stroke-linecap="round" stroke-linejoin="round" />
                                        <path d="M73.0059 32.2661L81.2751 41.5437M111.82 32.2661L103.551 41.5437L111.82 32.2661ZM92.3759 29.0605V41.5437V29.0605Z" stroke="#141414" stroke-width="1.8625" stroke-linecap="round" stroke-linejoin="round" />
                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M69.1345 52.9082H115.776L111.599 59.1735L117.169 63.3504H67.7422L74.0075 59.1735L69.1345 52.9082Z" fill="#141414" fill-opacity="0.3" />
                                        <rect x="66.3066" y="61.8496" width="52.895" height="55.875" rx="1.49" fill="white" />
                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M69.7227 92.3991V66.8003C69.7227 65.7456 70.587 64.8906 71.6533 64.8906L117.081 112.632C117.081 114.038 115.955 115.178 114.567 115.178H72.237C70.8484 115.178 69.7227 114.038 69.7227 112.632V103.118V100.537V92.3991ZM69.7227 97.926V95.059V97.926Z" fill="#141414" fill-opacity="0.3" />
                                        <path d="M67.0508 92.7402V64.7447C67.0508 63.5913 67.9973 62.6562 69.1649 62.6562H117.533C118.293 62.6562 118.909 63.2796 118.909 64.0485V114.867C118.909 116.405 117.677 117.652 116.156 117.652H69.804C68.2835 117.652 67.0508 116.405 67.0508 114.867V104.463V101.641M67.0508 98.7845V95.6492" stroke="#141414" stroke-width="1.8625" stroke-linecap="round" />
                                        <path d="M68.4435 62.6562V54.3025C68.4435 53.5335 69.0029 52.9102 69.693 52.9102L115.924 52.9102C116.614 52.9102 117.174 53.5335 117.174 54.3025V62.6562" stroke="#141414" stroke-width="1.8625" />
                                        <path d="M81.3135 77.2773C82.6591 77.2773 83.75 76.1865 83.75 74.8408C83.75 73.4952 82.6591 72.4043 81.3135 72.4043C79.9678 72.4043 78.877 73.4952 78.877 74.8408C78.877 76.1865 79.9678 77.2773 81.3135 77.2773Z" fill="#D0E2D0" stroke="#141414" stroke-width="1.8625" stroke-linecap="round" />
                                        <path d="M104.294 77.2773C105.64 77.2773 106.73 76.1865 106.73 74.8408C106.73 73.4952 105.64 72.4043 104.294 72.4043C102.948 72.4043 101.857 73.4952 101.857 74.8408C101.857 76.1865 102.948 77.2773 104.294 77.2773Z" fill="#D0E2D0" stroke="#141414" stroke-width="1.8625" stroke-linecap="round" />
                                        <path d="M103.941 77.2796C103.941 83.4312 98.954 88.418 92.8024 88.418C86.6509 88.418 81.6641 83.4312 81.6641 77.2796" stroke="#141414" stroke-width="1.8625" stroke-linecap="round" />
                                        <path d="M69.1761 53.6055L74.077 58.4433C74.3699 58.7323 74.3729 59.204 74.0839 59.4968C74.0339 59.5475 73.9768 59.5907 73.9145 59.6252L68.4375 62.6576" stroke="#141414" stroke-width="1.8625" stroke-linecap="round" />
                                        <path d="M116.546 53.6523L111.856 58.4356C111.568 58.7294 111.573 59.2011 111.867 59.4891C111.916 59.5372 111.971 59.5783 112.031 59.6112L117.609 62.654" stroke="#141414" stroke-width="1.8625" stroke-linecap="round" />
                                        <circle cx="117.711" cy="58.8599" r="8.94" fill="#141414" />
                                        <path d="M117.489 62.2586C116.912 62.2586 116.39 62.1126 115.924 61.8205C115.465 61.5285 115.104 61.1043 114.84 60.5481C114.575 59.9849 114.443 59.3034 114.443 58.5038C114.443 57.7042 114.575 57.0262 114.84 56.4699C115.104 55.9067 115.465 55.4791 115.924 55.1871C116.39 54.895 116.912 54.749 117.489 54.749C118.073 54.749 118.594 54.895 119.053 55.1871C119.512 55.4791 119.874 55.9067 120.138 56.4699C120.409 57.0262 120.545 57.7042 120.545 58.5038C120.545 59.3034 120.409 59.9849 120.138 60.5481C119.874 61.1043 119.512 61.5285 119.053 61.8205C118.594 62.1126 118.073 62.2586 117.489 62.2586ZM117.489 61.08C117.83 61.08 118.125 60.9896 118.375 60.8088C118.626 60.6211 118.82 60.336 118.959 59.9536C119.106 59.5711 119.179 59.0879 119.179 58.5038C119.179 57.9128 119.106 57.4295 118.959 57.054C118.82 56.6716 118.626 56.39 118.375 56.2092C118.125 56.0215 117.83 55.9276 117.489 55.9276C117.162 55.9276 116.87 56.0215 116.613 56.2092C116.362 56.39 116.164 56.6716 116.018 57.054C115.879 57.4295 115.81 57.9128 115.81 58.5038C115.81 59.0879 115.879 59.5711 116.018 59.9536C116.164 60.336 116.362 60.6211 116.613 60.8088C116.87 60.9896 117.162 61.08 117.489 61.08Z" fill="white" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_1_14383">
                                            <rect width="186.25" height="149" fill="white" />
                                        </clipPath>
                                    </defs>
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Oops! Your bag is still empty.</h2>
                        <p className="text-gray-500 mb-8">There is nothing in your bag. Let's add some items.</p>
                        <Link to="/" className="px-8 py-3 bg-black text-white font-bold uppercase tracking-wide rounded-[4px] hover:bg-gray-800 transition-colors">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
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
                                <div key={item._id}  className="flex gap-4 p-4 border border-gray-100 rounded-lg shadow-sm bg-white relative hover:shadow-md transition-shadow">
                                    {/* Delete Button */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); confirmRemove(item._id) }}
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
                                                    onClick={(e) => { e.stopPropagation(); handleQuantityChange(item._id, item.quantity, -1) }}
                                                    className="px-2 py-1 hover:bg-gray-50 text-gray-600 disabled:opacity-50"
                                                    disabled={item.quantity <= 1}
                                                >-</button>
                                                <span className="px-2 py-1 text-sm font-semibold min-w-[1.5rem] text-center">{item.quantity}</span>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleQuantityChange(item._id, item.quantity, 1) }}
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
                    <div className="lg:col-span-4 flex flex-col gap-4">
                        {/* Address Section */}
                        {user?.addresses?.length > 0 ? (
                            (() => {
                                const activeAddress = user.addresses.find(a => a.isDefault) || user.addresses[0];
                                return (
                                    <div className="bg-white p-4 border border-gray-100 rounded-lg shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="text-gray-900 shrink-0">
                                                    <FiMapPin size={20} />
                                                </div>
                                                <div className="flex items-center flex-wrap gap-2 text-sm text-gray-900 truncate">
                                                    <span className="text-gray-600">Deliver to:</span>
                                                    <span className="font-semibold">{activeAddress.firstName} {activeAddress.lastName}</span>
                                                    <span className="text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded border border-gray-200 uppercase font-medium">
                                                        {activeAddress.addressType}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setShowSelectionModal(true)}
                                                className="text-sm font-semibold text-blue-600 hover:text-blue-700 ml-4 shrink-0 uppercase tracking-wide"
                                            >
                                                Change
                                            </button>
                                        </div>

                                        {/* Delivery Info */}
                                        {loadingDeliveryFee ? (
                                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-3">
                                                <FiTruck size={16} />
                                                <span>Checking delivery options...</span>
                                            </div>
                                        ) : deliveryInfo ? (
                                            <div className="flex items-center gap-2 text-sm text-green-600 mt-3">
                                                <FiTruck size={16} />
                                                <span>
                                                    Delivery in {deliveryInfo.estimatedDays} days
                                                </span>
                                            </div>
                                        ) : activeAddress.pincode && (
                                            <div className="flex items-center gap-2 text-sm text-red-500 mt-3">
                                                <FiTruck size={16} />
                                                <span>Delivery not available to {activeAddress.pincode}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()
                        ) : (
                            <div className="bg-white p-4 border border-gray-100 rounded-lg shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <FiMapPin size={20} className="text-gray-400" />
                                    <span>No address selected</span>
                                </div>
                                <button
                                    onClick={() => setShowAddressModal(true)}
                                    className="text-sm font-bold text-blue-600 hover:underline"
                                >
                                    + Add Address
                                </button>
                            </div>
                        )}

                        {/* Coupon Section */}
                        <div className="bg-white p-4 border border-gray-100 rounded-lg shadow-sm">
                            {appliedCoupon ? (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="text-green-600">
                                            <FiTag size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Coupon Applied</p>
                                            <p className="text-xs text-green-600 font-medium">{appliedCoupon.code} - ₹{(appliedCoupon.discount || 0).toLocaleString()} Saved</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => dispatch(removeCoupon())}
                                        className="text-xs font-bold text-red-500 hover:text-red-600 uppercase"
                                    >
                                        REMOVE
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-gray-900 font-medium">
                                        <FiTag className="text-gray-900" />
                                        <span>% Apply Coupon</span>
                                    </div>
                                    <button
                                        onClick={() => setShowCouponModal(true)}
                                        className="text-sm font-bold text-blue-600 hover:underline"
                                    >
                                        View
                                    </button>
                                </div>
                            )}
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
                                    <span className="text-gray-600">Discount on MRP</span>
                                    <span className="font-medium text-green-600">-₹{totalDiscount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Delivery Fee</span>
                                    {loadingDeliveryFee ? (
                                        <span className="text-sm text-gray-400">Calculating...</span>
                                    ) : deliveryFee > 0 ? (
                                        <span className="font-medium">₹{deliveryFee.toLocaleString()}</span>
                                    ) : (
                                        <span className="font-medium text-green-600">FREE</span>
                                    )}
                                </div>
                                {appliedCoupon && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Coupon Discount</span>
                                        <span className="font-medium text-green-600">-₹{(appliedCoupon.discount || 0).toLocaleString()}</span>
                                    </div>
                                )}
                                <hr className="border-gray-100 my-2" />
                                <div className="flex justify-between text-base font-bold text-gray-900">
                                    <span>Subtotal</span>
                                    <span>₹{(totalPrice - (appliedCoupon ? appliedCoupon.discount : 0) + deliveryFee).toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/checkout/payment')}
                                className="w-full bg-black text-white py-3 rounded-lg font-bold text-sm mt-6 hover:bg-gray-900 transition-colors uppercase tracking-widest"
                            >
                                Proceed to pay
                            </button>
                        </div>

                        <CouponModal
                            isOpen={showCouponModal}
                            onClose={() => setShowCouponModal(false)}
                            cartValue={totalPrice}
                            cartItems={items}
                        />
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

            <AddAddressModal
                isOpen={showAddressModal}
                onClose={() => {
                    setShowAddressModal(false);
                    // Refresh delivery fee after new address is added
                    setTimeout(() => {
                        const activeAddress = user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0];
                        if (activeAddress?.pincode) {
                            refreshDeliveryFee(activeAddress.pincode);
                        }
                    }, 100);
                }}
            />

            <AddressSelectionModal
                isOpen={showSelectionModal}
                onClose={() => {
                    setShowSelectionModal(false);
                    // Refresh delivery fee after address change
                    setTimeout(() => {
                        const activeAddress = user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0];
                        if (activeAddress?.pincode) {
                            refreshDeliveryFee(activeAddress.pincode);
                        }
                    }, 100);
                }}
            />
        </div>
    );
}
