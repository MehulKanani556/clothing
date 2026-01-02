import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile } from '../../redux/slice/auth.slice';
import { FiCamera, FiEdit2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

const ProfileSchema = Yup.object().shape({
    firstName: Yup.string()
        .min(2, 'Too Short!')
        .max(50, 'Too Long!')
        .required('First Name is required'),
    lastName: Yup.string()
        .min(2, 'Too Short!')
        .max(50, 'Too Long!')
        .required('Last Name is required'),
    mobileNumber: Yup.string()
        .matches(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits')
        .required('Mobile Number is required'),
    dateOfBirth: Yup.date()
        .max(new Date(), 'Date of birth cannot be in the future')
        .min(new Date('1900-01-01'), 'Date of birth is too far in the past')
        .nullable(),
    gender: Yup.string().oneOf(['Male', 'Female', 'Other'], 'Invalid Gender'),
});

export default function ProfileDetails() {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [isEditing, setIsEditing] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    // Initial form values
    const [initialValues, setInitialValues] = useState({
        firstName: '',
        lastName: '',
        email: '',
        mobileNumber: '',
        countryCode: '+91',
        dateOfBirth: '',
        gender: 'Male',
    });

    useEffect(() => {
        if (user) {
            setInitialValues({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                mobileNumber: user.mobileNumber || '',
                countryCode: '+91',
                dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
                gender: user.gender || 'Male',
            });
            setPreviewImage(user.photo || 'https://via.placeholder.com/150');
        }
    }, [user]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        const data = new FormData();
        data.append('firstName', values.firstName);
        data.append('lastName', values.lastName);
        data.append('mobileNumber', values.mobileNumber);
        if (values.dateOfBirth) data.append('dateOfBirth', values.dateOfBirth);
        data.append('gender', values.gender);

        if (imageFile) {
            data.append('photo', imageFile);
        }

        try {
            await dispatch(updateUserProfile(data)).unwrap();
            toast.success("Profile Updated Successfully");
            setIsEditing(false);
            setImageFile(null);
        } catch (err) {
            toast.error(err.message || "Update Failed");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
                    {isEditing ? 'Edit Profile' : 'My Profile'}
                </h2>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                        <FiEdit2 /> Edit
                    </button>
                )}
            </div>

            {!isEditing ? (
                // READ ONLY VIEW
                <div className="space-y-6">
                    <div className="flex items-center gap-6 mb-8">
                        <img
                            src={user.photo || 'https://via.placeholder.com/150'}
                            alt="Profile"
                            className="w-28 h-28 rounded-lg object-cover bg-gray-100"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Full Name</p>
                            <p className="text-gray-900 font-medium text-lg border-b border-gray-100 pb-2">{user.firstName} {user.lastName}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email Address</p>
                            <p className="text-gray-900 font-medium text-lg border-b border-gray-100 pb-2">{user.email}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Mobile Number</p>
                            <p className="text-gray-900 font-medium text-lg border-b border-gray-100 pb-2">
                                {user.mobileNumber ? `+91 ${user.mobileNumber}` : <span className="text-gray-400 italic">Not added</span>}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Date of Birth</p>
                            <p className="text-gray-900 font-medium text-lg border-b border-gray-100 pb-2">
                                {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('en-GB').split('/').join('-') : <span className="text-gray-400 italic">Not added</span>}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Gender</p>
                            <p className="text-gray-900 font-medium text-lg border-b border-gray-100 pb-2 capitalize">
                                {user.gender || <span className="text-gray-400 italic">Not set</span>}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                // EDIT FORM
                <Formik
                    initialValues={initialValues}
                    validationSchema={ProfileSchema}
                    onSubmit={handleSubmit}
                    enableReinitialize
                >
                    {({ errors, touched, isSubmitting }) => (
                        <Form>
                            {/* Profile Image Upload */}
                            <div className="mb-8 relative w-fit">
                                <img
                                    src={previewImage}
                                    alt="Preview"
                                    className="w-28 h-28 rounded-lg object-cover"
                                />
                                <label htmlFor="photo-upload" className="absolute -bottom-2 -right-2 bg-gray-900 text-white p-2 rounded-full cursor-pointer hover:bg-black transition-colors shadow-lg">
                                    <FiCamera size={16} />
                                </label>
                                <input
                                    type="file"
                                    id="photo-upload"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                {/* First Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                    <Field
                                        name="firstName"
                                        className={`w-full bg-gray-50 border ${errors.firstName && touched.firstName ? 'border-red-500' : 'border-gray-200'} rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all`}
                                    />
                                    {errors.firstName && touched.firstName && (
                                        <div className="text-red-500 text-xs mt-1">{errors.firstName}</div>
                                    )}
                                </div>

                                {/* Last Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                    <Field
                                        name="lastName"
                                        className={`w-full bg-gray-50 border ${errors.lastName && touched.lastName ? 'border-red-500' : 'border-gray-200'} rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all`}
                                    />
                                    {errors.lastName && touched.lastName && (
                                        <div className="text-red-500 text-xs mt-1">{errors.lastName}</div>
                                    )}
                                </div>

                                {/* Mobile No */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Mobile No.</label>
                                    <div className="flex">
                                        <Field as="select" name="countryCode" className="bg-gray-100 border border-gray-200 border-r-0 rounded-l-md px-3 py-3 text-sm focus:ring-2 focus:ring-black/5 outline-none w-20">
                                            <option value="+91">+91</option>
                                            <option value="+1">+1</option>
                                        </Field>
                                        <Field
                                            name="mobileNumber"
                                            type="text"
                                            className={`flex-1 bg-gray-50 border ${errors.mobileNumber && touched.mobileNumber ? 'border-red-500' : 'border-gray-200'} rounded-r-md px-4 py-3 text-sm focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all`}
                                        />
                                    </div>
                                    {errors.mobileNumber && touched.mobileNumber && (
                                        <div className="text-red-500 text-xs mt-1">{errors.mobileNumber}</div>
                                    )}
                                </div>

                                {/* Email (Disabled) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <Field
                                        name="email"
                                        type="email"
                                        disabled
                                        className="w-full bg-gray-200 border border-transparent rounded-md px-4 py-3 text-sm text-gray-500 cursor-not-allowed"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">Email cannot be changed</p>
                                </div>

                                {/* Date of Birth */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                                    <Field
                                        name="dateOfBirth"
                                        type="date"
                                        className={`w-full bg-gray-50 border ${errors.dateOfBirth && touched.dateOfBirth ? 'border-red-500' : 'border-gray-200'} rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all`}
                                    />
                                    {errors.dateOfBirth && touched.dateOfBirth && (
                                        <div className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</div>
                                    )}
                                </div>

                                {/* Gender */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                                    <div className="flex gap-6 mt-3">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <Field type="radio" name="gender" value="Male" className="w-4 h-4 text-black focus:ring-black border-gray-300" />
                                            <span className="text-sm text-gray-600 group-hover:text-black">Male</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <Field type="radio" name="gender" value="Female" className="w-4 h-4 text-black focus:ring-black border-gray-300" />
                                            <span className="text-sm text-gray-600 group-hover:text-black">Female</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <Field type="radio" name="gender" value="Other" className="w-4 h-4 text-black focus:ring-black border-gray-300" />
                                            <span className="text-sm text-gray-600 group-hover:text-black">Other</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-8 py-3 bg-black text-white font-bold uppercase tracking-wide rounded-[4px] hover:bg-gray-800 transition-colors disabled:opacity-50 shadow-md"
                                >
                                    {isSubmitting ? 'Updating...' : 'Save Changes'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setImageFile(null);
                                        setPreviewImage(user.photo || 'https://via.placeholder.com/150');
                                    }}
                                    className="px-8 py-3 bg-white text-gray-700 border border-gray-300 font-bold uppercase tracking-wide rounded-[4px] hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            )}
        </div>
    );
}
