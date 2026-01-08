import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllReviews, updateReviewStatus, deleteReview } from '../../../redux/slice/review.slice';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import DataTable from '../../components/common/DataTable';
import { MdStar, MdVisibility, MdEdit, MdDelete, MdCheckCircle } from 'react-icons/md';
import ReviewStatusModal from '../../components/modals/ReviewStatusModal';
import DeleteModal from '../../components/modals/DeleteModal';
import toast from 'react-hot-toast';

// Chart.js imports
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import CustomSelect from '../../components/common/CustomSelect';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
);

export default function Reviews() {
    const dispatch = useDispatch();
    const { reviews, loading } = useSelector((state) => state.review);

    // Modal States
    const [selectedReview, setSelectedReview] = useState(null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('edit'); // 'view' | 'edit'
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        dispatch(fetchAllReviews());
    }, [dispatch]);

    // --- Statistics Logic ---
    const stats = useMemo(() => {
        if (!reviews || reviews.length === 0) return {
            avgRating: 0,
            totalReviews: 0,
            verifiedCount: 0,
            starCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        };

        const total = reviews.length;
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        const verified = reviews.filter(r => r.isVerifiedPurchase).length;

        const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(r => {
            if (counts[r.rating] !== undefined) counts[r.rating]++;
        });

        return {
            avgRating: (sum / total).toFixed(2),
            totalReviews: total,
            verifiedCount: verified,
            starCounts: counts
        };
    }, [reviews]);

    // --- Chart Logic (Reviews per day for last 30 days) ---
    const chartData = useMemo(() => {
        const labels = [];
        const dataPoints = [];

        // Generate last 30 days labels
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            labels.push(d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }));

            // Count reviews for this day
            const count = reviews.filter(r => {
                const rDate = new Date(r.createdAt);
                return rDate.getDate() === d.getDate() &&
                    rDate.getMonth() === d.getMonth() &&
                    rDate.getFullYear() === d.getFullYear();
            }).length;
            dataPoints.push(count);
        }

        return {
            labels,
            datasets: [
                {
                    label: 'Reviews',
                    data: dataPoints,
                    fill: true,
                    backgroundColor: 'rgba(0, 0, 0, 0.05)', // gray-light
                    borderColor: '#000000', // black
                    borderWidth: 2,
                    tension: 0.4, // smooth curves
                    pointRadius: 0,
                    pointHoverRadius: 4,
                },
            ],
        };
    }, [reviews]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: '#000',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#e5e7eb',
                borderWidth: 1,
            }
        },
        scales: {
            x: {
                grid: {
                    display: false,
                    drawBorder: false,
                },
                ticks: {
                    font: {
                        size: 10
                    },
                    maxTicksLimit: 10
                }
            },
            y: {
                grid: {
                    borderDash: [4, 4],
                    drawBorder: false,
                },
                ticks: {
                    stepSize: 1,
                    font: {
                        size: 10
                    }
                },
                min: 0,
                max: Math.max(...chartData.datasets[0].data) + 2,
            },
        },
    };

    // --- Handlers ---
    const handleEditStatus = (row) => {
        setSelectedReview(row);
        setModalMode('edit');
        setIsStatusModalOpen(true);
    };

    const handleViewReview = (row) => {
        setSelectedReview(row);
        setModalMode('view');
        setIsStatusModalOpen(true);
    };

    const handleDeleteClick = (row) => {
        setSelectedReview(row);
        setIsDeleteModalOpen(true);
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        setSelectedReview('BULK');
        setIsDeleteModalOpen(true);
    };

    const confirmUpdateStatus = async (newStatus) => {
        if (selectedReview) {
            const resultAction = await dispatch(updateReviewStatus({ id: selectedReview._id, status: newStatus }));
            if (updateReviewStatus.fulfilled.match(resultAction)) {
                toast.success('Review status updated');
                setIsStatusModalOpen(false);
            } else {
                toast.error('Failed to update status');
            }
        }
    };

    const confirmDeleteReview = async () => {
        if (selectedReview === 'BULK') {
            await Promise.all(selectedIds.map(id => dispatch(deleteReview(id))));
            setSelectedIds([]);
            toast.success('Selected reviews deleted');
            setIsDeleteModalOpen(false);
            setSelectedReview(null);
        } else if (selectedReview) {
            const resultAction = await dispatch(deleteReview(selectedReview._id));
            if (deleteReview.fulfilled.match(resultAction)) {
                toast.success('Review deleted');
                setIsDeleteModalOpen(false);
                setSelectedReview(null);
            } else {
                toast.error('Failed to delete review');
            }
        }
    };

    // --- Columns ---
    const columns = [
        {
            header: 'Product',
            accessor: 'product',
            sortable: true,
            render: (row) => (
                <div className="flex items-center gap-3 max-w-[200px]">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                        {row.product?.variants?.[0]?.images?.[0] ? (
                            <img src={row.product.variants[0].images[0]} className="w-full h-full object-cover" alt="" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">N/A</div>
                        )}
                    </div>
                    <div>
                        <div className="font-bold text-gray-900 text-xs line-clamp-1" title={row.product?.name}>{row.product?.name || 'Unknown Product'}</div>
                        {/* <div className="text-[10px] text-gray-400 mt-0.5">SKU: {row.product?.variants?.[0]?.options?.[0]?.sku || 'N/A'}</div> */}
                    </div>
                </div>
            )
        },
        {
            header: 'Reviewer',
            accessor: 'user',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-xs">
                        {row.user?.avatar ? <img src={row.user.avatar} className="w-full h-full rounded-full object-cover" alt="" /> : (row.user?.firstName?.[0] || 'U')}
                    </div>
                    <div>
                        <div className="font-bold text-gray-900 text-xs">{row.user?.firstName} {row.user?.lastName}</div>
                        <div className="text-[10px] text-gray-400">{row.user?.email}</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Review',
            accessor: 'review',
            sortable: true,
            render: (row) => (
                <div className="max-w-xs">
                    <div className="flex text-amber-400 text-[10px] mb-1">
                        {[...Array(5)].map((_, i) => (
                            <MdStar key={i} className={i < row.rating ? 'fill-current' : 'text-gray-200'} />
                        ))}
                    </div>
                    <div className="font-bold text-gray-800 text-xs mb-0.5 truncate">{row.title}</div>
                    <p className="text-gray-500 italic text-[11px] line-clamp-1">"{row.review}"</p>
                </div>
            )
        },
        {
            header: 'Date',
            accessor: 'createdAt',
            sortable: true,
            render: (row) => (
                <div className="text-gray-500 text-xs">
                    {new Date(row.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    <div className="text-[10px] text-gray-400">{new Date(row.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            sortable: true,
            render: (row) => (
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${row.status === 'Published' ? 'bg-emerald-50 text-emerald-600' :
                    row.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                        'bg-red-50 text-red-600'
                    }`}>
                    {row.status || 'Pending'}
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: 'actions',
            render: (row) => (
                <div className="flex items-center gap-1 text-gray-400">
                    <button onClick={() => handleViewReview(row)} className="p-1 hover:text-black transition-colors" title="View">
                        <MdVisibility size={16} />
                    </button>
                    <button onClick={() => handleEditStatus(row)} className="p-1 hover:text-black transition-colors" title="Edit">
                        <MdEdit size={16} />
                    </button>
                    <button onClick={() => handleDeleteClick(row)} className="p-1 hover:text-red-600 transition-colors" title="Delete">
                        <MdDelete size={16} />
                    </button>
                </div>
            )
        }
    ];

    const [searchTerm, setSearchTerm] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);

    // Filter Reviews
    const filteredReviews = useMemo(() => {
        if (!reviews) return [];

        return reviews.filter(review => {
            // Search Text
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch =
                (review.product?.name || '').toLowerCase().includes(searchLower) ||
                (review.user?.firstName || '').toLowerCase().includes(searchLower) ||
                (review.user?.lastName || '').toLowerCase().includes(searchLower) ||
                (review.user?.email || '').toLowerCase().includes(searchLower) ||
                (review.title || '').toLowerCase().includes(searchLower) ||
                (review.review || '').toLowerCase().includes(searchLower);

            // Filter Status
            const matchesStatus = statusFilter === 'All' || review.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [reviews, searchTerm, statusFilter]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = filteredReviews.slice(startIndex, startIndex + itemsPerPage);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-6 animate-fade-in-up">
            <div className="space-y-8">
                <Breadcrumbs
                    title="Reviews"
                    items={[{ label: 'Dashboard', to: '/admin/dashboard' }, { label: 'Reviews' }]}
                />

                {/* Top Section: Stats & Chart */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Left: Overall Rating */}
                        <div className="lg:col-span-5 flex flex-col justify-center border-r border-gray-100 pr-10">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="text-5xl font-black text-gray-900 tracking-wide">{stats.avgRating}</div>
                                <div>
                                    <div className="flex text-amber-400 text-lg">
                                        <MdStar />
                                    </div>
                                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Overall Rating</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                                    <MdCheckCircle size={14} />
                                </div>
                                <div className="text-sm text-gray-600">
                                    Based on <span className="font-bold text-gray-900">{stats.totalReviews}</span> reviews
                                </div>
                            </div>

                            {/* Breakdown Bars */}
                            <div className="space-y-2 w-full">
                                {[5, 4, 3, 2, 1].map(star => {
                                    const count = stats.starCounts[star];
                                    const percent = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                                    return (
                                        <div key={star} className="flex items-center gap-3 text-xs">
                                            <span className="font-medium text-gray-500 w-8">{star} Star</span>
                                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-black rounded-full transition-all duration-500"
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                            <span className="font-bold text-gray-700 w-6 text-right">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right: Line Chart */}
                        <div className="lg:col-span-7 h-64">
                            <Line data={chartData} options={chartOptions} />
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="space-y-4">
                    <DataTable
                        columns={columns}
                        data={currentData}
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                        pagination={{
                            current: currentPage,
                            total: filteredReviews.length,
                            start: startIndex + 1,
                            end: Math.min(startIndex + itemsPerPage, filteredReviews.length),
                            totalPages: totalPages
                        }}
                        searchProps={{
                            placeholder: 'Search reviews...',
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
                                        { label: 'Published', value: 'Published' },
                                        { label: 'Pending', value: 'Pending' },
                                        { label: 'Rejected', value: 'Rejected' },
                                    ]}
                                    className="w-36"
                                />
                            </>
                        }
                        onPageChange={(page) => setCurrentPage(page)}
                    />
                </div>
            </div>

            {/* Modals */}
            <ReviewStatusModal
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                onConfirm={confirmUpdateStatus}
                review={selectedReview}
                readOnly={modalMode === 'view'}
            />

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteReview}
                title={selectedReview === 'BULK' ? 'Delete Selected Reviews' : "Delete Review"}
                message={selectedReview === 'BULK'
                    ? `Are you sure you want to delete ${selectedIds.length} select reviews? This action cannot be undone.`
                    : "Are you sure you want to delete this review? This action cannot be undone."
                }
            />
        </div>
    )
}