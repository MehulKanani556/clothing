import React, { useState, useEffect } from 'react';
import { MdClose, MdStar } from 'react-icons/md';
import CustomSelect from '../common/CustomSelect';

const ReviewStatusModal = ({ isOpen, onClose, onConfirm, review }) => {
    const [status, setStatus] = useState('Pending');

    useEffect(() => {
        if (isOpen && review) {
            setStatus(review.status || 'Pending');
        }
    }, [isOpen, review]);

    if (!isOpen || !review) return null;

    const statusOptions = [
        { label: 'Pending', value: 'Pending' },
        { label: 'Published', value: 'Published' },
        { label: 'Rejected', value: 'Rejected' }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg transform transition-all animate-scale-in flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">
                        Review Details
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
                        <MdClose size={20} />
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="p-6">
                    {/* Reviewer Info */}
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-50">
                        <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700 font-bold uppercase overflow-hidden shrink-0 text-sm">
                            {review.user?.avatar ?
                                <img src={review.user.avatar} className="w-full h-full object-cover" alt="" />
                                : (review.user?.firstName?.[0] || 'U')}
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 text-base">{review.user?.firstName} {review.user?.lastName}</div>
                            <div className="text-sm text-gray-500">{review.user?.email}</div>
                        </div>
                        <div className="ml-auto text-xs text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </div>
                    </div>

                    {/* Review Content */}
                    <div className="space-y-4 mb-6">
                        <div>
                            <div className="flex text-amber-400 mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <MdStar key={i} className={i < review.rating ? 'fill-current' : 'text-gray-200'} size={18} />
                                ))}
                            </div>
                            {review.title && <h4 className="font-bold text-gray-800 text-sm mb-1">{review.title}</h4>}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                <p className="text-gray-600 text-sm italic leading-relaxed">
                                    "{review.review}"
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Status Update */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</label>
                        <CustomSelect
                            value={status}
                            options={statusOptions}
                            onChange={setStatus}
                            className="w-full"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(status)}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-all shadow-sm hover:shadow-md"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewStatusModal;
