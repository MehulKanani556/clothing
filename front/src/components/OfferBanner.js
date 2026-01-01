import React from 'react';

export default function OfferBanner({
    title = "Get Exclusive Offers on Denims!",
    subtitle = "Discover the latest trends in fashion. Shop our exclusive collection.",
    buttonText = "Shop Now",
    image = "https://images.unsplash.com/photo-1475180098004-ca77a66827be?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    reverse = false,
    textColor = "text-black",
    bgColor = "bg-gray-100"
}) {
    return (
        <section className={`py-12 ${bgColor}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className={`flex flex-col md:flex-row items-center overflow-hidden ${reverse ? 'md:flex-row-reverse' : ''}`}>
                    {/* Text Content */}
                    <div className={`w-full md:w-1/2 py-12 md:px-12 ${reverse ? 'md:pr-0 md:pl-12' : 'md:pl-0 md:pr-12'}`}>
                        <h2 className={`text-4xl md:text-5xl font-extrabold ${textColor} mb-4 leading-tight`}>
                            {title.split(' ').map((word, i) =>
                                word.toLowerCase() === 'exclusive' ?
                                    <span key={i} className="text-red-600">{word} </span> :
                                    word + ' '
                            )}
                        </h2>
                        <p className="text-lg text-gray-600 mb-8">{subtitle}</p>
                        <button className="bg-black text-white px-8 py-3 text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors">
                            {buttonText}
                        </button>
                    </div>

                    {/* Image */}
                    <div className="w-full md:w-1/2 h-[400px]">
                        <img src={image} alt="Offer" className="w-full h-full object-cover rounded-sm shadow-sm" />
                    </div>
                </div>
            </div>
        </section>
    );
}
