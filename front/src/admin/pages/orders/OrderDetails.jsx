import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderById, updateOrderStatus, approveReturn, rejectReturn, adminProcessRefund } from '../../../redux/slice/adminOrderSlice';
import { createShiprocketOrder, requestPickup, syncTrackingData } from '../../../redux/slice/tracking.slice';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import TrackingWidget from '../../../components/TrackingWidget';
import ShippingLabelModal from '../../../components/ShippingLabelModal';
import {
    MdArrowBack, MdDownload, MdEdit, MdDelete, MdLocalShipping, MdPerson,
    MdEmail, MdPhone, MdLocationOn, MdPayment, MdCheckCircle, MdCancel,
    MdMoreVert, MdPrint, MdSync
} from 'react-icons/md';
import { RiVisaLine, RiMastercardLine, RiPaypalLine, RiWallet3Line } from 'react-icons/ri';
import toast from 'react-hot-toast';
import InvoiceModal from '../../components/modals/InvoiceModal';

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentOrder: order, loading, error } = useSelector(state => state.adminOrders);
    const { loading: trackingLoading } = useSelector(state => state.tracking);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
    const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);

    useEffect(() => {
        if (id) {
            dispatch(fetchOrderById(id));
        }
    }, [dispatch, id]);

    const handleStatusUpdate = async (newStatus) => {
        try {
            await dispatch(updateOrderStatus({ id: order._id, status: newStatus })).unwrap();
            toast.success(`Order status updated to ${newStatus}`);
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const handleApproveReturn = async () => {
        try {
            await dispatch(approveReturn(order.orderId)).unwrap();
            toast.success('Return Approved & Pickup Scheduled');
            setIsReturnModalOpen(false);
            dispatch(fetchOrderById(id));
        } catch (err) {
            toast.error(err.message || 'Failed to approve return');
        }
    };

    const handleRejectReturn = async () => {
        const reason = prompt("Enter rejection reason:");
        if (!reason) return;
        try {
            await dispatch(rejectReturn({ orderId: order.orderId, reason })).unwrap();
            toast.success('Return Rejected');
            setIsReturnModalOpen(false);
            dispatch(fetchOrderById(id));
        } catch (err) {
            toast.error(err.message || 'Failed to reject return');
        }
    };

    const handleProcessRefund = async () => {
        // if (!window.confirm(`Process refund of ₹${order.grandTotal}?`)) return; // Removed confirmation here, now handled by modal
        try {
            await dispatch(adminProcessRefund({ orderId: order.orderId, amount: order.grandTotal, note: 'Admin processed from Order Details' })).unwrap();
            toast.success('Refund Processed Successfully');
            setIsRefundModalOpen(false);
            dispatch(fetchOrderById(id));
        } catch (err) {
            toast.error(err.message || 'Failed to process refund');
        }
    };

    const handleCreateShiprocketOrder = async () => {
        try {
            await dispatch(createShiprocketOrder(order._id)).unwrap();
            toast.success('Shiprocket order created successfully');
            // Refresh order data
            dispatch(fetchOrderById(id));
        } catch (err) {
            toast.error(err.message || 'Failed to create Shiprocket order');
        }
    };

    const handleRequestPickup = async () => {
        try {
            await dispatch(requestPickup(order._id)).unwrap();
            toast.success('Pickup requested successfully');
            // Refresh order data
            dispatch(fetchOrderById(id));
        } catch (err) {
            toast.error(err.message || 'Failed to request pickup');
        }
    };

    const handleSyncTracking = async () => {
        try {
            await dispatch(syncTrackingData()).unwrap();
            toast.success('Tracking data synced successfully');
            // Refresh order data
            dispatch(fetchOrderById(id));
        } catch (err) {
            toast.error(err.message || 'Failed to sync tracking data');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <div className="text-red-500 text-xl font-bold mb-2">Error Loading Order</div>
                <p className="text-gray-600">{error}</p>
                <button
                    onClick={() => navigate('/admin/orders')}
                    className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
                >
                    Back to Orders
                </button>
            </div>
        );
    }

    if (!order) return null;

    const getStatusColor = (status) => {
        const styles = {
            Pending: 'bg-yellow-100 text-yellow-700',
            Confirmed: 'bg-indigo-100 text-indigo-700',
            Processing: 'bg-indigo-50 text-indigo-600',
            Shipped: 'bg-blue-100 text-blue-700',
            Delivered: 'bg-green-100 text-green-700',
            Cancelled: 'bg-red-100 text-red-700',
            'Return Requested': 'bg-orange-100 text-orange-700',
            'Return Approved': 'bg-blue-100 text-blue-700',
            'Return Picked': 'bg-purple-100 text-purple-700',
            'Refund Initiated': 'bg-teal-100 text-teal-700',
            'Refund Completed': 'bg-green-100 text-green-700',
            Refunded: 'bg-gray-100 text-gray-700',
        };
        return styles[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="p-6  bg-gray-50 min-h-screen">
            {/* Header Navigation */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/orders')}
                        className="p-2 bg-white rounded-full shadow-sm hover:shadow-md text-gray-600 hover:text-indigo-600 transition-all"
                    >
                        <MdArrowBack size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Order Details</h1>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <span>Order ID: #{order.orderId}</span>
                            <span>•</span>
                            <span>{new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    {/* Refund Action for Cancelled Orders */}
                    {order.status === 'Cancelled' && order.paymentStatus === 'Paid' && order.refundStatus !== 'Completed' && (
                        <button
                            onClick={() => setIsRefundModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-sm transition-all animate-pulse"
                        >
                            <MdPayment size={20} />
                            <span>Process Refund</span>
                        </button>
                    )}

                    {/* Return Request Action */}
                    {order.status === 'Return Requested' && (
                        <button
                            onClick={() => setIsReturnModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium shadow-sm transition-all animate-bounce"
                        >
                            <MdLocalShipping size={20} />
                            <span>Review Return</span>
                        </button>
                    )}

                    <button
                        onClick={() => setIsInvoiceOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium shadow-sm transition-all"
                    >
                        <MdPrint size={20} />
                        <span>Invoice</span>
                    </button>

                    {/* Shiprocket Controls */}
                    {order.paymentStatus === 'Paid' && !order.shiprocketOrderId && order.status !== 'Cancelled' && order.status !== 'Return Requested' && ( // Don't show create shipment if cancelled/return
                        <button
                            onClick={handleCreateShiprocketOrder}
                            disabled={trackingLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-sm transition-all disabled:opacity-50"
                        >
                            <MdLocalShipping size={20} />
                            <span>Create Shipment</span>
                        </button>
                    )}

                    {order.shiprocketOrderId && !order.awbNumber && (
                        <button
                            onClick={handleRequestPickup}
                            disabled={trackingLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-all disabled:opacity-50"
                        >
                            <MdLocalShipping size={20} />
                            <span>Request Pickup</span>
                        </button>
                    )}

                    {order.shipmentId && (
                        <button
                            onClick={() => setIsLabelModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium shadow-sm transition-all"
                        >
                            <MdDownload size={20} />
                            <span>Shipping Label</span>
                        </button>
                    )}

                    <button
                        onClick={handleSyncTracking}
                        disabled={trackingLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium shadow-sm transition-all disabled:opacity-50"
                    >
                        <MdSync size={20} />
                        <span>Sync Tracking</span>
                    </button>

                    <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(e.target.value)}
                        className="px-4 py-2 bg-indigo-600 text-white border-none rounded-lg font-medium shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                    >
                        {['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Return Requested', 'Return Approved', 'Return Picked', 'Refund Initiated', 'Refund Completed'].map(s => (
                            <option key={s} value={s} className="bg-white text-gray-800">{s}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            <h2 className="text-lg font-bold text-gray-800">Order Summary</h2>
                            <div className="flex items-center gap-6">
                                <div className="flex flex-col items-end">
                                    <span className="text-xs text-gray-500 uppercase font-semibold mb-1">Order Status</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusColor(order.status)} border-opacity-20`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="h-8 w-px bg-gray-200"></div>
                                <div className="flex flex-col items-end">
                                    <span className="text-xs text-gray-500 uppercase font-semibold mb-1">Payment Status</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${order.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                        {order.paymentStatus}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                                        <th className="px-6 py-4 font-semibold">Product</th>
                                        <th className="px-6 py-4 font-semibold text-center">Unit Price</th>
                                        <th className="px-6 py-4 font-semibold text-center">Quantity</th>
                                        <th className="px-6 py-4 font-semibold text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {order.items?.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                                                        {item.image ? (
                                                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <MdLocalShipping className="text-gray-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                                                        <p className="text-xs text-gray-500 mt-0.5">Size: {item.size} <span className="mx-1">•</span> SKU: {item.sku}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm text-gray-600">₹{item.price?.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-center text-sm font-medium text-gray-900">{item.quantity}</td>
                                            <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">₹{item.totalPrice?.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50 border-t border-gray-100">
                                    <tr>
                                        <td colSpan="3" className="px-6 py-3 text-sm text-gray-600 text-right">Subtotal</td>
                                        <td className="px-6 py-3 text-sm text-gray-900 text-right font-medium">₹{order.subTotal?.toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan="3" className="px-6 py-3 text-sm text-gray-600 text-right">Tax (GST)</td>
                                        <td className="px-6 py-3 text-sm text-gray-900 text-right font-medium">₹{order.taxTotal?.toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan="3" className="px-6 py-3 text-sm text-gray-600 text-right">Shipping Fee</td>
                                        <td className="px-6 py-3 text-sm text-gray-900 text-right font-medium">₹{order.shippingFee?.toFixed(2) || '0.00'}</td>
                                    </tr>
                                    <tr className="border-t border-gray-200">
                                        <td colSpan="3" className="px-6 py-4 text-base font-bold text-gray-800 text-right">Grand Total</td>
                                        <td className="px-6 py-4 text-base font-bold text-indigo-600 text-right">₹{order.grandTotal?.toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Tracking Widget */}
                    {(order.status === 'Processing' || order.status === 'Shipped' || order.status === 'Delivered' || order.status === 'Return Requested') && (
                        <TrackingWidget order={order} showFullDetails={true} />
                    )}

                    {/* Timeline (Simplified) */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-6">Order Activity</h2>
                        <div className="relative pl-4 border-l-2 border-gray-100 space-y-8">
                            {(() => {
                                const steps = [];

                                // 1. Order Placed (Always First)
                                steps.push({
                                    title: 'Order Placed',
                                    date: order.createdAt,
                                    completed: true,
                                    description: 'Order has been created successfully.',
                                    type: 'standard'
                                });

                                // 2. Cancellation Flow
                                if (order.status === 'Cancelled') {
                                    steps.push({
                                        title: 'Cancelled',
                                        date: order.updatedAt,
                                        completed: true,
                                        description: `Reason: ${order.cancellationReason || 'Order Cancelled'}`,
                                        type: 'error'
                                    });
                                } else {
                                    // 3. Standard Flow (Confirmed, Shipped, Delivered)
                                    // Helper checks
                                    const isConfirmed = order.confirmedAt || ['Confirmed', 'Processing', 'Shipped', 'Delivered', 'Return Requested', 'Return Approved', 'Return Picked', 'Refund Initiated', 'Refund Completed', 'Refunded'].includes(order.status);
                                    const isShipped = order.shippedAt || ['Shipped', 'Delivered', 'Return Requested', 'Return Approved', 'Return Picked', 'Refund Initiated', 'Refund Completed', 'Refunded'].includes(order.status);
                                    const isDelivered = order.deliveredAt || ['Delivered', 'Return Requested', 'Return Approved', 'Return Picked', 'Refund Initiated', 'Refund Completed', 'Refunded'].includes(order.status);

                                    steps.push({ title: 'Confirmed', date: order.confirmedAt, completed: isConfirmed, type: 'standard' });
                                    steps.push({ title: 'Shipped', date: order.shippedAt, completed: isShipped, type: 'standard' });
                                    steps.push({ title: 'Delivered', date: order.deliveredAt, completed: isDelivered, type: 'standard' });

                                    // 4. Return Flow (Appended only if relevant)
                                    const returnStatuses = ['Return Requested', 'Return Approved', 'Return Picked', 'Refund Initiated', 'Refund Completed', 'Refunded'];

                                    if (returnStatuses.includes(order.status) || order.returnStatus === 'Requested') {
                                        steps.push({
                                            title: 'Return Requested',
                                            date: order.status === 'Return Requested' ? order.updatedAt : null,
                                            completed: true,
                                            description: `Reason: ${order.returnReason}`,
                                            type: 'warning'
                                        });

                                        const isReturnApproved = ['Return Approved', 'Return Picked', 'Refund Initiated', 'Refund Completed', 'Refunded'].includes(order.status);
                                        steps.push({ title: 'Return Approved', completed: isReturnApproved, type: 'warning' });

                                        const isReturnPicked = ['Return Picked', 'Refund Initiated', 'Refund Completed', 'Refunded'].includes(order.status);
                                        steps.push({ title: 'Return Picked', completed: isReturnPicked, type: 'warning' });

                                        const isRefunded = ['Refund Completed', 'Refunded'].includes(order.status);
                                        steps.push({ title: 'Refund Completed', date: order.refundDate, completed: isRefunded, type: 'success' });
                                    }
                                }

                                return steps.map((step, idx) => {
                                    let dotClass = 'bg-gray-300';
                                    let ringClass = '';

                                    if (step.completed) {
                                        if (step.type === 'error') { dotClass = 'bg-red-600'; ringClass = 'ring-red-50'; }
                                        else if (step.type === 'warning') { dotClass = 'bg-orange-500'; ringClass = 'ring-orange-50'; }
                                        else if (step.type === 'success') { dotClass = 'bg-green-600'; ringClass = 'ring-green-50'; }
                                        else { dotClass = 'bg-indigo-600'; ringClass = 'ring-indigo-50'; }
                                    }

                                    return (
                                        <div key={idx} className={`relative ${step.completed ? '' : 'opacity-40'}`}>
                                            <span className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full ring-4 ${step.completed ? ringClass : ''} ${dotClass}`}></span>
                                            <div className={`mb-1 text-sm font-semibold ${step.type === 'error' ? 'text-red-700' : 'text-gray-900'}`}>{step.title}</div>
                                            {step.date && <div className="text-xs text-gray-500">{new Date(step.date).toLocaleString()}</div>}
                                            {step.description && <p className="text-sm text-gray-600 mt-1">{step.description}</p>}
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-6">
                    {/* Customer Details */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-base font-bold text-gray-800">Customer Details</h3>
                            <button className="text-gray-400 hover:text-indigo-600"><MdEdit /></button>
                        </div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg overflow-hidden">
                                {order.user?.avatar ? <img src={order.user.avatar} alt="" className="w-full h-full object-cover" /> : (order.user?.firstName?.[0] || 'U')}
                            </div>
                            <div>
                                <div className="font-bold text-gray-900">{order.user?.firstName} {order.user?.lastName}</div>
                                <div className="text-xs text-gray-500">Customer since {new Date().getFullYear()}</div> {/* Placeholder */}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                                    <MdEmail size={16} />
                                </div>
                                <div className="text-sm break-all">
                                    <div className="text-gray-500 text-xs">Email</div>
                                    <a href={`mailto:${order.user?.email}`} className="text-gray-800 font-medium hover:text-indigo-600 transition-colors">{order.user?.email}</a>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                                    <MdPhone size={16} />
                                </div>
                                <div className="text-sm">
                                    <div className="text-gray-500 text-xs">Phone</div>
                                    <div className="text-gray-800 font-medium">{order.shippingAddress?.mobile || order.user?.phone || 'N/A'}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-base font-bold text-gray-800">Shipping Address</h3>
                            <button className="text-gray-400 hover:text-indigo-600"><MdEdit /></button>
                        </div>
                        <div className="mb-4 rounded-lg overflow-hidden h-48 bg-gray-100 relative shadow-inner">
                            <iframe
                                title="Order Location"
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                scrolling="no"
                                marginHeight="0"
                                marginWidth="0"
                                src={`https://maps.google.com/maps?q=${encodeURIComponent(`${order.shippingAddress?.streetAddress}, ${order.shippingAddress?.city}, ${order.shippingAddress?.zipCode}`)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                            >
                            </iframe>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                            <div className="font-bold text-gray-900 mb-1">{order.shippingAddress?.fullName}</div>
                            <p>{order.shippingAddress?.streetAddress}</p>
                            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                            <p>{order.shippingAddress?.zipCode}, {order.shippingAddress?.country}</p>
                        </div>
                    </div>

                    {/* Billing Details */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-base font-bold text-gray-800">Billing Details</h3>
                            <button className="text-gray-400 hover:text-indigo-600"><MdEdit /></button>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                            <div className="font-bold text-gray-900 mb-1">{order.shippingAddress?.fullName}</div>
                            <p>Same as shipping address</p>
                        </div>
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <div className="text-xs text-gray-500 uppercase font-semibold mb-3">Payment & Refund</div>

                                {/* Payment Status */}
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="p-2 rounded bg-gray-50 border border-gray-200 mt-1">
                                        {order.paymentMethod === 'Card' ? <RiVisaLine size={24} className="text-blue-600" /> : <MdPayment size={24} className="text-green-600" />}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">{order.paymentMethod} Payment</div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {order.paymentStatus}
                                            </span>
                                            {order.paymentStatus === 'Paid' && (
                                                <span className="text-xs text-gray-500">
                                                    {new Date(order.paymentMethod === 'COD' && order.deliveredAt ? order.deliveredAt : order.createdAt).toLocaleDateString()} {new Date(order.paymentMethod === 'COD' && order.deliveredAt ? order.deliveredAt : order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                </div>

                                {/* Refund Status */}
                                {order.refundStatus && order.refundStatus !== 'None' && (
                                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className={`w-2 h-2 rounded-full ${order.refundStatus === 'Completed' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                            <span className="text-sm font-bold text-gray-800">Refund {order.refundStatus}</span>
                                        </div>
                                        <div className="space-y-1 pl-4 border-l-2 border-gray-200">
                                            {order.refundAmount && (
                                                <div className="text-xs text-gray-600 flex justify-between">
                                                    <span>Amount:</span>
                                                    <span className="font-semibold text-gray-900">₹{order.refundAmount}</span>
                                                </div>
                                            )}
                                            {order.refundDate && (
                                                <div className="text-xs text-gray-600 flex justify-between">
                                                    <span>Date:</span>
                                                    <span className="text-gray-900">{new Date(order.refundDate).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            )}
                                            {order.refundId && (
                                                <div className="text-[10px] text-gray-400 mt-1 font-mono uppercase tracking-wider">
                                                    ID: {order.refundId}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Refund Confirmation Modal */}
                {isRefundModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="text-xl font-bold text-gray-800">Process Refund</h3>
                                <button onClick={() => setIsRefundModalOpen(false)} className="text-gray-400 hover:text-gray-600"><MdCancel size={24} /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-lg border border-amber-100 text-amber-800">
                                    <MdCheckCircle size={24} className="mt-1 shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-sm uppercase mb-1">Confirmation Required</h4>
                                        <p className="text-sm">You are about to initate a refund of <span className="font-bold">₹{order.grandTotal}</span> for order #{order.orderId}. This action cannot be undone.</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Refund</label>
                                    <input
                                        type="text"
                                        disabled
                                        value={order.cancellationReason || 'Order Cancelled'}
                                        className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-600"
                                    />
                                </div>
                            </div>
                            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                                <button onClick={() => setIsRefundModalOpen(false)} className="px-5 py-2.5 bg-white text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium transition-colors">
                                    Cancel
                                </button>
                                <button onClick={handleProcessRefund} className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-sm transition-colors">
                                    Confirm & Refund
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Return Request Modal */}
                {isReturnModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="text-xl font-bold text-gray-800">Review Return Request</h3>
                                <button onClick={() => setIsReturnModalOpen(false)} className="text-gray-400 hover:text-gray-600"><MdCancel size={24} /></button>
                            </div>
                            <div className="p-6 space-y-6">
                                <div>
                                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Return Reason</span>
                                    <p className="mt-2 p-3 bg-gray-50 rounded-lg text-gray-800 border border-gray-100">{order.returnReason || 'No reason provided'}</p>
                                </div>

                                {order.returnImages && order.returnImages.length > 0 && (
                                    <div>
                                        <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Returned Images</span>
                                        <div className="grid grid-cols-4 gap-4 mt-3">
                                            {order.returnImages.map((img, i) => (
                                                <a key={i} href={img} target="_blank" rel="noreferrer" className="aspect-square rounded-lg overflow-hidden border border-gray-200 block hover:ring-2 ring-indigo-500 transition-all">
                                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {order.paymentMethod === 'COD' && order.refundBankDetails && (
                                    <div>
                                        <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Bank Details (COD Refund)</span>
                                        <div className="mt-2 p-4 bg-blue-50 rounded-lg border border-blue-100 space-y-2">
                                            <div className="flex justify-between"><span className="text-gray-500 text-sm">Account Name:</span> <span className="font-semibold text-gray-900">{order.refundBankDetails.accountHolderName}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-500 text-sm">Account Number:</span> <span className="font-semibold text-gray-900">{order.refundBankDetails.accountNumber}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-500 text-sm">IFSC Code:</span> <span className="font-semibold text-gray-900">{order.refundBankDetails.ifscCode}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-500 text-sm">Bank Name:</span> <span className="font-semibold text-gray-900">{order.refundBankDetails.bankName}</span></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                                <button
                                    onClick={handleRejectReturn}
                                    className="px-5 py-2.5 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 font-medium transition-colors"
                                >
                                    Reject Return
                                </button>
                                <button
                                    onClick={handleApproveReturn}
                                    className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-sm transition-colors"
                                >
                                    Approve & Schedule Pickup
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <InvoiceModal
                    isOpen={isInvoiceOpen}
                    onClose={() => setIsInvoiceOpen(false)}
                    order={order}
                />
                <ShippingLabelModal
                    isOpen={isLabelModalOpen}
                    onClose={() => setIsLabelModalOpen(false)}
                    order={order}
                />
            </div>
            );
};

            export default OrderDetails;
