import React, { useState } from 'react';
import { FiX, FiCheck } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { setDefaultAddress } from '../../redux/slice/auth.slice';

export default function AddressSelectionModal({ isOpen, onClose }) {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const addresses = user?.addresses || [];

    const [selectedId, setSelectedId] = useState(null);

    // Initialize selectedId with current default
    React.useEffect(() => {
        if (isOpen && addresses.length > 0) {
            const defaultAddr = addresses.find(a => a.isDefault);
            if (defaultAddr) {
                setSelectedId(defaultAddr._id);
            } else {
                setSelectedId(addresses[0]._id);
            }
        }
    }, [isOpen, addresses]);

    const handleConfirm = () => {
        if (selectedId) {
            dispatch(setDefaultAddress(selectedId));
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative z-10 flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center p-5 border-b border-gray-100 shrink-0">
                    <h3 className="text-lg font-bold text-gray-900">Select Delivery Address</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <FiX size={20} />
                    </button>
                </div>

                <div className="p-2 overflow-y-auto bg-gray-50">
                    {addresses.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No addresses found</div>
                    ) : (
                        <div className="space-y-2 p-2">
                            {addresses.map((addr) => (
                                <label
                                    key={addr._id}
                                    className={`relative flex items-start p-4 cursor-pointer rounded-lg border transition-all ${selectedId === addr._id ? 'bg-white border-black shadow-sm' : 'bg-white border-gray-200 hover:border-gray-300'}`}
                                >
                                    <div className="flex items-center h-5 mt-0.5">
                                        <input
                                            type="radio"
                                            name="address-selection"
                                            value={addr._id}
                                            checked={selectedId === addr._id}
                                            onChange={() => setSelectedId(addr._id)}
                                            className="h-4 w-4 text-black border-gray-300 focus:ring-black"
                                        />
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <div className="flex justify-between">
                                            <span className="block text-sm font-bold text-gray-900">{addr.firstName} {addr.lastName}</span>
                                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 uppercase text-gray-600">{addr.addressType}</span>
                                        </div>
                                        <span className="block text-sm text-gray-500 mt-1">
                                            {addr.buildingName}, {addr.locality}, {addr.city} - {addr.pincode}
                                        </span>
                                        <span className="block text-sm text-gray-500 mt-0.5">
                                            Mobile: {addr.mobileNo}
                                        </span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-5 border-t border-gray-100 bg-white rounded-b-lg shrink-0">
                    <button
                        onClick={handleConfirm}
                        className="w-full bg-black text-white font-medium py-3 rounded hover:bg-gray-900 transition-colors"
                        disabled={addresses.length === 0}
                    >
                        Confirm Selection
                    </button>
                </div>
            </div>
        </div>
    );
}
