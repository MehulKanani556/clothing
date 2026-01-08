import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminProducts, createProduct, updateProduct, deleteProduct } from '../../../redux/slice/adminProductSlice';
import { fetchCategories, fetchSubCategoriesByCategoryId } from '../../../redux/slice/category.slice';
import { MdAdd, MdEdit, MdDelete, MdCloudUpload, MdClose, MdVisibility, MdAddShoppingCart, MdMoreHoriz, MdStar } from 'react-icons/md';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import DataTable from '../../components/common/DataTable';
import CustomSelect from '../../components/common/CustomSelect';
import DeleteModal from '../../components/modals/DeleteModal';
import ProductGridItem from './ProductGridItem';
import ProductFilters from './ProductFilters';

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

const Products = () => {
    const dispatch = useDispatch();
    const { products, loading } = useSelector(state => state.adminProducts);
    const { categories, subCategories } = useSelector(state => state.category);

    // UI State
    const [openModal, setOpenModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [viewMode, setViewMode] = useState('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

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
        setOpenModal(true);
    };

    const handleDeleteClick = (id) => {
        setProductToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        setProductToDelete('BULK');
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (productToDelete === 'BULK') {
            await Promise.all(selectedIds.map(id => dispatch(deleteProduct(id))));
            setSelectedIds([]);
        } else if (productToDelete) {
            await dispatch(deleteProduct(productToDelete));
        }
        setIsDeleteModalOpen(false);
        setProductToDelete(null);
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

    const columns = [
        {
            header: 'Product',
            accessor: 'name',
            sortable: true,
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0 border border-gray-200">
                        {row.variants[0]?.images[0] ? (
                            <img src={row.variants[0].images[0]} alt={row.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400"><MdVisibility /></div>
                        )}
                    </div>
                    <div>
                        <p className="font-medium text-gray-900 line-clamp-1 cursor-pointer hover:text-indigo-600" onClick={() => handleEdit(row)}>{row.name}</p>
                        <p className="text-xs text-gray-500">{row.brand}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Category',
            accessor: 'category.name',
            sortable: true,
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-sm text-gray-700">{row.category?.name || '-'}</span>
                    <span className="text-xs text-gray-400">{row.subCategory?.name}</span>
                </div>
            )
        },
        {
            header: 'Price',
            accessor: 'price',
            sortable: true,
            render: (row) => {
                const minPrice = row.variants[0]?.options[0]?.price || 0;
                return <span className="font-medium">₹{minPrice}</span>;
            }
        },
        {
            header: 'Rating',
            accessor: 'rating.average',
            sortable: true,
            render: (row) => (
                <div className="flex items-center gap-1">
                    <span className="font-medium text-gray-700">{row.rating?.average || row?.averageRating || 0}</span>
                    <span className="text-yellow-400">★</span>
                    <span className="text-xs text-gray-400">({row.rating?.count || row?.reviewCount || 0})</span>
                </div>
            )
        },
        {
            header: 'Orders',
            accessor: 'orderCount',
            sortable: true,
            render: (row) => <span className="text-gray-600">{row.orderCount || 0}</span>
        },
        {
            header: 'Stock',
            accessor: 'stock',
            render: (row) => {
                const totalStock = row.variants.reduce((acc, v) => acc + v.options.reduce((oa, o) => oa + o.stock, 0), 0);
                return (
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${totalStock > 0 ? '' : 'bg-red-100 text-red-700'}`}>
                        {totalStock > 0 ? `${totalStock}` : 'Out of Stock'}
                    </span>
                );
            }
        },
        {
            header: 'Status',
            accessor: 'isActive',
            sortable: true,
            render: (row) => (
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${row.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {row.isActive ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            header: 'Actions',
            render: (row) => (
                <div className="flex items-center gap-2 text-gray-400">
                    <button className="hover:text-black" onClick={() => handleEdit(row)}><MdEdit size={18} /></button>
                    <button className="hover:text-red-600" onClick={() => handleDeleteClick(row._id)}><MdDelete size={18} /></button>
                </div>
            )
        }
    ];

    // Filter State
    const [filterState, setFilterState] = useState({
        search: '',
        categories: [],
        brands: [],
        rating: null
    });

    // Sync local search term with filter state for search bar compatibility
    useEffect(() => {
        setFilterState(prev => ({ ...prev, search: searchTerm }));
    }, [searchTerm]);

    // Enhanced Filter Logic
    const filteredProducts = (products || []).filter(product => {
        // Search Filter
        const search = filterState.search.toLowerCase();
        const matchesSearch = (product.name || '').toLowerCase().includes(search) ||
            (product.brand || '').toLowerCase().includes(search);

        // Category Filter
        const matchesCategory = filterState.categories.length === 0 ||
            (product.category?.name && filterState.categories.includes(product.category.name));

        // Brand Filter
        const matchesBrand = filterState.brands.length === 0 ||
            (product.brand && filterState.brands.includes(product.brand));

        // Rating Filter
        const productRating = product.rating?.average || product.averageRating || 0;
        const matchesRating = !filterState.rating || productRating >= filterState.rating;

        return matchesSearch && matchesCategory && matchesBrand && matchesRating;
    });

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="p-6 bg-[#f9f9f9] min-h-screen">
            <Breadcrumbs
                title="Products"
                items={[
                    { label: 'Dashboard', to: '/admin/dashboard' },
                    { label: 'Products' },
                ]}
            />

            <DataTable
                columns={columns}
                data={currentData}
                grid={true}
                viewMode={viewMode}
                onViewChange={(mode) => {
                    setViewMode(mode);
                    setItemsPerPage(mode === 'grid' ? 12 : 10);
                    setCurrentPage(1);
                }}
                filters={
                    <ProductFilters
                        products={products || []}
                        filters={filterState}
                        setFilters={(newFilters) => {
                            setFilterState(newFilters);
                            setSearchTerm(newFilters.search); // Sync back to main search
                            setCurrentPage(1);
                        }}
                    />
                }
                renderGridItem={(product) => (
                    <ProductGridItem
                        product={product}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                    />
                )}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                searchProps={{
                    placeholder: 'Search product...',
                    value: searchTerm,
                    onChange: (val) => { setSearchTerm(val); setCurrentPage(1); }
                }}
                actions={
                    <>
                        {selectedIds.length > 0 && (
                            <button
                                onClick={handleBulkDelete}
                                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200 text-sm font-semibold shadow-sm group"
                            >
                                <MdDelete size={18} className="group-hover:scale-110 transition-transform" />
                                <span>Delete All ({selectedIds.length})</span>
                            </button>
                        )}
                        <CustomSelect
                            value={itemsPerPage}
                            onChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
                            options={viewMode === 'grid' ? [
                                { label: '12', value: 12 },
                                { label: '24', value: 24 },
                                { label: '36', value: 36 },
                                { label: '48', value: 48 },
                            ] : [
                                { label: '10', value: 10 },
                                { label: '25', value: 25 },
                                { label: '50', value: 50 },
                                { label: '100', value: 100 },
                            ]}
                            className="w-20"
                        />
                        <button
                            onClick={() => {
                                formik.resetForm();
                                setEditId(null);
                                setOpenModal(true);
                            }}
                            className="flex items-center gap-1 bg-black text-white px-4 py-2 rounded-md shadow-sm hover:bg-gray-800 transition-colors text-sm font-medium"
                        >
                            <MdAdd size={18} />
                            Add Product
                        </button>
                    </>
                }
                pagination={{
                    current: currentPage,
                    totalPages: totalPages,
                    total: filteredProducts.length,
                    start: filteredProducts.length === 0 ? 0 : startIndex + 1,
                    end: Math.min(startIndex + itemsPerPage, filteredProducts.length)
                }}
                onPageChange={(page) => setCurrentPage(page)}
            />

            {/* Add/Edit Product Modal */}
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

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title={productToDelete === 'BULK' ? 'Delete Selected Products' : undefined}
                message={productToDelete === 'BULK' ? `Are you sure you want to delete ${selectedIds.length} products? This action cannot be undone.` : undefined}
            />
        </div>
    );
};

export default Products;
