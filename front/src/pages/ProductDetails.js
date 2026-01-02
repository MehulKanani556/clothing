import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById, fetchRelatedProducts } from '../redux/slice/product.slice';
import { FiStar, FiShare2, FiHeart, FiShoppingBag, FiTruck, FiRefreshCw, FiChevronDown, FiChevronUp, FiCheck, FiInfo } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import ProductCard from '../components/ProductCard';

export default function ProductDetails() {
    const { id } = useParams();
    const location = useLocation();
    const dispatch = useDispatch();
    const productFromState = location.state?.product;

    // Redux State
    const { product: apiProduct, relatedProducts: apiRelated, loading } = useSelector((state) => state.product);

    const [selectedSize, setSelectedSize] = useState('M');
    const [selectedColor, setSelectedColor] = useState('Black');
    const [activeImage, setActiveImage] = useState(0);
    const [expandedSection, setExpandedSection] = useState('description');
    const [pincode, setPincode] = useState('');

    useEffect(() => {
        if (id) {
            dispatch(fetchProductById(id));
            dispatch(fetchRelatedProducts(id));
            window.scrollTo(0, 0);
        }
    }, [dispatch, id]);

    // Default data if state is missing or incomplete
    const defaultProduct = {
        name: "Black Oversized T-shirt for Men",
        brand: "Urban Monkey",
        price: "₹899",
        originalPrice: "₹1999",
        discount: "55% OFF",
        rating: 4.5,
        reviews: "1.2k Reviews",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        images: [
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
        ],
        colors: [
            { name: 'Black', hex: '#000000' },
            { name: 'White', hex: '#FFFFFF', border: true },
            { name: 'Olive', hex: '#556B2F' },
            { name: 'Brown', hex: '#8B4513' },
            { name: 'Navy', hex: '#000080' }
        ],
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        details: [
            { label: 'Fabric', value: '100% Cotton' },
            { label: 'Fit', value: 'Oversized Fit' },
            { label: 'Pattern', value: 'Graphic Print' },
            { label: 'Wash Care', value: 'Machine Wash' },
            { label: 'Neck', value: 'Round Neck' },
            { label: 'Sleeve', value: 'Half Sleeve' },
        ]
    };

    // Priority: API Data > Location State > Default Data
    // We treat apiProduct as the source of truth if available
    const productData = apiProduct || productFromState || defaultProduct;

    // Merge for robust display
    const product = {
        ...defaultProduct,
        ...productData,
        images: productData.images && productData.images.length > 0 ? productData.images :
            (productData.image ? [productData.image, ...defaultProduct.images.slice(1)] : defaultProduct.images),
        price: productData.price || defaultProduct.price,
        originalPrice: productData.oldPrice || productData.originalPrice || defaultProduct.originalPrice,
        discount: productData.discount || defaultProduct.discount,
        brand: productData.brand || productData.category || defaultProduct.brand,
    };

    // Mock Related used as fallback
    const mockRelated = [
        { id: 1, name: "Relaxed Fit Cotton T-shirt", brand: "Puma", price: "₹599", oldPrice: "₹1999", discount: "70% OFF", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", rating: 4.5 },
        { id: 2, name: "Slim Fit Polo T-shirt", brand: "US Polo Assn", price: "₹899", oldPrice: "₹1499", discount: "40% OFF", image: "https://images.unsplash.com/photo-1620012253295-c15cc3efb5ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", rating: 4.2 },
        { id: 3, name: "Oversized Graphic Tee", brand: "Nike", price: "₹1299", oldPrice: "₹2499", discount: "48% OFF", image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", rating: 4.7 },
        { id: 4, name: "Essential Crew Neck", brand: "H&M", price: "₹499", oldPrice: "₹999", discount: "50% OFF", image: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", rating: 4.1 },
    ];

    // If API related products exist, use them. Otherwise fallback.
    const displayRelated = apiRelated.length > 0 ? apiRelated : mockRelated;

    const toggleSection = (section) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-100">
                <div className="flex items-center text-sm text-gray-500">
                    <Link to="/" className="hover:text-black transition-colors">Home</Link>
                    <span className="mx-2">/</span>
                    <Link to="/category/men" className="hover:text-black transition-colors">Men</Link>
                    <span className="mx-2">/</span>
                    <span className="text-black font-medium truncate">{product.name}</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left Column - Images */}
                    <div className="space-y-4">
                        <div className="aspect-[3/4] overflow-hidden rounded-xl bg-gray-100 group">
                            <img
                                src={product.images[activeImage]}
                                alt={product.name}
                                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105 cursor-zoom-in"
                            />
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {product.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(idx)}
                                    className={`aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-black opacity-100' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                >
                                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Column - Details */}
                    <div className="flex flex-col h-full">
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                            <p className="text-gray-500 text-lg mb-4">{product.brand}</p>

                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-3xl font-bold text-gray-900">{product.price}</span>
                                <span className="text-xl text-gray-400 line-through">{product.originalPrice}</span>
                                <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded">{product.discount}</span>
                            </div>

                            <div className="flex items-center gap-2 mb-6 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors w-fit -ml-2">
                                <span className="bg-yellow-400 text-white px-2 py-0.5 rounded text-sm font-bold flex items-center gap-1">
                                    {product.rating} <FaStar size={10} />
                                </span>
                                <span className="text-gray-500 text-sm font-medium border-b border-gray-300">{product.reviews}</span>
                            </div>
                        </div>

                        {/* Color Selection */}
                        <div className="mb-8">
                            <h3 className="text-sm font-medium text-gray-900 mb-3 uppercase tracking-wide">Color: <span className="text-gray-500 normal-case">{selectedColor}</span></h3>
                            <div className="flex items-center gap-3">
                                {product.colors.map((color) => (
                                    <button
                                        key={color.name}
                                        onClick={() => setSelectedColor(color.name)}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${selectedColor === color.name ? 'ring-2 ring-offset-2 ring-black scale-110' : 'hover:scale-105'}`}
                                        style={{ backgroundColor: color.hex, border: color.border ? '1px solid #e5e7eb' : 'none' }}
                                        title={color.name}
                                    >
                                        {selectedColor === color.name && <FiCheck className={`w-5 h-5 ${color.name === 'White' ? 'text-black' : 'text-white'}`} />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Size Selection */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Select Size</h3>
                                <button className="text-sm text-gray-500 underline hover:text-black transition-colors">Size Chart</button>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {product.sizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`w-14 h-12 rounded-lg border flex items-center justify-center text-sm font-medium transition-all
                                            ${selectedSize === size
                                                ? 'border-black bg-black text-white shadow-lg'
                                                : 'border-gray-200 text-gray-900 hover:border-black'
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Pincode Check */}
                        <div className="mb-8 p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-900">
                                <FiTruck /> Check Delivery
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Enter Pincode"
                                    value={pincode}
                                    onChange={(e) => setPincode(e.target.value)}
                                    maxLength={6}
                                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                />
                                <button className="text-black font-semibold text-sm px-4 hover:bg-black hover:text-white rounded-lg transition-colors border border-transparent hover:border-black">
                                    Check
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 mb-8">
                            <button className="flex-1 bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-900 transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 transform active:scale-95 duration-200">
                                <FiShoppingBag /> Add to Cart
                            </button>
                            <button className="w-14 flex items-center justify-center border border-gray-200 rounded-xl hover:border-black hover:bg-gray-50 transition-colors">
                                <FiHeart size={24} />
                            </button>
                            <button className="w-14 flex items-center justify-center border border-gray-200 rounded-xl hover:border-black hover:bg-gray-50 transition-colors">
                                <FiShare2 size={24} />
                            </button>
                        </div>

                        {/* Accordions */}
                        <div className="border-t border-gray-200 divide-y divide-gray-200">
                            {/* Description */}
                            <div className="py-4">
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

                            {/* Returns & Exchange */}
                            <div className="py-4">
                                <button
                                    onClick={() => toggleSection('returns')}
                                    className="w-full flex items-center justify-between text-left font-medium text-gray-900 hover:text-black"
                                >
                                    <span>Returns & Exchange Policy</span>
                                    {expandedSection === 'returns' ? <FiChevronUp /> : <FiChevronDown />}
                                </button>
                                {expandedSection === 'returns' && (
                                    <div className="mt-4 text-gray-600 text-sm leading-relaxed animate-fadeIn">
                                        <div className="flex items-center gap-3 mb-2 text-gray-900 font-medium">
                                            <FiRefreshCw /> 14 Days Easy Return
                                        </div>
                                        <p>You can return or exchange this item within 14 days of delivery. Please ensure tags are intact.</p>
                                    </div>
                                )}
                            </div>

                            {/* Reviews */}
                            <div className="py-4">
                                <button
                                    onClick={() => toggleSection('reviews')}
                                    className="w-full flex items-center justify-between text-left font-medium text-gray-900 hover:text-black"
                                >
                                    <span>Rating & Reviews</span>
                                    {expandedSection === 'reviews' ? <FiChevronUp /> : <FiChevronDown />}
                                </button>
                                {expandedSection === 'reviews' && (
                                    <div className="mt-4 animate-fadeIn">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="text-center">
                                                <span className="text-4xl font-bold text-gray-900 block">{product.rating}</span>
                                                <div className="flex text-yellow-400 text-sm justify-center my-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <FaStar key={i} className={i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-200'} />
                                                    ))}
                                                </div>
                                                <span className="text-xs text-gray-500">{product.reviews}</span>
                                            </div>
                                            <div className="flex-1 border-l pl-4 border-gray-200">
                                                {/* Mock progress bars */}
                                                {[5, 4, 3, 2, 1].map((star) => (
                                                    <div key={star} className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-medium w-3">{star}</span>
                                                        <FaStar className="text-gray-300 w-3 h-3" />
                                                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-yellow-400 rounded-full"
                                                                style={{ width: star === 5 ? '70%' : star === 4 ? '20%' : '5%' }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
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
        </div>
    );
}
