import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FiArrowLeft, FiClock, FiCheck, FiX, FiDownload, FiChevronDown, FiChevronUp, FiUpload, FiTrash2 } from 'react-icons/fi';
import TrackingWidget from '../TrackingWidget';
import { cancelOrder, requestReturn } from '../../redux/slice/order.slice';
import axiosInstance from '../../utils/axiosInstance';
import { BASE_URL } from '../../utils/BASE_URL';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Select, MenuItem, FormControl, InputLabel,
    CircularProgress, Typography, IconButton, Grid, FormHelperText
} from '@mui/material';
import toast from 'react-hot-toast';

export default function OrderDetails({ order, onBack }) {
    const dispatch = useDispatch();
    const [showPriceDetails, setShowPriceDetails] = useState(false);

    // Cancellation State
    const [cancelOpen, setCancelOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelLoading, setCancelLoading] = useState(false);

    // Return State
    const [returnOpen, setReturnOpen] = useState(false);
    const [returnReason, setReturnReason] = useState('');
    const [returnImages, setReturnImages] = useState([]);
    const [returnLoading, setReturnLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [bankDetails, setBankDetails] = useState({
        accountNumber: '',
        ifscCode: '',
        accountHolderName: '',
        bankName: '',
        upiId: ''
    });

    if (!order) return null;

    // Helper for status styles
    const getStatusStyles = (status) => {
        switch (status) {
            case 'Pending': return { color: 'text-orange-600', bg: 'bg-orange-50', width: '25%' };
            case 'Processing': return { color: 'text-blue-600', bg: 'bg-blue-50', width: '50%' };
            case 'Shipped': return { color: 'text-indigo-600', bg: 'bg-indigo-50', width: '75%' };
            case 'Delivered': return { color: 'text-green-600', bg: 'bg-green-50', width: '100%' };
            case 'Cancelled': return { color: 'text-red-600', bg: 'bg-red-50', width: '100%' };
            case 'Return Requested': return { color: 'text-purple-600', bg: 'bg-purple-50', width: '100%' };
            case 'Refunded': return { color: 'text-gray-600', bg: 'bg-gray-100', width: '100%' };
            default: return { color: 'text-gray-600', bg: 'bg-gray-50', width: '0%' };
        }
    };

    const statusConfig = getStatusStyles(order.status);
    const isReturnWindowOpen = order.status === 'Delivered' && new Date() <= new Date(order.returnWindowExpiresAt);

    // Handlers
    const handleCancelOrder = async () => {
        if (!cancelReason) return toast.error('Please select a reason');
        setCancelLoading(true);
        try {
            await dispatch(cancelOrder({ orderId: order.orderId, reason: cancelReason })).unwrap();
            toast.success('Order cancelled successfully');
            setCancelOpen(false);
        } catch (error) {
            toast.error(error.message || 'Failed to cancel order');
        } finally {
            setCancelLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setReturnImages(prev => [...prev, ...files]);
        }
    };

    const handleRequestReturn = async () => {
        if (!returnReason) return toast.error('Please select a reason');
        if (returnImages.length === 0) return toast.error('Please upload at least one image');

        if (order.paymentMethod === 'COD') {
            if (!bankDetails.accountNumber || !bankDetails.ifscCode) {
                return toast.error('Please provide bank details for refund');
            }
        }

        setReturnLoading(true);
        const formData = new FormData();
        formData.append('orderId', order.orderId);
        formData.append('reason', returnReason);
        if (order.paymentMethod === 'COD') {
            formData.append('bankDetails', JSON.stringify(bankDetails));
        }

        returnImages.forEach(file => {
            formData.append('images', file);
        });

        try {
            await dispatch(requestReturn(formData)).unwrap();
            toast.success('Return requested successfully');
            setReturnOpen(false);
        } catch (error) {
            toast.error(error.message || 'Failed to request return');
        } finally {
            setReturnLoading(false);
        }
    };

    return (
        <div className="w-full bg-white animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Header / Back Button */}
            <div className="flex items-center gap-3 mb-6 p-1">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                >
                    <FiArrowLeft size={20} />
                </button>
                <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
            </div>

            {/* Top Card */}
            <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6 mb-4">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-gray-500 text-sm">Order ID</h3>
                        <p className="text-lg font-bold text-gray-900">#{order.orderId || order._id}</p>
                    </div>
                    <div className="text-right">
                        <h3 className="text-gray-500 text-sm">Order Placed</h3>
                        <p className="font-medium text-gray-900">
                            {new Date(order.placedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                    </div>
                </div>
                {/* Items List */}
                <div className="space-y-6">
                    {order.items.map((item, idx) => (
                        <div key={idx} className="flex gap-4">
                            <div className="w-20 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium text-gray-900 text-sm sm:text-base">{item.name}</h4>
                                <div className="mt-1 flex gap-3 text-xs sm:text-sm text-gray-500">
                                    {item.color && <span>Color: {item.color}</span>}
                                    {item.size && <span>Size: {item.size}</span>}
                                </div>
                                <div className="mt-1 font-semibold text-gray-900">₹{item.price?.toLocaleString()}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Status Section */}
            <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6 mb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${statusConfig.bg}`}>
                            {order.status === 'Delivered' ? <FiCheck className={statusConfig.color} /> :
                                order.status === 'Cancelled' ? <FiX className={statusConfig.color} /> :
                                    order.status === 'Return Requested' ? <FiClock className={statusConfig.color} /> :
                                        <FiClock className={statusConfig.color} />}
                        </div>
                        <div>
                            <h4 className={`font-bold ${statusConfig.color} text-lg`}>Order {order.status}</h4>
                            <p className="text-gray-500 text-sm">
                                On {new Date(order.updatedAt || order.placedAt).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        {(['Pending', 'Confirmed', 'Processing', 'Shipped'].includes(order.status)) && (
                            <Button variant="outlined" color="error" onClick={() => setCancelOpen(true)}>
                                Cancel Order
                            </Button>
                        )}
                        {isReturnWindowOpen && (
                            <Button variant="outlined" color="primary" onClick={() => setReturnOpen(true)}>
                                Return Order
                            </Button>
                        )}
                        {order.status === 'Cancelled' && (
                            <div className="text-sm text-red-500 font-medium">
                                Refund: {order.refundStatus || 'Pending'}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tracking Section */}
            {(order.status === 'Processing' || order.status === 'Shipped' || order.status === 'Delivered' || order.status === 'Return Requested') && (
                <div className="mb-4">
                    <TrackingWidget order={order} showFullDetails={true} />
                </div>
            )}

            {/* Price Footer */}
            <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold text-gray-900">₹{order.grandTotal?.toLocaleString()}</h3>
                            <span className="text-sm text-gray-500">Total Price</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Payment: {order.paymentMethod}</p>
                    </div>
                    <button
                        onClick={() => setShowPriceDetails(!showPriceDetails)}
                        className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:underline"
                    >
                        More Details {showPriceDetails ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                </div>
                {showPriceDetails && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
                        <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{order.subTotal?.toLocaleString()}</span></div>
                        <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{order.shippingFee === 0 ? 'Free' : `₹${order.shippingFee}`}</span></div>
                        <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-50"><span>Grand Total</span><span>₹{order.grandTotal?.toLocaleString()}</span></div>
                    </div>
                )}
            </div>

            {/* Cancel Modal */}
            <Dialog open={cancelOpen} onClose={() => setCancelOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle>Cancel Order</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Reason for Cancellation</InputLabel>
                        <Select
                            value={cancelReason}
                            label="Reason for Cancellation"
                            onChange={(e) => setCancelReason(e.target.value)}
                        >
                            <MenuItem value="Ordered by mistake">Ordered by mistake</MenuItem>
                            <MenuItem value="Found cheaper elsewhere">Found cheaper elsewhere</MenuItem>
                            <MenuItem value="Delivery time too long">Delivery time too long</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCancelOpen(false)}>Close</Button>
                    <Button onClick={handleCancelOrder} variant="contained" color="error" disabled={cancelLoading}>
                        {cancelLoading ? <CircularProgress size={24} /> : 'Confirm Cancel'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Return Modal */}
            <Dialog open={returnOpen} onClose={() => setReturnOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Return Order</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
                        <InputLabel>Reason for Return</InputLabel>
                        <Select
                            value={returnReason}
                            label="Reason for Return"
                            onChange={(e) => setReturnReason(e.target.value)}
                        >
                            <MenuItem value="Defective product">Defective product</MenuItem>
                            <MenuItem value="Wrong item received">Wrong item received</MenuItem>
                            <MenuItem value="Size issue">Size issue</MenuItem>
                            <MenuItem value="Quality not as expected">Quality not as expected</MenuItem>
                        </Select>
                    </FormControl>

                    <Typography variant="subtitle2" gutterBottom>Upload Images (Required)</Typography>
                    <div className="flex gap-2 mb-4 overflow-x-auto p-2 border rounded">
                        {returnImages.map((file, idx) => (
                            <div key={idx} className="relative w-20 h-20 flex-shrink-0">
                                <img src={URL.createObjectURL(file)} alt="return" className="w-full h-full object-cover rounded" />
                                <IconButton
                                    size="small"
                                    className="absolute -top-1 -right-1 bg-white shadow-sm"
                                    onClick={() => setReturnImages(prev => prev.filter((_, i) => i !== idx))}
                                >
                                    <FiTrash2 size={12} color="red" />
                                </IconButton>
                            </div>
                        ))}
                        <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer hover:bg-gray-50">
                            <FiUpload className="text-gray-400" />
                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                        </label>
                    </div>

                    {order.paymentMethod === 'COD' && (
                        <div className="mt-4">
                            <Typography variant="subtitle2" gutterBottom>Bank Details for Refund (COD Order)</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}><TextField fullWidth label="Account Number" size="small" value={bankDetails.accountNumber} onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })} /></Grid>
                                <Grid item xs={6}><TextField fullWidth label="IFSC Code" size="small" value={bankDetails.ifscCode} onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value })} /></Grid>
                                <Grid item xs={6}><TextField fullWidth label="Bank Name" size="small" value={bankDetails.bankName} onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })} /></Grid>
                                <Grid item xs={12}><TextField fullWidth label="Account Holder Name" size="small" value={bankDetails.accountHolderName} onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })} /></Grid>
                                <Grid item xs={12}><TextField fullWidth label="UPI ID (Optional)" size="small" value={bankDetails.upiId} onChange={(e) => setBankDetails({ ...bankDetails, upiId: e.target.value })} /></Grid>
                            </Grid>
                        </div>
                    )}

                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setReturnOpen(false)}>Close</Button>
                    <Button onClick={handleRequestReturn} variant="contained" color="primary" disabled={returnLoading}>
                        {returnLoading ? <CircularProgress size={24} /> : 'Confirm Return'}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
