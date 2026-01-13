import React, { useState } from 'react';
import { FiX, FiUpload, FiStar, FiImage } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';

export default function ReviewOffcanvas({ isOpen, onClose, product, onSubmit }) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [images, setImages] = useState([]);

    if (!isOpen) return null;

    const handleImageChange = (e) => {
        if (e.target.files) {
            const newImages = Array.from(e.target.files).map(file => ({
                file,
                preview: URL.createObjectURL(file)
            }));
            setImages([...images, ...newImages].slice(0, 5)); // Limit to 5
        }
    };

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        if (rating === 0) return;

        // Pass the raw files for FormData construction, and other fields
        onSubmit({
            rating,
            title,
            description,
            images: images.map(i => i.file)
        });

        // Reset form (optional, depending on UX desired)
        setRating(0);
        setTitle('');
        setDescription('');
        setImages([]);
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Offcanvas Panel */}
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slideInRight">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">Review Product</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <FiX size={20} />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Product Info */}
                    <div className="flex gap-4">
                        <div className="w-20 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                                src={product.images && product.images[0] ? product.images[0] : ''}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 text-sm mb-1">{product.name}</h3>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900">{product.price}</span>
                                {product.originalPrice && (
                                    <>
                                        <span className="text-xs text-gray-400 line-through">{product.originalPrice}</span>
                                        <span className="text-xs text-green-600 font-bold">{product.discount}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Overall Rating */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">Overall Rating (Mandatory)</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={(e) => {
                                        const { left, width } = e.currentTarget.getBoundingClientRect();
                                        const percent = (e.clientX - left) / width;
                                        setRating(percent < 0.5 ? star - 0.5 : star);
                                    }}
                                    onMouseMove={(e) => {
                                        const { left, width } = e.currentTarget.getBoundingClientRect();
                                        const percent = (e.clientX - left) / width;
                                        setHoverRating(percent < 0.5 ? star - 0.5 : star);
                                    }}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="relative text-3xl focus:outline-none transition-transform hover:scale-110"
                                >
                                    <div className="relative">
                                        <FaStar className="text-gray-200" />
                                        {(hoverRating || rating) >= star ? (
                                            <FaStar className="absolute top-0 left-0 text-yellow-400" />
                                        ) : (hoverRating || rating) >= star - 0.5 ? (
                                            <div className="absolute top-0 left-0 overflow-hidden w-1/2">
                                                <FaStar className="text-yellow-400 min-w-full" />
                                            </div>
                                        ) : null}
                                    </div>
                                </button>
                            ))}
                        </div>
                        {rating === 0 && <p className="text-red-500 text-xs mt-1">Please select a rating</p>}
                    </div>

                    {/* Write Review */}
                    <div className="space-y-4">
                        <label className="block text-sm font-semibold text-gray-900">Write a Review (Optional)</label>

                        <div>
                            <input
                                type="text"
                                placeholder="Review Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-black/5 placeholder-gray-400"
                            />
                        </div>

                        <div>
                            <textarea
                                placeholder="Write review description here"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={5}
                                className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-black/5 placeholder-gray-400 resize-none"
                            />
                        </div>
                    </div>

                    {/* Add Photos */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">Add a Photo or Video (Optional)</label>
                        <div className="flex flex-wrap gap-3">
                            {images.map((img, idx) => (
                                <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group">
                                    <img src={img.preview} alt="Upload" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => removeImage(idx)}
                                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <FiX size={12} />
                                    </button>
                                </div>
                            ))}
                            {images.length < 5 && (
                                <label className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-black hover:bg-gray-50 transition-colors">
                                    <FiImage className="text-gray-400 mb-1" size={20} />
                                    <span className="text-[10px] text-gray-400 text-center px-1">Add Media</span>
                                    <input
                                        type="file"
                                        accept="image/*,video/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                        multiple
                                    />
                                </label>
                            )}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">PNG, JPG, GIF up to 5 MB and max. 5 images</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleSubmit}
                        disabled={rating === 0}
                        className="w-full bg-black text-white font-bold text-sm py-4 rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase tracking-wide"
                    >
                        Submit
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .animate-slideInRight {
                    animation: slideInRight 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
