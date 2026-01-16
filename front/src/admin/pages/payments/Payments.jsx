import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminOrders, approveReturn, rejectReturn, adminProcessRefund } from '../../../redux/slice/adminOrderSlice';
import { MdAttachMoney, MdMoneyOff, MdAccountBalanceWallet } from 'react-icons/md';
import toast from 'react-hot-toast';

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

    const refundedAmount = orders
        .filter(o => o.status === 'Cancelled' && o.paymentStatus === 'Paid') // Approximate
        .reduce((sum, o) => sum + (o.grandTotal || 0), 0);

    const returnRequests = orders.filter(o => o.status === 'Return Requested');

    const handleApproveReturn = async (orderId) => {
        try {
            await dispatch(approveReturn(orderId)).unwrap();
            toast.success('Return Approved & Pickup Scheduled');
        } catch (err) {
            toast.error(err.message || 'Failed to approve return');
        }
    };

    const handleRejectReturn = async (orderId) => {
        const reason = prompt("Enter rejection reason:");
        if (!reason) return;
        try {
            await dispatch(rejectReturn({ orderId, reason })).unwrap();
            toast.success('Return Rejected');
        } catch (err) {
            toast.error(err.message || 'Failed to reject return');
        }
    };

    const handleProcessRefund = async (orderId, amount) => {
        if (!window.confirm(`Are you sure you want to process refund of ₹${amount}?`)) return;
        try {
            await dispatch(adminProcessRefund({ orderId, amount, note: 'Admin manual approval' })).unwrap();
            toast.success('Refund Processed Successfully');
        } catch (err) {
            toast.error(err.message || 'Failed to process refund');
        }
    };

    const pendingRefunds = orders.filter(o => o.refundStatus === 'Initiated' && o.paymentStatus !== 'Refunded');

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-gray-800">Payments & Returns</h2>

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

            {/* Return Requests Table */}
            {returnRequests.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-orange-200 overflow-hidden">
                    <div className="p-4 border-b border-orange-100 bg-orange-50 font-bold text-orange-800 flex justify-between items-center">
                        <span>Returns Pending Approval</span>
                        <span className="bg-orange-200 text-orange-800 text-xs px-2 py-1 rounded-full">{returnRequests.length} Pending</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-orange-50 border-b border-orange-100">
                                <tr>
                                    <th className="px-6 py-3 text-orange-800">Order ID</th>
                                    <th className="px-6 py-3 text-orange-800">Reason</th>
                                    <th className="px-6 py-3 text-orange-800">Images</th>
                                    <th className="px-6 py-3 text-orange-800 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {returnRequests.map(order => (
                                    <tr key={order._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-3 font-medium">{order.orderId}</td>
                                        <td className="px-6 py-3">{order.returnReason}</td>
                                        <td className="px-6 py-3 flex gap-2">
                                            {order.returnImages?.map((img, i) => (
                                                <a key={i} href={img} target="_blank" rel="noreferrer" className="block w-8 h-8 rounded overflow-hidden border">
                                                    <img src={img} alt="return" className="w-full h-full object-cover" />
                                                </a>
                                            ))}
                                        </td>
                                        <td className="px-6 py-3 text-right space-x-2">
                                            <button
                                                onClick={() => handleApproveReturn(order.orderId)}
                                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleRejectReturn(order.orderId)}
                                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                                            >
                                                Reject
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Pending Refunds Table */}
            {pendingRefunds.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-red-200 overflow-hidden">
                    <div className="p-4 border-b border-red-100 bg-red-50 font-bold text-red-800 flex justify-between items-center">
                        <span>Refunds Pending Approval</span>
                        <span className="bg-red-200 text-red-800 text-xs px-2 py-1 rounded-full">{pendingRefunds.length} Pending</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-red-50 border-b border-red-100">
                                <tr>
                                    <th className="px-6 py-3 text-red-800">Order ID</th>
                                    <th className="px-6 py-3 text-red-800">Amount</th>
                                    <th className="px-6 py-3 text-red-800">Reason</th>
                                    <th className="px-6 py-3 text-red-800 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {pendingRefunds.map(order => (
                                    <tr key={order._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-3 font-medium">{order.orderId}</td>
                                        <td className="px-6 py-3">₹{order.grandTotal.toLocaleString()}</td>
                                        <td className="px-6 py-3">{order.cancellationReason || order.returnReason || 'N/A'}</td>
                                        <td className="px-6 py-3 text-right">
                                            <button
                                                onClick={() => handleProcessRefund(order.orderId, order.grandTotal)}
                                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                                            >
                                                Process Refund
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 font-bold text-gray-700">Recent Transactions</div>
                <div className="overflow-x-auto">
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
        </div>
    );
};

export default Payments;
