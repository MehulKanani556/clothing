import React from 'react';
import { FiShoppingCart, FiHeart, FiEye } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';

export default function ProductCard({ product }) {
    const {
        name = "Classic T-Shirt",
        price = "$29.99",
        oldPrice = null,
        image = "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1480&q=80",
        category = "Brand Name",
        rating = 4.5,
        tag = null
    } = product || {};

    return (
        <div className="group flex flex-col items-start w-full">
            {/* Image Container */}
            <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-100 mb-3 rounded-sm">
                <img
                    src={image}
                    alt={name}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />

                {/* Tag */}
                {tag && (
                    <div className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wide">
                        {tag}
                    </div>
                )}

                {/* Hover Actions */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <button className="p-2.5 bg-white rounded-full shadow-lg hover:bg-black hover:text-white transition-colors" title="Add to Cart">
                        <FiShoppingCart size={18} />
                    </button>
                    <button className="p-2.5 bg-white rounded-full shadow-lg hover:bg-black hover:text-white transition-colors" title="Wishlist">
                        <FiHeart size={18} />
                    </button>
                    <button className="p-2.5 bg-white rounded-full shadow-lg hover:bg-black hover:text-white transition-colors" title="Quick View">
                        <FiEye size={18} />
                    </button>
                </div>
            </div>

            {/* Details */}
            <div className="w-full">
                <div className="flex items-center space-x-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={`w-3 h-3 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">({rating})</span>
                </div>
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">{category}</p>
                <h3 className="text-sm font-medium text-gray-900 truncate mb-1">
                    <a href="#">
                        {/* <span aria-hidden="true" className="absolute inset-0" /> */}
                        {name}
                    </a>
                </h3>
                <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-green-600">{price}</span>
                    {oldPrice && <span className="text-sm text-gray-400 line-through">{oldPrice}</span>}
                </div>
            </div>
        </div>
    );
}
