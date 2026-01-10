import React from 'react';
import { MdClose } from 'react-icons/md';

const ViewOfferModal = ({ isOpen, onClose, offer, categories = [], products = [] }) => {
    if (!isOpen || !offer) return null;

    // Helper to format date
    const formatDate = (dateValue) => {
        if (!dateValue) return 'N/A';
        return new Date(dateValue).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Helper for Status
    const isExpired = new Date(offer.endDate) < new Date();
    const status = (offer.isActive && !isExpired) ? 'Active' : 'Inactive';
    const statusColor = status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

    // Helper to get names
    const getCategoryName = (id) => {
        const cat = categories.find(c => c._id === id);
        return cat ? cat.name : 'Unknown Category';
    };

    const getProductName = (id) => {
        const prod = products.find(p => p._id === id);
        return prod ? prod.name : 'Unknown Product';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-xl font-bold text-black tracking-tight">Offer Details</h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-black transition-colors"
                    >
                        <MdClose size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">

                    {/* Main Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Title</span>
                            <p className="text-base font-semibold text-black">{offer.title}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Status</span>
                            <div>
                                <span className={`inline-flex px-2.5 py-0.5 text-xs rounded-full font-bold tracking-wider uppercase ${statusColor}`}>
                                    {status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description</span>
                        <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                            {offer.description || 'No description provided.'}
                        </p>
                    </div>

                    {/* Coupon & Discount */}
                    <div className="bg-black rounded-xl p-5 text-white">
                        <h4 className="text-sm font-bold mb-6 flex items-center gap-2 uppercase tracking-widest border-b border-white/20 pb-2">
                            Discount Configuration
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="space-y-1">
                                <span className="text-xs font-medium text-gray-400">Code</span>
                                <p className="text-lg font-bold font-mono tracking-widest">{offer.code}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs font-medium text-gray-400">Type</span>
                                <p className="text-sm font-semibold">{offer.type}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs font-medium text-gray-400">Value</span>
                                <p className="text-sm font-semibold">
                                    {offer.type === 'PERCENTAGE' ? `${offer.value}%` : `₹${offer.value}`}
                                </p>
                            </div>
                            {offer.maxDiscount > 0 && (
                                <div className="space-y-1">
                                    <span className="text-xs font-medium text-gray-400">Max Cap</span>
                                    <p className="text-sm font-semibold">₹{offer.maxDiscount}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Constraints */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-0.5">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Min Order Value</span>
                            <p className="text-sm font-medium text-black">₹{offer.minOrderValue || 0}</p>
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Usage Limit</span>
                            <p className="text-sm font-medium text-black">{offer.usageLimit ? `${offer.usageLimit} times` : 'Unlimited'}</p>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                        <div className="space-y-0.5">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Start Date</span>
                            <p className="text-sm font-medium text-black">{formatDate(offer.startDate)}</p>
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">End Date</span>
                            <p className="text-sm font-medium text-black">{formatDate(offer.endDate)}</p>
                        </div>
                    </div>

                    {/* Targeting - Only show if specific targeting exists */}
                    {(offer.applicableCategories?.length > 0 || offer.applicableProducts?.length > 0) && (
                        <div className="pt-4 border-t border-gray-100 space-y-4">
                            <h4 className="text-sm font-bold text-black uppercase tracking-widest">Targeting</h4>

                            {offer.applicableCategories?.length > 0 && (
                                <div className="space-y-0.5">
                                    <span className="text-xs font-medium text-gray-500">Categories</span>
                                    <div className="flex flex-wrap gap-2">
                                        {offer.applicableCategories.map((catId, idx) => (
                                            <span key={idx} className="bg-gray-100 text-black border border-gray-200 px-3 py-1 text-xs font-medium">
                                                {getCategoryName(catId)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {offer.applicableProducts?.length > 0 && (
                                <div className="space-y-2">
                                    <span className="text-xs font-medium text-gray-500">Products</span>
                                    <div className="flex flex-wrap gap-2">
                                        {offer.applicableProducts.map((prodId, idx) => (
                                            <span key={idx} className="bg-gray-100 text-black border border-gray-200 px-3 py-1 text-xs font-medium">
                                                {getProductName(prodId)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-6 bg-white border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-8 py-2 text-sm font-bold text-black rounded-lg transition-colors uppercase tracking-wider"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewOfferModal;
