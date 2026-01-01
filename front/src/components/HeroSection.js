import React, { useState, useEffect, useRef } from 'react';
import hero1 from '../assets/image/hero.png';
import hero2 from '../assets/image/hero2.png';
import hero3 from '../assets/image/hero3.png';

const slides = [
    {
        id: 1,
        image: hero1,
        subtitle: 'New Season',
        titleMain: 'Prove your generation',
        titleHighlight: 'URBAN STYLE',
        description: 'Discover the latest distinctive styles that define the new era of urban fashion.',
        buttonText: 'Shop Now',
        color: 'text-red-500',
        bgGradient: 'from-orange-100/20'
    },
    {
        id: 2,
        image: hero2,
        subtitle: 'Street Collection',
        titleMain: 'Discover Fashion',
        titleHighlight: 'That Defines You',
        description: 'Bold designs and premium comfort for the modern urban explorer.',
       buttonText: 'Shop Now',
        color: 'text-yellow-500',
        bgGradient: 'from-yellow-100/20'
    },
    {
        id: 3,
        image: hero3,
        subtitle: 'Premium Studio',
        titleMain: 'Just Design ',
        titleHighlight: 'for YOU.',
        description: 'Sophisticated cuts and timeless pieces for a standout wardrobe.',
        buttonText: 'Shop Now',
        color: 'text-blue-500',
        bgGradient: 'from-blue-100/20'
    }
];

