import React, { useEffect, useState } from 'react';
import { FiClock, FiCheck, FiX, FiChevronRight, FiTruck } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserOrders } from '../../redux/slice/order.slice';

import OrderDetails from './OrderDetails';
import TrackingWidget from '../TrackingWidget';

export default function MyOrders() {
    const [filter, setFilter] = useState('All orders');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const dispatch = useDispatch();
    const { orders, loading } = useSelector((state) => state.order);

    useEffect(() => {
        dispatch(fetchUserOrders());
    }, [dispatch]);

    const getStatusConfig = (status) => {
        switch (status) {
            case 'Pending':
                return {
                    icon: <FiClock className="w-5 h-5 text-orange-600" />,
                    bg: 'bg-orange-50',
                    text: 'text-orange-900',
                    title: 'Order Pending'
                };
            case 'Processing':
            case 'Shipped':
                return {
                    icon: <FiTruck className="w-5 h-5 text-blue-600" />,
                    bg: 'bg-blue-50',
                    text: 'text-blue-900',
                    title: status === 'Processing' ? 'Order Processing' : 'Order Shipped'
                };
            case 'Delivered':
                return {
                    icon: <FiCheck className="w-5 h-5 text-green-600" />,
                    bg: 'bg-green-50',
                    text: 'text-green-900',
                    title: 'Order Delivered'
                };
            case 'Cancelled':
                return {
                    icon: <FiX className="w-5 h-5 text-red-600" />,
                    bg: 'bg-red-50',
                    text: 'text-red-900',
                    title: 'Order Cancelled'
                };
            default:
                return {
                    icon: <FiClock />,
                    bg: 'bg-gray-50',
                    text: 'text-gray-900',
                    title: status
                };
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const filteredOrders = orders?.filter(order => {
        if (filter === 'All orders') return true;
        return order.status === filter;
    }) || [];

    if (loading && !selectedOrder) {
        return <div className="w-full h-64 flex items-center justify-center">Loading orders...</div>;
    }

    if (selectedOrder) {
        return (
            <OrderDetails
                order={selectedOrder}
                onBack={() => setSelectedOrder(null)}
            />
        );
    }

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">MY ORDERS</h2>
                <div className="relative">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black cursor-pointer"
                    >
                        <option>All orders</option>
                        <option>Pending</option>
                        <option>Delivered</option>
                        <option>Cancelled</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                    </div>
                </div>
            </div>

            {/* Orders List */}
            <div className="space-y-6">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">No orders found</div>
                ) : (
                    filteredOrders.map((order) => {
                        const statusConfig = getStatusConfig(order.status);

                        return (
                            <div
                                key={order._id}
                                onClick={() => setSelectedOrder(order)}
                                className="bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer"
                            >
                                {/* Order Header */}
                                <div className="p-6 flex items-center justify-between cursor-pointer group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${statusConfig.bg}`}>
                                            {statusConfig.icon}
                                        </div>
                                        <div>
                                            <h4 className="text-base font-semibold text-gray-900">{statusConfig.title}</h4>
                                            <p className="text-sm text-gray-500 mt-0.5">
                                                {order.status === 'Delivered' ? 'Delivered on' : 'Placed on'} {formatDate(order.placedAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-gray-400 group-hover:text-gray-600 transition-colors flex items-center gap-2">
                                        <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded text-gray-600">{order.orderId}</span>
                                        <FiChevronRight size={20} />
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="h-px bg-gray-100 mx-6"></div>

                                {/* Order Items */}
                                <div className="p-6 space-y-6">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="flex gap-4 sm:gap-6">
                                            <div className="w-20 h-24 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover object-top"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h5 className="text-sm sm:text-base font-medium text-gray-900 truncate pr-4">
                                                    {item.name}
                                                </h5>
                                                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-500">
                                                    {item.color && <p>Color: <span className="text-gray-700">{item.color}</span></p>}
                                                    {item.size && <p>Size: <span className="text-gray-700">{item.size}</span></p>}
                                                </div>
                                                <div className="mt-2 space-y-1">
                                                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                    <p className="text-sm font-semibold text-gray-900">₹{item.price}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 bg-gray-50 px-6 flex justify-between items-center text-sm">
                                    <span className="font-medium text-gray-600">Total Amount</span>
                                    <span className="font-bold text-gray-900">₹{order.grandTotal}</span>
                                </div>

                                {/* Real-time Tracking Widget for active orders */}
                                {(order.status === 'Processing' || order.status === 'Shipped') && (
                                    <div className="p-6 pt-0">
                                        <TrackingWidget order={order} showFullDetails={false} />
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
