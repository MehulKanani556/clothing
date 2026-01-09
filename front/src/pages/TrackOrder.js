import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTrackingInfo } from '../redux/slice/tracking.slice';
import TrackingWidget from '../components/TrackingWidget';
import { FiSearch, FiPackage } from 'react-icons/fi';

const TrackOrder = () => {
    const { orderId } = useParams();
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch();
    const { trackingData, loading, error } = useSelector(state => state.tracking);
    const [searchOrderId, setSearchOrderId] = useState(orderId || searchParams.get('order') || '');
    const [searchedOrder, setSearchedOrder] = useState(null);

    useEffect(() => {
        if (orderId) {
            handleSearch(orderId);
        }
    }, [orderId]);

    const handleSearch = async (orderIdToSearch = searchOrderId) => {
        if (!orderIdToSearch.trim()) return;
        
        try {
            // For demo purposes, create a mock order object
            // In real implementation, you'd fetch order details first
            const mockOrder = {
                _id: orderIdToSearch,
                orderId: orderIdToSearch,
                status: 'Shipped',
                trackingNumber: 'AWB123456789',
                carrier: 'Delhivery',
                estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                shippingAddress: {
                    firstName: 'John',
                    lastName: 'Doe',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    pincode: '400001'
                }
            };
            
            setSearchedOrder(mockOrder);
            await dispatch(fetchTrackingInfo(orderIdToSearch));
        } catch (err) {
            console.error('Failed to fetch tracking info:', err);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSearch();
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
                    <p className="text-gray-600">Enter your order ID to get real-time tracking information</p>
                </div>

                {/* Search Form */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                    <form onSubmit={handleSubmit} className="flex gap-4">
                        <div className="flex-1">
                            <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-2">
                                Order ID
                            </label>
                            <input
                                type="text"
                                id="orderId"
                                value={searchOrderId}
                                onChange={(e) => setSearchOrderId(e.target.value)}
                                placeholder="Enter your order ID (e.g., ORD-12345)"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                disabled={loading || !searchOrderId.trim()}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                                <FiSearch size={20} />
                                Track Order
                            </button>
                        </div>
                    </form>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Fetching tracking information...</p>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="bg-red-50 rounded-lg border border-red-200 p-6 text-center">
                        <FiPackage className="mx-auto text-red-400 mb-4" size={48} />
                        <h3 className="text-lg font-medium text-red-800 mb-2">Order Not Found</h3>
                        <p className="text-red-600 mb-4">{error}</p>
                        <p className="text-sm text-red-500">
                            Please check your order ID and try again. If you continue to have issues, contact our support team.
                        </p>
                    </div>
                )}

                {/* Tracking Results */}
                {searchedOrder && !loading && !error && (
                    <div className="space-y-6">
                        {/* Order Info */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Order Information</h2>
                                <span className="text-sm text-gray-500">Order ID: {searchedOrder.orderId}</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500">Delivery Address:</span>
                                    <p className="font-medium text-gray-900">
                                        {searchedOrder.shippingAddress.firstName} {searchedOrder.shippingAddress.lastName}
                                    </p>
                                    <p className="text-gray-600">
                                        {searchedOrder.shippingAddress.city}, {searchedOrder.shippingAddress.state} - {searchedOrder.shippingAddress.pincode}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Current Status:</span>
                                    <p className="font-medium text-gray-900">{searchedOrder.status}</p>
                                    {searchedOrder.estimatedDeliveryDate && (
                                        <p className="text-gray-600">
                                            Expected delivery: {searchedOrder.estimatedDeliveryDate.toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Tracking Widget */}
                        <TrackingWidget order={searchedOrder} showFullDetails={true} />
                    </div>
                )}

                {/* Help Section */}
                <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 mt-8">
                    <h3 className="text-lg font-medium text-blue-900 mb-2">Need Help?</h3>
                    <p className="text-blue-700 mb-4">
                        If you're having trouble tracking your order or have questions about delivery, we're here to help.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Contact Support
                        </button>
                        <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                            View Order History
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrackOrder;