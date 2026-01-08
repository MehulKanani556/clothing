import React, { useState } from 'react';
import { MdEdit, MdDelete, MdVisibility, MdMoreHoriz, MdStar } from 'react-icons/md';

const ProductGridItem = ({ product, onEdit, onDelete }) => {
    const [showMenu, setShowMenu] = useState(false);

    const variant = product.variants[0];
    const option = variant?.options[0];
    const price = option?.price || 0;
    const mrp = option?.mrp || 0;
    const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
    const image = variant?.images[0];
    const totalStock = product.variants.reduce((acc, v) => acc + v.options.reduce((oa, o) => oa + o.stock, 0), 0);
    const date = new Date(product.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-full flex flex-col relative group hover:shadow-md transition-all duration-300">
            {/* Top Section: Image, Badge, Menu */}
            <div className="relative bg-[#f8f9fa] rounded-lg h-48 mb-4 flex items-center justify-center overflow-hidden">
                {/* Discount Badge */}
                {discount > 0 && (
                    <div className="absolute top-3 left-3 w-10 h-10 bg-[#ff4f5e] rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm z-10">
                        {discount}%
                    </div>
                )}

                {/* Action Menu Button */}
                <div className="absolute top-3 right-3 z-20">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="w-8 h-8 bg-black text-white rounded-md flex items-center justify-center shadow-lg hover:bg-gray-800 transition-colors"
                    >
                        <MdMoreHoriz size={20} />
                    </button>

                    {/* Dropdown Menu */}
                    {showMenu && (
                        <div className="absolute right-0 top-10 bg-white rounded-lg shadow-xl border border-gray-100 py-2 w-32 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                            <button
                                onClick={() => { setShowMenu(false); onEdit(product); }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                                <MdEdit size={14} /> Edit
                            </button>
                            <button
                                onClick={() => { setShowMenu(false); onDelete(product._id); }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                                <MdDelete size={14} /> Remove
                            </button>
                        </div>
                    )}

                    {/* Click outside backdrop for menu */}
                    {showMenu && (
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowMenu(false)}
                        />
                    )}
                </div>

                {/* Product Image */}
                <div className="w-3/4 h-3/4 flex items-center justify-center">
                    {image ? (
                        <img
                            src={image}
                            alt={product.name}
                            className="max-w-full max-h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <MdVisibility className="text-gray-300 text-4xl" />
                    )}
                </div>
            </div>

            {/* Details Section */}
            <div className="flex-1 flex flex-col">
                {/* Price and Rating */}
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-black font-bold text-lg">${price}</span>
                        {mrp > price && (
                            <span className="text-gray-400 text-sm line-through decoration-gray-400">${mrp}</span>
                        )}
                    </div>

                    <div className="flex items-center gap-1 text-gray-700 font-bold text-sm">
                        <span>{product?.averageRating || 0}</span>
                        <MdStar className="text-amber-400 mb-0.5" />
                    </div>
                </div>

                {/* Title and Category */}
                <h3
                    className="font-bold text-gray-900 text-base mb-1 line-clamp-1 hover:text-black cursor-pointer"
                    onClick={() => onEdit(product)}
                >
                    {product.name}
                </h3>
                <p className="text-gray-400 text-sm mb-4">{product.category?.name || 'Fashion'}</p>

                {/* Footer Stats */}
                <div className="mt-auto grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100 pt-4">
                    <div className="flex flex-col items-center px-2">
                        <span className="font-bold text-gray-900 text-sm">{totalStock}</span>
                        <span className="text-gray-400 text-xs mt-0.5">Stocks</span>
                    </div>
                    <div className="flex flex-col items-center px-2">
                        <span className="font-bold text-gray-900 text-sm">{product.orderCount || 0}</span>
                        <span className="text-gray-400 text-xs mt-0.5">Orders</span>
                    </div>
                    <div className="flex flex-col items-center px-2">
                        <span className="font-bold text-gray-900 text-sm whitespace-nowrap">{date}</span>
                        <span className="text-gray-400 text-xs mt-0.5">Publish</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductGridItem;
