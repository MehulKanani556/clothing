import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminProducts, createProduct, deleteProduct } from '../../../redux/slice/adminProductSlice';
import { MdAdd, MdEdit, MdDelete, MdImage } from 'react-icons/md';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { Formik, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';

const ProductSchema = Yup.object().shape({
    name: Yup.string().required('Required'),
    description: Yup.string(),
    brand: Yup.string().required('Brand Required'),
    category: Yup.string().required('Category Required'),
    gender: Yup.string().required('Required'),
    gstPercentage: Yup.number().min(0).max(28).required('Required'),
    sizeChart: Yup.string(),
    variants: Yup.array().of(
        Yup.object().shape({
            color: Yup.string().required('Color Required'),
            colorFamily: Yup.string().required('Required'),
            images: Yup.array().of(Yup.string().required('Image URL required')).min(1, 'At least one image required'),
            options: Yup.array().of(
                Yup.object().shape({
                    sku: Yup.string().required('SKU Required'),
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
    const [openModal, setOpenModal] = useState(false);

    // Initial Values
    const initialValues = {
        name: '',
        description: '',
        brand: '',
        category: '',
        gender: 'Men',
        gstPercentage: 12, // Default standard for clothing
        isExchangeOnly: false,
        sizeChart: '',
        variants: [
            {
                color: '',
                colorFamily: '',
                images: [''],
                options: [{ sku: '', size: '', price: 0, mrp: 0, stock: 0 }]
            }
        ]
    };

    useEffect(() => {
        dispatch(fetchAdminProducts());
    }, [dispatch]);

    const handleDelete = (id) => {
        if (window.confirm('Are you sure?')) dispatch(deleteProduct(id));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Product Listings</h2>
                <button
                    onClick={() => setOpenModal(true)}
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
                            {/* Image Placeholder */}
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
                                <button className="flex-1 py-1.5 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 flex justify-center items-center gap-1 text-sm">
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

            {/* Simplified Add Modal - In real app, separate component */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogContent dividers>
                    <Formik
                        initialValues={initialValues}
                        validationSchema={ProductSchema}
                        onSubmit={(values, { setSubmitting }) => {
                            dispatch(createProduct(values));
                            setSubmitting(false);
                            setOpenModal(false);
                        }}
                    >
                        {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
                            <Form className="space-y-4">
                                {/* Basic Info Section */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-800 border-b pb-2">Basic Info</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Name</label>
                                            <Field name="name" className="mt-1 block w-full border border-gray-300 rounded-md p-2" placeholder="Product Name" />
                                            {errors.name && touched.name && <div className="text-red-500 text-xs">{errors.name}</div>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Brand</label>
                                            <Field name="brand" className="mt-1 block w-full border border-gray-300 rounded-md p-2" placeholder="Brand Name" />
                                            {errors.brand && touched.brand && <div className="text-red-500 text-xs">{errors.brand}</div>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Description</label>
                                        <Field as="textarea" name="description" rows="3" className="mt-1 block w-full border border-gray-300 rounded-md p-2" placeholder="Detailed product description..." />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Category (ID)</label>
                                            <Field name="category" className="mt-1 block w-full border border-gray-300 rounded-md p-2" placeholder="Category ID" />
                                            {errors.category && touched.category && <div className="text-red-500 text-xs">{errors.category}</div>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Size Chart (URL)</label>
                                            <Field name="sizeChart" className="mt-1 block w-full border border-gray-300 rounded-md p-2" placeholder="https://..." />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Gender</label>
                                            <Field as="select" name="gender" className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                                                <option value="Men">Men</option>
                                                <option value="Women">Women</option>
                                                <option value="Kids">Kids</option>
                                                <option value="Unisex">Unisex</option>
                                            </Field>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">GST %</label>
                                            <Field type="number" name="gstPercentage" className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                                        </div>
                                        <div className="flex items-center pt-6">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <Field type="checkbox" name="isExchangeOnly" className="rounded text-indigo-600 w-4 h-4" />
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

                                    <FieldArray name="variants">
                                        {({ push: pushVariant, remove: removeVariant }) => (
                                            <div className="space-y-6">
                                                {values.variants.map((variant, index) => (
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
                                                                <Field name={`variants.${index}.color`} className="mt-1 block w-full border border-gray-300 rounded p-1.5 text-sm" placeholder="e.g. Navy Blue" />
                                                                {errors.variants?.[index]?.color && touched.variants?.[index]?.color && <div className="text-red-500 text-xs">{errors.variants[index].color}</div>}
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-500">Color Family</label>
                                                                <Field name={`variants.${index}.colorFamily`} className="mt-1 block w-full border border-gray-300 rounded p-1.5 text-sm" placeholder="e.g. Blue" />
                                                            </div>
                                                        </div>

                                                        {/* Images Array */}
                                                        <div className="mb-4">
                                                            <label className="block text-xs font-medium text-gray-500 mb-2">Images (URLs)</label>
                                                            <FieldArray name={`variants.${index}.images`}>
                                                                {({ push: pushImage, remove: removeImage }) => (
                                                                    <div className="grid grid-cols-1 gap-2">
                                                                        {variant.images.map((img, imgIndex) => (
                                                                            <div key={imgIndex} className="flex gap-2">
                                                                                <Field name={`variants.${index}.images.${imgIndex}`} className="flex-1 border border-gray-300 rounded p-1.5 text-sm" placeholder="Image URL" />
                                                                                <button type="button" onClick={() => removeImage(imgIndex)} className="text-red-400 hover:text-red-600"><MdDelete /></button>
                                                                            </div>
                                                                        ))}
                                                                        <button type="button" onClick={() => pushImage('')} className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mt-1">
                                                                            + Add Image
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </FieldArray>
                                                        </div>

                                                        {/* Options (Sizes) Array */}
                                                        <div className="bg-white p-3 rounded border border-gray-100">
                                                            <label className="block text-xs font-bold text-gray-700 mb-2">Sizes & Stock</label>
                                                            <FieldArray name={`variants.${index}.options`}>
                                                                {({ push: pushOption, remove: removeOption }) => (
                                                                    <div className="space-y-2">
                                                                        {variant.options.map((option, optIndex) => (
                                                                            <div key={optIndex} className="grid grid-cols-6 gap-2 items-end">
                                                                                <div className="col-span-1">
                                                                                    <label className="text-[10px] text-gray-500">SKU</label>
                                                                                    <Field name={`variants.${index}.options.${optIndex}.sku`} className="w-full border p-1 rounded text-sm" />
                                                                                </div>
                                                                                <div className="col-span-1">
                                                                                    <label className="text-[10px] text-gray-500">Size</label>
                                                                                    <Field name={`variants.${index}.options.${optIndex}.size`} className="w-full border p-1 rounded text-sm" />
                                                                                </div>
                                                                                <div className="col-span-1">
                                                                                    <label className="text-[10px] text-gray-500">Price</label>
                                                                                    <Field type="number" name={`variants.${index}.options.${optIndex}.price`} className="w-full border p-1 rounded text-sm" />
                                                                                </div>
                                                                                <div className="col-span-1">
                                                                                    <label className="text-[10px] text-gray-500">MRP</label>
                                                                                    <Field type="number" name={`variants.${index}.options.${optIndex}.mrp`} className="w-full border p-1 rounded text-sm" />
                                                                                </div>
                                                                                <div className="col-span-1">
                                                                                    <label className="text-[10px] text-gray-500">Stock</label>
                                                                                    <Field type="number" name={`variants.${index}.options.${optIndex}.stock`} className="w-full border p-1 rounded text-sm" />
                                                                                </div>
                                                                                <div className="col-span-1 flex justify-center pb-1">
                                                                                    <button type="button" onClick={() => removeOption(optIndex)} className="text-red-400 hover:text-red-600">
                                                                                        <MdDelete />
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                        <button type="button" onClick={() => pushOption({ sku: '', size: '', price: 0, mrp: 0, stock: 0 })} className="text-xs font-medium text-indigo-600 hover:text-indigo-800 mt-2 block w-full text-center border border-dashed border-indigo-200 p-1 rounded bg-indigo-50">
                                                                            + Add Size Option
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </FieldArray>
                                                        </div>
                                                    </div>
                                                ))}

                                                <button
                                                    type="button"
                                                    onClick={() => pushVariant({ color: '', colorFamily: '', images: [''], options: [{ sku: '', size: '', price: 0, mrp: 0, stock: 0 }] })}
                                                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-indigo-500 hover:text-indigo-600 transition flex items-center justify-center gap-2"
                                                >
                                                    <MdAdd size={20} /> Add Another Variant
                                                </button>
                                            </div>
                                        )}
                                    </FieldArray>
                                </div>

                                <DialogActions className="pt-4 border-t mt-4">
                                    <Button onClick={() => setOpenModal(false)} color="inherit">Cancel</Button>
                                    <Button type="submit" variant="contained" color="primary" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700">
                                        {isSubmitting ? 'Creating...' : 'Create Product'}
                                    </Button>
                                </DialogActions>
                            </Form>
                        )}
                    </Formik>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Products;
