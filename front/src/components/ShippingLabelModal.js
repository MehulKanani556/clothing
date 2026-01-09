import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { generateShippingLabel } from '../redux/slice/tracking.slice';
import { FiDownload, FiX, FiPrinter, FiExternalLink } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ShippingLabelModal = ({ isOpen, onClose, order }) => {
    const dispatch = useDispatch();
    const { loading } = useSelector(state => state.tracking);
    const [labelUrl, setLabelUrl] = useState(order?.shippingLabel || null);

    const handleGenerateLabel = async () => {
        try {
            const result = await dispatch(generateShippingLabel(order._id)).unwrap();
            setLabelUrl(result.data.labelUrl);
            toast.success('Shipping label generated successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to generate shipping label');
        }
    };

    const handleDownload = () => {
        if (labelUrl) {
            window.open(labelUrl, '_blank');
        }
    };

    const handlePrint = () => {
        if (labelUrl) {
            const printWindow = window.open(labelUrl, '_blank');
            printWindow.onload = () => {
                printWindow.print();
            };
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">Shipping Label</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="text-center">
                        <div className="mb-4">
                            <h3 className="font-medium text-gray-900 mb-2">
                                Order #{order?.orderId}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {order?.shippingAddress?.firstName} {order?.shippingAddress?.lastName}
                            </p>
                            <p className="text-sm text-gray-600">
                                {order?.shippingAddress?.city}, {order?.shippingAddress?.state} - {order?.shippingAddress?.pincode}
                            </p>
                        </div>

                        {!labelUrl ? (
                            <div className="space-y-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <FiPrinter className="mx-auto text-gray-400 mb-2" size={32} />
                                    <p className="text-gray-600 text-sm">
                                        Generate shipping label for this order
                                    </p>
                                </div>
                                
                                <button
                                    onClick={handleGenerateLabel}
                                    disabled={loading || !order?.shipmentId}
                                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Generating...
                                        </div>
                                    ) : (
                                        'Generate Label'
                                    )}
                                </button>

                                {!order?.shipmentId && (
                                    <p className="text-red-600 text-xs">
                                        Shiprocket order must be created first
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-green-50 rounded-lg p-4">
                                    <div className="flex items-center justify-center text-green-600 mb-2">
                                        <FiDownload size={24} />
                                    </div>
                                    <p className="text-green-700 text-sm font-medium">
                                        Shipping label is ready
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleDownload}
                                        className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FiExternalLink size={16} />
                                        Download
                                    </button>
                                    <button
                                        onClick={handlePrint}
                                        className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FiPrinter size={16} />
                                        Print
                                    </button>
                                </div>

                                <button
                                    onClick={handleGenerateLabel}
                                    disabled={loading}
                                    className="w-full text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                                >
                                    Regenerate Label
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t bg-gray-50 rounded-b-lg">
                    <p className="text-xs text-gray-500 text-center">
                        Make sure to attach this label securely to the package before pickup
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ShippingLabelModal;