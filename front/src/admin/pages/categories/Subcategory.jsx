import React, { useEffect, useState } from 'react';
import { MdAdd, MdEdit, MdDelete, MdVisibility } from 'react-icons/md';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import DataTable from '../../components/common/DataTable';
import CustomSelect from '../../components/common/CustomSelect';
import SubCategoryModal from '../../components/modals/SubCategoryModal';
import DeleteModal from '../../components/modals/DeleteModal';
import {
    createSubCategory,
    updateSubCategory,
    deleteSubCategory,
    fetchAdminSubCategories,
    fetchAdminCategories
} from '../../../redux/slice/category.slice';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const SubCategory = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { subCategories, categories, loading } = useSelector((state) => state.category);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSubCategory, setCurrentSubCategory] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [subCategoryToDelete, setSubCategoryToDelete] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);

    // Fetch data on mount
    useEffect(() => {
        dispatch(fetchAdminSubCategories());
        dispatch(fetchAdminCategories()); // Needed for dropdown in modal
    }, [dispatch]);

    const handleAdd = () => {
        setCurrentSubCategory(null);
        setIsModalOpen(true);
    };

    const handleEdit = (subCategory) => {
        setCurrentSubCategory(subCategory);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        setSubCategoryToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (subCategoryToDelete === 'BULK') {
            await Promise.all(selectedIds.map(id => dispatch(deleteSubCategory(id))));
            setSelectedIds([]);
            toast.success('Selected subcategories deleted');
        } else if (subCategoryToDelete) {
            const resultAction = await dispatch(deleteSubCategory(subCategoryToDelete));
            if (deleteSubCategory.fulfilled.match(resultAction)) {
                toast.success('Subcategory deleted successfully');
            } else {
                toast.error('Failed to delete subcategory');
            }
        }
        dispatch(fetchAdminSubCategories()); // Refresh list
        setIsDeleteModalOpen(false);
        setSubCategoryToDelete(null);
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        setSubCategoryToDelete('BULK');
        setIsDeleteModalOpen(true);
    };

    const handleSave = async (values) => {
        if (currentSubCategory) {
            // Edit Mode
            const resultAction = await dispatch(updateSubCategory({ id: currentSubCategory._id, data: values }));
            if (updateSubCategory.fulfilled.match(resultAction)) {
                toast.success('Subcategory updated successfully');
            } else {
                toast.error('Failed to update subcategory');
            }
        } else {
            // Add Mode
            const resultAction = await dispatch(createSubCategory(values));
            if (createSubCategory.fulfilled.match(resultAction)) {
                toast.success('Subcategory created successfully');
            } else {
                toast.error('Failed to create subcategory');
            }
        }
        dispatch(fetchAdminSubCategories());
        setIsModalOpen(false);
    };

    const columns = [
        {
            header: 'SubCategory',
            accessor: 'name',
            sortable: true,
            render: (row) => (
                <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-900">{row.name}</span>
                </div>
            )
        },
        {
            header: 'Category',
            accessor: 'category',
            sortable: true,
            render: (row) => <span className="text-gray-600">{row.category?.name || 'N/A'}</span>
        },
        {
            header: 'Description',
            accessor: 'description',
            sortable: true,
            render: (row) => <span className="text-gray-500 max-w-xs truncate block">{row.description || '-'}</span>
        },
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
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${row.deletedAt ? 'bg-red-100 text-red-700' :
                    row.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                    {row.deletedAt ? 'Deleted' : row.isActive ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            header: 'Actions',
            render: (row) => (
                <div className="flex items-center gap-2 text-gray-400">
                    {!row.deletedAt && (
                        <>
                            <button className="hover:text-black" onClick={() => handleEdit(row)}><MdEdit size={18} /></button>
                            <button className="hover:text-red-600" onClick={() => handleDelete(row._id)}><MdDelete size={18} /></button>
                        </>
                    )}
                </div>
            )
        }
    ];

    const [searchTerm, setSearchTerm] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);

    // Filter Logic
    const filteredSubCategories = (subCategories || []).filter(sub => {
        const matchesSearch = (sub.name || '').toLowerCase().includes(searchTerm.toLowerCase());

        // Complex status logic including deletedAt
        let statusString = 'Inactive';
        if (sub.deletedAt) statusString = 'Deleted';
        else if (sub.isActive) statusString = 'Active';

        const matchesStatus = statusFilter === 'All' || statusString === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredSubCategories.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = filteredSubCategories.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="p-6 bg-[#f9f9f9]">
            <Breadcrumbs
                title="SubCategories"
                items={[
                    { label: 'Dashboard', to: '/admin/dashboard' },
                    { label: 'SubCategories' },
                ]}
            />

            <DataTable
                columns={columns}
                data={currentData}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                searchProps={{
                    placeholder: 'Search subcategory...',
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
                                { label: 'Deleted', value: 'Deleted' },
                            ]}
                            className="w-36"
                        />

                        <button
                            onClick={handleAdd}
                            className="flex items-center gap-1 bg-black text-white px-4 py-2 rounded-md shadow-sm hover:bg-gray-800 transition-colors text-sm font-medium"
                        >
                            <MdAdd size={18} />
                            Add SubCategory
                        </button>
                    </>
                }
                pagination={{
                    current: currentPage,
                    totalPages: totalPages,
                    total: filteredSubCategories.length,
                    start: filteredSubCategories.length === 0 ? 0 : startIndex + 1,
                    end: Math.min(startIndex + itemsPerPage, filteredSubCategories.length)
                }}
                onPageChange={(page) => setCurrentPage(page)}
            />

            <SubCategoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={currentSubCategory}
                categories={categories}
            />

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title={subCategoryToDelete === 'BULK' ? 'Delete Selected SubCategories' : undefined}
                message={subCategoryToDelete === 'BULK' ? `Are you sure you want to delete ${selectedIds.length} subcategories?` : undefined}
            />
        </div>
    );
};

export default SubCategory;