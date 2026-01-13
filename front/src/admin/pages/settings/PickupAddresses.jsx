import React, { useState, useEffect } from 'react';
import { 
    MdAdd, MdEdit, MdDelete, MdLocationOn, MdPhone, MdEmail, 
    MdBusiness, MdSave, MdCancel, MdRefresh, MdMoreVert 
} from 'react-icons/md';
import { FiMapPin, FiUser, FiMail, FiPhone, FiHome, FiStar } from 'react-icons/fi';
import axiosInstance from '../../../utils/axiosInstance';
import { BASE_URL } from '../../../utils/BASE_URL';
import toast from 'react-hot-toast';
import Breadcrumbs from '../../components/common/Breadcrumbs';

const PickupAddresses = () => {
    const [pickupLocations, setPickupLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState(null);
    const [formData, setFormData] = useState({
        pickup_location: '',
        name: '',
        email: '',
        phone: '',
        address: '',
        address_2: '',
        city: '',
        state: '',
        country: 'India',
        pin_code: '',
        vendor_name: '',
        gstin: '',
        rto_address_id: ''
    });

    // Ensure pickupLocations is always an array
    const safePickupLocations = Array.isArray(pickupLocations) ? pickupLocations : [];

    useEffect(() => {
        fetchPickupLocations();
    }, []);

    const fetchPickupLocations = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`${BASE_URL}/shiprocket/pickup-locations/manage`);
            console.log('API Response:', response.data);
            
            if (response.data.success) {
                // Ensure we always set an array, even if the response is different
                const locations = Array.isArray(response.data.data) ? response.data.data : [];
                setPickupLocations(locations);
                console.log('Fetched pickup locations:', locations);
                
                if (locations.length === 0) {
                    console.log('No pickup locations found');
                }
            } else {
                console.error('API returned success: false', response.data);
                setPickupLocations([]);
                toast.error(response.data.message || 'Failed to fetch pickup locations');
            }
        } catch (error) {
            console.error('Failed to fetch pickup locations:', error);
            setPickupLocations([]); // Ensure we set an empty array on error
            
            if (error.response?.status === 401) {
                toast.error('Authentication required. Please login again.');
            } else if (error.response?.status === 403) {
                toast.error('Access denied. Admin privileges required.');
            } else if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Failed to fetch pickup locations. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (editingLocation) {
                // Update existing location
                const response = await axiosInstance.put(
                    `${BASE_URL}/shiprocket/pickup-locations/${editingLocation.id}`,
                    formData
                );
                if (response.data.success) {
                    toast.success('Pickup location updated successfully');
                    fetchPickupLocations();
                    closeModal();
                }
            } else {
                // Add new location
                const response = await axiosInstance.post(
                    `${BASE_URL}/shiprocket/pickup-locations`,
                    formData
                );
                if (response.data.success) {
                    toast.success('Pickup location added successfully');
                    fetchPickupLocations();
                    closeModal();
                }
            }
        } catch (error) {
            console.error('Failed to save pickup location:', error);
            toast.error(error.response?.data?.message || 'Failed to save pickup location');
        }
    };

    const handleEdit = (location) => {
        setEditingLocation(location);
        setFormData({
            pickup_location: location.pickup_location || '',
            name: location.name || '',
            email: location.email || '',
            phone: location.phone || '',
            address: location.address || '',
            address_2: location.address_2 || '',
            city: location.city || '',
            state: location.state || '',
            country: location.country || 'India',
            pin_code: location.pin_code || '',
            vendor_name: location.vendor_name || '',
            gstin: location.gstin || '',
            rto_address_id: location.rto_address_id || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (locationId) => {
        if (!window.confirm('Are you sure you want to delete this pickup location?')) {
            return;
        }

        try {
            const response = await axiosInstance.delete(
                `${BASE_URL}/shiprocket/pickup-locations/${locationId}`
            );
            if (response.data.success) {
                toast.success('Pickup location deleted successfully');
                fetchPickupLocations();
            }
        } catch (error) {
            console.error('Failed to delete pickup location:', error);
            toast.error('Failed to delete pickup location');
        }
    };

    const openAddModal = () => {
        setEditingLocation(null);
        setFormData({
            pickup_location: '',
            name: '',
            email: '',
            phone: '',
            address: '',
            address_2: '',
            city: '',
            state: '',
            country: 'India',
            pin_code: '',
            vendor_name: '',
            gstin: '',
            rto_address_id: ''
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingLocation(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading pickup addresses...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className=" ">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Pickup Addresses</h1>
                            <p className="text-gray-600 mt-2">Manage your Shiprocket pickup locations for order fulfillment</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={fetchPickupLocations}
                                disabled={loading}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <MdRefresh className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                            <button
                                onClick={openAddModal}
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                                <MdAdd className="w-4 h-4 mr-2" />
                                Add Pickup Address
                            </button>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">{safePickupLocations.length}</div>
                                <div className="text-sm text-gray-600">Total Locations</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {safePickupLocations.filter(loc => loc.is_primary_location).length}
                                </div>
                                <div className="text-sm text-gray-600">Primary Locations</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                    {safePickupLocations.filter(loc => !loc.is_first_mile_pickup).length}
                                </div>
                                <div className="text-sm text-gray-600">Secondary Locations</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                {safePickupLocations.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="text-center py-16">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MdLocationOn className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No pickup addresses found</h3>
                            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                Get started by adding your first pickup address. This will be used for order fulfillment and shipping.
                            </p>
                            <button
                                onClick={openAddModal}
                                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                                <MdAdd className="w-5 h-5 mr-2" />
                                Add Your First Pickup Address
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {safePickupLocations.map((location) => (
                            <div key={location.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                                {/* Card Header */}
                                <div className="p-6 border-b border-gray-100">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-3 flex-1">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                location.is_first_mile_pickup 
                                                    ? 'bg-green-100 text-green-600' 
                                                    : 'bg-blue-100 text-blue-600'
                                            }`}>
                                                {location.is_first_mile_pickup ? (
                                                    <FiStar className="w-5 h-5" />
                                                ) : (
                                                    <FiHome className="w-5 h-5" />
                                                )}
                                            </div>
                                            <div className='flex justify-between flex-1'>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {location.pickup_location}
                                                </h3>
                                                {location.is_primary_location == 1 && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                                                        <FiStar className="w-3 h-3 mr-1" />
                                                        Primary
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {/* <div className="flex items-center space-x-1">
                                            <button
                                                onClick={() => handleEdit(location)}
                                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                                                title="Edit location"
                                            >
                                                <MdEdit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(location.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                title="Delete location"
                                            >
                                                <MdDelete className="w-4 h-4" />
                                            </button>
                                        </div> */}
                                    </div>
                                </div>

                                {/* Card Content */}
                                <div className="p-6 space-y-4">
                                    {/* Contact Person */}
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                            <FiUser className="w-4 h-4 text-gray-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{location.name}</div>
                                            <div className="text-xs text-gray-500">Contact Person</div>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                            <FiMail className="w-4 h-4 text-gray-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{location.email}</div>
                                            <div className="text-xs text-gray-500">Email Address</div>
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                            <FiPhone className="w-4 h-4 text-gray-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{location.phone}</div>
                                            <div className="text-xs text-gray-500">Phone Number</div>
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div className="flex items-start space-x-3">
                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mt-0.5">
                                            <FiMapPin className="w-4 h-4 text-gray-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-gray-900 leading-relaxed">
                                                {location.address}
                                                {location.address_2 && (
                                                    <span>, {location.address_2}</span>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-600 mt-1">
                                                {location.city}, {location.state} - {location.pin_code}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">{location.country}</div>
                                        </div>
                                    </div>

                                    {/* Additional Info */}
                                    {(location.vendor_name || location.gstin) && (
                                        <div className="pt-4 border-t border-gray-100">
                                            {location.vendor_name && (
                                                <div className="flex justify-between items-center text-sm mb-2">
                                                    <span className="text-gray-500">Vendor:</span>
                                                    <span className="text-gray-900 font-medium">{location.vendor_name}</span>
                                                </div>
                                            )}
                                            {location.gstin && (
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-500">GSTIN:</span>
                                                    <span className="text-gray-900 font-mono text-xs">{location.gstin}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add/Edit Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingLocation ? 'Edit Pickup Address' : 'Add New Pickup Address'}
                                </h2>
                                <p className="text-gray-600 mt-1">
                                    {editingLocation ? 'Update the pickup location details' : 'Add a new pickup location for order fulfillment'}
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Pickup Location Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="pickup_location"
                                            value={formData.pickup_location}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="e.g., Main Warehouse"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Contact Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="Contact person name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="contact@example.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone *
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="10-digit phone number"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Address *
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="Street address"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Address Line 2
                                    </label>
                                    <input
                                        type="text"
                                        name="address_2"
                                        value={formData.address_2}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="Apartment, suite, etc. (optional)"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="City"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            State *
                                        </label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="State"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            PIN Code *
                                        </label>
                                        <input
                                            type="text"
                                            name="pin_code"
                                            value={formData.pin_code}
                                            onChange={handleInputChange}
                                            required
                                            pattern="[0-9]{6}"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="6-digit PIN code"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Vendor Name
                                        </label>
                                        <input
                                            type="text"
                                            name="vendor_name"
                                            value={formData.vendor_name}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="Vendor name (optional)"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            GSTIN
                                        </label>
                                        <input
                                            type="text"
                                            name="gstin"
                                            value={formData.gstin}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="GST number (optional)"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        {editingLocation ? 'Update Address' : 'Add Address'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PickupAddresses;