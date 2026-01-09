import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTrackingInfo } from '../redux/slice/tracking.slice';
import { FiTruck, FiPackage, FiMapPin, FiClock, FiExternalLink, FiRefreshCw } from 'react-icons/fi';
import { MdLocalShipping, MdCheckCircle, MdLocationOn } from 'react-icons/md';

const TrackingWidget = ({ order, showFullDetails = false }) => {
    const dispatch = useDispatch();
    const { trackingData, loading, error } = useSelector(state => state.tracking);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (order?.trackingNumber || order?.shipmentId) {
            dispatch(fetchTrackingInfo(order._id));
        }
    }, [dispatch, order]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await dispatch(fetchTrackingInfo(order._id));
        setRefreshing(false);
    };

    const getStatusIcon = (status) => {
        const statusLower = status?.toLowerCase() || '';
        if (statusLower.includes('delivered')) return <MdCheckCircle className="text-green-500" size={20} />;
        if (statusLower.includes('shipped') || statusLower.includes('transit')) return <FiTruck className="text-blue-500" size={20} />;
        if (statusLower.includes('picked')) return <FiPackage className="text-orange-500" size={20} />;
        return <FiClock className="text-gray-500" size={20} />;
    };

    const getStatusColor = (status) => {
        const statusLower = status?.toLowerCase() || '';
        if (statusLower.includes('delivered')) return 'text-green-600 bg-green-50';
        if (statusLower.includes('shipped') || statusLower.includes('transit')) return 'text-blue-600 bg-blue-50';
        if (statusLower.includes('picked')) return 'text-orange-600 bg-orange-50';
        return 'text-gray-600 bg-gray-50';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!order?.trackingNumber && !order?.shipmentId) {
        return (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
                <FiPackage className="mx-auto text-gray-400 mb-2" size={24} />
                <p className="text-gray-600 text-sm">Tracking information not available yet</p>
                <p className="text-gray-500 text-xs mt-1">We'll update you once your order is shipped</p>
            </div>
        );
    }

    if (loading && !trackingData) {
        return (
            <div className="bg-white rounded-lg border p-4">
                <div className="animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-6 h-6 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 rounded-lg p-4 text-center">
                <p className="text-red-600 text-sm mb-2">Failed to load tracking information</p>
                <button
                    onClick={handleRefresh}
                    className="text-red-600 hover:text-red-700 text-xs underline"
                >
                    Try again
                </button>
            </div>
        );
    }

    const currentStatus = trackingData?.tracking_data?.track_status || order.shiprocketStatus || order.status;
    const scans = trackingData?.tracking_data?.shipment_track || [];

    return (
        <div className="bg-white rounded-lg border">
            {/* Header */}
            <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FiTruck className="text-indigo-600" size={20} />
                        <div>
                            <h3 className="font-medium text-gray-900">Shipment Tracking</h3>
                            {order.trackingNumber && (
                                <p className="text-sm text-gray-500">AWB: {order.trackingNumber}</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <FiRefreshCw className={refreshing ? 'animate-spin' : ''} size={16} />
                    </button>
                </div>
            </div>

            {/* Current Status */}
            <div className="p-4">
                <div className="flex items-center gap-3 mb-4">
                    {getStatusIcon(currentStatus)}
                    <div className="flex-1">
                        <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentStatus)}`}>
                            {currentStatus}
                        </div>
                        {order.carrier && (
                            <p className="text-sm text-gray-600 mt-1">via {order.carrier}</p>
                        )}
                    </div>
                </div>

                {/* Estimated Delivery */}
                {order.estimatedDeliveryDate && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <FiClock size={16} />
                        <span>Expected delivery: {formatDate(order.estimatedDeliveryDate)}</span>
                    </div>
                )}

                {/* Tracking Link */}
                {order.trackingUrl && (
                    <a
                        href={order.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                        <FiExternalLink size={16} />
                        Track on carrier website
                    </a>
                )}
            </div>

            {/* Tracking Timeline */}
            {showFullDetails && scans.length > 0 && (
                <div className="border-t">
                    <div className="p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Tracking History</h4>
                        <div className="space-y-3">
                            {scans.slice(0, 5).map((scan, index) => (
                                <div key={index} className="flex gap-3">
                                    <div className="flex-shrink-0 mt-1">
                                        {getStatusIcon(scan.current_status)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900">
                                            {scan.current_status}
                                        </p>
                                        {scan.location && (
                                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                <MdLocationOn size={12} />
                                                <span>{scan.location}</span>
                                            </div>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formatDate(scan.date)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {scans.length > 5 && (
                            <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium mt-3">
                                View all updates ({scans.length})
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrackingWidget;