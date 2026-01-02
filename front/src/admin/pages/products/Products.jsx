import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminProducts, createProduct, updateProduct, deleteProduct } from '../../../redux/slice/adminProductSlice';
import { fetchCategories, fetchSubCategoriesByCategoryId } from '../../../redux/slice/category.slice';
import { MdAdd, MdEdit, MdDelete, MdImage, MdCloudUpload, MdClose } from 'react-icons/md';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axiosInstance from '../../../utils/axiosInstance'; // Ensure axiosInstance is imported if needed separately, but thunks handle it.

const ProductSchema = Yup.object().shape({
    name: Yup.string().required('Required'),
    description: Yup.string(),
    brand: Yup.string().required('Brand Required'),
    category: Yup.string().required('Category Required'),
    subCategory: Yup.string().required('Sub-Category Required'),
    gender: Yup.string().required('Required'),
    gstPercentage: Yup.number().min(0).max(28).required('Required'),
    sizeChart: Yup.mixed(), // Allow File or String
    variants: Yup.array().of(
        Yup.object().shape({
            color: Yup.string().required('Color Required'),
            colorFamily: Yup.string().required('Required'),
            images: Yup.array().of(Yup.mixed().required('Image is required')).min(1, 'At least one image required'),
            options: Yup.array().of(
                Yup.object().shape({
                    sku: Yup.string(), // SKU is auto-generated if empty, but can be editable
                    size: Yup.string().required('Size Required'),
                    price: Yup.number().required('Required').min(0),
                    mrp: Yup.number().required('Required').min(0),
                    stock: Yup.number().required('Required').min(0),
                })
            ).min(1, 'At least one option required')
        })
    ).min(1, 'At least one variant required')
});

