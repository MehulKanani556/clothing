import React, { useEffect, useMemo } from 'react';
import { MdClose, MdCloudUpload } from 'react-icons/md';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import CustomSelect from '../common/CustomSelect';

const CategoryModal = ({ isOpen, onClose, onSave, initialData }) => {

    const validationSchema = useMemo(() => {
        return Yup.object({
            name: Yup.string().required('Category Name is required'),
            isActive: Yup.boolean().required('Status is required'),
            description: Yup.string(),
            // Image is required only if NOT editing (no initialData)
            image: initialData
                ? Yup.mixed().optional()
                : Yup.mixed().required('Image is required')
        });
    }, [initialData]);

    const formik = useFormik({
        initialValues: {
            name: initialData?.name || '',
            slug: initialData?.slug || '',
            isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
            description: initialData?.description || '',
            image: initialData?.image || null,
            previewImage: initialData?.image || null
        },
        validationSchema,
        enableReinitialize: true, // Important: Reset form when initialData changes
        onSubmit: (values) => {
            onSave(values);
        }
    });

    // Reset form when modal closes or opens to ensure clean state for "Add" mode
    useEffect(() => {
        if (isOpen && !initialData) {
            formik.resetForm();
            formik.setValues({
                name: '',
                slug: '',
                isActive: true, // Default status for new category
                description: '',
                image: null,
                previewImage: null
            });
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleNameChange = (e) => {
        formik.handleChange(e);
        const slug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        formik.setFieldValue('slug', slug);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            formik.setFieldValue('image', file);
            formik.setFieldValue('previewImage', URL.createObjectURL(file));
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800">
                        {initialData ? 'Edit Category' : 'Add New Category'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <MdClose size={24} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Category Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formik.values.name}
                                onChange={handleNameChange} // Use custom handler for slug generation
                                onBlur={formik.handleBlur}
                                placeholder="e.g. Electronics"
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
                                placeholder="e.g. electronics"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Image */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Category Image</label>
                        <div className="flex items-center gap-4">
                            {formik.values.previewImage && (
                                <img src={formik.values.previewImage} alt="Preview" className="w-16 h-16 object-cover rounded-md border border-gray-200" />
                            )}
                            <div className="flex-1">
                                <label className={`flex flex-col items-center justify-center w-full h-16 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${formik.touched.image && formik.errors.image
                                    ? 'border-red-300 bg-red-50 hover:bg-red-100'
                                    : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                                    }`}>
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <MdCloudUpload size={20} />
                                        <span className="text-sm">
                                            {formik.values.image ? formik.values.image.name : 'Choose file'}
                                        </span>
                                    </div>
                                    <input
                                        type="file"
                                        name="image"
                                        onChange={handleImageChange}
                                        accept="image/*"
                                        className="hidden"
                                        onBlur={() => formik.setFieldTouched('image', true)}
                                    />
                                </label>
                                {formik.touched.image && formik.errors.image && (
                                    <p className="text-xs text-red-500 mt-1">{formik.errors.image}</p>
                                )}
                            </div>
                        </div>
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

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Description (Optional)</label>
                        <textarea
                            name="description"
                            value={formik.values.description}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Brief description of the category..."
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
                            {initialData ? 'Update Category' : 'Add Category'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryModal;
