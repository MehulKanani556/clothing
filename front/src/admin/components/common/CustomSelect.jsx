import React, { useState, useRef, useEffect } from 'react';
import { MdKeyboardArrowDown } from 'react-icons/md';

const CustomSelect = ({ value, options, onChange, className = "w-32", placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white border border-gray-200 text-gray-700 text-sm rounded-md px-3 py-2 flex items-center justify-between shadow-sm hover:border-gray-400 hover:text-black transition-all duration-200"
            >
                <span className={`truncate mr-2 ${selectedOption ? 'font-medium' : 'text-gray-400'}`}>
                    {selectedOption?.label || placeholder || value}
                </span>
                <MdKeyboardArrowDown size={18} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-black' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-100 rounded-md shadow-lg z-50 py-1 max-h-60 overflow-auto animate-fade-in-down">
                    {options.map((option) => (
                        <button
                            type="button"
                            key={option.value}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between
                                ${option.value === value ? 'bg-gray-50 text-black font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-black'}
                            `}
                        >
                            <span>{option.label}</span>
                            {option.value === value && <span className="w-1.5 h-1.5 rounded-full bg-black"></span>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
