import React, { useState, useEffect } from 'react';
import { FiTruck, FiMapPin, FiClock, FiCheck, FiRefreshCw, FiPackage, FiHome } from 'react-icons/fi';
import axiosInstance from '../utils/axiosInstance';
import { BASE_URL } from '../utils/BASE_URL';

export default function TrackingWidget({ order, showFullDetails = false }) {
    const [trackingData, setTrackingData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    // Auto-refresh tracking data every 30 seconds for active shipments
    useEffect(() => {
        if (order && (order.status === 'Processing' || order.status === 'Shipped')) {
            fetchTrackingData();
            
            const interval = setInterval(() => {
                fetchTrackingData(true); // Silent refresh
            }, 30000); // 30 seconds

            return () => clearInterval(interval);
        }
    }, [order]);

    const fetchTrackingData = async (silent = false) => {
        if (!order || !order._id) return;

        if (!silent) setLoading(true);
        setError(null);

        try {
            const response = await axiosInstance.get(`${BASE_URL}/shiprocket/orders/${order._id}/tracking/detailed`);
            
            if (response.data.success) {
                setTrackingData(response.data.data);
                setLastUpdated(new Date());
            }
        } catch (err) {
            console.error('Failed to fetch tracking data:', err);
            
            // If the order doesn't have tracking info yet, show a friendly message
            if (err.response?.status === 400 && err.response?.data?.message?.includes('No tracking information')) {
                setError('Tracking information will be available once your order is shipped');
            } else if (err.response?.status === 401) {
                setError('Authentication required to view tracking details');
            } else {
                setError('Unable to fetch tracking information');
            }
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        const statusLower = status?.toLowerCase() || '';
        
        if (statusLower.includes('delivered')) {
            return <FiHome className="w-4 h-4 text-green-600" />;
        } else if (statusLower.includes('out for delivery')) {
            return <FiTruck className="w-4 h-4 text-blue-600" />;
        } else if (statusLower.includes('transit') || statusLower.includes('shipped') || statusLower.includes('destination')) {
            return <FiTruck className="w-4 h-4 text-indigo-600" />;
        } else if (statusLower.includes('picked') || statusLower.includes('pickup')) {
            return <FiPackage className="w-4 h-4 text-orange-600" />;
        } else {
            return <FiClock className="w-4 h-4 text-gray-600" />;
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (!order || (order.status !== 'Processing' && order.status !== 'Shipped' && order.status !== 'Delivered')) {
        return null;
    }

    // Show basic tracking info from order data if no detailed tracking is available
    const showBasicTracking = !trackingData && !loading && (order.status === 'Processing' || order.status === 'Shipped');

    return (
        <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <FiTruck className="w-5 h-5" />
                    Track Your Order
                </h3>
                <div className="flex items-center gap-2">
                    {lastUpdated && (
                        <span className="text-xs text-gray-500">
                            Updated {formatDateTime(lastUpdated)}
                        </span>
                    )}
                    <button
                        onClick={() => fetchTrackingData()}
                        disabled={loading}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                        title="Refresh tracking"
                    >
                        <FiRefreshCw className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {loading && !trackingData ? (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            ) : error ? (
                <div className="text-center py-8">
                    <p className="text-amber-600 text-sm">{error}</p>
                    {showBasicTracking && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-3">
                                <FiTruck className="w-5 h-5 text-blue-600" />
                                <div className="flex-1 text-left">
                                    <h4 className="font-semibold text-gray-900">{order.status}</h4>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Your order is being processed. Detailed tracking will be available once shipped.
                                    </p>
                                    {order.shippedAt && (
                                        <p className="text-sm text-green-600 mt-1">
                                            Shipped on: {formatDate(order.shippedAt)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : trackingData ? (
                <div className="space-y-4">
                    {/* Current Status */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            {getStatusIcon(trackingData.status)}
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{trackingData.status || 'In Transit'}</h4>
                                {trackingData.currentLocation && (
                                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                        <FiMapPin className="w-3 h-3" />
                                        {trackingData.currentLocation}
                                    </p>
                                )}
                                {trackingData.expectedDeliveryDate && (
                                    <p className="text-sm text-green-600 mt-1">
                                        Expected delivery: {formatDate(trackingData.expectedDeliveryDate)}
                                    </p>
                                )}
                                {trackingData.estimatedDeliveryDate && (
                                    <p className="text-sm text-blue-600 mt-1">
                                        Estimated delivery: {formatDate(trackingData.estimatedDeliveryDate)}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tracking Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        {/* Tracking Number */}
                        {trackingData.trackingNumber && (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Tracking Number:</span>
                                <span className="font-mono font-semibold text-gray-900">{trackingData.trackingNumber}</span>
                            </div>
                        )}

                        {/* Carrier Info */}
                        {trackingData.carrier && (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Carrier:</span>
                                <span className="font-semibold text-gray-900">{trackingData.carrier}</span>
                            </div>
                        )}

                        {/* Courier Name */}
                        {trackingData.courierName && (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Courier:</span>
                                <span className="font-semibold text-gray-900">{trackingData.courierName}</span>
                            </div>
                        )}

                        {/* Package Count */}
                        {trackingData.packages && (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Packages:</span>
                                <span className="font-semibold text-gray-900">{trackingData.packages}</span>
                            </div>
                        )}

                        {/* Weight */}
                        {trackingData.weight && (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Weight:</span>
                                <span className="font-semibold text-gray-900">{trackingData.weight} kg</span>
                            </div>
                        )}

                        {/* Tracking URL */}
                        {trackingData.trackingUrl && (
                            <div className="sm:col-span-2">
                                <a 
                                    href={trackingData.trackingUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                    <FiTruck className="w-4 h-4" />
                                    Track on Shiprocket
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Tracking History */}
                    {showFullDetails && trackingData.trackingHistory && trackingData.trackingHistory.length > 0 && (
                        <div className="mt-6">
                            <h4 className="font-semibold text-gray-900 mb-3">Tracking History</h4>
                            <div className="space-y-3">
                                {trackingData.trackingHistory.map((event, index) => (
                                    <div key={index} className="flex gap-3">
                                        <div className="flex-shrink-0 mt-1">
                                            {index === 0 ? (
                                                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                            ) : (
                                                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {event.description || event.status}
                                                    </p>
                                                    {event.location && (
                                                        <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                                                            <FiMapPin className="w-3 h-3" />
                                                            {event.location}
                                                        </p>
                                                    )}
                                                </div>
                                                <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                                    {formatDateTime(event.timestamp)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick Status Summary for non-detailed view */}
                    {!showFullDetails && trackingData.trackingHistory && trackingData.trackingHistory.length > 0 && (
                        <div className="text-center">
                            <button
                                onClick={() => window.open(`/track/${order._id}`, '_blank')}
                                className="text-blue-600 text-sm hover:underline"
                            >
                                View detailed tracking →
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    <FiTruck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">Tracking information will be available once your order is shipped</p>
                    {order.status === 'Processing' && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-3">
                                <FiPackage className="w-5 h-5 text-blue-600" />
                                <div className="flex-1 text-left">
                                    <h4 className="font-semibold text-gray-900">Order Processing</h4>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Your order is being prepared for shipment. You'll receive tracking details soon.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}