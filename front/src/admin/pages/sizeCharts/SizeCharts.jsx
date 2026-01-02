import React, { useState } from 'react';
import { MdAdd, MdStraighten } from 'react-icons/md';

// A simple builder UI for Size Charts
const SizeCharts = () => {
    const [charts, setCharts] = useState([
        { id: 1, name: 'Men T-Shirts Standard', category: 'Men Topwear', type: 'Table' }
    ]);
    const [builderMode, setBuilderMode] = useState(false);

    // Builder State
    const [columns, setColumns] = useState(['Size', 'Chest (in)', 'Length (in)', 'Shoulder (in)']);
    const [rows, setRows] = useState([
        { Size: 'S', 'Chest (in)': '38', 'Length (in)': '27', 'Shoulder (in)': '17' },
        { Size: 'M', 'Chest (in)': '40', 'Length (in)': '28', 'Shoulder (in)': '18' },
        { Size: 'L', 'Chest (in)': '42', 'Length (in)': '29', 'Shoulder (in)': '19' },
    ]);

    const handleAddColumn = () => {
        const name = prompt("Enter Measurement Name (e.g. Sleeve Length)");
        if (name) {
            setColumns([...columns, name]);
            setRows(rows.map(r => ({ ...r, [name]: '' })));
        }
    };

    const handleAddRow = () => {
        const newRow = {};
        columns.forEach(c => newRow[c] = '');
        setRows([...rows, newRow]);
    };

    const updateCell = (rowIndex, col, value) => {
        const newRows = [...rows];
        newRows[rowIndex][col] = value;
        setRows(newRows);
    };

    if (builderMode) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between mb-6">
                    <h2 className="text-xl font-bold">Create New Size Chart</h2>
                    <div className="flex gap-2">
                        <button onClick={handleAddColumn} className="px-3 py-1 border rounded hover:bg-gray-50">+ Add Measurement</button>
                        <button onClick={handleAddRow} className="px-3 py-1 border rounded hover:bg-gray-50">+ Add Size Row</button>
                        <button onClick={() => setBuilderMode(false)} className="px-4 py-2 bg-indigo-600 text-white rounded">Save Chart</button>
                    </div>
                </div>

                <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-center">
                        <thead className="bg-gray-100">
                            <tr>
                                {columns.map((col, i) => (
                                    <th key={i} className="p-3 border-r last:border-r-0 text-sm font-semibold text-gray-700">{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, rIndex) => (
                                <tr key={rIndex} className="border-t">
                                    {columns.map((col, cIndex) => (
                                        <td key={cIndex} className="p-0 border-r last:border-r-0">
                                            <input
                                                value={row[col]}
                                                onChange={(e) => updateCell(rIndex, col, e.target.value)}
                                                className="w-full p-3 text-center focus:outline-none focus:bg-blue-50"
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 bg-gray-50 p-4 rounded text-sm text-gray-500">
                    Preview: Roughly how it will look on Product Page.
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Size Charts</h2>
                <button onClick={() => setBuilderMode(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                    <MdAdd /> Create Chart
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {charts.map(chart => (
                    <div key={chart.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                                <MdStraighten size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">{chart.name}</h3>
                                <p className="text-sm text-gray-500">{chart.category}</p>
                            </div>
                        </div>
                        <div className="w-full bg-gray-100 h-24 rounded flex items-center justify-center text-xs text-gray-400">
                            Preview Grid
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SizeCharts;
