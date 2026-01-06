
import React, { useState, useEffect, useRef } from 'react';
import {
    MdMenu,
    MdNotifications,
    MdFullscreen,
    MdKeyboardArrowDown,
    MdPerson,
    MdSettings,
    MdSupportAgent,
    MdLock,
    MdLogout
} from 'react-icons/md';

const Header = ({ toggleSidebar }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="h-[70px] bg-white text-gray-700 flex items-center justify-between px-6 shadow-sm sticky top-0 z-20 border-b border-gray-100">
            {/* Left Section */}
            <div className="flex items-center gap-6">
                <button
                    onClick={toggleSidebar}
                    className="text-gray-500 hover:text-black transition-colors"
                >
                    <MdMenu size={24} />
                </button>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4 text-gray-500">
                <button className="relative hover:text-black transition-colors">
                    <MdNotifications size={22} />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                        5
                    </span>
                </button>

                <button className="hover:text-black transition-colors hidden sm:block">
                    <MdFullscreen size={24} />
                </button>

                {/* User Profile */}
                <div className="relative" ref={dropdownRef}>
                    <div
                        className="flex items-center gap-3 cursor-pointer pl-4 hover:text-black transition-colors border-l border-gray-100"
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                    >
                        <img
                            src="https://i.pravatar.cc/150?img=32"
                            alt="User"
                            className="w-8 h-8 rounded-full border border-gray-200"
                        />
                        <div className="hidden md:flex items-center gap-1">
                            <span className="text-sm font-medium text-gray-700">Geneva</span>
                            <MdKeyboardArrowDown size={16} className={`transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                        </div>
                    </div>

                    {/* Dropdown Menu */}
                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-100 z-50 animate-fade-in-down">
                            <div className="px-4 py-3 border-b border-gray-100">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Welcome back 👋!</p>
                            </div>

                            <div className="py-1">
                                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors">
                                    <MdPerson size={16} />
                                    <span>Profile</span>
                                </button>
                                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors">
                                    <MdNotifications size={16} />
                                    <span>Notifications</span>
                                </button>
                                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors">
                                    <MdSettings size={16} />
                                    <span>Account Settings</span>
                                </button>
                                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors">
                                    <MdSupportAgent size={16} />
                                    <span>Support Center</span>
                                </button>
                            </div>

                            <div className="border-t border-gray-100 py-1">
                                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors">
                                    <MdLock size={16} />
                                    <span>Lock Screen</span>
                                </button>
                                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-gray-50 hover:text-red-700 transition-colors">
                                    <MdLogout size={16} />
                                    <span>Log Out</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;

