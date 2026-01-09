import React, { useEffect, useRef } from 'react';
import { FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCategories } from '../redux/slice/category.slice';

export default function CategorySection() {
    const scrollRef = useRef(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { categories } = useSelector((state) => state.category);
    console.log(categories);

    useEffect(() => {
        dispatch(fetchCategories());
    }, []);


    const scroll = (direction) => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = direction === 'left' ? -300 : 300;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                {/* Section Header */}
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Shop by Category</h2>
                        <span className="text-gray-500 mt-2 block text-sm">Explore our curated collections</span>
                    </div>
                    <div className="hidden md:flex gap-2">
                        <button
                            onClick={() => scroll('left')}
                            className="p-2 rounded-full border border-gray-200 hover:bg-black hover:text-white hover:border-black transition-all duration-300"
                        >
                            <FiArrowLeft size={20} />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="p-2 rounded-full border border-gray-200 hover:bg-black hover:text-white hover:border-black transition-all duration-300"
                        >
                            <FiArrowRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Slider Container */}
                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto gap-4 pb-8 hide-scrollbar scroll-smooth snap-x snap-mandatory"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {categories.map((category, index) => (
                        <div
                            key={category._id || index}
                            onClick={() => navigate(`/category/${category._id}`)}
                            className="min-w-[280px] md:min-w-[290px] relative group cursor-pointer overflow-hidden rounded-xl h-[400px] snap-start bg-gray-100"
                        >
                            <img
                                src={category.image}
                                alt={category.name}
                                loading="lazy"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90"></div>

                            {/* Content */}
                            <div className="absolute bottom-0 left-0 p-6 w-full transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-300 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">{category.subtitle}</p>
                                <div className="flex justify-between items-center">
                                    <h3 className="text-2xl font-bold text-white w-10/12">{category.name}</h3>
                                    <span className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300 delay-100">
                                        <FiArrowRight size={14} />
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
