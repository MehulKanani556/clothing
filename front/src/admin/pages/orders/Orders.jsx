import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminOrders, updateOrderStatus } from '../../../redux/slice/adminOrderSlice';
import {
    MdVisibility, MdEdit, MdDelete,
    MdCheckCircle, MdCancel, MdLocalShipping, MdOutlineShoppingBag,
    MdAttachMoney, MdPendingActions, MdErrorOutline, MdAdd, MdFilterList,
    MdSearch, MdKeyboardArrowDown, MdMoreVert, MdHourglassEmpty, MdRefresh,
    MdSync, MdLocationOn
} from 'react-icons/md';
import { FiTruck, FiMapPin } from 'react-icons/fi';
import { RiVisaLine, RiMastercardLine, RiPaypalLine, RiWallet3Line } from 'react-icons/ri';
import DataTable from '../../components/common/DataTable';
import { useNavigate } from 'react-router-dom';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import axiosInstance from '../../../utils/axiosInstance';
import { BASE_URL } from '../../../utils/BASE_URL';
import toast from 'react-hot-toast';

const StatsCard = ({ title, count, icon: Icon, colorClass, trend }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-start justify-between transition-transform hover:-translate-y-1 duration-300">
        <div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">{count}</h3>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClass} bg-opacity-50 flex items-center justify-center`}>
            <Icon size={24} className={colorClass.replace('bg-', 'text-')} />
        </div>
    </div>
);

