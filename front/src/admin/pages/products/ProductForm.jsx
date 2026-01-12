import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { MdCloudUpload, MdDelete, MdClose, MdAdd } from 'react-icons/md';
import { CircularProgress } from '@mui/material';
import { createProduct, updateProduct, fetchAdminProducts } from '../../../redux/slice/adminProductSlice';
import { fetchCategories, fetchSubCategoriesByCategoryId, fetchAdminMainCategories } from '../../../redux/slice/category.slice';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import CustomSelect from '../../components/common/CustomSelect';
import { generateSKU, getCategoryCode } from '../../../utils/skuGenerator';

const ProductSchema = Yup.object().shape({
    name: Yup.string().required('Required'),
    slug: Yup.string().required('Required'),
    description: Yup.string(),
    brand: Yup.string().required('Brand Required'),
    mainCategory: Yup.string().required('Main Category Required'),
    category: Yup.string().required('Category Required'),
    subCategory: Yup.string().required('Sub-Category Required'),
    gender: Yup.string().required('Required'),
    gstPercentage: Yup.number().min(0).max(28).required('Required'),
    sizeChart: Yup.mixed(),
    packageInfo: Yup.object().shape({
        weight: Yup.number().min(0, 'Weight must be positive').nullable(),
        dimensions: Yup.object().shape({
            length: Yup.number().min(0, 'Length must be positive').nullable(),
            width: Yup.number().min(0, 'Width must be positive').nullable(),
            height: Yup.number().min(0, 'Height must be positive').nullable()
        })
    }),
    variants: Yup.array().of(
        Yup.object().shape({
            color: Yup.string().required('Color Required'),
            colorFamily: Yup.string().required('Required'),
            images: Yup.array().of(Yup.mixed().required('Image is required')).min(1, 'At least one image required'),
            options: Yup.array().of(
                Yup.object().shape({
                    sku: Yup.string(),
                    size: Yup.string().required('Size Required'),
                    price: Yup.number().required('Required').min(0),
                    mrp: Yup.number().required('Required').min(0),
                    stock: Yup.number().required('Required').min(0),
                })
            ).min(1, 'At least one option required')
        })
    ).min(1, 'At least one variant required')
});

