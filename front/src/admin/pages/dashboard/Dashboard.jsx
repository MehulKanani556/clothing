import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats } from '../../../redux/slice/adminDashboardSlice';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { MdAttachMoney, MdShoppingBag, MdRefresh, MdLocalOffer } from 'react-icons/md';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
            <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        </div>
        <div className={`p-4 rounded-full ${color} text-white text-xl`}>
            {icon}
        </div>
    </div>
);

const Dashboard = () => {
    const dispatch = useDispatch();
    const { stats, loading } = useSelector(state => state.adminDashboard);

    useEffect(() => {
        dispatch(fetchDashboardStats());
    }, [dispatch]);

    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];

    // Sales Trends (Area Chart Equivalent)
    const salesData = {
        labels,
        datasets: [
            {
                label: 'Sales (UV)',
                data: [4000, 3000, 2000, 2780, 1890],
                borderColor: '#8884d8',
                backgroundColor: 'rgba(136, 132, 216, 0.5)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const salesOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: false,
            },
        },
        maintainAspectRatio: false,
    };

    // Revenue vs Returns (Line Chart)
    const revenueReturnsData = {
        labels,
        datasets: [
            {
                label: 'Revenue (PV)',
                data: [2400, 1398, 9800, 3908, 4800],
                borderColor: '#82ca9d',
                backgroundColor: 'rgba(130, 202, 157, 0.5)',
                tension: 0.3,
            },
            {
                label: 'Returns (UV)',
                data: [4000, 3000, 2000, 2780, 1890],
                borderColor: '#ff7300',
                backgroundColor: 'rgba(255, 115, 0, 0.5)',
                tension: 0.3,
            },
        ],
    };

    const revenueOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: false,
            },
        },
        maintainAspectRatio: false,
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                    Download Report
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`₹${stats?.gstStats?.summary?.totalRevenue || 0}`}
                    icon={<MdAttachMoney />}
                    color="bg-green-500"
                />
                <StatCard
                    title="GST Collected"
                    value={`₹${stats?.gstStats?.summary?.totalTax || 0}`}
                    icon={<MdShoppingBag />}
                    color="bg-purple-500"
                />
                <StatCard
                    title="Total Orders"
                    value={stats?.gstStats?.summary?.count || 0}
                    icon={<MdRefresh />}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Net Payout"
                    value={`₹${stats?.payoutStats?.netPayout || 0}`}
                    icon={<MdLocalOffer />}
                    color="bg-orange-500"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Sales Trends</h3>
                    <div className="h-80 w-full">
                        <Line options={salesOptions} data={salesData} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Revenue vs Returns</h3>
                    <div className="h-80 w-full">
                        <Line options={revenueOptions} data={revenueReturnsData} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
