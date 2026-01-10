import React, { useEffect, useState } from 'react';
import { FiX, FiTag, FiCheck } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOffers, validateCoupon, clearOfferErrors } from '../../redux/slice/offer.slice';
import toast from 'react-hot-toast';

export default function CouponModal({ isOpen, onClose, cartValue }) {
    const dispatch = useDispatch();
    const { offers, loading, validationLoading, validationError, appliedCoupon } = useSelector((state) => state.offers);
    const { isAuthenticated } = useSelector((state) => state.auth);

    const [manualCode, setManualCode] = useState('');
    const [selectedCode, setSelectedCode] = useState('');

    useEffect(() => {
        if (isOpen && isAuthenticated) {
            dispatch(fetchOffers());
            dispatch(clearOfferErrors());
            // Reset local state if needed
        }
    }, [isOpen, dispatch, isAuthenticated]);

    useEffect(() => {
        if (validationError) {
            toast.error(validationError);
        }
    }, [validationError]);

    // Update selected code if applied coupon exists
    useEffect(() => {
        if (appliedCoupon) {
            setSelectedCode(appliedCoupon.code);
        }
    }, [appliedCoupon]);

    const handleApply = (code) => {
        if (!isAuthenticated) {
            toast.error("Please login to apply coupons");
            return;
        }
        if (!code) {
            toast.error("Please enter or select a coupon code");
            return;
        }
        dispatch(validateCoupon({ code, cartValue }))
            .unwrap()
            .then(() => {
                toast.success(`Coupon ${code} applied successfully!`);
                onClose();
            })
            .catch((err) => {
                // Toast handled by useEffect or here
            });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed mt-0 inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative z-10 flex flex-col max-h-[80vh]">

                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-100 shrink-0">
                    <h3 className="text-lg font-bold text-gray-900">Apply Coupon</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <FiX size={20} />
                    </button>
                </div>

                <div className="p-5 overflow-y-auto">
                    {/* Manual Input */}
                    <div className="flex gap-0 mb-6 relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <FiTag size={16} />
                        </div>
                        <input
                            type="text"
                            value={manualCode}
                            onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                            placeholder="Enter Coupon Code"
                            className="w-full bg-gray-50 border border-gray-200 rounded-l-md py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-gray-300 transition-colors uppercase"
                        />
                        <button
                            onClick={() => handleApply(manualCode)}
                            disabled={!manualCode || validationLoading}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-6 rounded-r-md text-sm transition-colors uppercase disabled:opacity-50"
                        >
                            {validationLoading && manualCode ? '...' : 'Apply'}
                        </button>
                    </div>

                    {/* Offers List */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-900">Special offers</h4>

                        {!isAuthenticated ? (
                            <div className="text-center py-4 text-gray-500 text-sm">
                                Please login to view available offers
                            </div>
                        ) : loading ? (
                            <div className="text-center py-4 text-gray-500 text-sm">Loading offers...</div>
                        ) : offers.length === 0 ? (
                            <div className="text-center py-4 text-gray-500 text-sm">No offers available for you</div>
                        ) : (
                            offers.map((offer) => (
                                <label
                                    key={offer._id}
                                    className={`relative flex items-start cursor-pointer group`}
                                >
                                    <div className="flex items-center h-5 mt-0.5">
                                        <input
                                            type="radio"
                                            name="coupon-selection"
                                            value={offer.code}
                                            checked={selectedCode === offer.code}
                                            onChange={() => handleApply(offer.code)} // Auto apply on select? User request image implies radio selection
                                            className="h-4 w-4 text-black border-gray-300 focus:ring-black"
                                        />
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="block text-sm font-bold text-gray-900">{offer.code}</span>
                                            {offer.isFirstOrderOnly && (
                                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                                                    First Order
                                                </span>
                                            )}
                                        </div>
                                        <span className="block text-sm text-gray-600 mt-0.5">{offer.description || offer.title}</span>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="block text-sm font-semibold text-green-600">
                                                Save {offer.type === 'FLAT' ? `₹${offer.value}` : `${offer.value}%`}
                                                {offer.type === 'PERCENTAGE' && offer.maxDiscount && ` (up to ₹${offer.maxDiscount})`}
                                            </span>
                                            {offer.minOrderValue > 0 && (
                                                <span className="text-xs text-gray-500">
                                                    Min ₹{offer.minOrderValue}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </label>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
