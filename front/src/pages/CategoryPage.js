import React, { useState, Fragment } from 'react';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { useParams, Link } from 'react-router-dom';
import { FiFilter, FiChevronDown, FiGrid, FiList, FiX, FiMinus, FiPlus } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';

export default function CategoryPage() {
    const { categoryName } = useParams();
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('recommended');
    const [isSortOpen, setSortOpen] = useState(false);
    const [isFilterOpen, setFilterOpen] = useState(false);

    // Filter state
    const [filters, setFilters] = useState({
        gender: [],
        size: [],
        color: [],
        discount: [],
        rating: [],
        productType: [],
        pattern: [],
        sleeveLength: [],
        brand: []
    });

    // Toggle section state
    const [expandedSections, setExpandedSections] = useState({
        gender: true,
        size: true,
        color: true,
        price: true,
        discount: false,
        rating: false,
        productType: false,
        brand: false
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const filterOptions = {
        gender: ['Men', 'Women'],
        size: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
        color: [
            { name: 'Black', hex: '#000000' },
            { name: 'White', hex: '#FFFFFF', border: true },
            { name: 'Green', hex: '#228B22' },
            { name: 'Brown', hex: '#8B4513' },
            { name: 'Orange', hex: '#FFA500' },
            { name: 'Purple', hex: '#800080' },
            { name: 'Blue', hex: '#0000FF' },
            { name: 'Red', hex: '#FF0000' },
        ],
        discount: ['10% or more', '20% or more', '30% or more', '40% or more', '50% or more'],
        rating: ['4★ & above', '3★ & above', '2★ & above'],
        productType: ['T-shirt', 'Sweatshirt', 'Hoodie', 'Shirt', 'Jeans', 'Jacket'],
        brand: ['Puma', 'Nike', 'Adidas', 'Zara', 'H&M', 'Levis', 'Jack & Jones']
    };

    // Mock data based on the uploaded image style
    const products = [
        {
            id: 1,
            name: "Relaxed Fit Cotton T-shirt",
            brand: "Puma",
            price: "₹599",
            oldPrice: "₹1999",
            discount: "70% OFF",
            image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            rating: 4.5,
            reviews: "2.5k"
        },
        {
            id: 2,
            name: "Slim Fit Polo T-shirt",
            brand: "US Polo Assn",
            price: "₹899",
            oldPrice: "₹1499",
            discount: "40% OFF",
            image: "https://images.unsplash.com/photo-1620012253295-c15cc3efb5ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            rating: 4.2,
            reviews: "1.2k"
        },
        {
            id: 3,
            name: "Oversized Graphic Tee",
            brand: "Nike",
            price: "₹1299",
            oldPrice: "₹2499",
            discount: "48% OFF",
            image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            rating: 4.7,
            reviews: "850"
        },
        {
            id: 4,
            name: "Essential Crew Neck",
            brand: "H&M",
            price: "₹499",
            oldPrice: "₹999",
            discount: "50% OFF",
            image: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            rating: 4.1,
            reviews: "3.4k"
        },
        {
            id: 5,
            name: "Striped Cotton Shirt",
            brand: "Zara",
            price: "₹1599",
            oldPrice: "₹2299",
            discount: "30% OFF",
            image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            rating: 4.4,
            reviews: "500"
        },
        {
            id: 6,
            name: "Denim Jacket",
            brand: "Levi's",
            price: "₹2999",
            oldPrice: "₹4999",
            discount: "40% OFF",
            image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            rating: 4.8,
            reviews: "1.1k"
        },
        {
            id: 7,
            name: "Casual Shorts",
            brand: "Adidas",
            price: "₹999",
            oldPrice: "₹1799",
            discount: "45% OFF",
            image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            rating: 4.3,
            reviews: "900"
        },
        {
            id: 8,
            name: "Printed Hoodie",
            brand: "Jack & Jones",
            price: "₹1499",
            oldPrice: "₹2999",
            discount: "50% OFF",
            image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            rating: 4.6,
            reviews: "1.5k"
        }
    ];

    return (
        <div className="bg-white min-h-screen">
            {/* Breadcrumb & Title */}
            <div className="border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                        <Link to="/" className="hover:text-black">Home</Link>
                        <span className="mx-2">/</span>
                        <span className="capitalize text-black font-medium">{categoryName ? categoryName.replace(/-/g, ' ') : 'All Products'}</span>
                    </div>

                    {/* Filters Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setFilterOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:border-black transition-colors"
                            >
                                <FiFilter size={18} />
                                <span className="font-medium">Filters</span>
                            </button>
                            <div className="hidden sm:block w-px h-8 bg-gray-200"></div>
                            <span className="text-gray-500">Showing {products.length} Results</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <button
                                    onClick={() => setSortOpen(!isSortOpen)}
                                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:border-black transition-colors"
                                >
                                    <span className="text-gray-600">Sort by:</span>
                                    <span className="font-medium capitalize">{sortBy.replace('-', ' ')}</span>
                                    <FiChevronDown className={`transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isSortOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-1">
                                        {[
                                            { label: 'Recommended', value: 'recommended' },
                                            { label: 'Price: Low to High', value: 'price-low-high' },
                                            { label: 'Price: High to Low', value: 'price-high-low' },
                                            { label: 'Newest Arrivals', value: 'newest' }
                                        ].map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => {
                                                    setSortBy(option.value);
                                                    setSortOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${sortBy === option.value ? 'font-bold text-black' : 'text-gray-600'}`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={{
                                ...product,
                                category: product.brand, // Mapping brand to category field for display
                                tag: product.discount // Using discount as tag
                            }}
                        />
                    ))}
                </div>
            </div>

            <Transition show={isFilterOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={setFilterOpen}>
                    <TransitionChild
                        as={Fragment}
                        enter="ease-in-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in-out duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/50 transition-opacity" />
                    </TransitionChild>

                    <div className="fixed inset-0 overflow-hidden">
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full pr-10">
                                <TransitionChild
                                    as={Fragment}
                                    enter="transform transition ease-in-out duration-300 sm:duration-300"
                                    enterFrom="-translate-x-full"
                                    enterTo="translate-x-0"
                                    leave="transform transition ease-in-out duration-300 sm:duration-300"
                                    leaveFrom="translate-x-0"
                                    leaveTo="-translate-x-full"
                                >
                                    <DialogPanel className="pointer-events-auto w-screen max-w-xs">
                                        <div className="flex h-full flex-col bg-white shadow-xl">
                                            {/* Header */}
                                            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                                <h2 className="text-xl font-bold">Filters</h2>
                                                <button
                                                    onClick={() => setFilterOpen(false)}
                                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                                >
                                                    <FiX size={20} />
                                                </button>
                                            </div>

                                            {/* Filter Contents */}
                                            <div className="flex-1 overflow-y-auto p-4 space-y-4"> {/* Reduced space-y-6 to space-y-4 */}

                                                {/* Gender */}
                                                <div className="border-b border-gray-100 pb-4"> {/* Reduced pb-6 to pb-4 */}
                                                    <button
                                                        onClick={() => toggleSection('gender')}
                                                        className="w-full flex items-center justify-between font-medium mb-2"
                                                    >
                                                        <span>Gender</span>
                                                        {expandedSections.gender ? <FiMinus size={14} /> : <FiPlus size={14} />}
                                                    </button>
                                                    {expandedSections.gender && (
                                                        <div className="space-y-2">
                                                            {filterOptions.gender.map(option => (
                                                                <label key={option} className="flex items-center gap-3 cursor-pointer group">
                                                                    <div className="relative flex items-center">
                                                                        <input type="checkbox" className="peer h-4 w-4 rounded border-gray-300 text-black focus:ring-black" />
                                                                    </div>
                                                                    <span className="text-sm text-gray-600 group-hover:text-black">{option}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Size */}
                                                <div className="border-b border-gray-100 pb-4">
                                                    <button
                                                        onClick={() => toggleSection('size')}
                                                        className="w-full flex items-center justify-between font-medium mb-2"
                                                    >
                                                        <span>Size</span>
                                                        {expandedSections.size ? <FiMinus size={14} /> : <FiPlus size={14} />}
                                                    </button>
                                                    {expandedSections.size && (
                                                        <div className="space-y-2">
                                                            {filterOptions.size.map(option => (
                                                                <label key={option} className="flex items-center gap-3 cursor-pointer group">
                                                                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black" />
                                                                    <span className="text-sm text-gray-600 group-hover:text-black">{option}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Color */}
                                                <div className="border-b border-gray-100 pb-4">
                                                    <button
                                                        onClick={() => toggleSection('color')}
                                                        className="w-full flex items-center justify-between font-medium mb-2"
                                                    >
                                                        <span>Color</span>
                                                        {expandedSections.color ? <FiMinus size={14} /> : <FiPlus size={14} />}
                                                    </button>
                                                    {expandedSections.color && (
                                                        <div className="space-y-2">
                                                            {filterOptions.color.map(option => (
                                                                <label key={option.name} className="flex items-center gap-3 cursor-pointer group">
                                                                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black" />
                                                                    <div className="flex items-center gap-2">
                                                                        <span
                                                                            className={`w-4 h-4 rounded-full border ${option.border ? 'border-gray-200' : 'border-transparent'}`}
                                                                            style={{ backgroundColor: option.hex }}
                                                                        ></span>
                                                                        <span className="text-sm text-gray-600 group-hover:text-black">{option.name}</span>
                                                                    </div>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Price Range */}
                                                <div className="border-b border-gray-100 pb-4">
                                                    <button
                                                        onClick={() => toggleSection('price')}
                                                        className="w-full flex items-center justify-between font-medium mb-2"
                                                    >
                                                        <span>Price</span>
                                                        {expandedSections.price ? <FiMinus size={14} /> : <FiPlus size={14} />}
                                                    </button>
                                                    {expandedSections.price && (
                                                        <div className="px-2">
                                                            <input type="range" min="0" max="10000" className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black" />
                                                            <div className="flex justify-between mt-2 text-sm text-gray-500">
                                                                <span>₹0</span>
                                                                <span>₹10,000+</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Discount */}
                                                <div className="border-b border-gray-100 pb-4">
                                                    <button
                                                        onClick={() => toggleSection('discount')}
                                                        className="w-full flex items-center justify-between font-medium mb-2"
                                                    >
                                                        <span>Discount</span>
                                                        {expandedSections.discount ? <FiMinus size={14} /> : <FiPlus size={14} />}
                                                    </button>
                                                    {expandedSections.discount && (
                                                        <div className="space-y-2">
                                                            {filterOptions.discount.map(option => (
                                                                <label key={option} className="flex items-center gap-3 cursor-pointer group">
                                                                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black" />
                                                                    <span className="text-sm text-gray-600 group-hover:text-black">{option}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Rating */}
                                                <div className="border-b border-gray-100 pb-4">
                                                    <button
                                                        onClick={() => toggleSection('rating')}
                                                        className="w-full flex items-center justify-between font-medium mb-2"
                                                    >
                                                        <span>Rating</span>
                                                        {expandedSections.rating ? <FiMinus size={14} /> : <FiPlus size={14} />}
                                                    </button>
                                                    {expandedSections.rating && (
                                                        <div className="space-y-2">
                                                            {filterOptions.rating.map(option => (
                                                                <label key={option} className="flex items-center gap-3 cursor-pointer group">
                                                                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black" />
                                                                    <span className="text-sm text-gray-600 group-hover:text-black">{option}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Product Type */}
                                                <div className="border-b border-gray-100 pb-4">
                                                    <button
                                                        onClick={() => toggleSection('productType')}
                                                        className="w-full flex items-center justify-between font-medium mb-2"
                                                    >
                                                        <span>Product Type</span>
                                                        {expandedSections.productType ? <FiMinus size={14} /> : <FiPlus size={14} />}
                                                    </button>
                                                    {expandedSections.productType && (
                                                        <div className="space-y-2">
                                                            {filterOptions.productType.map(option => (
                                                                <label key={option} className="flex items-center gap-3 cursor-pointer group">
                                                                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black" />
                                                                    <span className="text-sm text-gray-600 group-hover:text-black">{option}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Brand */}
                                                <div className="pb-4">
                                                    <button
                                                        onClick={() => toggleSection('brand')}
                                                        className="w-full flex items-center justify-between font-medium mb-2"
                                                    >
                                                        <span>Brand</span>
                                                        {expandedSections.brand ? <FiMinus size={14} /> : <FiPlus size={14} />}
                                                    </button>
                                                    {expandedSections.brand && (
                                                        <div className="space-y-2">
                                                            {filterOptions.brand.map(option => (
                                                                <label key={option} className="flex items-center gap-3 cursor-pointer group">
                                                                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black" />
                                                                    <span className="text-sm text-gray-600 group-hover:text-black">{option}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                            </div>

                                            {/* Footer */}
                                            <div className="p-4 border-t border-gray-100 bg-white">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <button
                                                        onClick={() => setFilterOpen(false)}
                                                        className="px-4 py-3 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => setFilterOpen(false)}
                                                        className="px-4 py-3 rounded-lg bg-black text-white font-medium hover:bg-gray-800 transition-colors"
                                                    >
                                                        Apply
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </DialogPanel>
                                </TransitionChild>
                            </div>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
}
