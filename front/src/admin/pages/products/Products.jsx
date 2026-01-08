import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchAdminProducts, deleteProduct } from '../../../redux/slice/adminProductSlice';
import { fetchCategories, fetchSubCategoriesByCategoryId } from '../../../redux/slice/category.slice';
import { MdAdd, MdEdit, MdDelete, MdVisibility } from 'react-icons/md';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import DataTable from '../../components/common/DataTable';
import CustomSelect from '../../components/common/CustomSelect';
import DeleteModal from '../../components/modals/DeleteModal';
import ProductGridItem from './ProductGridItem';
import ProductFilters from './ProductFilters';

const Products = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { products, loading } = useSelector(state => state.adminProducts);

    // UI State
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

    const handleEdit = (product) => {
        navigate(`/admin/product/edit/${product._id}`);
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

    const handleView = (row) => {
        navigate(`/admin/products/${row._id}`);
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
                        <p className="font-medium text-gray-900 line-clamp-1 cursor-pointer hover:text-black">{row.name}</p>
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
                    <button className="hover:text-black" onClick={() => handleView(row)}><MdVisibility size={18} /></button>
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
                        onView={handleView}
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
                            onClick={() => navigate('/admin/add-product')}
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
