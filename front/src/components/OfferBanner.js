import React from 'react';
import { Link } from 'react-router-dom';

export default function OfferBanner({
    title = "Get [Exclusive] Offers on Denims!",
    subtitle = "Discover the latest trends in fashion. Shop our exclusive collection.",
    buttonText = "Shop Now",
    image = "https://images.unsplash.com/photo-1475180098004-ca77a66827be?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    reverse = false,
    textColor = "#000000",
    bgColor = "#F3F4F6",
    buttonColor = "#000000",
    highlightColor = "#DC2626",
    link = "#",
    textPosition = "left"
}) {
    // Check if bgColor is a tailwind class (starts with 'bg-') or a hex code
    const isTailwindBg = bgColor.startsWith('bg-');

    // Layout variation for "Center" position: Background Image Style
    if (textPosition === 'center') {
        return (
            <section className="">
                <div className="relative w-full h-[500px] overflow-hidden group">
                    {/* Background Image */}
                    <img
                        src={image}
                        alt="Offer"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Dark Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-black/40"></div>

                    {/* Centered Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 px-4">
                        <h2
                            className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight drop-shadow-md"
                            style={{ color: '#FFFFFF' }} // Force white text on dark overlay for contrast
                        >
                            {title.split(/\[(.*?)\]/).map((part, i) =>
                                i % 2 === 1 ? (
                                    <span key={i} style={{ color: highlightColor }}>{part}</span>
                                ) : (
                                    <span key={i}>{part}</span>
                                )
                            )}
                        </h2>
                        <p className="text-xl text-gray-100 mb-8 max-w-2xl drop-shadow-sm">{subtitle}</p>
                        <Link
                            to={link}
                            className="inline-block rounded-[4px] text-white px-10 py-4 text-sm font-bold uppercase tracking-wider hover:opacity-90 transition-opacity transform hover:-translate-y-1 shadow-lg"
                            style={{ backgroundColor: buttonColor }}
                        >
                            {buttonText}
                        </Link>
                    </div>
                </div>
            </section>
        );
    }

    // Default Layout (Left/Right Split)
    return (
        <section
            className={`${isTailwindBg ? bgColor : ''}`}
            style={!isTailwindBg ? { backgroundColor: bgColor } : {}}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className={`flex flex-col md:flex-row items-center overflow-hidden ${reverse ? 'md:flex-row-reverse' : ''}`}>
                    {/* Text Content */}
                    <div className={`w-full md:w-1/2 py-12 md:px-12 ${reverse ? 'md:pr-0 md:pl-12' : 'md:pl-0 md:pr-12'}`}>
                        <h2
                            className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight"
                            style={{ color: textColor }}
                        >
                            {/* Parse title for [highlighted] text */}
                            {title.split(/\[(.*?)\]/).map((part, i) =>
                                i % 2 === 1 ? (
                                    <span key={i} style={{ color: highlightColor }}>{part}</span>
                                ) : (
                                    <span key={i}>{part}</span>
                                )
                            )}
                        </h2>
                        <p className="text-lg text-gray-600 mb-8">{subtitle}</p>
                        <Link
                            to={link}
                            className="inline-block rounded-[4px] text-white px-8 py-3 text-sm font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: buttonColor }}
                        >
                            {buttonText}
                        </Link>
                    </div>

                    {/* Image */}
                    <div className="w-full md:w-1/2 h-[400px]">
                        <img src={image} alt="Offer" loading="lazy" className="w-full h-full object-cover rounded-sm shadow-sm" />
                    </div>
                </div>
            </div>
        </section>
    );
}
