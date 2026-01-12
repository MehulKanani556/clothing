import React, { useRef, useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const HeroBannerViewModal = ({ isOpen, onClose, banner }) => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);

    // Reuse mouse move logic from HeroSection.js
    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const { left, top, width, height } = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - left) / width * 2 - 1;
        const y = (e.clientY - top) / height * 2 - 1;
        setMousePos({ x, y });
    };

    const handleMouseLeave = () => {
        setMousePos({ x: 0, y: 0 });
    };

    const renderHighlightedText = (text, highlightColor) => {
        if (!text) return null;
        return text.split(/\[(.*?)\]/).map((part, i) =>
            i % 2 === 1 ? (
                <span key={i} style={{ color: highlightColor }}>{part}</span>
            ) : (
                <span key={i}>{part}</span>
            )
        );
    };

    if (!isOpen || !banner) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-[90vw] h-[80vh] md:h-[85vh] bg-white rounded-3xl overflow-hidden shadow-2xl animate-fade-in-up">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-50 p-2 bg-black/20 backdrop-blur-md hover:bg-black/40 rounded-full text-white transition-colors"
                >
                    <FiX size={24} />
                </button>

                {/* Banner Render Reusing HeroSection Logic */}
                <div
                    ref={containerRef}
                    className="relative w-full h-full overflow-hidden group perspective-1000 bg-[#f5f5f7]"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                >
                    {/* Background Image Container with Reveal Effect */}
                    <div className="absolute inset-0 overflow-hidden">
                        <img
                            src={banner.image}
                            alt={banner.title}
                            style={{
                                transform: `scale(1.05) translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)`
                            }}
                            className="w-full h-full object-cover object-center md:object-[center_top] transition-transform duration-[2000ms] ease-out will-change-transform"
                        />
                        {/* Complex gradient overlay matching HeroSection */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${banner.backgroundColor} via-white/40 to-white/10 mix-blend-multiply opacity-60`} />
                        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/60 to-transparent"></div>
                    </div>

                    {/* Content Container with 3D Tilt */}
                    <div
                        className="relative z-10 max-w-7xl mx-auto px-8 md:px-16 w-full h-full flex items-center"
                        style={{
                            transform: `rotateY(${mousePos.x * 2}deg) rotateX(${mousePos.y * -2}deg)`,
                            transition: 'transform 0.2s ease-out'
                        }}
                    >
                        {/* Dynamic Positioning Wrapper */}
                        <div className={`w-full flex ${banner.textPosition === 'right' ? 'justify-end text-right' : 'justify-start text-left'}`}>

                            <div className="max-w-2xl transform-style-3d">
                                {/* Subtitle */}
                                {banner.subtitle && (
                                    <div className="animate-float mb-4">
                                        <span className="font-black tracking-[0.3em] uppercase text-sm block" style={{ color: banner.subtitleHighlightColor || '#ECA72C' }}>
                                            <span className="inline-block border-b-2 border-current pb-1">
                                                {renderHighlightedText(banner.subtitle, banner.subtitleHighlightColor || '#ECA72C')}
                                            </span>
                                        </span>
                                    </div>
                                )}

                                {/* Title */}
                                <h1 className="text-5xl md:text-7xl font-black leading-[0.9] mb-6 text-gray-900 drop-shadow-sm">
                                    <span
                                        className="block"
                                        style={{ color: banner.textColor }}
                                    >
                                        {renderHighlightedText(banner.title, banner.titleHighlightColor)}
                                    </span>
                                </h1>

                                {/* Description */}
                                {banner.description && (
                                    <p
                                        className="mt-6 text-lg md:text-xl mb-10 leading-relaxed font-medium animate-float-delayed"
                                        style={{ color: banner.descriptionColor || '#4b5563' }}
                                    >
                                        {banner.description}
                                    </p>
                                )}

                                {/* Button */}
                                <div className={`transition-all duration-700 delay-500`}>
                                    <button
                                        className="group/btn relative overflow-hidden px-8 py-4 rounded-[4px] text-sm font-bold uppercase tracking-widest shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                                        style={{ backgroundColor: banner.buttonColor, color: '#ffffff' }}
                                    >
                                        <span className="relative z-10 flex items-center gap-2">
                                            {banner.buttonText}
                                            <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                        </span>
                                        <div className="absolute inset-0 bg-white/20 transform scale-x-0 origin-left transition-transform duration-500 ease-out group-hover/btn:scale-x-100"></div>
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroBannerViewModal;
