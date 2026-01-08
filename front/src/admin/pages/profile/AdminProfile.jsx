import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { updateUserProfile } from '../../../redux/slice/auth.slice';
import {
    MdEmail,
    MdSave,
    MdCameraAlt
} from 'react-icons/md';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import { BiMessageSquareDetail } from 'react-icons/bi';

const AdminProfile = () => {
    const dispatch = useDispatch();
    const { user, loading, message } = useSelector((state) => state.auth);
    const [imagePreview, setImagePreview] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const validationSchema = Yup.object({
        firstName: Yup.string().required('First Name is required'),
        lastName: Yup.string().required('Last Name is required'),
        mobileNumber: Yup.string()
            .required('Phone Number is required')
            .matches(/^\+?[0-9\s-]{10,}$/, 'Invalid phone number format'),
        bio: Yup.string().max(500, 'Bio must be at most 500 characters'),
        email: Yup.string().email('Invalid email').required('Email is required'),
    });

    const formik = useFormik({
        initialValues: {
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            mobileNumber: user?.mobileNumber || '',
            bio: user?.bio || '',
            email: user?.email || '',
            photo: null,
        },
        enableReinitialize: true,
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            const formData = new FormData();
            formData.append('firstName', values.firstName);
            formData.append('lastName', values.lastName);
            formData.append('mobileNumber', values.mobileNumber);
            formData.append('bio', values.bio);
            formData.append('email', values.email);
            if (values.photo) {
                formData.append('photo', values.photo);
            }

            try {
                await dispatch(updateUserProfile(formData)).unwrap();
                setIsEditing(false);
                toast.success('Profile updated successfully!');
            } catch (error) {
                toast.error(error?.message || 'Failed to update profile');
            }
        },
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            formik.setFieldValue('photo', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="p-6 bg-[#f9f9f9]">
            <Breadcrumbs
                title="Profile"
                items={[
                    { label: 'Dashboard', to: '/admin/dashboard' },
                    { label: 'Profile' },
                ]}
            />

            {/* Banner Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
                {/* Left Column - Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 text-center border-b border-gray-100">
                            <div className="relative inline-block mb-4">
                                <div className="w-28 h-28 rounded-full p-1 bg-white border-2 border-gray-100 shadow-sm mx-auto overflow-hidden">
                                    <img
                                        src={imagePreview || user?.photo || "https://i.pravatar.cc/150?img=32"}
                                        alt="Profile"
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                </div>
                                <label htmlFor="profile-upload" className="absolute bottom-1 right-1 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 shadow-md transition-colors border-2 border-white cursor-pointer">
                                    <MdCameraAlt size={16} />
                                    <input
                                        type="file"
                                        id="profile-upload"
                                        accept="image/*"
                                    className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </label>
                            </div>

                            <h2 className="text-xl font-bold text-gray-900 mb-1">{user?.firstName} {user?.lastName}</h2>
                            {/* <p className="text-gray-500 text-sm mb-3">{user?.email}</p> */}
                        </div>

                        <div className="p-6 space-y-5">
                            {/* <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                                    <MdLocationOn size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-semibold uppercase">Location</p>
                                    <p className="font-medium text-gray-800">San Francisco, CA</p>
                                </div>
                            </div> */}

                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                                    <MdEmail size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-semibold uppercase">Email</p>
                                    <p className="font-medium text-gray-800">{user?.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                                    <BiMessageSquareDetail size={16} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-semibold uppercase">Bio</p>
                                    <p className="font-medium text-gray-800">{user?.bio}</p>
                                </div>
                            </div>

                            {/* <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                                    <MdLanguage size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-semibold uppercase">Languages</p>
                                    <p className="font-medium text-gray-800">English, Hindi, Japanese</p>
                                </div>
                            </div> */}
                        </div>
                    </div>
                </div>

                {/* Right Column - Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden max-h-[600px]">
                        {/* Tabs */}
                        {/* <div className="border-b border-gray-200 px-6 flex items-center gap-8">
                            {['About Me', 'Timeline', 'Settings'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`py-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === tab
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-800'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div> */}

                        <div className="p-8">
                            <form onSubmit={formik.handleSubmit} className="space-y-8 animate-in fade-in duration-300">
                                {/* Personal Info */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                            Personal Info
                                        </h3>

                                        {!isEditing ? (
                                            <button
                                                type="button"
                                                onClick={() => setIsEditing(true)}
                                                className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                                            >
                                                Edit
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    formik.resetForm();
                                                    setImagePreview(null);
                                                }}
                                                className="text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">First Name</label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={formik.values.firstName}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                disabled={!isEditing}
                                                className={`w-full px-4 py-2.5 bg-gray-50 border ${formik.touched.firstName && formik.errors.firstName ? 'border-red-500' : 'border-gray-200'} text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed`}
                                                placeholder="Enter first name"
                                            />
                                            {formik.touched.firstName && formik.errors.firstName && (
                                                <div className="text-red-500 text-xs mt-1">{formik.errors.firstName}</div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Last Name</label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={formik.values.lastName}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                disabled={!isEditing}
                                                className={`w-full px-4 py-2.5 bg-gray-50 border ${formik.touched.lastName && formik.errors.lastName ? 'border-red-500' : 'border-gray-200'} text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed`}
                                                placeholder="Enter last name"
                                            />
                                            {formik.touched.lastName && formik.errors.lastName && (
                                                <div className="text-red-500 text-xs mt-1">{formik.errors.lastName}</div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Email Address</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formik.values.email}
                                                readOnly
                                                className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 text-gray-500 text-sm rounded-lg cursor-not-allowed"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                                            <input
                                                type="text"
                                                name="mobileNumber"
                                                value={formik.values.mobileNumber}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                disabled={!isEditing}
                                                className={`w-full px-4 py-2.5 bg-gray-50 border ${formik.touched.mobileNumber && formik.errors.mobileNumber ? 'border-red-500' : 'border-gray-200'} text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed`}
                                                placeholder="+1 234 567 8900"
                                            />
                                            {formik.touched.mobileNumber && formik.errors.mobileNumber && (
                                                <div className="text-red-500 text-xs mt-1">{formik.errors.mobileNumber}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Bio</label>
                                        <textarea
                                            name="bio"
                                            rows={4}
                                            value={formik.values.bio}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            disabled={!isEditing}
                                            className={`w-full px-4 py-3 bg-gray-50 border ${formik.touched.bio && formik.errors.bio ? 'border-red-500' : 'border-gray-200'} text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 resize-none disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed`}
                                            placeholder="Write something about yourself..."
                                        />
                                        {formik.touched.bio && formik.errors.bio && (
                                            <div className="text-red-500 text-xs mt-1">{formik.errors.bio}</div>
                                        )}
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="border-t border-gray-100 pt-4 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-lg transition-all font-semibold active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <MdSave size={18} />
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                )}
                            </form>
                            {/* {activeTab === 'Settings' && (
                                <form className="space-y-8 animate-in fade-in duration-300">
                                    <div className="space-y-6">
                                        <h3 className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-6">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                            Personal Info
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-700">First Name</label>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                                                    placeholder="Enter first name"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-700">Last Name</label>
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                                                    placeholder="Enter last name"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-700">Email Address</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    readOnly
                                                    className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 text-gray-500 text-sm rounded-lg cursor-not-allowed"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                                                <input
                                                    type="text"
                                                    name="mobileNumber"
                                                    value={formData.mobileNumber}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                                                    placeholder="+1 234 567 8900"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Bio</label>
                                            <textarea
                                                name="bio"
                                                rows={4}
                                                value={formData.bio}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 resize-none"
                                                placeholder="Write something about yourself..."
                                            />
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 pt-4 flex justify-end">
                                        <button className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-lg transition-all font-semibold active:scale-95">
                                            <MdSave size={18} />
                                            Save Changes
                                        </button>
                                    </div>

                                </form>
                            )}
                            {activeTab === 'About Me' && (
                                <div className="text-center py-20 text-gray-400">
                                    About Me content coming soon...
                                </div>
                            )}
                            {activeTab === 'Timeline' && (
                                <div className="text-center py-20 text-gray-400">
                                    Timeline content coming soon...
                                </div>
                            )} */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
