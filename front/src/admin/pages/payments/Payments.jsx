import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminOrders } from '../../../redux/slice/adminOrderSlice';
import { MdAttachMoney, MdMoneyOff, MdAccountBalanceWallet } from 'react-icons/md';

const Payments = () => {
    const dispatch = useDispatch();
    const { orders, loading } = useSelector(state => state.adminOrders);

    useEffect(() => {
        dispatch(fetchAdminOrders());
    }, [dispatch]);

    const totalReceived = orders
        .filter(o => o.paymentStatus === 'Paid')
        .reduce((sum, o) => sum + (o.grandTotal || 0), 0);

    const pendingAmount = orders
        .filter(o => o.paymentStatus === 'Pending')
        .reduce((sum, o) => sum + (o.grandTotal || 0), 0);

    // Using Cancelled as proxy for Refunded if refundStatus is not explicitly tracked in order root
    const refundedAmount = orders
        .filter(o => o.status === 'Cancelled' && o.paymentStatus === 'Paid')
        .reduce((sum, o) => sum + (o.grandTotal || 0), 0);


    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Payments & Settlements</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 uppercase font-bold">Total Received</p>
                            <h3 className="text-3xl font-bold text-gray-800 mt-2">₹{totalReceived.toLocaleString()}</h3>
                        </div>
                        <div className="p-3 bg-green-50 text-green-600 rounded-lg"><MdAccountBalanceWallet size={24} /></div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 uppercase font-bold">Pending Settlements</p>
                            <h3 className="text-3xl font-bold text-gray-800 mt-2">₹{pendingAmount.toLocaleString()}</h3>
                        </div>
                        <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg"><MdAttachMoney size={24} /></div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 uppercase font-bold">Refunded</p>
                            <h3 className="text-3xl font-bold text-gray-800 mt-2">₹{refundedAmount.toLocaleString()}</h3>
                        </div>
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg"><MdMoneyOff size={24} /></div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 font-bold text-gray-700">Recent Transactions</div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3">Order ID</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Customer</th>
                            <th className="px-6 py-3">Amount</th>
                            <th className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="5" className="p-4 text-center">Loading...</td></tr>
                        ) : orders && orders.length > 0 ? (
                            orders.slice(0, 10).map(order => (
                                <tr key={order._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-3 font-medium text-indigo-600">{order.orderId}</td>
                                    <td className="px-6 py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-3">{order.user?.firstName || 'User'}</td>
                                    <td className="px-6 py-3">₹{order.grandTotal}</td>
                                    <td className="px-6 py-3">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {order.paymentStatus}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" className="p-4 text-center">No transactions found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Payments;
