import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReturns, updateReturnStatus } from '../../../redux/slice/return.slice';
import { MdCheckCircle, MdCancel, MdVisibility } from 'react-icons/md';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

const Returns = () => {
    const dispatch = useDispatch();
    const { returns, loading } = useSelector(state => state.returns);
    const [selectedReturn, setSelectedReturn] = useState(null);
    const [actionModal, setActionModal] = useState(false);

    useEffect(() => {
        dispatch(fetchReturns());
    }, [dispatch]);

    const handleAction = (ret, action) => {
        const status = action === 'Approve' ? 'Approved' : 'Rejected';
        dispatch(updateReturnStatus({ id: ret._id, status, adminComments: 'Processed by Admin' }))
            .then(() => setActionModal(false));
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Return & Exchange Requests</h2>
                <div className="flex gap-2">
                    <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">Pending</button>
                    <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">Processed</button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
                        <tr>
                            <th className="px-6 py-4">Request ID</th>
                            <th className="px-6 py-4">Order / Customer</th>
                            <th className="px-6 py-4">Item</th>
                            <th className="px-6 py-4">Reason</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="7" className="p-4 text-center">Loading...</td></tr>
                        ) : returns && returns.length > 0 ? (
                            returns.map((ret) => (
                                <tr key={ret._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-indigo-600">{ret.requestId}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{ret.order}</div>
                                        <div className="text-xs text-gray-400">{ret.user}</div>
                                    </td>
                                    <td className="px-6 py-4">{ret.items?.length} Items</td>
                                    <td className="px-6 py-4">{ret.items?.[0]?.reason}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${ret.type === 'Exchange' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                                            {ret.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${ret.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                            {ret.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            {ret.status === 'Pending' && (
                                                <>
                                                    <button
                                                        onClick={() => { setSelectedReturn(ret); setActionModal('Approve'); }}
                                                        className="p-1 text-green-600 hover:bg-green-50 rounded" title="Approve"
                                                    >
                                                        <MdCheckCircle size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => { setSelectedReturn(ret); setActionModal('Reject'); }}
                                                        className="p-1 text-red-600 hover:bg-red-50 rounded" title="Reject"
                                                    >
                                                        <MdCancel size={18} />
                                                    </button>
                                                </>
                                            )}
                                            <button className="p-1 text-gray-500 hover:bg-gray-100 rounded">
                                                <MdVisibility size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="7" className="p-4 text-center">No requests found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Approval Modal */}
            <Dialog open={!!actionModal} onClose={() => setActionModal(false)}>
                <DialogTitle>{actionModal} Request?</DialogTitle>
                <DialogContent>
                    <p>Are you sure you want to {actionModal?.toLowerCase()} this request?</p>
                    {selectedReturn?.type === 'Return' && actionModal === 'Approve' && (
                        <div className="mt-4 bg-gray-50 p-3 rounded text-sm">
                            <p className="font-bold">Refund Preview:</p>
                            <div className="flex justify-between mt-1"><span>Product Value:</span> <span>₹{selectedReturn.refundAmount || '---'}</span></div>
                            <div className="flex justify-between text-red-500"><span>GST Reversal:</span> <span>-₹{selectedReturn.gstReversalAmount || '0'}</span></div>
                            <div className="flex justify-between font-bold border-t mt-1 pt-1"><span>Net Refund:</span> <span>₹{selectedReturn.refundAmount || '---'}</span></div>
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setActionModal(false)}>Cancel</Button>
                    <Button onClick={() => handleAction(selectedReturn, actionModal)} variant="contained" color={actionModal === 'Reject' ? 'error' : 'primary'}>
                        Confirm {actionModal}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Returns;
