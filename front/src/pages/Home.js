import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBestSellers, fetchNewArrivals, fetchProducts } from '../redux/slice/product.slice';
import { fetchBanners } from '../redux/slice/banner.slice';
import HeroSection from '../components/HeroSection';
import CategorySection from '../components/CategorySection';
import ProductCard from '../components/ProductCard';
import OfferBanner from '../components/OfferBanner';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

export default function Home() {
    const dispatch = useDispatch();
    const { newArrivals, bestSellers, products: allProducts, loading } = useSelector((state) => state.product);
    const { banners } = useSelector((state) => state.banner);

    useEffect(() => {
        dispatch(fetchNewArrivals());
        dispatch(fetchBestSellers());
        dispatch(fetchProducts({ limit: 8 }));
        dispatch(fetchBanners());
    }, [dispatch]);

    const displayProducts = allProducts.length > 0 ? allProducts : [];
    const displayNewArrivals = newArrivals.length > 0 ? newArrivals : [];
    const displayBestSellers = bestSellers.length > 0 ? bestSellers : [];

    return (
        <div className="bg-white">
            {/* 1. Hero Section */}
            <HeroSection />

            {/* 2. Category Grid/Slider */}
            <CategorySection />

            {/* 3. Most Popular */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 uppercase">Most Popular</h2>
                    <Link to="/category/all-products" className="hidden sm:block text-xs font-bold text-gray-500 hover:text-black uppercase tracking-wider relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-gray-300">
                        View All &rarr;
                    </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {displayProducts.map((product) => (
                        <ProductCard key={product._id || product.id || Math.random()} product={product} />
                    ))}
                </div>
            </section>

            {/* 4. Banner 1 */}
            {banners && banners.length > 0 ? (
                <OfferBanner
                    title={banners[0].title}
                    subtitle={banners[0].subtitle}
                    image={banners[0].image}
                    buttonText={banners[0].buttonText}
                    link={banners[0].link}
                    reverse={banners[0].textPosition === 'right'}
                    textColor={banners[0].textColor}
                    highlightColor={banners[0].highlightColor}
                    buttonColor={banners[0].buttonColor}
                    bgColor={banners[0].backgroundColor}
                    textPosition={banners[0].textPosition}
                />
            ) : (
                <OfferBanner
                    title="Get [Exclusive] Offers on Denims!"
                    subtitle="Up to 40% off on all Denim products."
                    image="https://images.unsplash.com/photo-1582418702059-97ebafb35d09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                    bgColor="bg-gray-100"
                />
            )}

            {/* 5. New Arrivals */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 uppercase">New Arrivals</h2>
                    <Link to="/category/new-arrivals" className="hidden sm:block text-xs font-bold text-gray-500 hover:text-black uppercase tracking-wider relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-gray-300">
                        View All &rarr;
                    </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {displayNewArrivals.map((product) => (
                        <ProductCard key={`na-${product._id || product.id}`} product={product} />
                    ))}
                </div>
            </section>

            {/* 6. Best Sellers */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 uppercase">Best Sellers</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-8">
                    {displayBestSellers.map((product) => (
                        <ProductCard key={`bs-${product._id || product.id}`} product={product} />
                    ))}
                </div>
            </section>

            {/* 7. Banner 2 */}
            {banners && banners.length > 1 ? (
                <OfferBanner
                    title={banners[1].title}
                    subtitle={banners[1].subtitle}
                    image={banners[1].image}
                    buttonText={banners[1].buttonText}
                    link={banners[1].link}
                    reverse={banners[1].textPosition === 'right' || true}
                    textColor={banners[1].textColor}
                    highlightColor={banners[1].highlightColor}
                    buttonColor={banners[1].buttonColor}
                    bgColor={banners[1].backgroundColor}
                    textPosition={banners[1].textPosition}
                />
            ) : (
                <OfferBanner
                    title="Get Exclusive Offers on [New Arrivals]!"
                    subtitle="Check out the latest collections."
                    image="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                    reverse={true}
                    bgColor="bg-gray-100"
                />
            )}

            {/* 8. Shop For Style */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 uppercase">Shop For Style</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {displayProducts.map((product) => (
                        <ProductCard key={`sfs-${product._id || product.id}`} product={product} />
                    ))}
                </div>
            </section>

            {/* 9. Top Checks (Bottom Grid) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-12">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 uppercase">Top Checks</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {displayProducts.slice().reverse().map((product) => (
                        <ProductCard key={`tc-${product._id || product.id}`} product={product} />
                    ))}
                </div>
            </section>

            {/* 10. Footer */}

        </div>
    );
}