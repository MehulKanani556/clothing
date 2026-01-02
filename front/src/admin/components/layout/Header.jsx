import React from 'react';
import { MdMenu, MdNotifications, MdLogout } from 'react-icons/md';

const Header = () => {
    return (
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shadow-sm">
            <button className="text-gray-500 hover:text-gray-700 md:hidden">
                <MdMenu size={24} />
            </button>

            <div className="flex-1"></div>

            <div className="flex items-center gap-4">
                <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <MdNotifications size={24} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <div className="h-8 w-px bg-gray-200"></div>
                <button className="flex items-center gap-2 text-red-500 hover:text-red-700 font-medium transition-colors">
                    <MdLogout size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </header>
    );
};

export default Header;
