import React, { useState } from 'react';
import { FiArrowLeft, FiClock, FiCheck, FiTruck, FiX, FiMapPin, FiPhone, FiDownload, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import TrackingWidget from '../TrackingWidget';

export default function OrderDetails({ order, onBack }) {
    const [showPriceDetails, setShowPriceDetails] = useState(false);

    if (!order) return null;

    // Helper for status styles
    const getStatusStyles = (status) => {
        switch (status) {
            case 'Pending': return { color: 'text-orange-600', bg: 'bg-orange-50', width: '25%' };
            case 'Processing': return { color: 'text-blue-600', bg: 'bg-blue-50', width: '50%' };
            case 'Shipped': return { color: 'text-indigo-600', bg: 'bg-indigo-50', width: '75%' };
            case 'Delivered': return { color: 'text-green-600', bg: 'bg-green-50', width: '100%' };
            case 'Cancelled': return { color: 'text-red-600', bg: 'bg-red-50', width: '100%' };
            default: return { color: 'text-gray-600', bg: 'bg-gray-50', width: '0%' };
        }
    };

    const statusConfig = getStatusStyles(order.status);

    // Format Address
    const { shippingAddress } = order;
    const fullAddress = [
        shippingAddress?.addressLine1,
        shippingAddress?.addressLine2,
        shippingAddress?.city,
        shippingAddress?.state,
        shippingAddress?.pincode,
        'India' // Assuming India for now based on context
    ].filter(Boolean).join(', ');

    return (
        <div className="w-full bg-white animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Header / Back Button */}
            <div className="flex items-center gap-3 mb-6 p-1">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                >
                    <FiArrowLeft size={20} />
                </button>
                <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
            </div>

            {/* Top Card: ID and Date */}
            <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6 mb-4">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-gray-500 text-sm">Order ID</h3>
                        <p className="text-lg font-bold text-gray-900">#{order.orderId || order._id}</p>
                    </div>
                    <div className="text-right">
                        <h3 className="text-gray-500 text-sm">Order Placed</h3>
                        <p className="font-medium text-gray-900">
                            {new Date(order.placedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                {/* Items List */}
                <div className="space-y-6">
                    {order.items.map((item, idx) => (
                        <div key={idx} className="flex gap-4">
                            <div className="w-20 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 flex justify-between items-start">
                                <div>
                                    <h4 className="font-medium text-gray-900 text-sm sm:text-base">{item.name}</h4>
                                    <div className="mt-1 flex gap-3 text-xs sm:text-sm text-gray-500">
                                        {item.color && <span>Color: <span className="text-gray-900">{item.color}</span></span>}
                                        {item.size && <span>Size: <span className="text-gray-900">{item.size}</span></span>}
                                    </div>
                                    <div className="mt-2 text-sm">
                                        <span className="text-gray-500">Qty: {item.quantity}</span>
                                    </div>
                                    <div className="mt-1 font-semibold text-gray-900">₹{item.price?.toLocaleString()}</div>
                                </div>
                                {order.status === 'Delivered' && (
                                    <button className="text-sm text-gray-900 underline hover:text-gray-700">
                                        Write a review
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Status Section */}
            <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6 mb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center  gap-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${statusConfig.bg}`}>
                            {order.status === 'Delivered' ? <FiCheck className={statusConfig.color} /> :
                                order.status === 'Cancelled' ? <FiX className={statusConfig.color} /> :
                                    <FiClock className={statusConfig.color} />}
                        </div>
                        <div>
                            <h4 className={`font-bold ${statusConfig.color} text-lg`}>Order {order.status}</h4>
                            <p className="text-gray-500 text-sm">
                                On {new Date(order.updatedAt || order.placedAt).toLocaleString('en-US', {
                                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 w-full sm:w-auto">
                        {order.status === 'Pending' && (
                            <button className="flex-1 sm:flex-none py-2 px-4 border border-red-200 text-red-600 rounded-md text-sm font-medium hover:bg-red-50 transition-colors">
                                Cancel Order
                            </button>
                        )}
                        {order.status === 'Delivered' ? (
                            <button className="flex-1 sm:flex-none py-2 px-4 border border-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
                                Return Order
                            </button>
                        ) : order.status === 'Cancelled' ? (
                            <button className="flex-1 sm:flex-none py-2 px-4 border border-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
                                Refund Status
                            </button>
                        ) : (
                            <button className="flex-1 sm:flex-none py-2 px-4 border border-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
                                Track Order
                            </button>
                        )}
                    </div>
                </div>

                {/* Progress Bar (Visual Only) */}
                {order.status !== 'Cancelled' && (

                    <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden mt-6">
                        <div
                            className={`absolute top-0 left-0 h-full transition-all duration-500 ${order.status === 'Delivered' ? 'bg-green-500' :
                                    order.status === 'Cancelled' ? 'bg-red-500' :
                                        'bg-orange-500'
                                }`}
                            style={{ width: statusConfig.width }}
                        ></div>
                    </div>
                )}
            </div>

            {/* Tracking Section */}
            {(order.status === 'Processing' || order.status === 'Shipped' || order.status === 'Delivered') && (
                <div className="mb-4">
                    <TrackingWidget order={order} showFullDetails={true} />
                </div>
            )}

            {/* Shipping Details */}
            <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6 mb-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900">Shipping Details</h3>
                    <button className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
                        <FiDownload /> Download Invoice
                    </button>
                </div>

                <div className="space-y-1 text-sm text-gray-600">
                    <div className="font-medium text-gray-900 text-base mb-1">
                        {shippingAddress?.firstName} {shippingAddress?.lastName}
                        {shippingAddress?.phone && <span className="text-gray-500 font-normal ml-2">| {shippingAddress.phone}</span>}
                    </div>
                    <div className="flex items-start gap-2">
                        <p className="leading-relaxed">{fullAddress || 'Address not available'}</p>
                    </div>
                </div>
                {/* Tag for address type if available, using placeholder logic */}
                <div className="mt-3">
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">Home</span>
                </div>
            </div>

            {/* Price Footer */}
            <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold text-gray-900">₹{order.grandTotal?.toLocaleString()}</h3>
                            <span className="text-sm text-gray-500">Total Price</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            To be paid by {order.paymentMethod}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowPriceDetails(!showPriceDetails)}
                        className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:underline"
                    >
                        More Details {showPriceDetails ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                </div>

                {/* Expandable Price Details */}
                {showPriceDetails && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span>₹{order.subTotal?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>SGST</span>
                            <span>₹{order.sgstTotal?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>CGST</span>
                            <span>₹{order.cgstTotal?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Shipping</span>
                            <span>{order.shippingFee === 0 ? 'Free' : `₹${order.shippingFee}`}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Discount</span>
                            <span className="text-green-600">- ₹{order.discountTotal?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-50">
                            <span>Grand Total</span>
                            <span>₹{order.grandTotal?.toLocaleString()}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
