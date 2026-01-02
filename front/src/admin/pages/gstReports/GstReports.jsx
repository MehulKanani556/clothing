import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGstReport } from '../../../redux/slice/report.slice';
import { MdDownload, MdFilterList } from 'react-icons/md';

const GstReports = () => {
    const dispatch = useDispatch();
    const { gstReport: reportData, loading } = useSelector(state => state.reports);
    const [filters, setFilters] = useState({ startDate: '', endDate: '' });

    useEffect(() => {
        dispatch(fetchGstReport(filters));
    }, [dispatch]); // Initial load

    const handleFilter = () => {
        dispatch(fetchGstReport(filters));
    };

    const downloadCSV = () => {
        if (!reportData?.details) return;

        const headers = ['Invoice No', 'Date', 'Customer', 'Taxable Value', 'CGST', 'SGST', 'Total Tax', 'Grand Total'];
        const rows = reportData.details.map(order => [
            order.orderId,
            new Date(order.createdAt).toLocaleDateString(),
            order.user, // Ideally populate name
            order.subTotal,
            order.cgstTotal,
            order.sgstTotal,
            order.taxTotal,
            order.grandTotal
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "gst_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">GSTR-1 Reports</h2>
                <div className="flex gap-2">
                    <input
                        type="date"
                        className="border rounded px-3 py-2 text-sm"
                        onChange={e => setFilters({ ...filters, startDate: e.target.value })}
                    />
                    <input
                        type="date"
                        className="border rounded px-3 py-2 text-sm"
                        onChange={e => setFilters({ ...filters, endDate: e.target.value })}
                    />
                    <button onClick={handleFilter} className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 flex items-center gap-2">
                        <MdFilterList /> Filter
                    </button>
                    <button onClick={downloadCSV} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2">
                        <MdDownload /> Export CSV
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase font-bold">Total Taxable Value</p>
                    <p className="text-xl font-bold mt-1">₹{reportData?.summary?.totalTaxableValue?.toFixed(2) || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase font-bold">Total CGST</p>
                    <p className="text-xl font-bold mt-1 text-blue-600">₹{reportData?.summary?.totalCGST?.toFixed(2) || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase font-bold">Total SGST</p>
                    <p className="text-xl font-bold mt-1 text-purple-600">₹{reportData?.summary?.totalSGST?.toFixed(2) || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase font-bold">Total Sales (Inc Tax)</p>
                    <p className="text-xl font-bold mt-1 text-green-600">₹{reportData?.summary?.totalRevenue?.toFixed(2) || 0}</p>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 font-medium text-gray-500">Invoice No</th>
                            <th className="px-6 py-3 font-medium text-gray-500">Date</th>
                            <th className="px-6 py-3 font-medium text-gray-500 text-right">Taxable Value</th>
                            <th className="px-6 py-3 font-medium text-gray-500 text-right">CGST</th>
                            <th className="px-6 py-3 font-medium text-gray-500 text-right">SGST</th>
                            <th className="px-6 py-3 font-medium text-gray-500 text-right">Total Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="6" className="text-center p-4">Loading...</td></tr>
                        ) : reportData?.details?.map((order) => (
                            <tr key={order._id} className="hover:bg-gray-50">
                                <td className="px-6 py-3 text-indigo-600 font-medium">{order.orderId}</td>
                                <td className="px-6 py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-3 text-right">₹{order.subTotal}</td>
                                <td className="px-6 py-3 text-right">₹{order.cgstTotal}</td>
                                <td className="px-6 py-3 text-right">₹{order.sgstTotal}</td>
                                <td className="px-6 py-3 text-right font-bold">₹{order.grandTotal}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GstReports;