const ProductForm = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const { products } = useSelector(state => state.adminProducts);
    const { categories, subCategories, mainCategories } = useSelector(state => state.category);

    const isEdit = !!id;

    useEffect(() => {
        dispatch(fetchCategories());
        dispatch(fetchAdminMainCategories());
        if (!products.length && isEdit) {
            dispatch(fetchAdminProducts());
        }
    }, [dispatch, products.length, isEdit]);

    const initialValues = {
        name: '',
        slug: '',
        description: '',
        brand: '',
        mainCategory: '',
        category: '',
        subCategory: '',
        gender: 'Men',
        gstPercentage: 12,
        isExchangeOnly: false,
        sizeChart: null,
        packageInfo: {
            weight: '',
            dimensions: {
                length: '',
                width: '',
                height: ''
            }
        },
        variants: [
            {
                color: '',
                colorFamily: '',
                colorCode: '',
                images: [],
                options: [{ sku: '', size: '', price: '', mrp: '', stock: '' }]
            }
        ]
    };

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: ProductSchema,
        onSubmit: (values, { setSubmitting }) => {
            const formData = new FormData();

            const productPayload = {
                ...values,
                sizeChart: (values.sizeChart instanceof File) ? null : values.sizeChart,
                variants: values.variants.map(v => ({
                    ...v,
                    images: v.images.filter(img => !(img instanceof File))
                }))
            };

            formData.append('product', JSON.stringify(productPayload));

            if (values.sizeChart instanceof File) {
                formData.append('sizeChart', values.sizeChart);
            }

            values.variants.forEach((variant, vIndex) => {
                variant.images.forEach((image, imgIndex) => {
                    if (image instanceof File) {
                        formData.append(`variants[${vIndex}].images[${imgIndex}]`, image);
                    }
                });
            });

            const action = isEdit
                ? updateProduct({ id, formData })
                : createProduct(formData);

            dispatch(action)
                .unwrap()
                .then(() => {
                    navigate('/admin/products');
                })
                .catch((err) => {
                    console.error("Failed to save product", err);
                })
                .finally(() => {
                    setSubmitting(false);
                });
        }
    });

    // Populate form if editing
    useEffect(() => {
        if (isEdit && products.length > 0) {
            const product = products.find(p => p._id === id);
            if (product) {
                const categoryId = product.category?._id || product.category;
                const subCategoryId = product.subCategory?._id || product.subCategory;

                if (categoryId) {
                    dispatch(fetchSubCategoriesByCategoryId(categoryId));
                }

                const mainCategoryId = product.category?.mainCategory?._id || product.category?.mainCategory || '';

                formik.setValues({
                    name: product.name,
                    slug: product.slug || '',
                    description: product.description || '',
                    brand: product.brand,
                    mainCategory: mainCategoryId,
                    category: categoryId,
                    subCategory: subCategoryId || '',
                    gender: product.gender,
                    gstPercentage: product.gstPercentage,
                    isExchangeOnly: product.isExchangeOnly,
                    sizeChart: product.sizeChart,
                    packageInfo: {
                        weight: product.packageInfo?.weight || '',
                        dimensions: {
                            length: product.packageInfo?.dimensions?.length || '',
                            width: product.packageInfo?.dimensions?.width || '',
                            height: product.packageInfo?.dimensions?.height || ''
                        }
                    },
                    variants: product.variants.map(v => ({
                        color: v.color,
                        colorFamily: v.colorFamily,
                        colorCode: v.colorCode,
                        images: v.images,
                        options: v.options.map(o => ({
                            sku: o.sku,
                            size: o.size,
                            price: o.price,
                            mrp: o.mrp,
                            stock: o.stock
                        }))
                    }))
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEdit, id, products, dispatch]);


    // Filter categories by selected mainCategory
    const filteredCategories = formik.values.mainCategory
        ? categories.filter(cat =>
            cat.mainCategory &&
            (cat.mainCategory._id === formik.values.mainCategory || cat.mainCategory === formik.values.mainCategory)
        )
        : categories;

    const handleMainCategoryChange = (mainCategoryId) => {
        formik.setFieldValue('mainCategory', mainCategoryId);
        formik.setFieldValue('category', '');
        formik.setFieldValue('subCategory', '');
        // Auto-set gender from mainCategory name
        const selectedMainCategory = mainCategories.find(mc => mc._id === mainCategoryId);
        if (selectedMainCategory) {
            formik.setFieldValue('gender', selectedMainCategory.name);
        }
        setTimeout(() => generateAllSKUs(), 300);
    };

    const handleCategoryChange = (categoryId) => {
        formik.setFieldValue('category', categoryId);
        formik.setFieldValue('subCategory', '');
        if (categoryId) {
            dispatch(fetchSubCategoriesByCategoryId(categoryId));
        }
        setTimeout(() => generateAllSKUs(), 300);
    };

    // Auto-generate SKUs for all variants and options
    const generateAllSKUs = useCallback(() => {
        const currentValues = formik.values;
        const { name, brand, mainCategory, category, subCategory, gender, variants } = currentValues;

        // Check if we have all required fields
        if (!name || !brand || !category || !gender) {
            return;
        }

        // Get category and subcategory names
        const categoryObj = categories.find(cat => cat._id === category);
        const subCategoryObj = subCategories.find(sub => sub._id === subCategory);
        const mainCategoryObj = mainCategories.find(mc => mc._id === mainCategory);

        // Derive gender from mainCategory name (as per backend logic)
        const genderFromMainCategory = mainCategoryObj?.name || gender || 'Unisex';

        // Get category code
        const categoryCode = getCategoryCode(
            subCategoryObj?.name || categoryObj?.name,
            subCategoryObj?.name
        );

        // Generate SKUs for all variants and options
        const updatedVariants = variants.map((variant) => {
            if (!variant.color) return variant; // Skip if color not set

            const updatedOptions = variant.options.map((option) => {
                if (!option.size) return option; // Skip if size not set

                // Generate SKU
                const sku = generateSKU({
                    categoryCode,
                    gender: genderFromMainCategory,
                    brand,
                    productName: name,
                    subCategoryName: subCategoryObj?.name,
                    color: variant.color,
                    size: option.size
                });

                return {
                    ...option,
                    sku: sku
                };
            });

            return {
                ...variant,
                options: updatedOptions
            };
        });

        formik.setFieldValue('variants', updatedVariants);
    }, [formik, categories, subCategories, mainCategories]);

    // Helper functions for array manipulations
    const pushVariant = () => {
        const newVariant = {
            color: '',
            colorFamily: '',
            colorCode: '',
            images: [],
            options: [{ sku: '', size: '', price: '', mrp: '', stock: '' }]
        };
        formik.setFieldValue('variants', [...formik.values.variants, newVariant]);
        // Auto-generate SKU after variant is added (will trigger when color and size are entered)
        setTimeout(() => generateAllSKUs(), 100);
    };

    const removeVariant = (index) => {
        const newVariants = formik.values.variants.filter((_, i) => i !== index);
        formik.setFieldValue('variants', newVariants);
    };

    const pushImage = (variantIndex, files) => {
        const currentImages = formik.values.variants[variantIndex].images;
        const newImages = [...currentImages, ...files];
        formik.setFieldValue(`variants[${variantIndex}].images`, newImages);
    };

    const removeImage = (variantIndex, imageIndex) => {
        const currentImages = formik.values.variants[variantIndex].images;
        const newImages = currentImages.filter((_, i) => i !== imageIndex);
        formik.setFieldValue(`variants[${variantIndex}].images`, newImages);
    };

    const pushOption = (variantIndex) => {
        const currentOptions = formik.values.variants[variantIndex].options;
        const newOption = { sku: '', size: '', price: '', mrp: '', stock: '' };
        formik.setFieldValue(`variants[${variantIndex}].options`, [...currentOptions, newOption]);
        // Auto-generate SKU after option is added (will trigger when size is entered)
        setTimeout(() => generateAllSKUs(), 100);
    };

    const removeOption = (variantIndex, optionIndex) => {
        const currentOptions = formik.values.variants[variantIndex].options;
        const newOptions = currentOptions.filter((_, i) => i !== optionIndex);
        formik.setFieldValue(`variants[${variantIndex}].options`, newOptions);
    };

    // Auto-generate SKU when main product fields change (not variant fields to avoid interfering with typing)
    useEffect(() => {
        const { name, brand, mainCategory, category, subCategory, gender, variants } = formik.values;

        // Only generate if we have minimum required fields
        if (name && brand && category && gender && variants.length > 0) {
            // Check if at least one variant has color and one option has size
            const hasValidVariant = variants.some(v =>
                v.color && v.options && v.options.some(o => o.size)
            );

            if (hasValidVariant) {
                // Longer delay to avoid interfering with user input
                const timeoutId = setTimeout(() => {
                    generateAllSKUs();
                }, 500);

                return () => clearTimeout(timeoutId);
            }
        }
        // Only trigger on main product fields, not variant fields (variants handled via onBlur)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formik.values.name, formik.values.brand, formik.values.mainCategory,
    formik.values.category, formik.values.subCategory, formik.values.gender]);

    // Generate SKU for a specific variant option
    const generateSKUForOption = useCallback((variantIndex, optionIndex) => {
        const { name, brand, mainCategory, category, subCategory, gender, variants } = formik.values;

        if (!name || !brand || !category || !gender) return;

        const categoryObj = categories.find(cat => cat._id === category);
        const subCategoryObj = subCategories.find(sub => sub._id === subCategory);
        const mainCategoryObj = mainCategories.find(mc => mc._id === mainCategory);

        const genderFromMainCategory = mainCategoryObj?.name || gender || 'Unisex';
        const categoryCode = getCategoryCode(
            subCategoryObj?.name || categoryObj?.name,
            subCategoryObj?.name
        );

        const variant = variants[variantIndex];
        if (!variant) return;

        const option = variant.options?.[optionIndex];
        if (!option) return;

        if (variant.color && option.size) {
            const sku = generateSKU({
                categoryCode,
                gender: genderFromMainCategory,
                brand,
                productName: name,
                subCategoryName: subCategoryObj?.name,
                color: variant.color,
                size: option.size
            });

            formik.setFieldValue(`variants[${variantIndex}].options[${optionIndex}].sku`, sku);
        }
    }, [formik, categories, subCategories, mainCategories]);

    // Generate SKUs for all options in a variant
    const generateSKUsForVariant = useCallback((variantIndex) => {
        const { name, brand, mainCategory, category, subCategory, gender, variants } = formik.values;

        if (!name || !brand || !category || !gender) return;

        const categoryObj = categories.find(cat => cat._id === category);
        const subCategoryObj = subCategories.find(sub => sub._id === subCategory);
        const mainCategoryObj = mainCategories.find(mc => mc._id === mainCategory);

        const genderFromMainCategory = mainCategoryObj?.name || gender || 'Unisex';
        const categoryCode = getCategoryCode(
            subCategoryObj?.name || categoryObj?.name,
            subCategoryObj?.name
        );

        const variant = variants[variantIndex];
        if (!variant || !variant.color) return;

        // Update SKUs for all options in this variant
        variant.options.forEach((option, optIndex) => {
            if (option.size) {
                const sku = generateSKU({
                    categoryCode,
                    gender: genderFromMainCategory,
                    brand,
                    productName: name,
                    subCategoryName: subCategoryObj?.name,
                    color: variant.color,
                    size: option.size
                });

                formik.setFieldValue(`variants[${variantIndex}].options[${optIndex}].sku`, sku);
            }
        });
    }, [formik, categories, subCategories, mainCategories]);

    return (
        <div className="p-6 bg-[#f9f9f9] min-h-screen">
            <Breadcrumbs
                title={isEdit ? "Edit Product" : "Add Product"}
                items={[
                    { label: 'Dashboard', to: '/admin/dashboard' },
                    { label: 'Products', to: '/admin/products' },
                    { label: isEdit ? 'Edit' : 'Add' },
                ]}
            />

            <div className="mt-6 max-w-5xl mx-auto">
                <div className="bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800">
                            {isEdit ? 'Edit Product Details' : 'Add New Product'}
                        </h3>
                    </div>

                    <form onSubmit={formik.handleSubmit} className="p-6 space-y-8">
                        {/* Basic Info Section */}
                        <div className="space-y-6">
                            <h4 className="text-sm font-bold text-gray-900 border-l-4 border-black pl-3 uppercase tracking-wider">
                                Basic Information
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Product Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        onChange={(e) => {
                                            formik.handleChange(e);
                                            const slug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                                            formik.setFieldValue('slug', slug);
                                            setTimeout(() => generateAllSKUs(), 300);
                                        }}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.name}
                                        placeholder="e.g. Classic Cotton T-Shirt"
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
                                        readOnly
                                        value={formik.values.slug}
                                        placeholder="e.g. classic-cotton-t-shirt"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed focus:outline-none"
                                    />
                                </div>

                                {/* Brand */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Brand</label>
                                    <input
                                        type="text"
                                        name="brand"
                                        onChange={(e) => {
                                            formik.handleChange(e);
                                            setTimeout(() => generateAllSKUs(), 300);
                                        }}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.brand}
                                        placeholder="e.g. Nike"
                                        className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 transition-colors ${formik.touched.brand && formik.errors.brand
                                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-300 focus:ring-black focus:border-black'
                                            }`}
                                    />
                                    {formik.touched.brand && formik.errors.brand && (
                                        <p className="text-xs text-red-500 mt-1">{formik.errors.brand}</p>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Description</label>
                                <textarea
                                    name="description"
                                    rows="4"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.description}
                                    placeholder="Write a detailed description..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors resize-none"
                                />
                            </div>

                            {/* Categories */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Main Category</label>
                                    <CustomSelect
                                        value={formik.values.mainCategory}
                                        onChange={handleMainCategoryChange}
                                        options={mainCategories.map(mc => ({ label: mc.name, value: mc._id }))}
                                        placeholder="Select Main Category"
                                        className="w-full"
                                    />
                                    {formik.touched.mainCategory && formik.errors.mainCategory && (
                                        <p className="text-xs text-red-500 mt-1">{formik.errors.mainCategory}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Category</label>
                                    <CustomSelect
                                        value={formik.values.category}
                                        onChange={handleCategoryChange}
                                        options={filteredCategories.map(cat => ({ label: cat.name, value: cat._id }))}
                                        disabled={!formik.values.mainCategory}
                                        placeholder="Select Category"
                                        className="w-full"
                                    />
                                    {formik.touched.category && formik.errors.category && (
                                        <p className="text-xs text-red-500 mt-1">{formik.errors.category}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Sub Category</label>
                                    <CustomSelect
                                        value={formik.values.subCategory}
                                        onChange={(val) => {
                                            formik.setFieldValue('subCategory', val);
                                            setTimeout(() => generateAllSKUs(), 200);
                                        }}
                                        options={subCategories.map(sub => ({ label: sub.name, value: sub._id }))}
                                        disabled={!formik.values.category}
                                        placeholder="Select Sub Category"
                                        className="w-full"
                                    />
                                    {formik.touched.subCategory && formik.errors.subCategory && (
                                        <p className="text-xs text-red-500 mt-1">{formik.errors.subCategory}</p>
                                    )}
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Gender</label>
                                    <CustomSelect
                                        value={formik.values.gender}
                                        onChange={(val) => formik.setFieldValue('gender', val)}
                                        options={[
                                            { label: 'Men', value: 'Men' },
                                            { label: 'Women', value: 'Women' },
                                            { label: 'Kids', value: 'Kids' },
                                            { label: 'Unisex', value: 'Unisex' }
                                        ]}
                                        className="w-full"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">GST %</label>
                                    <input
                                        type="number"
                                        name="gstPercentage"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.gstPercentage}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
                                    />
                                </div>

                                <div className="flex items-center pt-8">
                                    <label className="flex items-center gap-3 cursor-pointer group select-none">
                                        <input
                                            type="checkbox"
                                            name="isExchangeOnly"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            checked={formik.values.isExchangeOnly}
                                            className="rounded border-gray-300 accent-black focus:ring-black transition-colors cursor-pointer"
                                        />
                                        <span className="text-sm font-semibold text-gray-700 group-hover:text-black transition-colors">Exchange Only Item</span>
                                    </label>
                                </div>
                            </div>

                            {/* Size Chart Upload */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Size Chart</label>
                                <div className="flex items-center gap-4">
                                    {formik.values.sizeChart && (
                                        <div className="w-16 h-16 rounded border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                                            {formik.values.sizeChart instanceof File ? (
                                                <MdCloudUpload className="text-gray-400" size={24} />
                                            ) : (
                                                <img src={formik.values.sizeChart} alt="Size Chart" className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <label className="flex flex-col items-center justify-center w-full h-16 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <MdCloudUpload size={20} />
                                                <span className="text-sm font-medium">
                                                    {formik.values.sizeChart
                                                        ? (formik.values.sizeChart instanceof File ? formik.values.sizeChart.name : 'Change Size Chart')
                                                        : 'Upload Size Chart Image'}
                                                </span>
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    if (e.target.files[0]) {
                                                        formik.setFieldValue('sizeChart', e.target.files[0]);
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Package Information Section */}
                        <div className="space-y-6 pt-4 border-t border-gray-100">
                            <h4 className="text-sm font-bold text-gray-900 border-l-4 border-black pl-3 uppercase tracking-wider">
                                Package Information
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {/* Weight */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Weight (kg)</label>
                                    <input
                                        type="number"
                                        name="packageInfo.weight"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.packageInfo.weight}
                                        placeholder="e.g. 0.25"
                                        min="0"
                                        step="0.01"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
                                    />
                                    <p className="text-xs text-gray-500">Package weight in kilograms</p>
                                </div>

                                {/* Length */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Length (cm)</label>
                                    <input
                                        type="number"
                                        name="packageInfo.dimensions.length"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.packageInfo.dimensions.length}
                                        placeholder="e.g. 30"
                                        min="0"
                                        step="0.1"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
                                    />
                                    <p className="text-xs text-gray-500">Package length in cm</p>
                                </div>

                                {/* Width */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Width (cm)</label>
                                    <input
                                        type="number"
                                        name="packageInfo.dimensions.width"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.packageInfo.dimensions.width}
                                        placeholder="e.g. 25"
                                        min="0"
                                        step="0.1"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
                                    />
                                    <p className="text-xs text-gray-500">Package width in cm</p>
                                </div>

                                {/* Height */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Height (cm)</label>
                                    <input
                                        type="number"
                                        name="packageInfo.dimensions.height"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.packageInfo.dimensions.height}
                                        placeholder="e.g. 5"
                                        min="0"
                                        step="0.1"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
                                    />
                                    <p className="text-xs text-gray-500">Package height in cm</p>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-white text-xs font-bold">i</span>
                                    </div>
                                    <div className="text-sm text-blue-800">
                                        <p className="font-semibold mb-1">Package Information Guidelines:</p>
                                        <ul className="space-y-1 text-xs">
                                            <li>• Weight should include packaging materials (poly bags, boxes, etc.) in kilograms</li>
                                            <li>• Dimensions should be of the final packaged product in centimeters</li>
                                            <li>• These values are used for shipping cost calculation</li>
                                            <li>• Accurate measurements help reduce shipping disputes</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Variants Section */}
                        <div className="space-y-6 pt-4 border-t border-gray-100">
                            <h4 className="text-sm font-bold text-gray-900 border-l-4 border-black pl-3 uppercase tracking-wider">
                                Product Variants
                            </h4>

                            <div className="space-y-6">
                                {formik.values.variants.map((variant, index) => (
                                    <div key={index} className="bg-gray-50 p-6 rounded-lg border border-gray-200 relative">
                                        <button
                                            type="button"
                                            onClick={() => removeVariant(index)}
                                            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                                            title="Remove Variant"
                                        >
                                            <MdClose size={24} />
                                        </button>

                                        <h5 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs">{index + 1}</span>
                                            Variant Config
                                        </h5>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Color Name</label>
                                                <input
                                                    type="text"
                                                    name={`variants[${index}].color`}
                                                    onChange={formik.handleChange}
                                                    onBlur={(e) => {
                                                        formik.handleBlur(e);
                                                        // Generate SKUs only when user finishes typing (on blur)
                                                        setTimeout(() => {
                                                            generateSKUsForVariant(index);
                                                        }, 100);
                                                    }}
                                                    value={formik.values.variants[index].color}
                                                    placeholder="e.g. Navy Blue"
                                                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 transition-colors ${formik.touched.variants?.[index]?.color && formik.errors.variants?.[index]?.color
                                                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                                        : 'border-gray-300 focus:ring-black focus:border-black'
                                                        }`}
                                                />
                                                {formik.touched.variants?.[index]?.color && formik.errors.variants?.[index]?.color && (
                                                    <p className="text-xs text-red-500 mt-1">{formik.errors.variants[index].color}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Color Family</label>
                                                <input
                                                    type="text"
                                                    name={`variants[${index}].colorFamily`}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    value={formik.values.variants[index].colorFamily}
                                                    placeholder="e.g. Blue"
                                                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 transition-colors ${formik.touched.variants?.[index]?.colorFamily && formik.errors.variants?.[index]?.colorFamily
                                                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                                        : 'border-gray-300 focus:ring-black focus:border-black'
                                                        }`}
                                                />
                                                {formik.touched.variants?.[index]?.colorFamily && formik.errors.variants?.[index]?.colorFamily && (
                                                    <p className="text-xs text-red-500 mt-1">{formik.errors.variants[index].colorFamily}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Color Code</label>
                                                <input
                                                    type="text"
                                                    name={`variants[${index}].colorCode`}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    value={formik.values.variants[index].colorCode}
                                                    placeholder="e.g. #000000"
                                                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 transition-colors ${formik.touched.variants?.[index]?.colorCode && formik.errors.variants?.[index]?.colorCode
                                                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                                        : 'border-gray-300 focus:ring-black focus:border-black'
                                                        }`}
                                                />
                                                {formik.touched.variants?.[index]?.colorCode && formik.errors.variants?.[index]?.colorCode && (
                                                    <p className="text-xs text-red-500 mt-1">{formik.errors.variants[index].colorCode}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Images */}
                                        <div className="mb-6 space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Variant Images</label>
                                            <div className="flex flex-wrap gap-4">
                                                {variant.images.map((img, imgIndex) => (
                                                    <div key={imgIndex} className="relative w-24 h-24 border border-gray-200 rounded-lg overflow-hidden group bg-white">
                                                        {img instanceof File ? (
                                                            <img src={URL.createObjectURL(img)} alt="Preview" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <img src={img} alt="Variant" className="w-full h-full object-cover" />
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(index, imgIndex)}
                                                            className="absolute top-1 right-1 bg-white/90 text-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
                                                        >
                                                            <MdClose size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                                <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-all bg-white">
                                                    <MdCloudUpload size={24} className="text-gray-400" />
                                                    <span className="text-[10px] mt-1 font-medium text-gray-500">Upload</span>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        multiple
                                                        accept="image/*"
                                                        onChange={(e) => pushImage(index, Array.from(e.target.files))}
                                                    />
                                                </label>
                                            </div>
                                            {formik.touched.variants?.[index]?.images && typeof formik.errors.variants?.[index]?.images === 'string' && (
                                                <p className="text-xs text-red-500 font-medium">{formik.errors.variants[index].images}</p>
                                            )}
                                        </div>

                                        {/* Sizes */}
                                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-3">Sizes & Inventory</label>
                                            <div className="space-y-2">
                                                {variant.options.map((option, optIndex) => (
                                                    <div key={optIndex} className="grid grid-cols-8 gap-2 items-start">
                                                        <div className="space-y-1">
                                                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block">Size</label>
                                                            <input
                                                                type="text"
                                                                placeholder="Size"
                                                                name={`variants[${index}].options[${optIndex}].size`}
                                                                onChange={formik.handleChange}
                                                                onBlur={(e) => {
                                                                    formik.handleBlur(e);
                                                                    // Generate SKU only when user finishes typing (on blur)
                                                                    setTimeout(() => {
                                                                        generateSKUForOption(index, optIndex);
                                                                    }, 100);
                                                                }}
                                                                value={formik.values.variants[index].options[optIndex].size}
                                                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-black focus:ring-1 focus:ring-black outline-none"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block">Price</label>
                                                            <input
                                                                type="number"
                                                                placeholder="Price"
                                                                name={`variants[${index}].options[${optIndex}].price`}
                                                                onChange={formik.handleChange}
                                                                value={formik.values.variants[index].options[optIndex].price}
                                                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-black focus:ring-1 focus:ring-black outline-none"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block">MRP</label>
                                                            <input
                                                                type="number"
                                                                placeholder="MRP"
                                                                name={`variants[${index}].options[${optIndex}].mrp`}
                                                                onChange={formik.handleChange}
                                                                value={formik.values.variants[index].options[optIndex].mrp}
                                                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-black focus:ring-1 focus:ring-black outline-none"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block">Stock</label>
                                                            <input
                                                                type="number"
                                                                placeholder="Stock"
                                                                name={`variants[${index}].options[${optIndex}].stock`}
                                                                onChange={formik.handleChange}
                                                                value={formik.values.variants[index].options[optIndex].stock}
                                                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-black focus:ring-1 focus:ring-black outline-none"
                                                            />
                                                        </div>
                                                        <div className="relative col-span-3 space-y-1">
                                                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block">SKU (Auto-generated)</label>
                                                            <input
                                                                type="text"
                                                                placeholder="SKU (Auto-generated)"
                                                                name={`variants[${index}].options[${optIndex}].sku`}
                                                                onChange={formik.handleChange}
                                                                value={formik.values.variants[index].options[optIndex].sku}
                                                                title="SKU is auto-generated based on product details. You can edit it manually if needed."
                                                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-black focus:ring-1 focus:ring-black outline-none bg-blue-50/30"
                                                            />
                                                            <span className="absolute right-2 bottom-1.5 text-[10px] text-gray-400" title="Auto-generated">AUTO</span>
                                                        </div>
                                                        <div className="flex justify-center pt-6">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeOption(index, optIndex)}
                                                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                            >
                                                                <MdDelete size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => pushOption(index)}
                                                    className="w-full py-2 mt-2 text-xs font-bold text-gray-500 border border-dashed border-gray-300 rounded hover:bg-gray-50 hover:text-black transition-colors uppercase tracking-wide"
                                                >
                                                    + Add Size Option
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={pushVariant}
                                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-black hover:text-black hover:bg-gray-50 transition-all flex items-center justify-center gap-2 font-semibold"
                                >
                                    <MdAdd size={20} /> Add Another Variant
                                </button>
                            </div>
                        </div>

                        {/* Footer / Actions */}
                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/products')}
                                className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={formik.isSubmitting}
                                className="px-6 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 transition-colors shadow-sm disabled:bg-gray-300 flex items-center justify-center min-w-[140px]"
                            >
                                {formik.isSubmitting ? (
                                    <CircularProgress size={20} color="inherit" />
                                ) : (
                                    isEdit ? 'Update Product' : 'Create Product'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProductForm;
