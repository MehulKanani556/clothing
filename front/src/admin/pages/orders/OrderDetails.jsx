import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderById, updateOrderStatus } from '../../../redux/slice/adminOrderSlice';
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
                    <button
                        onClick={() => setIsInvoiceOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium shadow-sm transition-all"
                    >
                        <MdPrint size={20} />
                        <span>Invoice</span>
                    </button>
                    
                    {/* Shiprocket Controls */}
                    {order.paymentStatus === 'Paid' && !order.shiprocketOrderId && (
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
                        {['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
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
                                        <td className="px-6 py-3 text-sm text-gray-900 text-right font-medium">₹0.00</td>
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
                    {(order.status === 'Processing' || order.status === 'Shipped' || order.status === 'Delivered') && (
                        <TrackingWidget order={order} showFullDetails={true} />
                    )}

                    {/* Timeline (Simplified) */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-6">Order Activity</h2>
                        <div className="relative pl-4 border-l-2 border-gray-100 space-y-8">
                            <div className="relative">
                                <span className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-indigo-600 ring-4 ring-indigo-50"></span>
                                <div className="mb-1 text-sm font-semibold text-gray-900">Order Placed</div>
                                <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</div>
                                <p className="text-sm text-gray-600 mt-2">Order has been created successfully.</p>
                            </div>
                            {['Confirmed', 'Shipped', 'Delivered'].map((stepStatus) => {
                                const isCompleted = ['Confirmed', 'Shipped', 'Delivered'].indexOf(order.status) >= ['Confirmed', 'Shipped', 'Delivered'].indexOf(stepStatus);
                                return (
                                    <div key={stepStatus} className={`relative ${isCompleted ? '' : 'opacity-50'}`}>
                                        <span className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full ${isCompleted ? 'bg-indigo-600 ring-4 ring-indigo-50' : 'bg-gray-300'}`}></span>
                                        <div className="mb-1 text-sm font-semibold text-gray-900">{stepStatus}</div>
                                        {isCompleted && <div className="text-xs text-gray-500">Updated recently</div>}
                                    </div>
                                );
                            })}
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
                            <div className="text-xs text-gray-500 uppercase font-semibold mb-2">Payment Method</div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded bg-gray-50 border border-gray-200">
                                    {order.paymentMethod === 'Card' ? <RiVisaLine size={24} className="text-blue-600" /> : <MdPayment size={24} className="text-green-600" />}
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900">{order.paymentMethod}</div>
                                    <div className="text-xs text-gray-500">Status: <span className={order.paymentStatus === 'Paid' ? 'text-green-600' : 'text-amber-600'}>{order.paymentStatus}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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
