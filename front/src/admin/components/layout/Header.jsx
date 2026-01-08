
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
    MdLogout,
    MdFullscreenExit
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { Transition } from '@headlessui/react';
import { useDispatch, useSelector } from 'react-redux';
import { logout, lockSession } from '../../../redux/slice/auth.slice';

const Header = ({ toggleSidebar }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const dropdownRef = useRef(null);
    const notificationRef = useRef(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    console.log(user);

    const name = user?.firstName + ' ' + user?.lastName;

    const handleLogout = () => {
        dispatch(logout());
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleFullscreenToggle = () => {
        if (!document.fullscreenElement) {
            const element = document.documentElement;
            if (element.requestFullscreen) {
                element.requestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
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
                <div className="relative" ref={notificationRef}>
                    <button className="hover:text-black transition-colors" onClick={() => setIsNotificationOpen(!isNotificationOpen)}>
                        <MdNotifications size={22} />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                            5
                        </span>
                    </button>

                    {/* Dropdown Menu */}
                    <Transition
                        show={isNotificationOpen}
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95 translate-y-2"
                        enterTo="transform opacity-100 scale-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="transform opacity-100 scale-100 translate-y-0"
                        leaveTo="transform opacity-0 scale-95 translate-y-2"
                    >
                        <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 border border-gray-100 z-50 overflow-hidden ring-1 ring-black ring-opacity-5">
                            <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Notifications</p>
                                <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-md">5 New</span>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                <div className="px-4 py-8 text-center text-gray-400 text-sm">
                                    No new notifications
                                </div>
                            </div>
                        </div>
                    </Transition>
                </div>

                <button type="button" onClick={handleFullscreenToggle} className="hover:text-black transition-colors hidden sm:block">
                    {isFullscreen ? <MdFullscreenExit size={24} /> : <MdFullscreen size={24} />}
                </button>

                {/* User Profile */}
                <div className="relative" ref={dropdownRef}>
                    <div
                        className="flex items-center gap-3 cursor-pointer pl-4 hover:text-black transition-colors border-l border-gray-100"
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                    >
                        <img
                            src={user?.photo || "https://i.pravatar.cc/150?img=32"}
                            alt={name}
                            className="w-8 h-8 rounded-full border border-gray-200"
                        />
                        <div className="hidden md:flex items-center gap-1">
                            <span className="text-sm font-medium text-gray-700">{name}</span>
                            <MdKeyboardArrowDown size={16} className={`transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                        </div>
                    </div>

                    {/* Dropdown Menu */}
                    <Transition
                        show={isProfileOpen}
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95 translate-y-2"
                        enterTo="transform opacity-100 scale-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="transform opacity-100 scale-100 translate-y-0"
                        leaveTo="transform opacity-0 scale-95 translate-y-2"
                    >
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 border border-gray-100 z-50 ring-1 ring-black ring-opacity-5">
                            <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Signed in as</p>
                                <p className="text-sm font-bold text-gray-900 truncate">{user?.email}</p>
                            </div>

                            <div className="py-2">
                                <button onClick={() => { setIsProfileOpen(false); navigate('/admin/profile'); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-black transition-colors group">
                                    <MdPerson size={18} className="text-gray-400 group-hover:text-black transition-colors" />
                                    <span>Profile</span>
                                </button>
                                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-black transition-colors group">
                                    <MdSettings size={18} className="text-gray-400 group-hover:text-black transition-colors" />
                                    <span>Account Settings</span>
                                </button>
                            </div>

                            <div className="border-t border-gray-100 py-2">
                                <button onClick={() => dispatch(lockSession())} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-black transition-colors group">
                                    <MdLock size={18} className="text-gray-400 group-hover:text-black transition-colors" />
                                    <span>Lock Screen</span>
                                </button>
                                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors group">
                                    <MdLogout size={18} className="text-red-400 group-hover:text-red-600 transition-colors" />
                                    <span>Log Out</span>
                                </button>
                            </div>
                        </div>
                    </Transition>
                </div>
            </div>
        </header>
    );
};

export default Header;

