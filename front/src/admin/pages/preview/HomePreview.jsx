import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBanners } from '../../../redux/slice/banner.slice';
import OfferBanner from '../../../components/OfferBanner';

export default function HomePreview() {
    const dispatch = useDispatch();
    const { banners, loading } = useSelector((state) => state.banner);
    const [viewMode, setViewMode] = useState('desktop'); // desktop, tablet, mobile

    useEffect(() => {
        dispatch(fetchBanners());
    }, [dispatch]);

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Home Page Preview</h2>

                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('desktop')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'desktop'
                            ? 'bg-white shadow-sm text-black'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Desktop
                    </button>
                    <button
                        onClick={() => setViewMode('tablet')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'tablet'
                            ? 'bg-white shadow-sm text-black'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Tablet
                    </button>
                    <button
                        onClick={() => setViewMode('mobile')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'mobile'
                            ? 'bg-white shadow-sm text-black'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Mobile
                    </button>
                </div>
            </div>

            <div className="bg-gray-100 p-8 rounded-xl border border-gray-200 overflow-hidden flex justify-center min-h-[600px]">
                {/* Preview Container simulating device width */}
                <div
                    className={`bg-white shadow-2xl transition-all duration-300 origin-top overflow-y-auto h-[800px] custom-scrollbar
                        ${viewMode === 'desktop' ? 'w-full max-w-[1400px]' : ''}
                        ${viewMode === 'tablet' ? 'w-[768px]' : ''}
                        ${viewMode === 'mobile' ? 'w-[375px]' : ''}
                    `}
                >
                    {/* Header Placeholder */}
                    <header className="sticky top-0 bg-white z-50 border-b border-gray-100 px-4 py-3 flex items-center justify-between">
                        <div className="w-8 h-8 bg-black rounded flex items-center justify-center text-white font-bold">L</div>
                        <div className="flex gap-4 text-xs font-semibold uppercase text-gray-500">
                            <span className="hidden sm:block">Men</span>
                            <span className="hidden sm:block">Women</span>
                            <span className="hidden sm:block">Kids</span>
                        </div>
                        <div className="flex gap-2">
                            <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                            <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                        </div>
                    </header>

                    {/* Main Content Area mimicking Home.js structure */}
                    <div className="bg-white">
                        {/* 1. Hero Section Placeholder */}
                        <div className="w-full h-[600px] bg-gray-100 flex items-center justify-center border-b border-gray-200 relative">
                            <span className="text-gray-400 font-medium text-lg border-2 border-dashed border-gray-300 p-4 rounded">Hero Slider Section</span>
                        </div>

                        {/* 2. Category Grid/Slider Placeholder */}
                        <section className="py-12 bg-white">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded flex items-center justify-center">
                                    <span className="text-gray-400 font-medium">Category Section</span>
                                </div>
                            </div>
                        </section>

                        {/* 3. Most Popular Placeholder */}
                        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold tracking-tight text-gray-900 uppercase">Most Popular</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 opacity-50">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="h-80 bg-gray-100 rounded"></div>
                                ))}
                            </div>
                        </section>

                        {/* 4. Banner 1 (Real Component) */}
                        <div className="relative border-2 border-dashed border-blue-400 m-2 rounded-lg overflow-hidden">
                            <div className="absolute top-0 left-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 z-10 font-bold uppercase tracking-wider">
                                Banner 1 Position
                            </div>
                            {loading ? (
                                <div className="h-64 flex items-center justify-center bg-gray-50 text-gray-400">Loading Banner 1...</div>
                            ) : (
                                banners && banners.length > 0 ? (
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
                                )
                            )}
                        </div>

                        {/* 5. New Arrivals Placeholder */}
                        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold tracking-tight text-gray-900 uppercase">New Arrivals</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 opacity-50">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="h-80 bg-gray-100 rounded"></div>
                                ))}
                            </div>
                        </section>

                        {/* 6. Best Sellers Placeholder */}
                        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold tracking-tight text-gray-900 uppercase">Best Sellers</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-8 opacity-50">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="h-80 bg-gray-100 rounded"></div>
                                ))}
                            </div>
                        </section>

                        {/* 7. Banner 2 (Real Component) */}
                        <div className="relative border-2 border-dashed border-blue-400 m-2 rounded-lg overflow-hidden">
                            <div className="absolute top-0 left-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 z-10 font-bold uppercase tracking-wider">
                                Banner 2 Position
                            </div>
                            {loading ? (
                                <div className="h-64 flex items-center justify-center bg-gray-50 text-gray-400">Loading Banner 2...</div>
                            ) : (
                                banners && banners.length > 1 ? (
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
                                )
                            )}
                        </div>

                        {/* 8. Shop For Style Placeholder */}
                        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold tracking-tight text-gray-900 uppercase">Shop For Style</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 opacity-50">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="h-80 bg-gray-100 rounded"></div>
                                ))}
                            </div>
                        </section>

                        {/* 9. Top Checks Placeholder */}
                        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-12">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold tracking-tight text-gray-900 uppercase">Top Checks</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 opacity-50">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="h-80 bg-gray-100 rounded"></div>
                                ))}
                            </div>
                        </section>

                    </div>

                    {/* Footer Placeholder */}
                    <footer className="bg-gray-900 text-white py-12 mt-8 text-center text-sm opacity-80">
                        Footer Content
                    </footer>
                </div>
            </div>
        </div>
    );
}
