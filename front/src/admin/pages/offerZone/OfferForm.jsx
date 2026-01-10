import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { format } from 'date-fns';
import { CircularProgress } from '@mui/material';

import { createOffer, updateOffer, fetchOffers } from '../../../redux/slice/offer.slice';
import { fetchCategories } from '../../../redux/slice/category.slice';
import { fetchProducts } from '../../../redux/slice/product.slice';

import Breadcrumbs from '../../components/common/Breadcrumbs';
import CustomSelect from '../../components/common/CustomSelect';
import MultiSelect from '../../components/common/MultiSelect';
import CustomDatePicker from '../../components/common/CustomDatePicker';

const OfferForm = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    // Redux State
    const { offers, loading } = useSelector(state => state.offers);
    const { categories } = useSelector(state => state.category);
    const { products } = useSelector(state => state.product);

    // Initial Data Fetch
    useEffect(() => {
        dispatch(fetchCategories());
        dispatch(fetchProducts());
        if (!offers.length && isEdit) {
            dispatch(fetchOffers());
        }
    }, [dispatch, offers.length, isEdit]);

    // Validation Schema
    const validationSchema = useMemo(() => {
        return Yup.object({
            title: Yup.string().required('Title is required'),
            description: Yup.string(),
            code: Yup.string().required('Coupon Code is required'),
            type: Yup.string().required('Type is required'),
            value: Yup.number().required('Value is required').min(1, 'Value must be greater than 0'),
            maxDiscount: Yup.number().min(0, 'Must be positive').nullable(),
            minOrderValue: Yup.number().min(0, 'Must be positive').nullable(),
            usageLimit: Yup.number().min(1, 'Must be at least 1').nullable(),
            startDate: Yup.date().required('Start Date is required'),
            endDate: Yup.date()
                .required('End Date is required')
                .min(Yup.ref('startDate'), 'End Date must be after Start Date'),
            isActive: Yup.boolean()
        });
    }, []);

    // Form Initial Values
    const initialValues = useMemo(() => {
        if (isEdit && offers.length > 0) {
            const offer = offers.find(o => o._id === id);
            if (offer) {
                return {
                    title: offer.title || '',
                    description: offer.description || '',
                    code: offer.code || '',
                    type: offer.type || 'PERCENTAGE',
                    value: offer.value || '',
                    maxDiscount: offer.maxDiscount || '',
                    minOrderValue: offer.minOrderValue || 0,
                    usageLimit: offer.usageLimit || '',
                    startDate: offer.startDate ? new Date(offer.startDate).toISOString().split('T')[0] : '', // Will be updated by format in render if strictly needed, but internal val is string
                    endDate: offer.endDate ? new Date(offer.endDate).toISOString().split('T')[0] : '',
                    isActive: offer.isActive !== undefined ? offer.isActive : true,
                    applicableCategories: offer.applicableCategories || [],
                    applicableProducts: offer.applicableProducts || []
                };
            }
        }
        return {
            title: '',
            description: '',
            code: '',
            type: 'PERCENTAGE',
            value: '',
            maxDiscount: '',
            minOrderValue: 0,
            usageLimit: '',
            startDate: '',
            endDate: '',
            isActive: true,
            applicableCategories: [],
            applicableProducts: []
        };
    }, [isEdit, offers, id]);

    // Formik
    const formik = useFormik({
        initialValues,
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            // Clean up values before submission
            const cleanValues = {
                ...values,
                maxDiscount: values.maxDiscount === '' ? null : values.maxDiscount,
                minOrderValue: values.minOrderValue === '' ? 0 : values.minOrderValue,
                usageLimit: values.usageLimit === '' ? null : values.usageLimit,
                // Ensure array fields are not undefined (though initialValues handles this)
                applicableCategories: values.applicableCategories || [],
                applicableProducts: values.applicableProducts || []
            };

            const action = isEdit
                ? updateOffer({ id, data: cleanValues })
                : createOffer(cleanValues);

            await dispatch(action).unwrap();
            navigate('/admin/offers');
        }
    });

    // Options for Selects
    const categoryOptions = categories.map(cat => ({ label: cat.name, value: cat._id }));
    const productOptions = products.map(prod => ({ label: prod.name, value: prod._id }));

    return (
        <div className="p-6 bg-[#f9f9f9] min-h-screen">
            <Breadcrumbs
                title={isEdit ? "Edit Offer" : "Create Offer"}
                items={[
                    { label: 'Dashboard', to: '/admin/dashboard' },
                    { label: 'Offers', to: '/admin/offers' },
                    { label: isEdit ? 'Edit' : 'Create' },
                ]}
            />

            <div className="mt-6 max-w-5xl mx-auto">
                <div className="bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800">
                            {isEdit ? 'Edit Offer Details' : 'Common Offer Details'}
                        </h3>
                    </div>

                    <form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Title */}
                            <div className="col-span-1 md:col-span-2 space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Offer Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formik.values.title}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="e.g. Summer Sale 2024"
                                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 transition-colors ${formik.touched.title && formik.errors.title
                                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-300 focus:ring-black focus:border-black'
                                        }`}
                                />
                                {formik.touched.title && formik.errors.title && (
                                    <p className="text-xs text-red-500 mt-1">{formik.errors.title}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="col-span-1 md:col-span-2 space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Description</label>
                                <textarea
                                    name="description"
                                    value={formik.values.description}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Enter offer description..."
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
                                />
                            </div>

                            {/* Targeting Section */}
                            <div className="col-span-1 md:col-span-2 space-y-4 pt-2 border-t border-gray-100">
                                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Targeting (Optional)</h4>

                                {/* Categories */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Applicable Categories</label>
                                    <MultiSelect
                                        value={formik.values.applicableCategories}
                                        options={categoryOptions}
                                        onChange={(val) => formik.setFieldValue('applicableCategories', val)}
                                        placeholder="Select categories..."
                                        className="w-full"
                                    />
                                    <p className="text-xs text-gray-500">Leave empty to apply to all categories.</p>
                                </div>

                                {/* Products */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Applicable Products</label>
                                    <MultiSelect
                                        value={formik.values.applicableProducts}
                                        options={productOptions}
                                        onChange={(val) => formik.setFieldValue('applicableProducts', val)}
                                        placeholder="Select products..."
                                        className="w-full"
                                    />
                                    <p className="text-xs text-gray-500">Leave empty to apply to all products.</p>
                                </div>
                            </div>

                            {/* Coupon Code */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Coupon Code</label>
                                <input
                                    type="text"
                                    name="code"
                                    value={formik.values.code}
                                    onChange={(e) => {
                                        formik.handleChange(e);
                                        formik.setFieldValue('code', e.target.value.toUpperCase());
                                    }}
                                    onBlur={formik.handleBlur}
                                    placeholder="e.g. SUMMER50"
                                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 transition-colors uppercase ${formik.touched.code && formik.errors.code
                                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-300 focus:ring-black focus:border-black'
                                        }`}
                                />
                                {formik.touched.code && formik.errors.code && (
                                    <p className="text-xs text-red-500 mt-1">{formik.errors.code}</p>
                                )}
                            </div>

                            {/* Status */}
                            {isEdit && (
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Status</label>
                                    <CustomSelect
                                        value={formik.values.isActive}
                                        onChange={(val) => formik.setFieldValue('isActive', val)}
                                        options={[
                                            { label: 'Active', value: true },
                                            { label: 'Inactive', value: false }
                                        ]}
                                        className="w-full"
                                    />
                                </div>
                            )}

                            {/* Type */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Discount Type</label>
                                <CustomSelect
                                    value={formik.values.type}
                                    onChange={(val) => formik.setFieldValue('type', val)}
                                    options={[
                                        { label: 'Percentage (%)', value: 'PERCENTAGE' },
                                        { label: 'Flat Amount (₹)', value: 'FLAT' }
                                    ]}
                                    className="w-full"
                                />
                            </div>

                            {/* Value */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Discount Value</label>
                                <input
                                    type="number"
                                    name="value"
                                    value={formik.values.value}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Enter value"
                                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 transition-colors ${formik.touched.value && formik.errors.value
                                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-300 focus:ring-black focus:border-black'
                                        }`}
                                />
                                {formik.touched.value && formik.errors.value && (
                                    <p className="text-xs text-red-500 mt-1">{formik.errors.value}</p>
                                )}
                            </div>

                            {/* Max Discount (Only for Percentage) */}
                            {formik.values.type === 'PERCENTAGE' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Max Discount (₹)</label>
                                    <input
                                        type="number"
                                        name="maxDiscount"
                                        value={formik.values.maxDiscount}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        placeholder="Max cap (optional)"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
                                    />
                                    {formik.touched.maxDiscount && formik.errors.maxDiscount && (
                                        <p className="text-xs text-red-500 mt-1">{formik.errors.maxDiscount}</p>
                                    )}
                                </div>
                            )}

                            {/* Min Order Value */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Min Order Value (₹)</label>
                                <input
                                    type="number"
                                    name="minOrderValue"
                                    value={formik.values.minOrderValue}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="0"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
                                />
                            </div>

                            {/* Usage Limit */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Usage Limit (Optional)</label>
                                <input
                                    type="number"
                                    name="usageLimit"
                                    value={formik.values.usageLimit}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Total times usable"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
                                />
                            </div>

                            {/* Start Date */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Start Date</label>
                                <CustomDatePicker
                                    value={formik.values.startDate}
                                    onChange={(date) => {
                                        const val = date ? format(date, 'yyyy-MM-dd') : '';
                                        formik.setFieldValue('startDate', val);
                                    }}
                                    placeholder="Select Start Date"
                                    error={formik.touched.startDate && formik.errors.startDate}
                                    className="w-full"
                                    position="top"
                                />
                                {formik.touched.startDate && formik.errors.startDate && (
                                    <p className="text-xs text-red-500 mt-1">{formik.errors.startDate}</p>
                                )}
                            </div>

                            {/* End Date */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">End Date</label>
                                <CustomDatePicker
                                    value={formik.values.endDate}
                                    minDate={formik.values.startDate}
                                    onChange={(date) => {
                                        const val = date ? format(date, 'yyyy-MM-dd') : '';
                                        formik.setFieldValue('endDate', val);

                                        if (date) {
                                            // Custom Logic for Active Status
                                            const checkDate = new Date(date);
                                            checkDate.setHours(23, 59, 59, 999);
                                            if (checkDate > new Date()) {
                                                formik.setFieldValue('isActive', true);
                                            } else {
                                                formik.setFieldValue('isActive', false);
                                            }
                                        }
                                    }}
                                    placeholder="Select End Date"
                                    error={formik.touched.endDate && formik.errors.endDate}
                                    className="w-full"
                                    position="top"
                                />
                                {formik.touched.endDate && formik.errors.endDate && (
                                    <p className="text-xs text-red-500 mt-1">{formik.errors.endDate}</p>
                                )}
                            </div>
                        </div>

                        {/* Footer / Actions */}
                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/offers')}
                                className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={formik.isSubmitting || loading}
                                className="px-6 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 transition-colors shadow-sm disabled:bg-gray-300 flex items-center justify-center min-w-[120px]"
                            >
                                {(formik.isSubmitting || loading) ? (
                                    <CircularProgress size={20} color="inherit" />
                                ) : (
                                    isEdit ? 'Update Offer' : 'Create Offer'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OfferForm;
