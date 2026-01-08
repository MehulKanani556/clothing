import React, { useState, useMemo } from 'react';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight, MdSearch, MdViewList, MdGridView } from 'react-icons/md';
import { LuArrowUp, LuArrowDown } from 'react-icons/lu';
import { BiSort } from 'react-icons/bi';

const DataTable = ({ columns, data, pagination, onPageChange, selection = true, searchProps, actions, selectedIds = [], onSelectionChange, grid = false, viewMode = 'list', onViewChange, renderGridItem, filters }) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedData = useMemo(() => {
        if (!sortConfig.key) return data;
        return [...data].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
            if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [data, sortConfig]);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = sortedData.map(row => row._id || row.id);
            onSelectionChange && onSelectionChange(allIds);
        } else {
            onSelectionChange && onSelectionChange([]);
        }
    };

    const handleSelectRow = (id) => {
        if (!onSelectionChange) return;
        if (selectedIds.includes(id)) {
            onSelectionChange(selectedIds.filter(itemId => itemId !== id));
        } else {
            onSelectionChange([...selectedIds, id]);
        }
    };

    const allSelected = sortedData.length > 0 && sortedData.every(row => selectedIds.includes(row._id || row.id));

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Toolbar */}
            {(searchProps || actions || grid) && (
                <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-100">
                    {/* Search */}
                    <div className="relative w-full md:w-64">
                        {searchProps && viewMode !== 'grid' && (
                            <>
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                    <MdSearch size={20} />
                                </span>
                                <input
                                    type="text"
                                    placeholder={searchProps.placeholder || "Search..."}
                                    value={searchProps.value || ''}
                                    onChange={(e) => searchProps.onChange && searchProps.onChange(e.target.value)}
                                    className="w-full py-2 pl-10 pr-4 text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                                />
                            </>
                        )}
                    </div>

                    {/* Right Side: Actions & View Toggle */}
                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                        {/* View Toggle */}
                        {grid && (
                            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200">
                                <button
                                    onClick={() => onViewChange && onViewChange('list')}
                                    className={`p-1.5 rounded-md transition-all duration-200 flex items-center justify-center ${viewMode === 'list'
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                                        }`}
                                    title="List View"
                                >
                                    <MdViewList size={20} />
                                </button>
                                <button
                                    onClick={() => onViewChange && onViewChange('grid')}
                                    className={`p-1.5 rounded-md transition-all duration-200 flex items-center justify-center ${viewMode === 'grid'
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                                        }`}
                                    title="Grid View"
                                >
                                    <MdGridView size={20} />
                                </button>
                            </div>
                        )}

                        {/* Actions */}
                        {actions && (
                            <div className="flex items-center gap-3">
                                {actions}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Content: Grid or Table */}
            {viewMode === 'grid' && renderGridItem ? (
                <div className="flex flex-col md:flex-row gap-6 p-6">
                    {/* Filters Sidebar */}
                    {filters && (
                        <div className="w-full md:w-64 flex-shrink-0">
                            {filters}
                        </div>
                    )}

                    {/* Grid Content */}
                    <div className="flex-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {sortedData.map((row, index) => (
                                <div key={row._id || row.id || index} className="h-full">
                                    {renderGridItem(row)}
                                </div>
                            ))}
                        </div>
                        {sortedData.length === 0 && (
                            <div className="text-center py-10 text-gray-500">No products found.</div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold border-b border-gray-100">
                                {selection && (
                                    <th className="p-4 w-4">
                                        <input
                                            type="checkbox"
                                            className={`rounded border-gray-300 text-black focus:ring-black accent-black`}
                                            checked={allSelected}
                                            onChange={handleSelectAll}
                                        />
                                    </th>
                                )}
                                {columns.map((col, index) => {
                                    const isAsc = sortConfig.key === col.accessor && sortConfig.direction === 'asc';
                                    const isDesc = sortConfig.key === col.accessor && sortConfig.direction === 'desc';

                                    return (
                                        <th
                                            key={index}
                                            className={`p-4 cursor-pointer hover:text-black group ${!col.sortable ? 'cursor-default' : ''}`}
                                            onClick={() => col.sortable && handleSort(col.accessor)}
                                        >
                                            <div className="flex items-center gap-1">
                                                {col.header}
                                                {col.sortable && (
                                                    <span className="inline-block ml-1">
                                                        {isAsc ? (
                                                            <LuArrowUp className="text-sm text-gray-600" />
                                                        ) : isDesc ? (
                                                            <LuArrowDown className="text-sm text-gray-600" />
                                                        ) : (
                                                            <BiSort className="text-sm text-[#cccaca] group-hover:text-gray-500" />
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
                            {sortedData.map((row, rowIndex) => {
                                const isSelected = selectedIds.includes(row._id || row.id);
                                return (
                                    <tr
                                        key={row._id || row.id || rowIndex}
                                        className={`transition-colors border-b border-gray-50 last:border-none ${isSelected ? 'bg-[#fffbf0]' : 'hover:bg-gray-50'}`}
                                    >
                                        {selection && (
                                            <td className="p-4">
                                                <input
                                                    type="checkbox"
                                                    className={`rounded border-gray-300 text-black focus:ring-black ${isSelected ? 'accent-black' : ''}`}
                                                    checked={isSelected}
                                                    onChange={() => handleSelectRow(row._id || row.id)}
                                                />
                                            </td>
                                        )}
                                        {columns.map((col, colIndex) => (
                                            <td key={colIndex} className="p-4">
                                                {col.render ? col.render(row) : (row[col.accessor] || '-')}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {pagination && (
                <div className="p-4 flex flex-col sm:flex-row justify-between items-center border-t border-gray-100 text-sm text-gray-600 gap-4">
                    <div>
                        Showing {pagination.start} to {pagination.end} of {pagination.total} entries
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-black transition-colors disabled:opacity-50"
                            onClick={() => onPageChange(pagination.current - 1)}
                            disabled={pagination.current === 1}
                        >
                            <MdKeyboardArrowLeft size={16} />
                        </button>

                        {/* Simple Logic for pagination numbers - active is black */}
                        {[...Array(pagination.totalPages)].map((_, i) => {
                            const page = i + 1;
                            const isActive = page === pagination.current;
                            return (
                                <button
                                    key={page}
                                    onClick={() => onPageChange(page)}
                                    className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${isActive
                                        ? 'bg-black text-white shadow-sm'
                                        : 'border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-black'
                                        }`}
                                >
                                    {page}
                                </button>
                            );
                        })}

                        <button
                            className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-black transition-colors disabled:opacity-50"
                            onClick={() => onPageChange(pagination.current + 1)}
                            disabled={pagination.current === pagination.totalPages}
                        >
                            <MdKeyboardArrowRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataTable;
