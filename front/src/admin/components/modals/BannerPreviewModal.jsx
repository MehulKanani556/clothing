import React from 'react';
import { FiX } from 'react-icons/fi';
import OfferBanner from '../../../components/OfferBanner';

export default function BannerPreviewModal({ isOpen, onClose, banner }) {
    if (!isOpen || !banner) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-7xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-white">
                    <h3 className="text-lg font-bold text-gray-900">
                        Banner Preview
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <FiX size={24} />
                    </button>
                </div>

                <div className="overflow-y-auto p-4 bg-gray-50 flex-1 flex items-center justify-center">
                    <div className="w-full bg-white shadow-sm border border-gray-200">
                        <OfferBanner
                            title={banner.title}
                            subtitle={banner.subtitle}
                            image={banner.image} // Preview might need Blob URL if it's a file object, but here it's likely a URL from DB
                            buttonText={banner.buttonText}
                            link={banner.link}
                            reverse={banner.textPosition === 'right'}
                            textPosition={banner.textPosition}
                            textColor={banner.textColor}
                            highlightColor={banner.highlightColor}
                            buttonColor={banner.buttonColor}
                            bgColor={banner.backgroundColor}
                        />
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 bg-white text-center text-sm text-gray-500">
                    This is how the banner will appear on the website.
                </div>
            </div>
        </div>
    );
}
