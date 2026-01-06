import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategoryById } from '../../../redux/slice/category.slice';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import { MdArrowBack, MdCalendarToday, MdDelete, MdShoppingBag, MdVisibility } from 'react-icons/md';
import DataTable from '../../components/common/DataTable';
import CustomSelect from '../../components/common/CustomSelect';

const CategoriesProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { categoryDetails, categoryProducts, loading, error } = useSelector((state) => state.category);
    const [searchTerm, setSearchTerm] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (id) {
            dispatch(fetchCategoryById(id));
        }
    }, [dispatch, id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return <div className="p-8 text-center text-red-500">{error}</div>;
    }

    if (!categoryDetails) {
        return <div className="p-8 text-center text-gray-500">Category not found</div>;
    }

    const handleView = (row) => {
        console.log(row);
        navigate(`/admin/products/${row._id}`);
    };

    const columns = [
        {
            header: 'Product Name',
            accessor: 'name',
            sortable: true,
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-md bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                        {row.variants[0]?.images[0] ? (
                            <img
                                src={row.variants[0].images[0]}
                                alt=""
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">IMG</div>
                        )}
                    </div>
                    <div>
                        <div className="font-medium text-gray-900">{row.name}</div>
                        <div className="text-xs text-gray-500">ID: {row._id}</div>
                    </div>
                </div>
            )
        },
        { header: 'Brand', accessor: 'brand', sortable: true },
        {
            header: 'Price',
            accessor: 'price',
            sortable: true,
            render: (row) => <span className="font-medium">₹{row.variants[0]?.options[0]?.price || 0}</span>
        },
        {
            header: 'SubCategory',
            accessor: 'subCategory',
            sortable: true,
            render: (row) => (
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                    {row.subCategory?.name || '-'}
                </span>
            )
        },
        {
            header: 'Status',
            accessor: 'isActive',
            sortable: true,
            render: (row) => (
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${row.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {row.isActive ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            header: 'Actions',
            render: (row) => (
                <div className="flex items-center gap-2 text-gray-400">
                    <button className="hover:text-black" onClick={() => handleView(row)}><MdVisibility size={18} /></button>
                </div>
            )
        }
    ];

    // Safe filter check
    const filteredCategories = (categoryProducts || []).filter(cat => {
        const matchesSearch = (cat.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (cat.slug || '').toLowerCase().includes(searchTerm.toLowerCase());

        const statusString = cat.isActive ? 'Active' : 'Inactive';
        const matchesStatus = statusFilter === 'All' || statusString === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="space-y-6 p-6">
            <Breadcrumbs
                title='Categories Details'
                items={[
                    { label: 'Dashboard', to: '/admin/dashboard' },
                    { label: 'Categories', to: '/admin/categories' },
                    { label: categoryDetails.name || 'Category Details' }
                ]}
            />

            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/admin/categories')}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <MdArrowBack size={24} />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">{categoryDetails.name}</h1>
                <span className={`px-3 py-1 text-xs rounded-full font-semibold ${categoryDetails.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {categoryDetails.isActive ? 'Active' : 'Inactive'}
                </span>
            </div>

            {/* Category Details Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex flex-col md:flex-row">
                    {/* Image Section */}
                    <div className="w-full md:w-1/4 bg-gray-50 border-r border-gray-100 relative min-h-[300px]">
                        {categoryDetails.image ? (
                            <div className="absolute inset-0 p-4">
                                <img
                                    src={categoryDetails.image}
                                    alt={categoryDetails.name}
                                    className="w-full h-full object-cover rounded-lg shadow-sm"
                                />
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300">
                                <MdShoppingBag size={64} className="opacity-20" />
                                <span className="text-xs font-bold uppercase tracking-widest mt-2">No Preview</span>
                            </div>
                        )}
                    </div>

                    {/* Info Section */}
                    <div className="p-6 md:w-3/4 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</label>
                                    <p className="mt-1 text-gray-700 leading-relaxed flex items-start gap-2">
                                        {/* <MdDescription className="mt-1 text-gray-400" /> */}
                                        {categoryDetails.description || 'No description provided.'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Products</label>
                                    <p className="mt-1 text-2xl font-bold text-gray-900 flex items-center gap-2">
                                        {/* <MdShoppingBag className="text-black" /> */}
                                        {categoryProducts?.length || 0}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</label>
                                    <p className="mt-1 text-gray-700 font-mono text-sm bg-gray-100 px-2 py-1 rounded inline-block">
                                        /{categoryDetails.slug}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Created At</label>
                                    <p className="mt-1 text-gray-700 flex items-center gap-2">
                                        <MdCalendarToday className="text-gray-400" />
                                        {new Date(categoryDetails.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Modify</label>
                                    <p className="mt-1 text-gray-700 flex items-center gap-2">
                                        <MdCalendarToday className="text-gray-400" />
                                        {new Date(categoryDetails.updatedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Section */}
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    Products <span className="text-sm font-normal text-gray-500">({categoryProducts?.length || 0})</span>
                </h3>

                <DataTable
                    columns={columns}
                    data={currentData || []}
                    selection={false}
                    searchProps={{
                        placeholder: 'Search product...',
                        value: searchTerm,
                        onChange: (val) => { setSearchTerm(val); setCurrentPage(1); }
                    }}
                    actions={
                        <>
                            <CustomSelect
                                value={itemsPerPage}
                                onChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
                                options={[
                                    { label: '5', value: 5 },
                                    { label: '10', value: 10 },
                                    { label: '25', value: 25 },
                                    { label: '100', value: 100 },
                                ]}
                                className="w-20"
                            />

                            <CustomSelect
                                value={statusFilter}
                                onChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
                                options={[
                                    { label: 'All Status', value: 'All' },
                                    { label: 'Active', value: 'Active' },
                                    { label: 'Inactive', value: 'Inactive' },
                                ]}
                                className="w-36"
                            />
                        </>
                    }
                    pagination={{
                        current: currentPage,
                        totalPages: totalPages,
                        total: filteredCategories.length,
                        start: filteredCategories.length === 0 ? 0 : startIndex + 1,
                        end: Math.min(startIndex + itemsPerPage, filteredCategories.length)
                    }}
                    onPageChange={(page) => setCurrentPage(page)}
                />
            </div>
        </div>
    );
};

export default CategoriesProduct;