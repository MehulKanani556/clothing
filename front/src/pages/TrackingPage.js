import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiTruck, FiMapPin, FiClock, FiPackage } from 'react-icons/fi';
import TrackingWidget from '../components/TrackingWidget';
import axiosInstance from '../utils/axiosInstance';
import { BASE_URL } from '../utils/BASE_URL';

export default function TrackingPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Try to fetch order details for tracking
            const response = await axiosInstance.get(`${BASE_URL}/shiprocket/track/${orderId}`);
            
            if (response.data.success) {
                // Create a minimal order object for TrackingWidget
                setOrder({
                    _id: orderId,
                    orderId: response.data.data.orderId,
                    status: response.data.data.status,
                    trackingNumber: response.data.data.trackingNumber,
                    carrier: response.data.data.carrier,
                    currentLocation: response.data.data.currentLocation,
                    expectedDeliveryDate: response.data.data.expectedDeliveryDate,
                    trackingHistory: response.data.data.trackingHistory
                });
            }
        } catch (err) {
            console.error('Failed to fetch tracking data:', err);
            setError('Unable to fetch tracking information. Please check your order ID.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading tracking information...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Tracking Not Available</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <FiArrowLeft className="w-4 h-4" />
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <FiArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Track Your Order</h1>
                            <p className="text-gray-600">Order #{order?.orderId}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                {order ? (
                    <TrackingWidget order={order} showFullDetails={true} />
                ) : (
                    <div className="text-center py-12">
                        <FiTruck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Tracking Information</h2>
                        <p className="text-gray-600">Tracking information will be available once your order is shipped.</p>
                    </div>
                )}
            </div>
        </div>
    );
}