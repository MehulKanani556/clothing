import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductBySlug, fetchRelatedProducts } from '../redux/slice/product.slice';
import { addToCart } from '../redux/slice/cart.slice';
import { addReview } from '../redux/slice/review.slice';
import { fetchCart } from '../redux/slice/cart.slice';
import { fetchUserOrders } from '../redux/slice/order.slice';
import { addToWishlist, removeFromWishlist, fetchWishlist } from '../redux/slice/wishlist.slice';
import toast from 'react-hot-toast';
import { FiStar, FiShare2, FiHeart, FiShoppingBag, FiTruck, FiRefreshCw, FiChevronDown, FiChevronUp, FiCheck, FiInfo } from 'react-icons/fi';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';
import ReviewOffcanvas from '../components/ReviewOffcanvas';
import ProductCard from '../components/ProductCard';
import { BASE_URL } from '../utils/BASE_URL';
import { Rating } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';

export default function ProductDetails() {
    const { slug } = useParams();
    const location = useLocation();
    const dispatch = useDispatch();
    const productFromState = location.state?.product;

    // Redux State
    const { product: apiProduct, relatedProducts: apiRelated, loading } = useSelector((state) => state.product);
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const { items: cartItems } = useSelector((state) => state.cart);
    const { items: wishlistItems } = useSelector((state) => state.wishlist);
    const { orders } = useSelector((state) => state.order);

    // Priority: API Data > Location State
    const productData = apiProduct || productFromState;

    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [activeImage, setActiveImage] = useState(0);
    const [expandedSection, setExpandedSection] = useState('description');
    const [pincode, setPincode] = useState('');
    const [pincodeResult, setPincodeResult] = useState(null);
    const [checkingPincode, setCheckingPincode] = useState(false);
    const [isReviewOpen, setIsReviewOpen] = useState(false);

    useEffect(() => {
        if (slug) {
            dispatch(fetchProductBySlug(slug));
            // Related products might need ID. But we can fetch related inside fetchProductBySlug or 
            // wait for product to accept ID.
            // For now, let's assume we need to wait for productData to get ID for related products?
            // Or change backend to accept slug for related?
            // The existing getRelatedProducts uses ID.
            // We can dispatch fetchRelatedProducts AFTER we have productData._id
        }
    }, [dispatch, slug]);

    // useEffect(() => {
    //     if (apiProduct?._id) {
    //         dispatch(fetchRelatedProducts(apiProduct._id));
    //     }
    // }, [dispatch, apiProduct]);

    useEffect(() => {
        if (slug) {
            window.scrollTo(0, 0);
            setActiveImage(0);
        }
        // Fetch cart and wishlist to check if items are already added
        if (isAuthenticated) {
            dispatch(fetchCart());
            dispatch(fetchWishlist());
            dispatch(fetchUserOrders());
        }
    }, [dispatch, isAuthenticated]);

    // Initialize selection when data loads
    useEffect(() => {
        if (productData?.variants?.length > 0) {
            const defaultVariant = productData.variants.find(v => v.isDefault) || productData.variants[0];
            // Only set if not already set or if switching products
            // Ideally we check if selectedColor is valid for this product, but simpler to just reset on load
            setSelectedColor(defaultVariant.color);
            if (defaultVariant.options?.length > 0) {
                setSelectedSize(defaultVariant.options[0].size); // Default to first available size
            }
        }
    }, [productData]);

    const thumbnailsRef = React.useRef(null);

    useEffect(() => {
        if (thumbnailsRef.current) {
            const activeThumbnail = thumbnailsRef.current.children[activeImage];
            if (activeThumbnail) {
                activeThumbnail.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            }
        }
    }, [activeImage]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-xl font-bold">Loading...</div>;
    }

    if (!productData) {
        return <div className="min-h-screen flex items-center justify-center text-xl text-red-500">Product not found</div>;
    }

    // Identify current variant based on selection
    // Fallback to first variant if selection matches nothing (shouldn't happen due to useEffect, but safety first)
    const currentVariant = productData.variants?.find(v => v.color === selectedColor) || productData.variants?.[0] || {};
    const currentOption = currentVariant.options?.find(o => o.size === selectedSize) || currentVariant.options?.[0] || {};

    const product = {
        _id: productData._id,
        name: productData.name,
        brand: productData.brand,
        price: currentOption.price ? `₹${currentOption.price}` : 'Unavailable',
        originalPrice: currentOption.mrp ? `₹${currentOption.mrp}` : null,
        discount: currentOption.mrp && currentOption.price ? `${Math.round(((currentOption.mrp - currentOption.price) / currentOption.mrp) * 100)}% OFF` : null,
        rating: productData.rating?.average || 0,
        reviews: `${productData.rating?.count || 0} Reviews`,
        ratingBreakdown: productData.rating?.breakdown || {},
        description: productData.description,
        images: currentVariant.images || [],
        colors: productData.variants?.map(v => ({ name: v.color, hex: v.colorCode || '#000', border: v.color === 'White' })) || [],
        sizes: currentVariant.options?.map(o => o.size) || [],
        details: productData.highlights?.length > 0 ? productData.highlights.map(h => ({ label: 'Highlight', value: h })) : [], // Or use specifications if available
        specifications: productData.specifications || [],
        returnPolicy: productData.deliveryInfo?.returnPolicy || 'No Returns',
        deliveryDays: productData.deliveryInfo?.dispatchDays || 0
    };

    // Use mock related if API related is empty? Or just empty.
    // User asked to remove defaultProduct only. I'll keep the related products logic simple.
    const displayRelated = apiRelated.length > 0 ? apiRelated : [];

    // Check if current product with selected size and color is already in cart
    const isInCart = cartItems && cartItems.length > 0 && cartItems.some(item =>
        item.product?._id === product?._id &&
        item.size === selectedSize &&
        item.color === selectedColor
    );

    // Check if current product is in wishlist
    const isInWishlist = wishlistItems && wishlistItems.length > 0 && wishlistItems.some(item =>
        item._id === product._id
    );

    const hasOrdered = isAuthenticated && orders?.some(order =>
        order.items?.some(item => (item.product?._id || item.product) === product._id)
    );
    const hasReviewed = isAuthenticated && productData?.reviews?.some(review =>
        review?.user?._id === user?._id
    );

    const toggleSection = (section) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const handlePincodeCheck = async () => {
        if (!pincode || pincode.length !== 6) {
            toast.error("Please enter a valid 6-digit pincode");
            return;
        }

        setCheckingPincode(true);
        setPincodeResult(null);

        try {
            const response = await fetch(`${BASE_URL}/shiprocket/check-pincode/${pincode}`);
            const data = await response.json();

            if (data.success) {
                setPincodeResult(data.data);
                if (data.data.serviceable) {
                    // toast.success(`Delivery available in ${data.data.estimatedDays} days!`);
                } else {
                    toast.error(data.data.message || "Delivery not available to this pincode");
                }
            } else {
                toast.error(data.message || "Failed to check pincode");
            }
        } catch (error) {
            console.error('Pincode check error:', error);
            toast.error("Failed to check pincode. Please try again.");
        } finally {
            setCheckingPincode(false);
        }
    };



    const handleAddToWishlist = () => {
        if (!isAuthenticated) {
            toast.error("Please login to add to wishlist");
            return;
        }

        if (isInWishlist) {
            // Remove from wishlist
            dispatch(removeFromWishlist(product._id))
                .unwrap()
                .then(() => toast.success("Removed from wishlist"))
                .catch((err) => toast.error(err.message || "Failed to remove from wishlist"));
        } else {
            // Add to wishlist
            dispatch(addToWishlist(product._id))
                .unwrap()
                .then(() => toast.success("Added to wishlist"))
                .catch((err) => toast.error(err.message || "Failed to add to wishlist"));
        }
    };

    const handleSubmitReview = async (data) => {
        if (!isAuthenticated) {
            toast.error("Please login to write a review");
            return;
        }

        const formData = new FormData();
        formData.append('product', product._id);
        formData.append('rating', data.rating);
        formData.append('title', data.title);
        formData.append('review', data.description);

        if (data.images && data.images.length > 0) {
            data.images.forEach((file) => {
                formData.append('images', file);
            });
        }

        dispatch(addReview(formData))
            .unwrap()
            .then(() => {
                toast.success("Review submitted for moderation!");
                setIsReviewOpen(false);
                // Refresh to show the new review (since we include Pending in fetch)
                dispatch(fetchProductBySlug(slug));
            })
            .catch((err) => {
                toast.error(err.message || "Failed to submit review");
            });
    };

    const handleAddToCart = () => {
        if (!isAuthenticated) {
            alert("Please login to add items to cart");
            return;
        }
        if (!selectedSize || !selectedColor) {
            alert("Please select size and color");
            return;
        }

        // Check if product with same size and color is already in cart
        const existingItem = cartItems && cartItems.find(item =>
            item.product._id === product._id &&
            item.size === selectedSize &&
            item.color === selectedColor
        );

        if (existingItem) {
            toast.error("This item is already in your cart!");
            return;
        }

        dispatch(addToCart({
            productId: product._id,
            quantity: 1, // Default 1 for now, or use the counter if implemented
            size: selectedSize,
            color: selectedColor
        })).unwrap()
            .then(() => {
                toast.success("Added to cart successfully!");
            })
            .catch((err) => {
                // If the error is about item already existing, show appropriate message
                if (err.message && err.message.includes('already')) {
                    toast.error("This item is already in your cart!");
                } else {
                    toast.error(err.message || "Failed to add to cart");
                }
            });
    };

    return (
        <div className="bg-white min-h-screen pb-20 font-sans">
            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center text-xs text-gray-500 uppercase tracking-wide overflow-x-auto whitespace-nowrap pb-1">
                    <Link to="/" className="hover:text-black transition-colors">Home</Link>

                    {productData?.category?.mainCategory && (
                        <>
                            <span className="mx-2">/</span>
                            <Link to={`/${productData.category.mainCategory.slug}`} className="hover:text-black transition-colors">
                                {productData.category.mainCategory.name}
                            </Link>
                        </>
                    )}

                    {productData?.category && (
                        <>
                            <span className="mx-2">/</span>
                            <Link to={`/${productData.category.slug}`} className="hover:text-black transition-colors">
                                {productData.category.name}
                            </Link>
                        </>
                    )}

                    {productData?.subCategory && (
                        <>
                            <span className="mx-2">/</span>
                            <Link to={`/${productData.subCategory.slug}`} className="hover:text-black transition-colors">
                                {productData.subCategory.name}
                            </Link>
                        </>
                    )}

                    <span className="mx-2">/</span>
                    <span className="text-black font-medium truncate max-w-[200px]">{product.name}</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column - 2 Column Grid Images */}
                    <div className="lg:col-span-7">
                        <div className="grid grid-cols-2 gap-1">
                            {product.images.map((img, idx) => (
                                <div
                                    key={idx}
                                    className="aspect-[4/5] bg-gray-100 overflow-hidden relative group"
                                >
                                    <img
                                        src={img}
                                        alt={`${product.name} view ${idx + 1}`}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column - Details (Sticky) */}
                    <div className="lg:col-span-5 lg:sticky lg:top-8 h-fit pl-0 lg:pl-8">
                        {/* Header */}
                        <div className="mb-6 border-b border-gray-100 pb-6">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
                            <p className="text-gray-500 text-sm mb-4 leading-relaxed">{product.brand} - {product.description?.substring(0, 100)}...</p>

                            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider mb-3">
                                <FiCheck size={12} /> In Stock
                            </div>

                            <div className="flex items-center gap-4 mb-2">
                                <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                                    <span className="font-bold text-sm">{product.rating}</span>
                                    <FaStar className="text-yellow-400 text-xs" />
                                    <span className="text-xs text-gray-500 border-l border-gray-300 pl-2 ml-1">{product.reviews}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-2xl font-bold text-gray-900">{product.price}</span>
                                {product.originalPrice && (
                                    <>
                                        <span className="text-lg text-gray-400 line-through font-light">{product.originalPrice}</span>
                                        <span className="text-green-600 font-bold text-sm">{product.discount}</span>
                                    </>
                                )}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Inclusive of all taxes</p>
                        </div>

                        {/* Options */}
                        <div className="space-y-6 mb-8">
                            {/* Colors */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">Color: <span className="text-gray-500 font-normal">{selectedColor}</span></h3>
                                <div className="flex flex-wrap gap-3">
                                    {product.colors.map((color) => (
                                        <button
                                            key={color.name}
                                            onClick={() => setSelectedColor(color.name)}
                                            className={`w-10 h-10 rounded-md flex items-center justify-center transition-all ${selectedColor === color.name ? 'ring-2 ring-offset-2 ring-black' : 'hover:ring-1 hover:ring-gray-300'}`}
                                            title={color.name}
                                        >
                                            <div
                                                className="w-full h-full rounded-md border border-gray-100"
                                                style={{ backgroundColor: color.hex }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sizes */}
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-sm font-semibold text-gray-900">Size: <span className="text-gray-500 font-normal">{selectedSize}</span></h3>
                                    <button className="text-xs font-medium text-gray-500 underline hover:text-black">Size Guide</button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {product.sizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`min-w-[3rem] h-10 px-3 rounded border text-sm font-medium transition-all flex items-center justify-center
                                                ${selectedSize === size
                                                    ? 'border-black bg-black text-white'
                                                    : 'border-gray-200 text-gray-900 hover:border-black'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Delivery */}
                        <div className="mb-8">
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Check Delivery</h3>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        placeholder="Enter Pincode"
                                        value={pincode}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                                            if (value.length <= 6) {
                                                setPincode(value);
                                                if (pincodeResult) {
                                                    setPincodeResult(null); // Clear previous result when typing
                                                }
                                            }
                                        }}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && pincode.length === 6 && !checkingPincode) {
                                                handlePincodeCheck();
                                            }
                                        }}
                                        maxLength={6}
                                        className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-black/5"
                                    />
                                    <button
                                        onClick={handlePincodeCheck}
                                        disabled={checkingPincode || pincode.length !== 6}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 uppercase hover:text-black px-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {checkingPincode ? 'Checking...' : 'Check'}
                                    </button>
                                </div>
                            </div>

                            {/* Pincode Result */}
                            {pincodeResult && (
                                <div className={`mt-3 p-3 rounded-lg border ${pincodeResult.serviceable
                                    ? 'bg-green-50 border-green-200 text-green-800'
                                    : 'bg-red-50 border-red-200 text-red-800'
                                    }`}>
                                    {pincodeResult.serviceable ? (
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <FiCheck size={16} />
                                                <span className="font-semibold text-sm">{pincodeResult.message || 'Delivery available'}</span>
                                            </div>

                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold">
                                                {pincodeResult.message || 'Delivery not available'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="mt-4 flex flex-wrap gap-4">
                                <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                    <FiTruck className="text-gray-900" /> Dispatch in {product.deliveryDays} days
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                    <FiRefreshCw className="text-gray-900" /> {product.returnPolicy}
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                    <FiInfo className="text-gray-900" /> Cash on Delivery available
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 mb-8">
                            {/* Qty mock */}
                            <div className="flex items-center border border-gray-200 rounded-lg h-12 px-3">
                                <button className="w-8 text-gray-500 hover:text-black">-</button>
                                <span className="w-8 text-center text-sm font-semibold">1</span>
                                <button className="w-8 text-gray-500 hover:text-black">+</button>
                            </div>
                            <button
                                onClick={handleAddToCart}
                                disabled={isInCart}
                                className={`flex-1 h-12 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 uppercase tracking-wide ${isInCart
                                    ? 'bg-gray-400 text-white cursor-not-allowed'
                                    : 'bg-black text-white hover:bg-gray-900'
                                    }`}
                            >
                                <FiShoppingBag size={18} />
                                {isInCart ? 'Already in Cart' : 'Add to Bag'}
                            </button>
                            <button
                                onClick={handleAddToWishlist}
                                className={`w-12 h-12 flex items-center justify-center border rounded-lg transition-colors ${isInWishlist
                                    ? 'border-red-500 bg-red-50 text-red-500 hover:bg-red-100'
                                    : 'border-gray-200 hover:border-black'
                                    }`}
                                title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                            >
                                <FiHeart size={20} fill={isInWishlist ? "currentColor" : "none"} />
                            </button>
                        </div>

                        {/* Offers */}
                        <div className="border border-gray-100 rounded-xl p-5 bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]">
                            <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Best Offers</h3>
                            <ul className="space-y-3">
                                <li className="flex gap-3 items-start">
                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-black flex-shrink-0" />
                                    <div className="text-xs leading-5 text-gray-600">
                                        <span className="font-bold text-gray-900">Welcome Offer:</span> Extra 10% OFF for First-Time Buyers! Use code: <strong>WELCOME10</strong>
                                    </div>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-black flex-shrink-0" />
                                    <div className="text-xs leading-5 text-gray-600">
                                        Get a special surprise on orders above ₹799!
                                    </div>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-black flex-shrink-0" />
                                    <div className="text-xs leading-5 text-gray-600">
                                        Free Shipping on prepaid orders over ₹999.
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* Accordions */}


                    </div>


                </div>
                {/* Accordions */}
                <div className="space-y-4 mt-8">
                    {/* Product Description */}
                    <div className="p-4 shadow-md rounded-md">
                        <button
                            onClick={() => toggleSection('description')}
                            className="w-full flex items-center justify-between text-left font-medium text-gray-900 hover:text-black"
                        >
                            <span>Product Description</span>
                            {expandedSection === 'description' ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                        {expandedSection === 'description' && (
                            <div className="mt-4 text-gray-600 text-sm leading-relaxed animate-fadeIn">
                                <p className="mb-4">{product.description}</p>
                                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                    {product.details.map((detail, idx) => (
                                        <div key={idx}>
                                            <span className="font-semibold text-gray-900 block">{detail.label}</span>
                                            <span className="text-gray-500">{detail.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>


                    {/* Shipping */}
                    <div className="p-4 shadow-md rounded-md">
                        <button
                            onClick={() => toggleSection('shipping')}
                            className="w-full flex items-center justify-between text-left font-medium text-gray-900 hover:text-black"
                        >
                            <span>Shipping</span>
                            {expandedSection === 'shipping' ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                        {expandedSection === 'shipping' && (
                            <div className="mt-4 text-gray-600 text-xs leading-loose animate-fadeIn text-justify space-y-4">
                                <p>
                                    Once our system has processed the order that you have placed with us, your products are thoroughly inspected to ensure that they are in pristine condition. If they pass the final round of quality checks, we will pack and hand them over to our reliable logistic partner.
                                </p>
                                <p>
                                    Our logistic partner will then deliver the products to you as soon as possible. In the event that our logistic partner is unable to reach you at the shipping address or at the time that you have specified, they will attempt to contact you to resolve the issue.
                                </p>
                                <p>
                                    Please note that all products ordered by you (including any free gifts bundled with the product that you have ordered) will be shipped to you at the shipping address provided by you when you placed your order, along with an invoice. Although we try to ship all products in your order together, this may not be feasible at all times.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Returns & Exchange */}
                    <div className="p-4 shadow-md rounded-md">
                        <button
                            onClick={() => toggleSection('returns')}
                            className="w-full flex items-center justify-between text-left font-medium text-gray-900 hover:text-black"
                        >
                            <span>Return/Exchange policy</span>
                            {expandedSection === 'returns' ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                        {expandedSection === 'returns' && (
                            <div className="mt-4 text-gray-600 text-xs leading-loose animate-fadeIn text-justify">
                                <p className="mb-4">
                                    For any product, you need to raise the request within 7 days of the product being delivered to you. Within these 7 days, you can thoroughly check the product, and if you do not like it, you can file a return or replacement request as you wish.
                                </p>
                                <p className="mb-4">
                                    {product.returnPolicy !== 'No Returns' ? product.returnPolicy : 'Returns are not accepted for this product unless damaged.'}
                                </p>
                                <p>
                                    Dispatch in {product.deliveryDays} days.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Reviews */}
                    <div className="p-4 shadow-md rounded-md">
                        <button
                            onClick={() => toggleSection('reviews')}
                            className="w-full flex items-center justify-between text-left font-medium text-gray-900 hover:text-black group"
                        >
                            <span className="text-lg">Rating & Review</span>
                            {expandedSection === 'reviews' ? <FiChevronUp className="group-hover:text-black" /> : <FiChevronDown className="group-hover:text-black" />}
                        </button>
                        {expandedSection === 'reviews' && (
                            <div className="mt-8 animate-fadeIn">
                                {/* Rating Summary */}
                                <div className="flex flex-col md:flex-row items-center gap-10 mb-10 pb-8 border-b border-gray-100">
                                    {/* Score */}
                                    <div className="text-center">
                                        <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-4 border-yellow-400 mb-2 mx-auto">
                                            <span className="text-4xl font-bold text-gray-900">{product.rating ? parseFloat(product.rating).toFixed(1) : '0.0'}</span>
                                        </div>
                                        <p className="text-gray-900 text-sm font-medium">from {product.reviews}</p>
                                    </div>

                                    {/* Bars */}
                                    <div className="flex-1 w-full max-w-md space-y-3">
                                        {[5, 4, 3, 2, 1].map((star) => {
                                            const count = product.ratingBreakdown?.[star] || 0;
                                            const total = parseInt(productData?.rating?.count) || 1;
                                            const percentage = total > 0 ? (count / total) * 100 : 0;
                                            return (
                                                <div key={star} className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1 w-8">
                                                        <span className="text-sm font-semibold">{star}</span>
                                                        <FaStar className="text-yellow-400 text-xs" />
                                                    </div>
                                                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-black rounded-full"
                                                            style={{ width: `${percentage}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm text-gray-400 w-8 text-right">{count}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Reviews Heading & Write Review */}
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-lg text-gray-900">Reviews</h3>
                                    {(hasOrdered && !hasReviewed) && (
                                        <button
                                            onClick={() => setIsReviewOpen(true)}
                                            className="text-sm font-medium text-gray-900 underline hover:text-gray-600 underline-offset-4 decoration-1"
                                        >
                                            Write a review
                                        </button>
                                    )}
                                </div>

                                {/* Review List */}
                                <div className="space-y-8">
                                    {productData.reviews && productData.reviews.length > 0 ? (
                                        productData.reviews.map((review, idx) => (
                                            <div key={idx} className="border-b border-gray-100 last:border-0 pb-8 last:pb-0">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={`https://ui-avatars.com/api/?name=${review.user?.firstName || 'User'}+${review.user?.lastName || ''}&background=000&color=fff`}
                                                            alt="User"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="font-bold text-sm text-gray-900">{review.user?.firstName || 'User'} {review.user?.lastName}</span>
                                                            <span className="text-xs text-gray-400">{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recently'}</span>
                                                        </div>
                                                        <div className="flex text-yellow-400 text-xs mb-2">
                                                            <Rating
                                                                name="text-feedback"
                                                                value={review.rating}
                                                                precision={0.5}
                                                                readOnly
                                                                sx={{ color: '#FACC15' }}
                                                                size="small"
                                                                emptyIcon={<StarIcon style={{ opacity: 1 }} fontSize="inherit" />}
                                                            />
                                                        </div>

                                                        {review.title && <h5 className="font-bold text-gray-900 text-sm mb-1">{review.title}</h5>}
                                                        <p className="text-sm text-gray-600 leading-relaxed mb-3">{review.review}</p>

                                                        {review.images && review.images.length > 0 && (
                                                            <div className="flex gap-2 mt-3">
                                                                {review.images.map((img, imgIdx) => (
                                                                    <div key={imgIdx} className="w-16 h-16 rounded bg-gray-100 overflow-hidden border border-gray-200">
                                                                        <img src={img} alt="Review attachment" className="w-full h-full object-cover" />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-gray-500 text-sm">No reviews yet. Be the first to review!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recommendations */}
                <div className="mt-20">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 uppercase tracking-wider">You May Also Like</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {displayRelated.map(item => (
                            <ProductCard key={item.id} product={item} />
                        ))}
                    </div>
                </div>
            </div>

            <ReviewOffcanvas
                isOpen={isReviewOpen}
                onClose={() => setIsReviewOpen(false)}
                product={product}
                onSubmit={handleSubmitReview}
            />
        </div>
    );
}
