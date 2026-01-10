import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchOffers, deleteOffer } from '../../../redux/slice/offer.slice';
import { fetchCategories } from '../../../redux/slice/category.slice';
import { fetchProducts } from '../../../redux/slice/product.slice';
import { MdAdd, MdEdit, MdDelete, MdVisibility } from 'react-icons/md';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import DataTable from '../../components/common/DataTable';
import CustomSelect from '../../components/common/CustomSelect';
import ViewOfferModal from '../../components/modals/ViewOfferModal';
import DeleteModal from '../../components/modals/DeleteModal';
import toast from 'react-hot-toast';

const OfferZone = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { offers, loading } = useSelector(state => state.offers);
    const { categories } = useSelector(state => state.category);
    const { products } = useSelector(state => state.product);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [offerToDelete, setOfferToDelete] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewOfferData, setViewOfferData] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        dispatch(fetchOffers());
        dispatch(fetchCategories());
        dispatch(fetchProducts());
    }, [dispatch]);

    const handleAdd = () => {
        navigate('/admin/add-offer');
    };

    const handleEdit = (offer) => {
        navigate(`/admin/offer/edit/${offer._id}`);
    };

    const handleView = (offer) => {
        setViewOfferData(offer);
        setIsViewModalOpen(true);
    };

    const handleDelete = (id) => {
        setOfferToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (offerToDelete === 'BULK') {
            await Promise.all(selectedIds.map(id => dispatch(deleteOffer(id))));
            setSelectedIds([]);
            toast.success('Selected offers deleted');
        } else if (offerToDelete) {
            const resultAction = await dispatch(deleteOffer(offerToDelete));
            if (deleteOffer.fulfilled.match(resultAction)) {
                toast.success('Offer deleted successfully');
            } else {
                toast.error('Failed to delete offer');
            }
        }
        setIsDeleteModalOpen(false);
        setOfferToDelete(null);
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        setOfferToDelete('BULK');
        setIsDeleteModalOpen(true);
    };

    // Columns Definition
    const columns = [
        {
            header: 'Offer Title',
            accessor: 'title',
            sortable: true,
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{row.title}</span>
                    <span className="text-xs text-gray-500">{row.description}</span>
                </div>
            )
        },
        {
            header: 'Coupon Code',
            accessor: 'code',
            sortable: true,
            render: (row) => <span className="font-bold text-gray-800 tracking-wide">{row.code}</span>
        },
        {
            header: 'Type',
            accessor: 'type',
            sortable: true,
            render: (row) => (
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${row.type === 'PERCENTAGE' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {row.type}
                </span>
            )
        },
        {
            header: 'Value',
            accessor: 'value',
            sortable: true,
            render: (row) => row.type === 'PERCENTAGE' ? `${row.value}%` : `₹${row.value}`
        },
        {
            header: 'Start Date',
            accessor: 'startDate',
            sortable: true,
            render: (row) => (
                <span className="text-gray-500">
                    {new Date(row.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
            )
        },
        {
            header: 'End Date',
            accessor: 'endDate',
            sortable: true,
            render: (row) => (
                <span className="text-gray-500">
                    {new Date(row.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
            )
        },
        {
            header: 'Remaining Days',
            accessor: 'endDate',
            sortable: false,
            render: (row) => {
                const diff = Math.ceil((new Date(row.endDate) - new Date()) / (1000 * 60 * 60 * 24));
                const colorClass = diff <= 0 ? 'bg-red-100 text-red-700' : diff <= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700';
                return (
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>
                        {diff > 0 ? `${diff} days` : '0 days'}
                    </span>
                );
            }
        },
        {
            header: 'Status',
            accessor: 'isActive',
            sortable: true,
            render: (row) => {
                // const isExpired = new Date(row.endDate) < new Date();
                const isActive = row.isActive;
                return (
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                        }`}>
                        {isActive ? 'Active' : 'Expired'}
                    </span>
                );
            }
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

    // Filter Logic
    const filteredOffers = (offers || []).filter(offer => {
        const matchesSearch = (offer.code || '').toLowerCase().includes(searchTerm.toLowerCase());

        const isExpired = new Date(offer.endDate) < new Date();
        const statusString = (offer.isActive && !isExpired) ? 'Active' : 'Inactive';
        const matchesStatus = statusFilter === 'All' || statusString === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredOffers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = filteredOffers.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="p-6 bg-[#f9f9f9]">
            <Breadcrumbs
                title="Offer Zone"
                items={[
                    { label: 'Dashboard', to: '/admin/dashboard' },
                    { label: 'Offers' },
                ]}
            />

            <DataTable
                columns={columns}
                data={currentData}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                searchProps={{
                    placeholder: 'Search by coupon code...',
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
                            Add Offer
                        </button>
                    </>
                }
                pagination={{
                    current: currentPage,
                    totalPages: totalPages,
                    total: filteredOffers.length,
                    start: filteredOffers.length === 0 ? 0 : startIndex + 1,
                    end: Math.min(startIndex + itemsPerPage, filteredOffers.length)
                }}
                onPageChange={(page) => setCurrentPage(page)}
            />

            <ViewOfferModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                offer={viewOfferData}
                categories={categories}
                products={products}
            />

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title={offerToDelete === 'BULK' ? 'Delete Selected Offers' : undefined}
                message={offerToDelete === 'BULK' ? `Are you sure you want to delete ${selectedIds.length} offers? This action cannot be undone.` : undefined}
            />
        </div>
    );
};

export default OfferZone;
