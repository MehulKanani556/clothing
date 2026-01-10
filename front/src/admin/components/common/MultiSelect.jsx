import React, { useState, useRef, useEffect } from 'react';
import { MdKeyboardArrowDown, MdClose, MdSearch, MdCheck } from 'react-icons/md';

const MultiSelect = ({ value = [], options = [], onChange, className = "", placeholder = "Select...", disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = (optionValue) => {
        if (value.includes(optionValue)) {
            onChange(value.filter(v => v !== optionValue));
        } else {
            onChange([...value, optionValue]);
        }
    };

    const handleRemove = (e, optionValue) => {
        e.stopPropagation();
        onChange(value.filter(v => v !== optionValue));
    };

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedLabels = value.map(v => options.find(o => o.value === v)?.label).filter(Boolean);

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full min-h-[42px] bg-white border border-gray-300 rounded-md px-3 py-1 flex items-center justify-between shadow-sm cursor-pointer transition-colors duration-200
                    ${disabled
                        ? 'bg-gray-100 cursor-not-allowed border-gray-200'
                        : 'hover:border-black'
                    } ${isOpen ? 'ring-1 ring-black border-black' : ''}`}
            >
                <div className="flex flex-wrap gap-1.5 flex-1 p-0.5">
                    {selectedLabels.length === 0 && (
                        <span className="text-gray-400 text-sm py-1">{placeholder}</span>
                    )}
                    {selectedLabels.map((label, index) => (
                        <span key={index} className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-md flex items-center gap-1">
                            {label}
                            <button
                                type="button"
                                onClick={(e) => handleRemove(e, value[index])}
                                className="text-gray-500 hover:text-red-500 rounded-full p-0.5 hover:bg-gray-200 transition-colors"
                            >
                                <MdClose size={12} />
                            </button>
                        </span>
                    ))}
                </div>
                <div className="flex items-center pl-2 border-l border-gray-100 ml-1">
                    <MdKeyboardArrowDown size={20} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 border-b border-gray-100 bg-gray-50">
                        <div className="relative">
                            <MdSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search..."
                                autoFocus
                                className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 transition-colors bg-white"
                            />
                        </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => {
                                const isSelected = value.includes(option.value);
                                return (
                                    <button
                                        type="button"
                                        key={option.value}
                                        onClick={() => handleToggle(option.value)}
                                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between mb-0.5
                                            ${isSelected
                                                ? 'bg-black text-white hover:bg-gray-900'
                                                : 'text-gray-700 hover:bg-gray-100'
                                            }
                                        `}
                                    >
                                        <span className="truncate">{option.label}</span>
                                        {isSelected && <MdCheck size={16} />}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="px-4 py-8 text-center text-gray-500 text-sm flex flex-col items-center">
                                <MdSearch size={24} className="mb-2 opacity-20" />
                                <p>No options found</p>
                            </div>
                        )}
                    </div>

                    {filteredOptions.length > 0 && (
                        <div className="px-2 py-1.5 border-t border-gray-100 bg-gray-50 text-xs text-gray-400 text-right">
                            {value.length} selected
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MultiSelect;
