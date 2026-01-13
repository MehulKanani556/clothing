import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBestSellers, fetchNewArrivals, fetchProducts, fetchMostPopular } from '../redux/slice/product.slice';
import { fetchBanners } from '../redux/slice/banner.slice';
import { fetchHomeSettings } from '../redux/slice/adminHome.slice';
import HeroSection from '../components/HeroSection';
import CategorySection from '../components/CategorySection';
import ProductCard from '../components/ProductCard';
import OfferBanner from '../components/OfferBanner';
import { Link } from 'react-router-dom';

export default function Home() {
    const dispatch = useDispatch();
    const { newArrivals, bestSellers, mostPopular, products: allProducts } = useSelector((state) => state.product);
    const { banners } = useSelector((state) => state.banner);
    const {
        layout,
        bannerConfig,
        bannerSelections,
        loading: loadingLayout
    } = useSelector((state) => state.adminHome);

    useEffect(() => {
        dispatch(fetchNewArrivals({ limit: 12 })); // Pass limit if backend accepts it via query, otherwise standard fetch
        dispatch(fetchMostPopular({ limit: 8 }));
        dispatch(fetchBestSellers());
        dispatch(fetchProducts({ limit: 8 }));
        dispatch(fetchBanners());
        dispatch(fetchHomeSettings());
    }, [dispatch]);

    // Derived state: Assign banners to slots based on explicit selections
    const bannerAssignments = useMemo(() => {
        const assignments = {};
        const availableBanners = banners || [];

        layout.forEach(sectionKey => {
            if (sectionKey.startsWith('banner_slot')) {
                const mode = bannerConfig[sectionKey] || 'single';
                const selectedIds = bannerSelections[sectionKey] || [];

                // Map selected IDs to actual banner objects
                const assignedItems = [];
                const requiredCount = mode === 'triple' ? 3 : (mode === 'split' ? 2 : 1);

                for (let i = 0; i < requiredCount; i++) {
                    const id = selectedIds[i];
                    const found = availableBanners.find(b => b._id === id || b.id === id);
                    assignedItems.push(found || null);
                }

                assignments[sectionKey] = {
                    mode: mode,
                    items: assignedItems
                };
            }
        });
        return assignments;
    }, [layout, bannerConfig, bannerSelections, banners]);

    const displayProducts = allProducts.length > 0 ? allProducts : [];
    const displayNewArrivals = newArrivals.length > 0 ? newArrivals : [];
    const displayBestSellers = bestSellers.length > 0 ? bestSellers : [];
    const displayMostPopular = mostPopular && mostPopular.length > 0 ? mostPopular : [];

    // --- RENDER HELPERS ---

    const renderBannerItem = (banner, key, isSplit = false) => {
        if (!banner) return null;

        return (
            <div key={key} className={`relative overflow-hidden group ${isSplit ? 'h-full' : ''}`}>
                <OfferBanner
                    title={banner.title}
                    subtitle={banner.subtitle}
                    image={banner.image}
                    buttonText={banner.buttonText}
                    link={banner.link}
                    reverse={!isSplit && banner.textPosition === 'right'}
                    textColor={banner.textColor}
                    highlightColor={banner.highlightColor}
                    buttonColor={banner.buttonColor}
                    bgColor={banner.backgroundColor}
                    textPosition={isSplit ? 'center' : banner.textPosition}
                />
            </div>
        );
    };

    const renderBannerSlot = (slotKey) => {
        const assignment = bannerAssignments[slotKey];
        if (!assignment) return null; // No assignment found

        const mode = assignment.mode;
        const isSplit = mode === 'split';
        const isTriple = mode === 'triple';
        const items = assignment.items;

        // If no banners assigned at all for this slot (e.g. out of banners/empty selection)
        if (items.every(item => item === null)) return null;

        if (isTriple) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto px-4 sm:px-6">
                    {renderBannerItem(items[0], 'b1', true)}
                    {items[1] && renderBannerItem(items[1], 'b2', true)}
                    {items[2] && renderBannerItem(items[2], 'b3', true)}
                </div>
            );
        }

        if (isSplit) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-7xl mx-auto px-4 sm:px-6">
                    {renderBannerItem(items[0], 'b1', true)}
                    {items[1] && renderBannerItem(items[1], 'b2', true)}
                </div>
            );
        }

        return (
            <div className="">
                {renderBannerItem(items[0], 'b1', false)}
            </div>
        );
    };

    const renderSection = (key) => {
        if (key.startsWith('banner_slot')) {
            return renderBannerSlot(key);
        }

        switch (key) {
            case 'hero_section':
                return <HeroSection key="hero" />;
            case 'category_section':
                return <CategorySection key="category" />;
            case 'most_popular':
                return (
                    <section key="most_popular" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold tracking-tight text-gray-900 uppercase">Most Popular</h2>
                            <Link to="/most-popular" className="hidden sm:block text-xs font-bold text-gray-500 hover:text-black uppercase tracking-wider relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-gray-300">
                                View All &rarr;
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {displayMostPopular.map((product) => (
                                <ProductCard key={product._id || product.id || Math.random()} product={product} />
                            ))}
                        </div>
                    </section>
                );
            case 'new_arrivals':
                return (
                    <section key="new_arrivals" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold tracking-tight text-gray-900 uppercase">New Arrivals</h2>
                            <Link to="/new-arrivals" className="hidden sm:block text-xs font-bold text-gray-500 hover:text-black uppercase tracking-wider relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-gray-300">
                                View All &rarr;
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {displayNewArrivals.slice(0, 8).map((product) => (
                                <ProductCard key={`na-${product._id || product.id}`} product={product} />
                            ))}
                        </div>
                    </section>
                );
            case 'best_sellers':
                return (
                    <section key="best_sellers" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold tracking-tight text-gray-900 uppercase">Best Sellers</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-8">
                            {displayBestSellers.map((product) => (
                                <ProductCard key={`bs-${product._id || product.id}`} product={product} />
                            ))}
                        </div>
                    </section>
                );
            case 'shop_style':
                return (
                    <section key="shop_style" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold tracking-tight text-gray-900 uppercase">Shop For Style</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {displayProducts.map((product) => (
                                <ProductCard key={`sfs-${product._id || product.id}`} product={product} />
                            ))}
                        </div>
                    </section>
                );
            case 'top_checks':
                return (
                    <section key="top_checks" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-12">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold tracking-tight text-gray-900 uppercase">Top Checks</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {displayProducts.slice().reverse().map((product) => (
                                <ProductCard key={`tc-${product._id || product.id}`} product={product} />
                            ))}
                        </div>
                    </section>
                );
            default:
                return null;
        }
    };

    if (loadingLayout) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="bg-white">
            {layout.map((key) => (
                <React.Fragment key={key}>
                    {renderSection(key)}
                </React.Fragment>
            ))}
        </div>
    );
}