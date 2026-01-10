import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MdSearch, MdAdd, MdEdit, MdDelete, MdVisibility } from 'react-icons/md';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import DataTable from '../../components/common/DataTable';
import CustomSelect from '../../components/common/CustomSelect';
import CategoryModal from '../../components/modals/CategoryModal';
import DeleteModal from '../../components/modals/DeleteModal';
import { createCategory, updateCategory, deleteCategory, fetchAdminCategories } from '../../../redux/slice/category.slice';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const Categories = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { categories, loading } = useSelector((state) => state.category);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);

    // Fetch categories on mount
    useEffect(() => {
        dispatch(fetchAdminCategories());
    }, [dispatch]);

    const handleAdd = () => {
        setCurrentCategory(null);
        setIsModalOpen(true);
    };

    const handleEdit = (category) => {
        setCurrentCategory(category);
        setIsModalOpen(true);
    };

    const handleView = (category) => {
        navigate(`/admin/categories/${category._id}`);
    }

    const handleDelete = (id) => {
        setCategoryToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (categoryToDelete === 'BULK') {
            await Promise.all(selectedIds.map(id => dispatch(deleteCategory(id))));
            setSelectedIds([]);
            toast.success('Selected categories deleted');
        } else if (categoryToDelete) {
            const resultAction = await dispatch(deleteCategory(categoryToDelete));
            if (deleteCategory.fulfilled.match(resultAction)) {
                toast.success('Category deleted successfully');
            } else {
                toast.error('Failed to delete category');
            }
        }
        setIsDeleteModalOpen(false);
        setCategoryToDelete(null);
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        setCategoryToDelete('BULK');
        setIsDeleteModalOpen(true);
    };

    const handleSave = async (formData) => {
        const data = new FormData();
        data.append('name', formData.name);
        data.append('slug', formData.slug);
        data.append('mainCategory', formData.mainCategory);
        data.append('description', formData.description);
        data.append('isActive', formData.isActive);

        if (formData.image) {
            data.append('image', formData.image);
        }

        if (currentCategory) {
            // Edit Mode
            const resultAction = await dispatch(updateCategory({ id: currentCategory._id, data: data }));
            if (updateCategory.fulfilled.match(resultAction)) {
                toast.success('Category updated successfully');
            } else {
                toast.error('Failed to update category');
            }
        } else {
            // Add Mode
            const resultAction = await dispatch(createCategory(data));
            if (createCategory.fulfilled.match(resultAction)) {
                toast.success('Category created successfully');
            } else {
                toast.error('Failed to create category');
            }
        }
        setIsModalOpen(false);
    };

    const columns = [
        {
            header: 'Category Name',
            accessor: 'name',
            sortable: true,
            render: (row) => (
                <div className="flex items-center gap-3">
                    <span className="text-xl w-14 h-14 flex items-center justify-center bg-gray-100 rounded">{row.image ? <img src={row.image} alt="" className="w-full h-full object-cover rounded" /> : (row.icon || '📁')}</span>
                    <span className="font-medium text-gray-900">{row.name}</span>
                </div>
            )
        },
        {
            header: 'Main Category',
            accessor: 'mainCategory',
            sortable: true,
            render: (row) => (
                <span className="text-gray-600">{row.mainCategory?.name || 'N/A'}</span>
            )
        },
        { header: 'Slug', accessor: 'slug', sortable: true, render: (row) => <span className="text-gray-600">{row.slug}</span> },
        { header: 'Products', accessor: 'productCount', sortable: true, render: (row) => row.productCount || 0 },
        { header: 'Orders', accessor: 'orderCount', sortable: true, render: (row) => row.orderCount || 0 },
        { header: 'Earnings', accessor: 'totalEarnings', sortable: true, render: (row) => `₹${row.totalEarnings || 0}` },
        {
            header: 'Last Modify',
            accessor: 'updatedAt',
            sortable: true,
            render: (row) => <span className="text-gray-500">{new Date(row.updatedAt).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        },
        {
            header: 'Status',
            accessor: 'isActive',
            sortable: true,
            render: (row) => (
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${row.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                    }`}>
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
                    <button className="hover:text-red-600" onClick={() => handleDelete(row._id)}><MdDelete size={18} /></button>
                </div>
            )
        }
    ];

    const [searchTerm, setSearchTerm] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);

    // Safe filter check
    const filteredCategories = (categories || []).filter(cat => {
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
        <div className="p-6 bg-[#f9f9f9]">
            <Breadcrumbs
                title="Categories"
                items={[
                    { label: 'Dashboard', to: '/admin/dashboard' },
                    { label: 'Categories' },
                ]}
            />

            <DataTable
                columns={columns}
                data={currentData}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                searchProps={{
                    placeholder: 'Search category...',
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

                        <button
                            onClick={handleAdd}
                            className="flex items-center gap-1 bg-black text-white px-4 py-2 rounded-md shadow-sm hover:bg-gray-800 transition-colors text-sm font-medium"
                        >
                            <MdAdd size={18} />
                            Add Category
                        </button>
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

            <CategoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={currentCategory}
            />

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title={categoryToDelete === 'BULK' ? 'Delete Selected Categories' : undefined}
                message={categoryToDelete === 'BULK' ? `Are you sure you want to delete ${selectedIds.length} categories? This action cannot be undone.` : undefined}
            />
        </div>
    );
};


export default Categories;
