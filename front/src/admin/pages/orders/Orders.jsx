import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminOrders, updateOrderStatus } from '../../../redux/slice/adminOrderSlice';
import { MdVisibility, MdLocalShipping, MdCheckCircle, MdCancel } from 'react-icons/md';

const Orders = () => {
    const dispatch = useDispatch();
    const { orders, loading } = useSelector(state => state.adminOrders);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        dispatch(fetchAdminOrders({ status: filter }));
    }, [dispatch, filter]);

    const handleStatusUpdate = (id, status) => {
        dispatch(updateOrderStatus({ id, status }));
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'Shipped': return 'bg-blue-100 text-blue-800';
            case 'Delivered': return 'bg-green-100 text-green-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Orders</h2>
                <select
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
                        <tr>
                            <th className="px-6 py-4">Order ID</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Total</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Payment</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="7" className="text-center py-4">Loading...</td></tr>
                        ) : orders.map((order) => (
                            <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-indigo-600">{order.orderId}</td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{order.user?.firstName} {order.user?.lastName}</div>
                                    <div className="text-xs text-gray-400">{order.user?.email}</div>
                                </td>
                                <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4">₹{order.grandTotal}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs font-semibold border border-gray-200 px-2 py-1 rounded">
                                        {order.paymentMethod}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        {order.status === 'Pending' && (
                                            <button
                                                onClick={() => handleStatusUpdate(order._id, 'Confirmed')}
                                                className="p-1 text-green-600 hover:bg-green-50 rounded" title="Confirm"
                                            >
                                                <MdCheckCircle size={18} />
                                            </button>
                                        )}
                                        {order.status === 'Confirmed' && (
                                            <button
                                                onClick={() => handleStatusUpdate(order._id, 'Shipped')}
                                                className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Ship"
                                            >
                                                <MdLocalShipping size={18} />
                                            </button>
                                        )}
                                        {order.status === 'Shipped' && (
                                            <button
                                                onClick={() => handleStatusUpdate(order._id, 'Delivered')}
                                                className="p-1 text-purple-600 hover:bg-purple-50 rounded" title="Deliver"
                                            >
                                                <MdCheckCircle size={18} />
                                            </button>
                                        )}
                                        <button className="p-1 text-gray-500 hover:bg-gray-100 rounded" title="View Details">
                                            <MdVisibility size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-center">
                {/* Pagination Placeholders */}
                <button className="text-sm text-indigo-600 font-medium hover:underline">View All Orders</button>
            </div>
        </div>
    );
};

export default Orders;
