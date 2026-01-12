import React, { useEffect, useMemo } from 'react';
import { MdClose, MdCloudUpload } from 'react-icons/md';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import CustomSelect from '../common/CustomSelect';

const SubCategoryModal = ({ isOpen, onClose, onSave, initialData, categories, subCategories = [], mainCategories = [] }) => {

    const validationSchema = useMemo(() => {
        return Yup.object({
            name: Yup.string().required('SubCategory Name is required'),
            isActive: Yup.boolean().required('Status is required'),
            description: Yup.string(),
            mainCategory: Yup.string().required('Main Category is required'),
            category: Yup.string().required('Parent Category is required'),
            image: initialData
                ? Yup.mixed().optional()
                : Yup.mixed().required('Image is required')
        });
    }, []);

    const formik = useFormik({
        initialValues: {
            name: initialData?.name || '',
            slug: initialData?.slug || '',
            mainCategory: initialData?.category?.mainCategory?._id || initialData?.category?.mainCategory || '',
            category: initialData?.category?._id || initialData?.category || '',
            isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
            description: initialData?.description || '',
            image: initialData?.image || null,
            previewImage: initialData?.image || null
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
                mainCategory: '',
                category: '',
                isActive: true,
                description: '',
                image: null,
                previewImage: null
            });
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const generateSubCategorySlug = (catId, subName) => {
        const cat = categories.find(c => c._id === catId);
        if (!cat) return subName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        // Get main category slug
        const mainCatSlug = cat.mainCategory?.slug ||
            (cat.mainCategory?.name ? cat.mainCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '');
        const catSlug = cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const subSlug = subName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        // Slug format: mainCategory-category-subCategory
        return mainCatSlug ? `${mainCatSlug}-${catSlug}-${subSlug}` : `${catSlug}-${subSlug}`;
    };

    const handleNameChange = (e) => {
        formik.handleChange(e);
        if (formik.values.category && e.target.value) {
            const newSlug = generateSubCategorySlug(formik.values.category, e.target.value);
            formik.setFieldValue('slug', newSlug);
        }
    };

    // Filter categories by selected mainCategory
    const filteredCategories = formik.values.mainCategory
        ? categories.filter(cat =>
            cat.mainCategory &&
            (cat.mainCategory._id === formik.values.mainCategory || cat.mainCategory === formik.values.mainCategory)
        )
        : categories;

    const handleMainCategoryChange = (val) => {
        formik.setFieldValue('mainCategory', val);
        formik.setFieldValue('category', ''); // Reset category when mainCategory changes
        if (formik.values.name && val) {
            // Slug will be updated when category is selected
        }
    };

    const handleCategoryChange = (val) => {
        formik.setFieldValue('category', val);
        if (formik.values.name && val) {
            const newSlug = generateSubCategorySlug(val, formik.values.name);
            formik.setFieldValue('slug', newSlug);
        }
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
                        {initialData ? 'Edit SubCategory' : 'Add New SubCategory'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <MdClose size={24} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Main Category */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Main Category</label>
                            <CustomSelect
                                value={formik.values.mainCategory}
                                onChange={handleMainCategoryChange}
                                options={mainCategories.map(mc => ({ label: mc.name, value: mc._id }))}
                                placeholder="Select Main Category"
                                className={`w-full ${formik.touched.mainCategory && formik.errors.mainCategory ? 'border-red-500' : ''}`}
                            />
                            {formik.touched.mainCategory && formik.errors.mainCategory && (
                                <p className="text-xs text-red-500 mt-1">{formik.errors.mainCategory}</p>
                            )}
                        </div>

                        {/* Parent Category */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Category</label>
                            <CustomSelect
                                value={formik.values.category}
                                onChange={handleCategoryChange}
                                options={filteredCategories.map(cat => ({ label: cat.name, value: cat._id }))}
                                placeholder="Select Category"
                                disabled={!formik.values.mainCategory}
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
                                placeholder="e.g. T-Shirts, Jeans, Casual Shirts"
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
                                placeholder="e.g. men-topwear-t-shirts"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed focus:outline-none"
                            />
                        </div>

                        {/* Image */}
                        <div className="space-y-2 col-span-1 md:col-span-2">
                            <label className="text-sm font-semibold text-gray-700">SubCategory Image</label>
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
