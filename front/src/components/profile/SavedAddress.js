import React, { useState } from 'react';
import { FiPlus, FiMoreVertical, FiX } from 'react-icons/fi';
import { BsHouseDoor, BsBuilding, BsGeoAlt } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { deleteAddress } from '../../redux/slice/auth.slice';
import AddAddressModal from './AddAddressModal';

export default function SavedAddress() {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const addresses = user?.addresses || [];

    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedAddress, setEditedAddress] = useState(null);
    const [addressToDelete, setAddressToDelete] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);

    // Close menu when clicking outside (simple implementation)
    const toggleMenu = (id, e) => {
        e.stopPropagation();
        setOpenMenuId(openMenuId === id ? null : id);
    };


    const handleEdit = (address) => {
        setEditedAddress(address);
        setIsEditing(true);
        setShowModal(true);
        setOpenMenuId(null);
    };

    const handleDeleteClick = (address) => {
        setAddressToDelete(address);
        setShowDeleteModal(true);
        setOpenMenuId(null);
    };

    const confirmDelete = () => {
        if (addressToDelete && addressToDelete._id) {
            dispatch(deleteAddress(addressToDelete._id));
        }
        setShowDeleteModal(false);
        setAddressToDelete(null);
    };

    const openAddModal = () => {
        setIsEditing(false);
        setEditedAddress(null);
        setShowModal(true);
    };


    return (
        <div className="w-full relative" onClick={() => setOpenMenuId(null)}>
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">SAVED ADDRESS</h2>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-sm text-sm font-medium hover:bg-gray-800 transition-colors uppercase"
                >
                    <FiPlus /> Add New Address
                </button>
            </div>

            {/* Empty State */}
            {addresses.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-dashed border-gray-200">
                    <div className="mb-4 text-gray-300">
                        <BsHouseDoor size={64} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No Address yet.</h3>
                    <p className="text-gray-500 text-sm">You have no saved Address</p>
                </div>
            )}

            {/* Address Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.map((addr) => (
                    <div key={addr._id} className="bg-white border border-gray-200 rounded-sm p-6 relative hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded uppercase tracking-wider">
                                {addr.addressType}
                            </span>
                            <div className="relative">
                                <button
                                    onClick={(e) => toggleMenu(addr._id, e)}
                                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50"
                                >
                                    <FiMoreVertical size={20} />
                                </button>

                                {openMenuId === addr._id && (
                                    <div className="absolute right-0 top-8 w-32 bg-white border border-gray-100 shadow-lg rounded-md z-10 py-1">
                                        <button
                                            onClick={() => handleEdit(addr)}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(addr)}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mb-4">
                            <h3 className="text-base font-bold text-gray-900 mb-1">{addr.firstName} {addr.lastName}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                {addr.buildingName}, {addr.landmark},<br />
                                {addr.locality}, {addr.city} - {addr.pincode},<br />
                                {addr.state}, {addr.country}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Mobile No. <span className="font-medium text-gray-900">+91 {addr.mobileNo}</span>
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add/Edit Modal */}
            <AddAddressModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                isEditing={isEditing}
                initialData={editedAddress}
            />

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}></div>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-sm relative z-10 overflow-hidden px-6 py-8 text-center">
                        <div className="flex justify-between items-center w-full mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Delete</h3>
                            <button onClick={() => setShowDeleteModal(false)} className="text-gray-400 hover:text-gray-600">
                                <FiX size={20} />
                            </button>
                        </div>

                        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                            Are you sure you want to<br />Delete Address?
                        </p>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 bg-white border border-gray-200 text-gray-700 font-medium py-2.5 rounded hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 bg-black text-white font-medium py-2.5 rounded hover:bg-gray-800 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
