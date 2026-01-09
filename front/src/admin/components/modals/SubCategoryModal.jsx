import React, { useEffect, useMemo } from 'react';
import { MdClose } from 'react-icons/md';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import CustomSelect from '../common/CustomSelect';

const SubCategoryModal = ({ isOpen, onClose, onSave, initialData, categories }) => {

    const validationSchema = useMemo(() => {
        return Yup.object({
            name: Yup.string().required('SubCategory Name is required'),
            isActive: Yup.boolean().required('Status is required'),
            description: Yup.string(),
            category: Yup.string().required('Parent Category is required')
        });
    }, []);

    const formik = useFormik({
        initialValues: {
            name: initialData?.name || '',
            slug: initialData?.slug || '',
            category: initialData?.category?._id || initialData?.category || '',
            isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
            description: initialData?.description || ''
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: (values) => {
            onSave(values);
        }
    });

    useEffect(() => {
        if (isOpen && !initialData) {
            formik.resetForm();
            formik.setValues({
                name: '',
                slug: '',
                category: '',
                isActive: true,
                description: ''
            });
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const generateSlug = (catId, subName) => {
        const cat = categories.find(c => c._id === catId);
        const catPrefix = cat ? cat.name + '-' : '';
        return (catPrefix + subName).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    };

    const handleNameChange = (e) => {
        formik.handleChange(e);
        const newSlug = generateSlug(formik.values.category, e.target.value);
        formik.setFieldValue('slug', newSlug);
    };

    const handleCategoryChange = (val) => {
        formik.setFieldValue('category', val);
        const newSlug = generateSlug(val, formik.values.name);
        formik.setFieldValue('slug', newSlug);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800">
                        {initialData ? 'Edit SubCategory' : 'Add New SubCategory'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <MdClose size={24} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Parent Category */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Category</label>
                            <CustomSelect
                                value={formik.values.category}
                                onChange={handleCategoryChange}
                                options={categories.map(cat => ({ label: cat.name, value: cat._id }))}
                                placeholder="Select Category"
                                className={`w-full ${formik.touched.category && formik.errors.category ? 'border-red-500' : ''}`}
                            />
                            {formik.touched.category && formik.errors.category && (
                                <p className="text-xs text-red-500 mt-1">{formik.errors.category}</p>
                            )}
                        </div>

                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">SubCategory Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formik.values.name}
                                onChange={handleNameChange}
                                onBlur={formik.handleBlur}
                                placeholder="e.g. T-Shirts"
                                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 transition-colors ${formik.touched.name && formik.errors.name
                                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-black focus:border-black'
                                    }`}
                            />
                            {formik.touched.name && formik.errors.name && (
                                <p className="text-xs text-red-500 mt-1">{formik.errors.name}</p>
                            )}
                        </div>

                        {/* Slug */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Slug</label>
                            <input
                                type="text"
                                name="slug"
                                value={formik.values.slug}
                                readOnly
                                placeholder="e.g. t-shirts"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed focus:outline-none"
                            />
                        </div>

                        {/* Status */}
                        {initialData && (
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Status</label>
                                <CustomSelect
                                    value={formik.values.isActive}
                                    onChange={(val) => formik.setFieldValue('isActive', val)}
                                    options={[
                                        { label: 'Active', value: true },
                                        { label: 'Inactive', value: false }
                                    ]}
                                    placeholder="Select Status"
                                    className="w-full"
                                />
                                {formik.touched.isActive && formik.errors.isActive && (
                                    <p className="text-xs text-red-500 mt-1">{formik.errors.isActive}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Description (Optional)</label>
                        <textarea
                            name="description"
                            value={formik.values.description}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Brief description of the subcategory..."
                            rows="4"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors resize-none"
                        ></textarea>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 transition-colors shadow-sm"
                        >
                            {initialData ? 'Update SubCategory' : 'Add SubCategory'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SubCategoryModal;