const Orders = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { orders, total, loading } = useSelector(state => state.adminOrders);

    // Local Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('');
    const [deliveryFilter, setDeliveryFilter] = useState('');
    const [dateRange, setDateRange] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [syncingTracking, setSyncingTracking] = useState(false);
    const itemsPerPage = 10;

    useEffect(() => {
        // Fetch with server-side pagination and filtering
        dispatch(fetchAdminOrders({
            page: currentPage,
            limit: itemsPerPage,
            search: searchTerm,
            status: deliveryFilter || undefined
        }));
    }, [dispatch, currentPage, searchTerm, deliveryFilter]);

    const handleStatusUpdate = (id, status) => {
        dispatch(updateOrderStatus({ id, status }));
    };

    const handleSyncAllTracking = async () => {
        setSyncingTracking(true);
        try {
            const response = await axiosInstance.post(`${BASE_URL}/shiprocket/sync-all-tracking`);
            if (response.data.success) {
                toast.success(`Synced ${response.data.data.synced} orders successfully`);
                // Refresh data
                dispatch(fetchAdminOrders({
                    page: currentPage,
                    limit: itemsPerPage,
                    search: searchTerm,
                    status: deliveryFilter || undefined
                })); // Refresh
            }
        } catch (error) {
            console.error('Failed to sync tracking:', error);
            toast.error('Failed to sync tracking data');
        } finally {
            setSyncingTracking(false);
        }
    };

    // Calculate Stats
    // Note: Stats relying on 'orders' will only reflect the *current page* of orders.
    // For accurate global stats, we'd need a separate API call or return statsMetadata from backend.
    // Keeping this partial view for now as per immediate request scope.
    const stats = useMemo(() => {
        if (!orders) return { completed: 0, pending: 0, canceled: 0, new: 0 };
        return {
            completed: orders.filter(o => o.status === 'Delivered').length,
            pending: orders.filter(o => o.status === 'Pending').length,
            canceled: orders.filter(o => o.status === 'Cancelled').length,
            new: orders.filter(o => ['Confirmed', 'Processing'].includes(o.status)).length,
        };
    }, [orders]);


    const getStatusBadge = (status) => {
        const styles = {
            Pending: 'bg-yellow-100 text-yellow-700',
            Confirmed: 'bg-indigo-100 text-indigo-700',
            Processing: 'bg-indigo-50 text-indigo-600',
            Shipped: 'bg-blue-100 text-blue-700',
            Delivered: 'bg-green-100 text-green-700',
            Cancelled: 'bg-red-100 text-red-700',
            Refunded: 'bg-gray-100 text-gray-700',
        };
        return (
            <span className={`px-3 py-1 rounded-sm text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        );
    };

    const getPaymentBadge = (status) => {
        const dotColors = {
            Paid: 'bg-emerald-500',
            Pending: 'bg-amber-500',
            Failed: 'bg-red-500',
            Refunded: 'bg-gray-500'
        };
        const textColors = {
            Paid: 'text-emerald-700',
            Pending: 'text-amber-700',
            Failed: 'text-red-700',
            Refunded: 'text-gray-700'
        };
        const statusKey = status || 'Pending';

        return (
            <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${dotColors[statusKey] || 'bg-gray-400'}`}></span>
                <span className={`font-medium text-sm ${textColors[statusKey] || 'text-gray-600'}`}>
                    {statusKey}
                </span>
            </div>
        );
    };

    const getPaymentIcon = (method) => {
        // Simple heuristic for icons
        const m = (method || '').toLowerCase();
        if (m.includes('card') || m.includes('visa') || m.includes('master')) return <RiVisaLine size={24} className="text-blue-600" />;
        if (m.includes('paypal')) return <RiPaypalLine size={24} className="text-blue-800" />;
        if (m.includes('wallet')) return <RiWallet3Line size={24} className="text-purple-600" />;
        return <MdAttachMoney size={24} className="text-green-600" />; // Cash/COD
    };

    const columns = [
        {
            header: 'Order ID',
            accessor: 'orderId',
            sortable: true,
            render: (row) => <span className="font-bold text-gray-700">#{row.orderId}</span>
        },
        {
            header: 'Date',
            accessor: 'createdAt',
            sortable: true,
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-medium text-gray-800">{new Date(row.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span className="text-xs text-gray-400">{new Date(row.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            )
        },
        {
            header: 'Customer',
            accessor: 'user',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold overflow-hidden">
                        {row.user?.avatar ? <img src={row.user.avatar} alt="" className="w-full h-full object-cover" /> : (row.user?.firstName?.[0] || 'U')}
                    </div>
                    <div>
                        <div className="font-semibold text-gray-900">{row.user?.firstName} {row.user?.lastName}</div>
                        <div className="text-xs text-gray-400">{row.user?.email}</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Amount',
            accessor: 'grandTotal',
            sortable: true,
            render: (row) => <span className="font-semibold text-gray-700">₹{row.grandTotal?.toFixed(2)}</span>
        },
        {
            header: 'Payment Status',
            accessor: 'paymentStatus',
            render: (row) => getPaymentBadge(row.paymentStatus)
        },
        {
            header: 'Order Status',
            accessor: 'status',
            render: (row) => getStatusBadge(row.status)
        },
        {
            header: 'Payment Method',
            accessor: 'paymentMethod',
            render: (row) => (
                <div className="flex items-center gap-2">
                    {/* {getPaymentIcon(row.paymentMethod)} */}
                    <span className="text-sm text-gray-600">{row.paymentMethod}</span>
                </div>
            )
        },
        {
            header: 'Tracking Info',
            accessor: 'trackingInfo',
            render: (row) => {
                if (row.status === 'Processing' || row.status === 'Shipped') {
                    return (
                        <div className="flex flex-col gap-1">
                            {row.trackingNumber ? (
                                <div className="flex items-center gap-1 text-xs">
                                    <FiTruck className="w-3 h-3 text-blue-600" />
                                    <span className="font-mono text-gray-600">{row.trackingNumber}</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1 text-xs">
                                    <FiTruck className="w-3 h-3 text-gray-400" />
                                    <span className="text-gray-400">Pending</span>
                                </div>
                            )}
                            {row.currentLocation && (
                                <div className="flex items-center gap-1 text-xs">
                                    <FiMapPin className="w-3 h-3 text-green-600" />
                                    <span className="text-gray-600 truncate max-w-24" title={row.currentLocation}>
                                        {row.currentLocation}
                                    </span>
                                </div>
                            )}
                            {row.carrier && (
                                <div className="text-xs text-gray-500">{row.carrier}</div>
                            )}
                        </div>
                    );
                }
                return <span className="text-xs text-gray-400">-</span>;
            }
        },
        {
            header: 'Actions',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate(`/admin/orders/${row._id}`)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                        title="View"
                    >
                        <MdVisibility size={18} />
                    </button>
                    {/* <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Edit">
                        <MdEdit size={18} />
                    </button> */}
                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Delete">
                        <MdDelete size={18} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-8 p-6">
            <Breadcrumbs
                title="Orders"
                items={[
                    { label: 'Dashboard', to: '/admin/dashboard' },
                    { label: 'Orders' },
                ]}
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard title="Completed Orders" count={`${stats.completed}`} icon={MdCheckCircle} colorClass="bg-emerald-500 text-white" />
                <StatsCard title="Pending Orders" count={`${stats.pending}`} icon={MdHourglassEmpty} colorClass="bg-amber-500 text-white" />
                <StatsCard title="Canceled Orders" count={`${stats.canceled}`} icon={MdCancel} colorClass="bg-rose-500 text-white" />
                <StatsCard title="New Orders" count={`${stats.new}`} icon={MdRefresh} colorClass="bg-blue-500 text-white" />
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                {/* Header with Sync Button */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800">All Orders</h2>
                    <button
                        onClick={handleSyncAllTracking}
                        disabled={syncingTracking}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-all disabled:opacity-50"
                    >
                        <MdSync className={`w-4 h-4 ${syncingTracking ? 'animate-spin' : ''}`} />
                        <span>{syncingTracking ? 'Syncing...' : 'Sync Tracking'}</span>
                    </button>
                </div>

                {/* Table */}
                <DataTable
                    columns={columns}
                    data={orders || []} // Use server-side data directly
                    pagination={{
                        current: currentPage,
                        total: total || 0,
                        totalPages: Math.ceil((total || 0) / itemsPerPage),
                        start: (currentPage - 1) * itemsPerPage + 1,
                        end: Math.min(currentPage * itemsPerPage, total || 0)
                    }}
                    onPageChange={setCurrentPage}
                    searchProps={{
                        placeholder: 'Search Order...',
                        value: searchTerm,
                        onChange: (val) => { setSearchTerm(val); setCurrentPage(1); }
                    }}
                    selection={true}
                />
            </div>
        </div>
    );
};

export default Orders;
