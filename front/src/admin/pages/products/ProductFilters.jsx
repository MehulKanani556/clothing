import React, { useState } from 'react';
import { MdSearch, MdStar, MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';

const ProductFilters = ({ products, filters, setFilters }) => {
    // Derived Data for Facets
    const categories = React.useMemo(() => {
        const counts = {};
        products.forEach(p => {
            const name = p.category?.name || 'Uncategorized';
            counts[name] = (counts[name] || 0) + 1;
        });
        return Object.entries(counts).map(([name, count]) => ({ name, count }));
    }, [products]);

    const brands = React.useMemo(() => {
        const counts = {};
        products.forEach(p => {
            if (p.brand) {
                counts[p.brand] = (counts[p.brand] || 0) + 1;
            }
        });
        return Object.entries(counts).map(([name, count]) => ({ name, count }));
    }, [products]);

    // Derived Rating Counts
    const ratingCounts = React.useMemo(() => {
        const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        products.forEach(p => {
            const rating = Math.floor(p.rating?.average || p.averageRating || 0);
            if (rating >= 1 && rating <= 5) {
                // Inclusive Logic: 4 stars includes 5 stars? Usually filters are "4 stars & up"
                // Let's count exact integers for distributions, but filtering is usually >=
                counts[rating] = (counts[rating] || 0) + 1;
            }
        });

        // Accumulate for "X & up"
        const upCounts = {
            5: counts[5],
            4: counts[5] + counts[4],
            3: counts[5] + counts[4] + counts[3],
            2: counts[5] + counts[4] + counts[3] + counts[2],
            1: products.length // Generally all products have at least 1 star or 0, but effectively 0 is unrated.
        };
        return upCounts;
    }, [products]);

    // Handle Checkbox Changes
    const handleCategoryChange = (name) => {
        const newCategories = filters.categories.includes(name)
            ? filters.categories.filter(c => c !== name)
            : [...filters.categories, name];
        setFilters({ ...filters, categories: newCategories });
    };

    const handleBrandChange = (name) => {
        const newBrands = filters.brands.includes(name)
            ? filters.brands.filter(b => b !== name)
            : [...filters.brands, name];
        setFilters({ ...filters, brands: newBrands });
    };

    const handleRatingChange = (rating) => {
        // Toggle rating filter (single select behavior for simplicity or multi?)
        // Usually rating is "at least X". Toggling off if selected again.
        const newRating = filters.rating === rating ? null : rating;
        setFilters({ ...filters, rating: newRating });
    };

    return (
        <div className="bg-white p-5 rounded-xl border border-gray-200 text-gray-700 shadow-sm">
            {/* Search */}
            <div className="relative mb-6">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <MdSearch size={20} />
                </span>
                <input
                    type="text"
                    placeholder="Search product..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full py-2.5 pl-10 pr-4 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
                />
            </div>

            {/* Categories */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-gray-900">Category</h3>
                    <button className="text-xs text-black hover:text-gray-700 hover:underline" onClick={() => setFilters({ ...filters, categories: [] })}>Clear</button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {categories.map((cat) => (
                        <label key={cat.name} className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors" onClick={() => handleCategoryChange(cat.name)}>
                            <div className="flex items-center gap-3">
                                <div className={`text-xl ${filters.categories.includes(cat.name) ? 'text-black' : 'text-gray-300 group-hover:text-gray-400'}`}>
                                    {filters.categories.includes(cat.name) ? <MdCheckBox /> : <MdCheckBoxOutlineBlank />}
                                </div>
                                <span className={`text-sm ${filters.categories.includes(cat.name) ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>{cat.name}</span>
                            </div>
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{cat.count}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="border-t border-gray-100 my-4"></div>

            {/* Brands */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-gray-900">Brands</h3>
                    <button className="text-xs text-black hover:text-gray-700 hover:underline" onClick={() => setFilters({ ...filters, brands: [] })}>Clear</button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {brands.map((brand) => (
                        <label key={brand.name} className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors" onClick={() => handleBrandChange(brand.name)}>
                            <div className="flex items-center gap-3">
                                <div className={`text-xl ${filters.brands.includes(brand.name) ? 'text-black' : 'text-gray-300 group-hover:text-gray-400'}`}>
                                    {filters.brands.includes(brand.name) ? <MdCheckBox /> : <MdCheckBoxOutlineBlank />}
                                </div>
                                <span className={`text-sm ${filters.brands.includes(brand.name) ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>{brand.name}</span>
                            </div>
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{brand.count}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="border-t border-gray-100 my-4"></div>

            {/* Ratings */}
            <div className="mb-2">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-gray-900">Rating</h3>
                    {filters.rating && (
                        <button className="text-xs text-black hover:text-gray-700 hover:underline" onClick={() => setFilters({ ...filters, rating: null })}>Clear</button>
                    )}
                </div>
                <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => (
                        <label key={star} className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors" onClick={() => handleRatingChange(star)}>
                            <div className="flex items-center gap-3">
                                <div className={`text-xl ${filters.rating === star ? 'text-black' : 'text-gray-300 group-hover:text-gray-400'}`}>
                                    {filters.rating === star ? <MdCheckBox /> : <MdCheckBoxOutlineBlank />}
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                            <MdStar key={i} className={i < star ? "" : "text-gray-200"} />
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-600">& up</span>
                                </div>
                            </div>
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{ratingCounts[star] || 0}</span>
                        </label>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e5e7eb;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #d1d5db;
                }
            `}</style>
        </div>
    );
};

export default ProductFilters;