const Products = () => {
    const dispatch = useDispatch();
    const { products, loading } = useSelector(state => state.adminProducts);
    const { categories, subCategories } = useSelector(state => state.category);
    const [openModal, setOpenModal] = useState(false);
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        dispatch(fetchAdminProducts());
        dispatch(fetchCategories());
    }, [dispatch]);

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
        onSubmit: (values, { setSubmitting, resetForm }) => {
            const formData = new FormData();

            // Prepare JSON payload
            // For updates, we MUST keep existing image strings in the JSON payload
            // For files, we filter them out of JSON and append to FormData
            const productPayload = {
                ...values,
                sizeChart: (values.sizeChart instanceof File) ? null : values.sizeChart,
                variants: values.variants.map(v => ({
                    ...v,
                    images: v.images.filter(img => !(img instanceof File)) // Keep existing URL strings
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

            const action = editId
                ? updateProduct({ id: editId, formData })
                : createProduct(formData);

            dispatch(action)
                .unwrap()
                .then(() => {
                    setOpenModal(false);
                    resetForm();
                    setEditId(null);
                })
                .catch((err) => {
                    console.error("Failed to save product", err);
                })
                .finally(() => {
                    setSubmitting(false);
                });
        }
    });

    const handleEdit = (product) => {
        setEditId(product._id);

        // Extract IDs for category/subcategory if they are populated objects
        const categoryId = product.category?._id || product.category;
        const subCategoryId = product.subCategory?._id || product.subCategory;

        // Fetch subcategories for the selected category so the dropdown populates
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
            sizeChart: product.sizeChart, // URL string
            variants: product.variants.map(v => ({
                color: v.color,
                colorFamily: v.colorFamily,
                images: v.images, // Array of URL strings
                options: v.options.map(o => ({
                    sku: o.sku,
                    size: o.size,
                    price: o.price,
                    mrp: o.mrp,
                    stock: o.stock
                }))
            }))
        });
        setOpenModal(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure?')) dispatch(deleteProduct(id));
    };

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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Product Listings</h2>
                <button
                    onClick={() => {
                        formik.resetForm();
                        setEditId(null);
                        setOpenModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm"
                >
                    <MdAdd size={20} /> Add Product
                </button>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                    <div key={product._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                        <div className="h-48 bg-gray-100 relative">
                            {product.variants[0]?.images[0] ? (
                                <img src={product.variants[0].images[0]} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    <MdImage size={48} />
                                </div>
                            )}
                            {product.isExchangeOnly && (
                                <span className="absolute top-2 right-2 bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded font-bold uppercase">Exchange Only</span>
                            )}
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-gray-800 truncate">{product.name}</h3>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-indigo-600 font-bold">From ₹{product.variants[0]?.options[0]?.price}</span>
                                <span className="text-xs text-gray-500">{product.variants[0]?.options.reduce((acc, curr) => acc + curr.stock, 0)} In Stock</span>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => handleEdit(product)}
                                    className="flex-1 py-1.5 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 flex justify-center items-center gap-1 text-sm"
                                >
                                    <MdEdit /> Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(product._id)}
                                    className="p-1.5 border border-red-100 bg-red-50 text-red-500 rounded hover:bg-red-100"
                                >
                                    <MdDelete />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
                <DialogTitle>{editId ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                <DialogContent dividers>
                    <form onSubmit={formik.handleSubmit} className="space-y-4">
                        {/* Basic Info Section */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-800 border-b pb-2">Basic Info</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.name}
                                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                        placeholder="Product Name"
                                    />
                                    {formik.touched.name && formik.errors.name && (
                                        <div className="text-red-500 text-xs">{formik.errors.name}</div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Brand</label>
                                    <input
                                        type="text"
                                        name="brand"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.brand}
                                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                        placeholder="Brand Name"
                                    />
                                    {formik.touched.brand && formik.errors.brand && (
                                        <div className="text-red-500 text-xs">{formik.errors.brand}</div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    name="description"
                                    rows="3"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.description}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                    placeholder="Detailed product description..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Category</label>
                                    <select
                                        name="category"
                                        onChange={handleCategoryChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.category}
                                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    {formik.touched.category && formik.errors.category && (
                                        <div className="text-red-500 text-xs">{formik.errors.category}</div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Sub Category</label>
                                    <select
                                        name="subCategory"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.subCategory}
                                        disabled={!formik.values.category}
                                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                    >
                                        <option value="">Select Sub Category</option>
                                        {subCategories.map(sub => (
                                            <option key={sub._id} value={sub._id}>{sub.name}</option>
                                        ))}
                                    </select>
                                    {formik.touched.subCategory && formik.errors.subCategory && (
                                        <div className="text-red-500 text-xs">{formik.errors.subCategory}</div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Size Chart Image</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        {formik.values.sizeChart && formik.values.sizeChart instanceof File && (
                                            <span className="text-xs text-green-600 font-medium truncate w-32">File: {formik.values.sizeChart.name}</span>
                                        )}
                                        {formik.values.sizeChart && typeof formik.values.sizeChart === 'string' && (
                                            <a href={formik.values.sizeChart} target='_blank' rel="noreferrer" className="text-xs text-blue-600 underline">View</a>
                                        )}

                                        <label className={`cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded border border-gray-300 flex items-center gap-2 text-sm`}>
                                            <MdCloudUpload /> {formik.values.sizeChart ? 'Change' : 'Select'}
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

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                                    <select
                                        name="gender"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.gender}
                                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                    >
                                        <option value="Men">Men</option>
                                        <option value="Women">Women</option>
                                        <option value="Kids">Kids</option>
                                        <option value="Unisex">Unisex</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">GST %</label>
                                    <input
                                        type="number"
                                        name="gstPercentage"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.gstPercentage}
                                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                    />
                                </div>
                                <div className="flex items-center pt-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="isExchangeOnly"
                                            onChange={formik.handleChange}
                                            checked={formik.values.isExchangeOnly}
                                            className="rounded text-indigo-600 w-4 h-4"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Exchange Only?</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Variants Section */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <h3 className="font-semibold text-gray-800">Variants</h3>
                            </div>

                            <div className="space-y-6">
                                {formik.values.variants.map((variant, index) => (
                                    <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                                        <div className="absolute top-2 right-2">
                                            <button type="button" onClick={() => removeVariant(index)} className="text-red-500 hover:text-red-700 p-1">
                                                <MdDelete size={20} />
                                            </button>
                                        </div>
                                        <h4 className="font-medium text-indigo-700 mb-3 uppercase text-xs tracking-wider">Variant #{index + 1}</h4>

                                        {/* Variant Details */}
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500">Color Name</label>
                                                <input
                                                    type="text"
                                                    name={`variants[${index}].color`}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    value={formik.values.variants[index].color}
                                                    className="mt-1 block w-full border border-gray-300 rounded p-1.5 text-sm"
                                                    placeholder="e.g. Navy Blue"
                                                />
                                                {formik.touched.variants?.[index]?.color && formik.errors.variants?.[index]?.color && (
                                                    <div className="text-red-500 text-xs">{formik.errors.variants[index].color}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500">Color Family</label>
                                                <input
                                                    type="text"
                                                    name={`variants[${index}].colorFamily`}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    value={formik.values.variants[index].colorFamily}
                                                    className="mt-1 block w-full border border-gray-300 rounded p-1.5 text-sm"
                                                    placeholder="e.g. Blue"
                                                />
                                                {formik.touched.variants?.[index]?.colorFamily && formik.errors.variants?.[index]?.colorFamily && (
                                                    <div className="text-red-500 text-xs">{formik.errors.variants[index].colorFamily}</div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Images Array */}
                                        <div className="mb-4">
                                            <label className="block text-xs font-medium text-gray-500 mb-2">Images</label>
                                            <div className="grid grid-cols-1 gap-2">
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {variant.images.map((img, imgIndex) => (
                                                        <div key={imgIndex} className="relative w-20 h-20 border rounded overflow-hidden group bg-gray-100 flex items-center justify-center">
                                                            {img instanceof File ? (
                                                                <img src={URL.createObjectURL(img)} alt="Preview" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <img src={img} alt="Variant" className="w-full h-full object-cover" />
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() => removeImage(index, imgIndex)}
                                                                className="absolute top-0 right-0 bg-red-500 text-white p-0.5 opacity-0 group-hover:opacity-100 transition"
                                                            >
                                                                <MdClose />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <label className={`w-20 h-20 border border-dashed border-indigo-300 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50 text-indigo-500`}>
                                                        <MdCloudUpload size={24} />
                                                        <span className="text-[10px] mt-1">Select</span>
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
                                                    <div className="text-red-500 text-xs">{formik.errors.variants[index].images}</div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Options (Sizes) Array */}
                                        <div className="bg-white p-3 rounded border border-gray-100">
                                            <label className="block text-xs font-bold text-gray-700 mb-2">Sizes & Stock</label>
                                            <div className="space-y-2">
                                                {variant.options.map((option, optIndex) => (
                                                    <div key={optIndex} className="grid grid-cols-6 gap-2 items-end">
                                                        <div className="col-span-1">
                                                            <label className="text-[10px] text-gray-500">SKU</label>
                                                            <input
                                                                type="text"
                                                                name={`variants[${index}].options[${optIndex}].sku`}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                value={formik.values.variants[index].options[optIndex].sku}
                                                                className="w-full border p-1 rounded text-sm"
                                                            />
                                                        </div>
                                                        <div className="col-span-1">
                                                            <label className="text-[10px] text-gray-500">Size</label>
                                                            <input
                                                                type="text"
                                                                name={`variants[${index}].options[${optIndex}].size`}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                value={formik.values.variants[index].options[optIndex].size}
                                                                className="w-full border p-1 rounded text-sm"
                                                            />
                                                        </div>
                                                        <div className="col-span-1">
                                                            <label className="text-[10px] text-gray-500">Price</label>
                                                            <input
                                                                type="number"
                                                                name={`variants[${index}].options[${optIndex}].price`}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                value={formik.values.variants[index].options[optIndex].price}
                                                                className="w-full border p-1 rounded text-sm"
                                                            />
                                                        </div>
                                                        <div className="col-span-1">
                                                            <label className="text-[10px] text-gray-500">MRP</label>
                                                            <input
                                                                type="number"
                                                                name={`variants[${index}].options[${optIndex}].mrp`}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                value={formik.values.variants[index].options[optIndex].mrp}
                                                                className="w-full border p-1 rounded text-sm"
                                                            />
                                                        </div>
                                                        <div className="col-span-1">
                                                            <label className="text-[10px] text-gray-500">Stock</label>
                                                            <input
                                                                type="number"
                                                                name={`variants[${index}].options[${optIndex}].stock`}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                value={formik.values.variants[index].options[optIndex].stock}
                                                                className="w-full border p-1 rounded text-sm"
                                                            />
                                                        </div>
                                                        <div className="col-span-1 flex justify-center pb-1">
                                                            <button type="button" onClick={() => removeOption(index, optIndex)} className="text-red-400 hover:text-red-600">
                                                                <MdDelete />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <button type="button" onClick={() => pushOption(index)} className="text-xs font-medium text-indigo-600 hover:text-indigo-800 mt-2 block w-full text-center border border-dashed border-indigo-200 p-1 rounded bg-indigo-50">
                                                    + Add Size Option
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={pushVariant}
                                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-indigo-500 hover:text-indigo-600 transition flex items-center justify-center gap-2"
                                >
                                    <MdAdd size={20} /> Add Another Variant
                                </button>
                            </div>

                            <DialogActions className="pt-4 border-t mt-4">
                                <Button onClick={() => setOpenModal(false)} color="inherit">Cancel</Button>
                                <Button type="submit" variant="contained" color="primary" disabled={formik.isSubmitting} className="bg-indigo-600 hover:bg-indigo-700">
                                    {formik.isSubmitting ? <CircularProgress size={24} color="inherit" /> : (editId ? 'Update Product' : 'Create Product')}
                                </Button>
                            </DialogActions>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Products;
