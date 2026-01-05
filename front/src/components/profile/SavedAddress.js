import React, { useState } from 'react';
import { FiPlus, FiMoreVertical, FiX } from 'react-icons/fi';
import { BsHouseDoor, BsBuilding, BsGeoAlt } from 'react-icons/bs';

export default function SavedAddress() {
    const [addresses, setAddresses] = useState([
        {
            id: 1,
            type: 'Home',
            firstName: 'Vickey',
            lastName: 'Patel',
            mobile: '85300 59232',
            email: 'vickeypatel123@gmail.com',
            flat: '123, JantaNagar Society',
            landmark: 'Opposite Matrushakti',
            locality: 'Punagam',
            pincode: '395010',
            city: 'Surat',
            state: 'Gujarat',
            country: 'India'
        },
        {
            id: 2,
            type: 'Office',
            firstName: 'Vickey',
            lastName: 'Patel',
            mobile: '85300 59232',
            email: 'vickeypatel123@gmail.com',
            flat: '123, JantaNagar Society',
            landmark: 'Opposite Matrushakti',
            locality: 'Punagam',
            pincode: '395010',
            city: 'Surat',
            state: 'Gujarat',
            country: 'India'
        }
    ]);

    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentAddressId, setCurrentAddressId] = useState(null);
    const [addressToDelete, setAddressToDelete] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);

    const initialFormState = {
        firstName: '',
        lastName: '',
        mobile: '',
        email: '',
        flat: '',
        landmark: '',
        locality: '',
        pincode: '',
        city: '',
        state: '',
        country: 'India',
        type: 'Home'
    };

    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});

    // Close menu when clicking outside (simple implementation)
    const toggleMenu = (id, e) => {
        e.stopPropagation();
        setOpenMenuId(openMenuId === id ? null : id);
    };

    // Validation pattern
    const validate = () => {
        let tempErrors = {};
        if (!formData.firstName) tempErrors.firstName = "First Name is required";
        if (!formData.lastName) tempErrors.lastName = "Last Name is required";

        if (!formData.mobile) {
            tempErrors.mobile = "Mobile Number is required";
        } else if (!/^\d{10}$/.test(formData.mobile.replace(/\s/g, ''))) {
            tempErrors.mobile = "Invalid Mobile Number (10 digits)";
        }

        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            tempErrors.email = "Invalid Email";
        }

        if (!formData.flat) tempErrors.flat = "Address is required";
        if (!formData.locality) tempErrors.locality = "Locality is required";

        if (!formData.pincode) {
            tempErrors.pincode = "Pincode is required";
        } else if (!/^\d{6}$/.test(formData.pincode)) {
            tempErrors.pincode = "Invalid Pincode (6 digits)";
        }

        if (!formData.city) tempErrors.city = "City is required";
        if (!formData.state) tempErrors.state = "State is required";

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;

        if (isEditing) {
            setAddresses(addresses.map(addr =>
                addr.id === currentAddressId ? { ...formData, id: currentAddressId } : addr
            ));
        } else {
            setAddresses([...addresses, { ...formData, id: Date.now() }]);
        }
        closeModal();
    };

    const handleEdit = (address) => {
        setFormData(address);
        setIsEditing(true);
        setCurrentAddressId(address.id);
        setShowModal(true);
        setOpenMenuId(null);
    };

    const handleDeleteClick = (address) => {
        setAddressToDelete(address);
        setShowDeleteModal(true);
        setOpenMenuId(null);
    };

    const confirmDelete = () => {
        setAddresses(addresses.filter(addr => addr.id !== addressToDelete.id));
        setShowDeleteModal(false);
        setAddressToDelete(null);
    };

    const openAddModal = () => {
        setFormData(initialFormState);
        setIsEditing(false);
        setCurrentAddressId(null);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setErrors({});
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) setErrors({ ...errors, [name]: null });
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
                    <div key={addr.id} className="bg-white border border-gray-200 rounded-sm p-6 relative hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded uppercase tracking-wider">
                                {addr.type}
                            </span>
                            <div className="relative">
                                <button
                                    onClick={(e) => toggleMenu(addr.id, e)}
                                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50"
                                >
                                    <FiMoreVertical size={20} />
                                </button>

                                {openMenuId === addr.id && (
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
                                {addr.flat}, {addr.landmark},<br />
                                {addr.locality}, {addr.city} - {addr.pincode},<br />
                                {addr.state}, {addr.country}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Mobile No. <span className="font-medium text-gray-900">+91 {addr.mobile}</span>
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal}></div>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative z-10 flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
                            <h3 className="text-lg font-bold text-gray-900">{isEditing ? 'Edit Address' : 'Add New Address'}</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <FiX size={20} />
                            </button>
                        </div>

                        {/* Modal Body (Scrollable) */}
                        <div className="p-6 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* First Name */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">First Name</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="First Name"
                                        className={`w-full bg-gray-50 border ${errors.firstName ? 'border-red-500' : 'border-transparent'} rounded bg-gray-100 px-4 py-3 text-sm outline-none focus:bg-white focus:border-black transition-all`}
                                    />
                                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                                </div>

                                {/* Last Name */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder="Last Name"
                                        className={`w-full bg-gray-100 border ${errors.lastName ? 'border-red-500' : 'border-transparent'} rounded px-4 py-3 text-sm outline-none focus:bg-white focus:border-black transition-all`}
                                    />
                                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                                </div>

                                {/* Mobile */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Mobile No.</label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-3 bg-gray-100 border-r border-gray-200 text-gray-500 text-sm rounded-l">
                                            +91
                                        </span>
                                        <input
                                            type="text"
                                            name="mobile"
                                            value={formData.mobile}
                                            onChange={(e) => {
                                                if (e.target.value.length <= 10 && /^\d*$/.test(e.target.value)) handleChange(e);
                                            }}
                                            placeholder="Your Mobile No."
                                            className={`w-full bg-gray-100 border ${errors.mobile ? 'border-red-500' : 'border-transparent'} rounded-r px-4 py-3 text-sm outline-none focus:bg-white focus:border-black transition-all`}
                                        />
                                    </div>
                                    {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Email"
                                        className={`w-full bg-gray-100 border ${errors.email ? 'border-red-500' : 'border-transparent'} rounded px-4 py-3 text-sm outline-none focus:bg-white focus:border-black transition-all`}
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>

                                {/* Flat/House No */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Flat/ House No/ Building Name</label>
                                    <input
                                        type="text"
                                        name="flat"
                                        value={formData.flat}
                                        onChange={handleChange}
                                        placeholder="Flat/House No/Building Name"
                                        className={`w-full bg-gray-100 border ${errors.flat ? 'border-red-500' : 'border-transparent'} rounded px-4 py-3 text-sm outline-none focus:bg-white focus:border-black transition-all`}
                                    />
                                    {errors.flat && <p className="text-red-500 text-xs mt-1">{errors.flat}</p>}
                                </div>

                                {/* Landmark */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Landmark</label>
                                    <input
                                        type="text"
                                        name="landmark"
                                        value={formData.landmark}
                                        onChange={handleChange}
                                        placeholder="Landmark"
                                        className={`w-full bg-gray-100 border ${errors.landmark ? 'border-red-500' : 'border-transparent'} rounded px-4 py-3 text-sm outline-none focus:bg-white focus:border-black transition-all`}
                                    />
                                </div>

                                {/* Locality/Area */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Locality/ Area</label>
                                    <input
                                        type="text"
                                        name="locality"
                                        value={formData.locality}
                                        onChange={handleChange}
                                        placeholder="Locality/Area"
                                        className={`w-full bg-gray-100 border ${errors.locality ? 'border-red-500' : 'border-transparent'} rounded px-4 py-3 text-sm outline-none focus:bg-white focus:border-black transition-all`}
                                    />
                                    {errors.locality && <p className="text-red-500 text-xs mt-1">{errors.locality}</p>}
                                </div>

                                {/* Pincode */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Pincode</label>
                                    <input
                                        type="text"
                                        name="pincode"
                                        value={formData.pincode}
                                        onChange={(e) => {
                                            if (e.target.value.length <= 6 && /^\d*$/.test(e.target.value)) handleChange(e);
                                        }}
                                        placeholder="Pincode"
                                        className={`w-full bg-gray-100 border ${errors.pincode ? 'border-red-500' : 'border-transparent'} rounded px-4 py-3 text-sm outline-none focus:bg-white focus:border-black transition-all`}
                                    />
                                    {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                                </div>

                                {/* City */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="City"
                                        className={`w-full bg-gray-100 border ${errors.city ? 'border-red-500' : 'border-transparent'} rounded px-4 py-3 text-sm outline-none focus:bg-white focus:border-black transition-all`}
                                    />
                                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                                </div>

                                {/* State */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">State</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        placeholder="State"
                                        className={`w-full bg-gray-100 border ${errors.state ? 'border-red-500' : 'border-transparent'} rounded px-4 py-3 text-sm outline-none focus:bg-white focus:border-black transition-all`}
                                    />
                                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                                </div>

                                {/* Country */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Country</label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        disabled
                                        className="w-full bg-gray-100 border border-transparent rounded px-4 py-3 text-sm outline-none text-gray-500 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            {/* Save Address As */}
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">Save Address as</label>
                                <div className="flex gap-6">
                                    {['Home', 'Office', 'Other'].map(type => (
                                        <label key={type} className="flex items-center gap-2 cursor-pointer group">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="radio"
                                                    name="type"
                                                    value={type}
                                                    checked={formData.type === type}
                                                    onChange={handleChange}
                                                    className="peer h-4 w-4 cursor-pointer appearance-none rounded-full border border-gray-300 checked:border-black transition-all"
                                                />
                                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-black opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                                            </div>
                                            <span className={`text-sm ${formData.type === type ? 'text-black font-medium' : 'text-gray-500 group-hover:text-gray-700'}`}>
                                                {type}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-100 bg-white rounded-b-lg shrink-0">
                            <button
                                onClick={handleSave}
                                className="w-full bg-black text-white font-medium py-3.5 rounded hover:bg-gray-900 transition-colors"
                            >
                                Save Address
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
