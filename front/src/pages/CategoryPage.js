import React, { useState, Fragment, useEffect } from 'react';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../redux/slice/product.slice';
import { fetchCategoryById } from '../redux/slice/category.slice';
import { FiFilter, FiChevronDown, FiGrid, FiList, FiX, FiMinus, FiPlus } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';

export default function CategoryPage() {
    const { id } = useParams();
    const location = useLocation();
    const dispatch = useDispatch();
    const { products: allProducts, loading } = useSelector((state) => state.product);
    const { categoryDetails } = useSelector((state) => state.category);

    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('recommended');
    const [isSortOpen, setSortOpen] = useState(false);
    const [isFilterOpen, setFilterOpen] = useState(false);

    // Fetch products and category details when id, sort or search changes
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const searchQuery = searchParams.get('search');
        const subQuery = searchParams.get('sub');

        const params = {
            category: id !== 'all-products' ? id : undefined,
            sort: sortBy,
            search: searchQuery,
            subCategory: subQuery
        };
        dispatch(fetchProducts(params));

        if (id && id !== 'all-products') {
            dispatch(fetchCategoryById(id));
        }
    }, [dispatch, id, sortBy, location.search]);

    const products = allProducts.length > 0 ? allProducts : [];

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
        brand: [],
        priceRange: [0, 10000]
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

    const handleFilterChange = (section, value) => {
        setFilters(prev => {
            const sectionFilters = prev[section];
            const isSelected = sectionFilters.includes(value);
            if (isSelected) {
                return { ...prev, [section]: sectionFilters.filter(item => item !== value) };
            } else {
                return { ...prev, [section]: [...sectionFilters, value] };
            }
        });
    };

    const handlePriceChange = (e) => {
        setFilters(prev => ({ ...prev, priceRange: [0, parseInt(e.target.value)] }));
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

    // Filter Logic
    const filteredProducts = products.filter(product => {
        // Gender Filter
        if (filters.gender.length > 0 && !filters.gender.includes(product.gender)) return false;

        // Brand Filter
        if (filters.brand.length > 0 && !filters.brand.includes(product.brand)) return false;

        // Size Filter (Assuming product.sizes is an array)
        if (filters.size.length > 0) {
            const hasSize = product.sizes?.some(size => filters.size.includes(size));
            if (!hasSize) return false;
        }

        // Color Filter (Assuming product.colors is an array of strings or objects)
        if (filters.color.length > 0) {
            const hasColor = product.colors?.some(color => filters.color.includes(typeof color === 'string' ? color : color.name));
            if (!hasColor) return false;
        }

        // Price Filter
        const price = parseInt(product.price?.toString().replace(/[^0-9]/g, '') || 0);
        if (price > filters.priceRange[1]) return false;

        return true;
    });

    // Sort Logic
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortBy === 'price-low-high') {
            const priceA = parseInt(a.price?.toString().replace(/[^0-9]/g, '') || 0);
            const priceB = parseInt(b.price?.toString().replace(/[^0-9]/g, '') || 0);
            return priceA - priceB;
        } else if (sortBy === 'price-high-low') {
            const priceA = parseInt(a.price?.toString().replace(/[^0-9]/g, '') || 0);
            const priceB = parseInt(b.price?.toString().replace(/[^0-9]/g, '') || 0);
            return priceB - priceA;
        } else if (sortBy === 'newest') {
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return 0; // Default: Recommended (no specific sort)
    });



    return (
        <div className="bg-white min-h-screen">
            {/* Breadcrumb & Title */}
            <div className="border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                        <Link to="/" className="hover:text-black">Home</Link>
                        <span className="mx-2">/</span>
                        <span className="capitalize text-black font-medium">{id !== 'all-products' ? categoryDetails?.name || 'Category' : 'All Products'}</span>
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
                            <span className="text-gray-500">Showing {sortedProducts.length} Results</span>
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
                {sortedProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                        {sortedProducts.map((product) => (
                            <ProductCard
                                key={product._id || product.id}
                                product={{
                                    ...product,
                                    category: product.brand, // Mapping brand to category field for display
                                    tag: product.discount // Using discount as tag
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="bg-gray-100 p-6 rounded-full mb-4">
                            <FiFilter className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No Products Found</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            We couldn't find any products matching your current filters or search criteria. Try removing some filters or different keywords.
                        </p>
                    </div>
                )}
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
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={filters.gender.includes(option)}
                                                                            onChange={() => handleFilterChange('gender', option)}
                                                                            className="peer h-4 w-4 rounded border-gray-300 accent-black focus:ring-black"
                                                                        />
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
                                                                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 accent-black focus:ring-black" />
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
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={filters.color.includes(option.name)}
                                                                        onChange={() => handleFilterChange('color', option.name)}
                                                                        className="h-4 w-4 rounded border-gray-300 accent-black focus:ring-black"
                                                                    />
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
                                                            <input
                                                                type="range"
                                                                min="0"
                                                                max="10000"
                                                                value={filters.priceRange[1]}
                                                                onChange={handlePriceChange}
                                                                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                                                            />
                                                            <div className="flex justify-between mt-2 text-sm text-gray-500">
                                                                <span>₹0</span>
                                                                <span>₹{filters.priceRange[1].toLocaleString()}</span>
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
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={filters.discount.includes(option)}
                                                                        onChange={() => handleFilterChange('discount', option)}
                                                                        className="h-4 w-4 rounded border-gray-300 accent-black focus:ring-black"
                                                                    />
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
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={filters.rating.includes(option)}
                                                                        onChange={() => handleFilterChange('rating', option)}
                                                                        className="h-4 w-4 rounded border-gray-300 accent-black focus:ring-black"
                                                                    />
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
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={filters.productType.includes(option)}
                                                                        onChange={() => handleFilterChange('productType', option)}
                                                                        className="h-4 w-4 rounded border-gray-300 accent-black focus:ring-black"
                                                                    />
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
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={filters.brand.includes(option)}
                                                                        onChange={() => handleFilterChange('brand', option)}
                                                                        className="h-4 w-4 rounded border-gray-300 accent-black focus:ring-black"
                                                                    />
                                                                    <span className="text-sm text-gray-600 group-hover:text-black">{option}</span>
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
