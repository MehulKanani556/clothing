import React from 'react';
import HeroSection from '../components/HeroSection';
import CategorySection from '../components/CategorySection';
import ProductCard from '../components/ProductCard';
import OfferBanner from '../components/OfferBanner';
import Footer from '../components/Footer';

export default function Home() {
    // Use more consistent and tailored mock data for the sections
    const products = [
        { id: 1, name: 'Urban Jacket', price: '$120.00', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80', category: 'Men', rating: 5, tag: 'New' },
        { id: 2, name: 'Summer Dress', price: '$85.00', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80', category: 'Women', rating: 4.5, tag: 'Hot' },
        { id: 3, name: 'Casual Denim', price: '$60.00', image: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=600&q=80', category: 'Men', rating: 4 },
        { id: 4, name: 'Chic Blouse', price: '$45.00', image: 'https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?w=600&q=80', category: 'Women', rating: 5 },
    ];

    const bestSellers = [
        { id: 5, name: 'Striped Shirt', price: '$55.00', image: 'https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?w=600&q=80', category: 'Men', rating: 5, tag: 'Sale' },
        { id: 6, name: 'Classic Tee', price: '$25.00', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80', category: 'Men', rating: 4.5 },
        { id: 7, name: 'Floral Top', price: '$42.00', image: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600&q=80', category: 'Women', rating: 4 },
        { id: 8, name: 'Denim Jacket', price: '$98.00', image: 'https://images.unsplash.com/photo-1511401677968-feade623d58d?fm=jpg&q=80&w=600', category: 'Men', rating: 5 },
        { id: 9, name: 'Summer Hat', price: '$35.00', image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600&q=80', category: 'Accessories', rating: 4.5 },
        { id: 10, name: 'Leather Bag', price: '$150.00', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80', category: 'Accessories', rating: 5 },
        { id: 11, name: 'Running Shoes', price: '$89.00', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80', category: 'Footwear', rating: 5 },
        { id: 12, name: 'Cargo Pants', price: '$75.00', image: 'https://images.unsplash.com/photo-1649850874075-49e014357b9d?fm=jpg&q=80&w=600', category: 'Men', rating: 4 },
    ];

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
                    <a href="#" className="hidden sm:block text-xs font-bold text-gray-500 hover:text-black uppercase tracking-wider relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-gray-300">
                        Veiw All &rarr;
                    </a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </section>

            {/* 4. Banner 1 (Denim - Light Grey BG) */}
            <OfferBanner
                title="Get Exclusive Offers on Denims!"
                subtitle="Up to 40% off on all Denim products."
                image="https://images.unsplash.com/photo-1582418702059-97ebafb35d09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                bgColor="bg-gray-100"
            />

            {/* 5. New Arrivals */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 uppercase">New Arrivals</h2>
                    <a href="#" className="hidden sm:block text-xs font-bold text-gray-500 hover:text-black uppercase tracking-wider relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-gray-300">
                        Veiw All &rarr;
                    </a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.slice().reverse().map((product) => (
                        <ProductCard key={`na-${product.id}`} product={product} />
                    ))}
                </div>
            </section>

            {/* 6. Best Sellers */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 uppercase">Best Sellers</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-8">
                    {bestSellers.map((product) => (
                        <ProductCard key={`bs-${product.id}`} product={product} />
                    ))}
                </div>
            </section>

            {/* 7. Banner 2 (New Arrivals - Grey BG, Content Right) */}
            <OfferBanner
                title="Get Exclusive Offers on New Arrivals!"
                subtitle="Check out the latest collections."
                image="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                reverse={true}
                bgColor="bg-gray-100"
            />

            {/* 8. Shop For Style */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 uppercase">Shop For Style</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map((product) => (
                        <ProductCard key={`sfs-${product.id}`} product={product} />
                    ))}
                </div>
            </section>

            {/* 9. Top Checks (Bottom Grid) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-12">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 uppercase">Top Checks</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.slice().reverse().map((product) => (
                        <ProductCard key={`tc-${product.id}`} product={product} />
                    ))}
                </div>
            </section>

            {/* 10. Footer */}

        </div>
    );
}