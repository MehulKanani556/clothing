import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { addAddress } from '../../redux/slice/auth.slice';

export default function AddAddressModal({ isOpen, onClose, initialData = null, isEditing = false }) {
    const dispatch = useDispatch();

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

    // Reset or Set Data when modal opens
    useEffect(() => {
        if (isOpen) {
            if (isEditing && initialData) {
                setFormData({
                    firstName: initialData.firstName,
                    lastName: initialData.lastName,
                    mobile: initialData.mobileNo || initialData.mobile,
                    email: initialData.email,
                    flat: initialData.buildingName || initialData.flat,
                    landmark: initialData.landmark,
                    locality: initialData.locality,
                    pincode: initialData.pincode,
                    city: initialData.city,
                    state: initialData.state,
                    country: initialData.country || 'India',
                    type: initialData.addressType || initialData.type || 'Home'
                });
            } else {
                setFormData(initialFormState);
            }
            setErrors({});
        }
    }, [isOpen, isEditing, initialData]);


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

        const addressData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            mobileNo: formData.mobile,
            email: formData.email,
            buildingName: formData.flat,
            landmark: formData.landmark,
            locality: formData.locality,
            pincode: formData.pincode,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            addressType: formData.type
        };

        if (isEditing) {
            // Edit not implemented backend yet
            alert("Update requires backend implementation");
        } else {
            dispatch(addAddress(addressData));
        }
        onClose();
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) setErrors({ ...errors, [name]: null });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative z-10 flex flex-col max-h-[90vh]">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
                    <h3 className="text-lg font-bold text-gray-900">{isEditing ? 'Edit Address' : 'Add New Address'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
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
    );
}
