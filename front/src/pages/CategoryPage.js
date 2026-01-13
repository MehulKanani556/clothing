import React, { useState, Fragment, useEffect, useMemo } from 'react';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductsBySlug } from '../redux/slice/product.slice';
import { FiFilter, FiGrid, FiList, FiX, FiMinus, FiPlus, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import CustomSelect from '../admin/components/common/CustomSelect';

export default function CategoryPage() {
    const { slug } = useParams();
    const location = useLocation();
    const dispatch = useDispatch();
    const { products, loading, categoryDetails, totalPages, currentPage: serverPage, totalProducts } = useSelector((state) => state.product);

    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('recommended');
    const [isFilterOpen, setFilterOpen] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);

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

    // Fetch products and category details when slug, sort, search, filters or page changes
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const searchQuery = searchParams.get('search');

        // Prepare params for server-side processing
        const params = {
            page: currentPage,
            limit: 12, // Match backend default or itemPerPage
            sort: sortBy,
            search: searchQuery,
            minPrice: filters.priceRange[0],
            maxPrice: filters.priceRange[1],
        };

        // Add array filters if present (joining for backend)
        if (filters.gender.length > 0) params.gender = filters.gender.join('|'); // Regex friendly join
        if (filters.brand.length > 0) params.brand = filters.brand.join(',');
        if (filters.color.length > 0) params.color = filters.color.join(',');
        if (filters.size.length > 0) params.size = filters.size.join(',');

        // Note: discount, rating, productType are not currently supported by backend query params, 
        // but are kept in state for UI consistency or future implementation.

        if (slug) {
            dispatch(fetchProductsBySlug({ slug, params }));
        }
    }, [dispatch, slug, sortBy, location.search, currentPage, filters]); // Added filters and currentPage dependencies

    // Derive available filters from CURRENT PAGE products (limitation of server-side pagination without facet API)
    const derivedFilters = useMemo(() => {
        const sizes = new Set();
        const colors = new Map();
        const brands = new Set();
        const productTypes = new Set();
        let maxPrice = 0;

        // Ensure products is an array
        const productList = Array.isArray(products) ? products : [];

        productList.forEach(product => {
            // Brand
            if (product.brand) brands.add(product.brand);

            // Product Type (using subCategory name)
            if (product.subCategory?.name) productTypes.add(product.subCategory.name);

            if (product.variants && Array.isArray(product.variants)) {
                product.variants.forEach(variant => {
                    if (variant.color) {
                        if (!colors.has(variant.color)) {
                            colors.set(variant.color, variant.colorCode || '#000000');
                        }
                    }
                    if (variant.options && Array.isArray(variant.options)) {
                        variant.options.forEach(opt => {
                            if (opt.size) sizes.add(opt.size);
                            if (opt.price) {
                                maxPrice = Math.max(maxPrice, opt.price);
                            }
                        });
                    }
                });
            }
        });

        // Sort sizes
        const sizeOrder = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL'];
        const sortedSizes = Array.from(sizes).sort((a, b) => {
            const indexA = sizeOrder.indexOf(a);
            const indexB = sizeOrder.indexOf(b);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            return a.localeCompare(b);
        });

        const sortedColors = Array.from(colors.entries()).map(([name, hex]) => ({
            name,
            hex,
            border: hex.toUpperCase() === '#FFFFFF' || name.toLowerCase() === 'white'
        }));

        return {
            sizes: sortedSizes,
            colors: sortedColors,
            brands: Array.from(brands).sort(),
            productTypes: Array.from(productTypes).sort(),
            maxPrice: Math.ceil(maxPrice / 1000) * 1000 || 10000 // Round up to nearest 1000
        };
    }, [products]);

    // Temp Filter state for sidebar (applied only on "Apply")
    const [tempFilters, setTempFilters] = useState(filters);

    // Sync temp filters with actual filters when sidebar opens
    useEffect(() => {
        if (isFilterOpen) {
            setTempFilters(filters);
        }
    }, [isFilterOpen, filters]);

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
        setTempFilters(prev => {
            const sectionFilters = prev[section];
            const isSelected = sectionFilters.includes(value);
            const newFilters = isSelected
                ? sectionFilters.filter(item => item !== value)
                : [...sectionFilters, value];

            return { ...prev, [section]: newFilters };
        });
    };

    const handlePriceChange = (e) => {
        setTempFilters(prev => ({ ...prev, priceRange: [0, parseInt(e.target.value)] }));
    };

    const handleApplyFilters = () => {
        setFilters(tempFilters);
        setCurrentPage(1);
        setFilterOpen(false);
    };

    const isAnyFilterSelected =
        tempFilters.gender.length > 0 ||
        tempFilters.size.length > 0 ||
        tempFilters.color.length > 0 ||
        tempFilters.discount.length > 0 ||
        tempFilters.rating.length > 0 ||
        tempFilters.productType.length > 0 ||
        tempFilters.brand.length > 0 ||
        tempFilters.priceRange[1] !== 10000;

    const handleClearFilters = () => {
        const clearedFilters = {
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
        };
        setTempFilters(clearedFilters);
        setFilters(clearedFilters);
        setCurrentPage(1);
        setFilterOpen(false);
    };

    const filterOptions = {
        gender: ['Men', 'Women', 'Unisex'], // Updated to include Unisex based on data
        size: derivedFilters.sizes,
        color: derivedFilters.colors,
        discount: ['10% or more', '20% or more', '30% or more', '40% or more', '50% or more'],
        rating: ['4★ & above', '3★ & above', '2★ & above'],
        productType: derivedFilters.productTypes,
        brand: derivedFilters.brands
    };

    // Pagination Logic
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="bg-white min-h-screen">
            {/* Breadcrumb & Title */}
            <div className="border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center text-sm text-gray-500 mb-4 overflow-x-auto whitespace-nowrap pb-1">
                        {/* {location.pathname === '/' ? null : <Link to="/" className="hover:text-black">Home</Link>} */}
                        {categoryDetails?.breadcrumbs ? (
                            categoryDetails.breadcrumbs.map((crumb, index) => (
                                <React.Fragment key={index}>
                                    <Link
                                        to={crumb.slug}
                                        className={`hover:text-black ${index === categoryDetails.breadcrumbs.length - 1 ? 'text-black font-medium capitalize' : ''}`}
                                    >
                                        {crumb.name}
                                    </Link>
                                    {index < categoryDetails.breadcrumbs.length - 1 && <span className="mx-2">/</span>}
                                </React.Fragment>
                            ))
                        ) : (
                            <>
                                <Link to="/" className="hover:text-black">Home</Link>
                                <span className="mx-2">/</span>
                                <span className="capitalize text-black font-medium">{slug}</span>
                            </>
                        )}
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
                            <span className="text-gray-500">Showing {totalProducts || products.length} Results</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <CustomSelect
                                value={sortBy}
                                options={[
                                    { label: 'Recommended', value: 'recommended' },
                                    { label: 'Price: Low to High', value: 'price-low-high' },
                                    { label: 'Price: High to Low', value: 'price-high-low' },
                                    { label: 'Newest Arrivals', value: 'newest' }
                                ]}
                                onChange={setSortBy}
                                className="w-56"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="flex justify-center py-20">
                        {/* Simple loading state */}
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                        {products.map((product) => (
                            <ProductCard
                                key={product._id || product.id}
                                product={{
                                    ...product,
                                    category: product.brand, // Mapping brand to category field for display
                                    tag: (product.variants?.[0]?.options?.[0]?.mrp && product.variants?.[0]?.options?.[0]?.price) ?
                                        `${Math.round(((product.variants[0].options[0].mrp - product.variants[0].options[0].price) / product.variants[0].options[0].mrp) * 100)}% OFF` :
                                        null
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

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-end items-center gap-2 pt-8">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`p-2 rounded-lg border border-gray-200 transition-colors ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:border-black hover:text-black'
                                }`}
                        >
                            <FiChevronLeft size={20} />
                        </button>

                        {/* Simple Pagination Range: Show current, prev, next, first, last or just simple mapping. 
                        For safe large number handling, we might want to truncate, but for now map up to totalPages if small. 
                        Assuming strict limit is not an issue for now. */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => {
                            // Logic to hide too many pages if totalPages is large could go here
                            if (totalPages > 7 && Math.abs(currentPage - number) > 2 && number !== 1 && number !== totalPages) {
                                if (number === 2 || number === totalPages - 1) return <span key={number} className="px-1">...</span>;
                                return null;
                            }

                            return (
                                <button
                                    key={number}
                                    onClick={() => handlePageChange(number)}
                                    className={`w-10 h-10 rounded-lg border transition-colors ${currentPage === number
                                        ? 'bg-black text-white border-black'
                                        : 'border-gray-200 text-gray-600 hover:border-black hover:text-black'
                                        }`}
                                >
                                    {number}
                                </button>
                            )
                        })}

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`p-2 rounded-lg border border-gray-200 transition-colors ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:border-black hover:text-black'
                                }`}
                        >
                            <FiChevronRight size={20} />
                        </button>
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
                                                                            checked={tempFilters.gender.includes(option)}
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
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={tempFilters.size.includes(option)}
                                                                        onChange={() => handleFilterChange('size', option)}
                                                                        className="h-4 w-4 rounded border-gray-300 accent-black focus:ring-black"
                                                                    />
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
                                                                        checked={tempFilters.color.includes(option.name)}
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
                                                                max={derivedFilters.maxPrice} // Dynamic Max
                                                                step="100"
                                                                value={Math.min(tempFilters.priceRange[1], derivedFilters.maxPrice)} // Clamp value
                                                                onChange={handlePriceChange}
                                                                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                                                            />
                                                            <div className="flex justify-between mt-2 text-sm text-gray-500">
                                                                <span>₹0</span>
                                                                <span>₹{tempFilters.priceRange[1].toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Discount (Visual Only) */}
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
                                                                        checked={tempFilters.discount.includes(option)}
                                                                        onChange={() => handleFilterChange('discount', option)}
                                                                        className="h-4 w-4 rounded border-gray-300 accent-black focus:ring-black"
                                                                    />
                                                                    <span className="text-sm text-gray-600 group-hover:text-black">{option}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Rating (Visual Only) */}
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
                                                                        checked={tempFilters.rating.includes(option)}
                                                                        onChange={() => handleFilterChange('rating', option)}
                                                                        className="h-4 w-4 rounded border-gray-300 accent-black focus:ring-black"
                                                                    />
                                                                    <span className="text-sm text-gray-600 group-hover:text-black">{option}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Product Type (Visual Only) */}
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
                                                                        checked={tempFilters.productType.includes(option)}
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
                                                                        checked={tempFilters.brand.includes(option)}
                                                                        onChange={() => handleFilterChange('brand', option)}
                                                                        className="h-4 w-4 rounded border-gray-300 accent-black focus:ring-black"
                                                                    />
                                                                    <span className="text-sm text-gray-600 group-hover:text-black">{option}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="p-4 border-t border-gray-100 bg-white">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <button
                                                            onClick={handleClearFilters}
                                                            className="px-4 py-3 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                                        >
                                                            {isAnyFilterSelected ? 'Clear' : 'Cancel'}
                                                        </button>
                                                        <button
                                                            onClick={handleApplyFilters}
                                                            className="px-4 py-3 rounded-lg bg-black text-white font-medium hover:bg-gray-800 transition-colors"
                                                        >
                                                            Apply
                                                        </button>
                                                    </div>
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
