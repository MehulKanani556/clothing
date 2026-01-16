import React, { useState, useRef, useEffect } from 'react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    isValid,
    parseISO,
    setMonth,
    setYear,
    getYear,
    getMonth
} from 'date-fns';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight, MdCalendarToday, MdClose } from 'react-icons/md';
import CustomSelect from './CustomSelect';

const CustomDatePicker = ({
    value,
    onChange,
    placeholder = "Select Date",
    minDate,
    maxDate,
    className = "",
    error,
    position = "bottom", // "bottom" | "top"
    showMonthYearDropdowns = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const containerRef = useRef(null);

    // Initialize current month from value if available
    useEffect(() => {
        if (value) {
            const date = typeof value === 'string' ? parseISO(value) : value;
            if (isValid(date)) {
                setCurrentMonth(date);
            }
        }
    }, [isOpen, value]);

    // Handle Click Outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDateClick = (day) => {
        // Validation for min/max
        if (minDate && day < new Date(minDate).setHours(0, 0, 0, 0)) return;
        if (maxDate && day > new Date(maxDate).setHours(23, 59, 59, 999)) return;

        onChange(day);
        setIsOpen(false);
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const handleMonthSelect = (val) => {
        setCurrentMonth(setMonth(currentMonth, val));
    };

    const handleYearSelect = (val) => {
        setCurrentMonth(setYear(currentMonth, val));
    };

    // Calendar Grid Generation
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);

    // Determine start and end years for the dropdown
    const startYear = minDate ? getYear(new Date(minDate)) : 1900;
    const endYear = maxDate ? getYear(new Date(maxDate)) : 2100;
    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => endYear - i); // Descending order
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const monthOptions = months.map((m, i) => ({ value: i, label: m }));
    const yearOptions = years.map(y => ({ value: y, label: y.toString() }));

    const calendarDays = eachDayOfInterval({
        start: startOfWeek(monthStart, { weekStartsOn: 1 }),
        end: endOfWeek(monthEnd, { weekStartsOn: 1 })
    });

    const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

    // Formatting value for display
    const displayValue = value ? format(typeof value === 'string' ? parseISO(value) : value, 'dd-MM-yyyy') : '';

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {/* Input Field Trigger */}
            <div
                className={`flex items-center justify-between w-full px-4 py-2 border rounded-md cursor-pointer bg-white transition-colors duration-200 
                ${error ? 'border-red-500' : 'border-gray-300 hover:border-black'} 
                ${isOpen ? 'ring-1 ring-black border-black' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={`text-sm ${value ? 'text-gray-900' : 'text-gray-400'}`}>
                    {displayValue || placeholder}
                </span>
                <div className="flex items-center gap-2">
                    {value && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onChange(''); }}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <MdClose size={16} />
                        </button>
                    )}
                    <MdCalendarToday className="text-gray-400" size={18} />
                </div>
            </div>

            {/* Popup */}
            {isOpen && (
                <div className={`absolute z-50 bg-white rounded-lg shadow-xl border border-gray-100 w-[300px] p-4 animate-in fade-in zoom-in-95 duration-100 left-0 ${position === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
                    {/* Header with Selectors */}
                    <div className="flex items-center justify-between mb-4 gap-2">
                        {showMonthYearDropdowns ? (
                            <div className="flex items-center gap-2 flex-1">
                                <CustomSelect
                                    value={getMonth(currentMonth)}
                                    options={monthOptions}
                                    onChange={handleMonthSelect}
                                    className="w-[120px]"
                                    placeholder="Month"
                                />
                                <CustomSelect
                                    value={getYear(currentMonth)}
                                    options={yearOptions}
                                    onChange={handleYearSelect}
                                    className="w-[85px]"
                                    placeholder="Year"
                                />
                            </div>
                        ) : (
                            <span className="font-bold text-gray-800 text-sm">
                                {format(currentMonth, 'MMMM, yyyy')}
                            </span>
                        )}

                        <div className="flex gap-1 shrink-0">
                            <button onClick={prevMonth} type="button" className="p-1 hover:bg-gray-100 rounded-full text-gray-600">
                                <MdKeyboardArrowLeft size={20} />
                            </button>
                            <button onClick={nextMonth} type="button" className="p-1 hover:bg-gray-100 rounded-full text-gray-600">
                                <MdKeyboardArrowRight size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Week Days */}
                    <div className="grid grid-cols-7 mb-2">
                        {weekDays.map(day => (
                            <div key={day} className="text-center text-xs font-semibold text-gray-500 py-1">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, idx) => {
                            const isSelected = value && isSameDay(day, typeof value === 'string' ? parseISO(value) : value);
                            const isCurrentMonth = isSameMonth(day, monthStart);
                            const isDateToday = isToday(day);

                            // Disabled Check
                            let isDisabled = false;
                            if (minDate && day < new Date(minDate).setHours(0, 0, 0, 0)) isDisabled = true;
                            if (maxDate && day > new Date(maxDate).setHours(23, 59, 59, 999)) isDisabled = true;

                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    disabled={isDisabled}
                                    onClick={() => !isDisabled && handleDateClick(day)}
                                    className={`
                                        h-8 w-8 rounded-full flex items-center justify-center text-xs transition-all
                                        ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                                        ${isSelected ? 'bg-black text-white font-bold shadow-md' : 'hover:bg-gray-100'}
                                        ${isDateToday && !isSelected ? 'border border-black font-semibold' : ''}
                                        ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}
                                    `}
                                >
                                    {format(day, 'd')}
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange('');
                                setIsOpen(false);
                            }}
                            className="text-xs text-blue-500 font-medium hover:underline"
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            onClick={() => handleDateClick(new Date())}
                            className="text-xs text-blue-500 font-medium hover:underline"
                        >
                            Today
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomDatePicker;
