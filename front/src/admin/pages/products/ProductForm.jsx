import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { MdCloudUpload, MdDelete, MdClose, MdAdd } from 'react-icons/md';
import { CircularProgress, Button } from '@mui/material';
import { createProduct, updateProduct, fetchAdminProducts } from '../../../redux/slice/adminProductSlice';
import { fetchCategories, fetchSubCategoriesByCategoryId } from '../../../redux/slice/category.slice';
import Breadcrumbs from '../../components/common/Breadcrumbs';

const ProductSchema = Yup.object().shape({
    name: Yup.string().required('Required'),
    description: Yup.string(),
    brand: Yup.string().required('Brand Required'),
    category: Yup.string().required('Category Required'),
    subCategory: Yup.string().required('Sub-Category Required'),
    gender: Yup.string().required('Required'),
    gstPercentage: Yup.number().min(0).max(28).required('Required'),
    sizeChart: Yup.mixed(),
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
    const { categories, subCategories } = useSelector(state => state.category);

    const isEdit = !!id;

    useEffect(() => {
        dispatch(fetchCategories());
        if (!products.length && isEdit) {
            dispatch(fetchAdminProducts());
        }
    }, [dispatch, products.length, isEdit]);

    const initialValues = {
        name: '',
        description: '',
        brand: '',
        category: '',
        subCategory: '',
        gender: 'Men',
        gstPercentage: 12,
        isExchangeOnly: false,
        sizeChart: null,
        variants: [
            {
                color: '',
                colorFamily: '',
                images: [],
                options: [{ sku: '', size: '', price: 0, mrp: 0, stock: 0 }]
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

                formik.setValues({
                    name: product.name,
                    description: product.description || '',
                    brand: product.brand,
                    category: categoryId,
                    subCategory: subCategoryId || '',
                    gender: product.gender,
                    gstPercentage: product.gstPercentage,
                    isExchangeOnly: product.isExchangeOnly,
                    sizeChart: product.sizeChart,
                    variants: product.variants.map(v => ({
                        color: v.color,
                        colorFamily: v.colorFamily,
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


    const handleCategoryChange = (e) => {
        const categoryId = e.target.value;
        formik.setFieldValue('category', categoryId);
        formik.setFieldValue('subCategory', '');
        if (categoryId) {
            dispatch(fetchSubCategoriesByCategoryId(categoryId));
        }
    };

    // Helper functions for array manipulations
    const pushVariant = () => {
        const newVariant = {
            color: '',
            colorFamily: '',
            images: [],
            options: [{ sku: '', size: '', price: 0, mrp: 0, stock: 0 }]
        };
        formik.setFieldValue('variants', [...formik.values.variants, newVariant]);
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
        const newOption = { sku: '', size: '', price: 0, mrp: 0, stock: 0 };
        formik.setFieldValue(`variants[${variantIndex}].options`, [...currentOptions, newOption]);
    };

    const removeOption = (variantIndex, optionIndex) => {
        const currentOptions = formik.values.variants[variantIndex].options;
        const newOptions = currentOptions.filter((_, i) => i !== optionIndex);
        formik.setFieldValue(`variants[${variantIndex}].options`, newOptions);
    };

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

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6 max-w-4xl mx-auto">
                <form onSubmit={formik.handleSubmit} className="space-y-6">
                    {/* Basic Info Section */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-900 text-lg border-b pb-2">Basic Information</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.name}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-black focus:border-black transition-colors"
                                    placeholder="e.g. Classic Cotton T-Shirt"
                                />
                                {formik.touched.name && formik.errors.name && (
                                    <div className="text-red-500 text-xs mt-1 font-medium">{formik.errors.name}</div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Brand</label>
                                <input
                                    type="text"
                                    name="brand"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.brand}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-black focus:border-black transition-colors"
                                    placeholder="e.g. Nike, Adidas"
                                />
                                {formik.touched.brand && formik.errors.brand && (
                                    <div className="text-red-500 text-xs mt-1 font-medium">{formik.errors.brand}</div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                rows="4"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.description}
                                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-black focus:border-black transition-colors"
                                placeholder="Write a detailed description of the product..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                                <select
                                    name="category"
                                    onChange={handleCategoryChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.category}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-black focus:border-black transition-colors"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                                {formik.touched.category && formik.errors.category && (
                                    <div className="text-red-500 text-xs mt-1 font-medium">{formik.errors.category}</div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Sub Category</label>
                                <select
                                    name="subCategory"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.subCategory}
                                    disabled={!formik.values.category}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-black focus:border-black transition-colors disabled:bg-gray-100"
                                >
                                    <option value="">Select Sub Category</option>
                                    {subCategories.map(sub => (
                                        <option key={sub._id} value={sub._id}>{sub.name}</option>
                                    ))}
                                </select>
                                {formik.touched.subCategory && formik.errors.subCategory && (
                                    <div className="text-red-500 text-xs mt-1 font-medium">{formik.errors.subCategory}</div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Size Chart Data</label>
                                <div className="mt-1 flex items-center gap-4">
                                    <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm">
                                        <MdCloudUpload className="text-lg" />
                                        {formik.values.sizeChart ? 'Change File' : 'Upload Image'}
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

                                    {formik.values.sizeChart && (
                                        <div className="flex items-center gap-2 text-sm">
                                            {formik.values.sizeChart instanceof File ? (
                                                <span className="text-green-600 font-medium truncate max-w-[150px]">{formik.values.sizeChart.name}</span>
                                            ) : (
                                                <a href={formik.values.sizeChart} target='_blank' rel="noreferrer" className="text-blue-600 hover:underline font-medium">View Current</a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Gender</label>
                                <select
                                    name="gender"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.gender}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-black focus:border-black transition-colors"
                                >
                                    <option value="Men">Men</option>
                                    <option value="Women">Women</option>
                                    <option value="Kids">Kids</option>
                                    <option value="Unisex">Unisex</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">GST %</label>
                                <input
                                    type="number"
                                    name="gstPercentage"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.gstPercentage}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-black focus:border-black transition-colors"
                                />
                            </div>
                            <div className="flex items-center pt-8">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        name="isExchangeOnly"
                                        onChange={formik.handleChange}
                                        checked={formik.values.isExchangeOnly}
                                        className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black transition-colors cursor-pointer"
                                    />
                                    <span className="text-sm font-semibold text-gray-700 group-hover:text-black transition-colors">Exchange Only Item</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Variants Section */}
                    <div className="space-y-4 pt-6">
                        <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                            <h3 className="font-bold text-gray-900 text-lg">Product Variants</h3>
                        </div>

                        <div className="space-y-8">
                            {formik.values.variants.map((variant, index) => (
                                <div key={index} className="bg-gray-50 p-6 rounded-xl border border-gray-200 relative shadow-sm">
                                    <button
                                        type="button"
                                        onClick={() => removeVariant(index)}
                                        className="absolute top-4 right-4 text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
                                        title="Remove Variant"
                                    >
                                        <MdDelete size={20} />
                                    </button>

                                    <h4 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs">{index + 1}</span>
                                        Variant Details
                                    </h4>

                                    {/* Variant Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Color Name</label>
                                            <input
                                                type="text"
                                                name={`variants[${index}].color`}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.variants[index].color}
                                                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-black focus:border-black"
                                                placeholder="e.g. Navy Blue"
                                            />
                                            {formik.touched.variants?.[index]?.color && formik.errors.variants?.[index]?.color && (
                                                <div className="text-red-500 text-xs mt-1">{formik.errors.variants[index].color}</div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Color Family</label>
                                            <input
                                                type="text"
                                                name={`variants[${index}].colorFamily`}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.variants[index].colorFamily}
                                                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-black focus:border-black"
                                                placeholder="e.g. Blue"
                                            />
                                            {formik.touched.variants?.[index]?.colorFamily && formik.errors.variants?.[index]?.colorFamily && (
                                                <div className="text-red-500 text-xs mt-1">{formik.errors.variants[index].colorFamily}</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Images Array */}
                                    <div className="mb-6">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Variant Images</label>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="flex flex-wrap gap-4">
                                                {variant.images.map((img, imgIndex) => (
                                                    <div key={imgIndex} className="relative w-24 h-24 border border-gray-200 rounded-lg overflow-hidden group bg-white shadow-sm">
                                                        {img instanceof File ? (
                                                            <img src={URL.createObjectURL(img)} alt="Preview" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <img src={img} alt="Variant" className="w-full h-full object-cover" />
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(index, imgIndex)}
                                                            className="absolute top-1 right-1 bg-white/90 text-red-600 p-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
                                                        >
                                                            <MdClose size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                                <label className={`w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-black hover:text-black text-gray-400 transition-all`}>
                                                    <MdCloudUpload size={24} />
                                                    <span className="text-[10px] mt-1 font-medium">Upload</span>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        multiple
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const files = Array.from(e.target.files);
                                                            pushImage(index, files);
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                            {formik.touched.variants?.[index]?.images && typeof formik.errors.variants?.[index]?.images === 'string' && (
                                                <div className="text-red-500 text-xs font-medium">{formik.errors.variants[index].images}</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Options (Sizes) Array */}
                                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                        <label className="block text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">Sizes & Inventory</label>
                                        <div className="space-y-3">
                                            {variant.options.map((option, optIndex) => (
                                                <div key={optIndex} className="grid grid-cols-6 gap-3 items-end p-2 bg-gray-50 rounded border border-gray-100 hover:border-gray-300 transition-colors">
                                                    <div className="col-span-1">
                                                        <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">SKU</label>
                                                        <input
                                                            type="text"
                                                            name={`variants[${index}].options[${optIndex}].sku`}
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                            value={formik.values.variants[index].options[optIndex].sku}
                                                            className="w-full border border-gray-300 p-1.5 rounded text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
                                                        />
                                                    </div>
                                                    <div className="col-span-1">
                                                        <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Size</label>
                                                        <input
                                                            type="text"
                                                            name={`variants[${index}].options[${optIndex}].size`}
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                            value={formik.values.variants[index].options[optIndex].size}
                                                            className="w-full border border-gray-300 p-1.5 rounded text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
                                                        />
                                                    </div>
                                                    <div className="col-span-1">
                                                        <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Price</label>
                                                        <input
                                                            type="number"
                                                            name={`variants[${index}].options[${optIndex}].price`}
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                            value={formik.values.variants[index].options[optIndex].price}
                                                            className="w-full border border-gray-300 p-1.5 rounded text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
                                                        />
                                                    </div>
                                                    <div className="col-span-1">
                                                        <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">MRP</label>
                                                        <input
                                                            type="number"
                                                            name={`variants[${index}].options[${optIndex}].mrp`}
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                            value={formik.values.variants[index].options[optIndex].mrp}
                                                            className="w-full border border-gray-300 p-1.5 rounded text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
                                                        />
                                                    </div>
                                                    <div className="col-span-1">
                                                        <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Stock</label>
                                                        <input
                                                            type="number"
                                                            name={`variants[${index}].options[${optIndex}].stock`}
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                            value={formik.values.variants[index].options[optIndex].stock}
                                                            className="w-full border border-gray-300 p-1.5 rounded text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
                                                        />
                                                    </div>
                                                    <div className="col-span-1 flex justify-center pb-1">
                                                        <button type="button" onClick={() => removeOption(index, optIndex)} className="text-gray-400 hover:text-red-600 transition-colors p-1">
                                                            <MdDelete size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            <button type="button" onClick={() => pushOption(index)} className="text-xs font-bold text-black hover:text-gray-700 mt-3 block w-full text-center border border-dashed border-gray-300 p-2 rounded hover:bg-gray-50 transition-colors uppercase tracking-wide">
                                                + Add Size Option
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={pushVariant}
                                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-black hover:text-black transition-all flex items-center justify-center gap-2 font-semibold hover:bg-white"
                            >
                                <MdAdd size={22} /> Add Another Variant
                            </button>
                        </div>

                        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 mt-8">
                            <Button
                                onClick={() => navigate('/admin/products')}
                                color="inherit"
                                className="text-gray-600 hover:text-gray-900 font-medium px-6"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={formik.isSubmitting}
                                sx={{
                                    bgcolor: 'black',
                                    color: 'white',
                                    borderRadius: '8px',
                                    paddingX: '24px',
                                    '&:hover': { bgcolor: '#222' },
                                    '&.Mui-disabled': { bgcolor: '#f0f0f0', color: '#ccc' }
                                }}
                            >
                                {formik.isSubmitting ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    isEdit ? 'Update Product' : 'Create Product'
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductForm;