export default function HeroSection() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isAnimating, setIsAnimating] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const containerRef = useRef(null);

    const handleSlideChange = (index) => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentSlide(index);
        setTimeout(() => setIsAnimating(false), 1200);
    };

    useEffect(() => {
        if (isHovered) return;

        const interval = setInterval(() => {
            handleSlideChange((currentSlide + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [currentSlide, isAnimating, isHovered]);

    const goToSlide = (index) => {
        handleSlideChange(index);
    };

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const { left, top, width, height } = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - left) / width * 2 - 1;
        const y = (e.clientY - top) / height * 2 - 1;
        setMousePos({ x, y });
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setMousePos({ x: 0, y: 0 });
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    return (
        <div
            ref={containerRef}
            className="relative bg-[#f5f5f7] h-[750px] overflow-hidden group perspective-1000"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
        >
            {/* Animated Background Blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className={`absolute top-0 left-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob transition-colors duration-1000 ${currentSlide === 1 ? 'bg-yellow-300' : currentSlide === 2 ? 'bg-blue-300' : ''}`}></div>
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                >
                    {/* Background Image Container with Reveal Effect */}
                    <div className={`absolute inset-0 overflow-hidden ${index === currentSlide ? 'animate-reveal' : ''}`}>
                        {/* <div className="absolute inset-0 bg-gray-200"></div> Placeholder while loading/revealing */}
                        <img
                            src={slide.image}
                            alt={slide.titleMain}
                            style={{
                                transform: `scale(${index === currentSlide ? 1.05 : 1.2}) translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)`
                            }}
                            className={`w-full h-full object-cover object-center md:object-[center_top] transition-transform duration-[2000ms] ease-out will-change-transform`}
                        />
                        {/* complex gradient overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${slide.bgGradient} via-white/40 to-white/10 mix-blend-overlay`}></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/60 to-transparent"></div>
                    </div>

                    {/* Content Container with 3D Tilt */}
                    <div
                        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full h-full flex items-center"
                        style={{
                            transform: `rotateY(${mousePos.x * 2}deg) rotateX(${mousePos.y * -2}deg)`,
                            transition: 'transform 0.2s ease-out'
                        }}
                    >
                        <div className="max-w-xl transform-style-3d">
                            {/* Floating Subtitle */}
                            <div className="animate-float">
                                <span className={`${slide.color} font-black tracking-[0.3em] uppercase text-sm mb-4 block`}>
                                    <span className="inline-block border-b-2 border-current pb-1"> {slide.subtitle}</span>
                                </span>
                            </div>

                            {/* Split Text Title Animation */}
                            <h1 className="text-6xl font-black text-gray-900 leading-[0.9] mb-6">
                                <div className="overflow-hidden mb-2">
                                    <span className={`block transition-transform duration-700 delay-100 ${index === currentSlide ? 'translate-y-0' : 'translate-y-[120%]'}`}>
                                        {slide.titleMain}
                                    </span>
                                </div>
                                {/* <div className="overflow-hidden mb-2">
                                    <span className={`block transition-transform duration-700 delay-200 ${index === currentSlide ? 'translate-y-0' : 'translate-y-[120%]'}`}>
                                        {slide.titleMain2}
                                    </span>
                                </div> */}
                                <div className="relative">
                                    <span className="absolute inset-0 text-stroke-white translate-x-1 translate-y-1" aria-hidden="true">{slide.titleHighlight}</span>
                                    <span className={`block text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 transition-all duration-700 delay-300 transform ${index === currentSlide ? 'scale-100 opacity-100 blur-0' : 'scale-150 opacity-0 blur-sm'}`}>
                                        {slide.titleHighlight}
                                    </span>
                                </div>
                            </h1>

                            {/* Floating Description */}
                            <p className="mt-8 text-gray-600 text-lg mb-10 max-w-md leading-relaxed animate-float-delayed">
                                {slide.description}
                            </p>

                            {/* Magnetic Button */}
                            <div className={`transition-all duration-700 delay-500 transform ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                                }`}>
                                <button
                                    className="group/btn relative overflow-hidden bg-black text-white px-6 py-3 rounded-[4px] text-sm font-bold uppercase tracking-widest hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 hover:-translate-y-1"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        {slide.buttonText}
                                        <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                    </span>
                                    <div className="absolute inset-0 bg-gray-800 transform scale-x-0 origin-left transition-transform duration-500 ease-out group-hover/btn:scale-x-100"></div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Slider Dots & Progress */}
            <div className="absolute bottom-12 left-1/2 flex items-center space-x-6 z-20">
                <div className="flex space-x-2">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => handleSlideChange(index)}
                            className={`relative h-1.5 rounded-full transition-all duration-500 ${index === currentSlide ? 'w-20 bg-gray-200' : 'w-3 bg-gray-300 hover:bg-gray-400'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        >
                            {index === currentSlide && (
                                <div className="absolute inset-0 bg-black rounded-full animate-progress origin-left"></div>
                            )}
                        </button>
                    ))}
                </div>
                <div className="text-xs font-bold tracking-widest text-gray-400">
                    0{currentSlide + 1} / 0{slides.length}
                </div>
            </div>

            {/* Large Navigation Arrows */}
            {/* <div className="absolute bottom-0 right-0 z-20 flex">
                <button
                    onClick={() => handleSlideChange(currentSlide === 0 ? slides.length - 1 : currentSlide - 1)}
                    className="w-24 h-24 bg-white hover:bg-gray-50 flex items-center justify-center border-t border-l border-gray-100 transition-colors duration-300 group"
                >
                    <svg className="w-8 h-8 text-gray-400 group-hover:text-black transition-colors transform group-hover:-translate-x-1 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button
                    onClick={() => handleSlideChange((currentSlide + 1) % slides.length)}
                    className="w-24 h-24 bg-black hover:bg-gray-900 flex items-center justify-center transition-colors duration-300 group"
                >
                    <svg className="w-8 h-8 text-white transition-transform transform group-hover:translate-x-1 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div> */}

            {/* Decorative Side Text */}
            <div className="absolute top-1/2 left-8 transform -translate-y-1/2 -rotate-90 origin-left hidden xl:block pointer-events-none z-0">
                <span className="text-[120px] font-black text-gray-100 opacity-50 select-none">
                    FASHION
                </span>
            </div>
        </div>
    );
}
