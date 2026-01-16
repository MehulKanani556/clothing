import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    MdOutlineDashboard,
    MdOutlineInventory,
    MdKeyboardArrowRight,
    MdOutlineCategory,
    MdOutlineReceiptLong,
    MdOutlineRateReview,
    MdOutlineLocalOffer,
    MdOutlinePreview,
    MdOutlineSettings,
} from 'react-icons/md';
import { PiFlagBanner } from "react-icons/pi";
import { LuFile } from 'react-icons/lu';

const Sidebar = ({ isCollapsed, isMobileOpen, setIsMobileOpen }) => {
    const location = useLocation();
    const [expandedMenus, setExpandedMenus] = useState([]);

    const toggleMenu = (key) => {
        if (isCollapsed) return; // Don't toggle in collapsed mode
        setExpandedMenus((prev) =>
            prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
        );
    };

    // Close mobile sidebar on route change
    React.useEffect(() => {
        if (window.innerWidth < 1024 && isMobileOpen) {
            setIsMobileOpen(false);
        }
    }, [location.pathname]);

    const menuData = [
        {
            type: 'item',
            key: 'dashboard',
            name: 'Dashboards',
            path: '/admin/dashboard',
            icon: <MdOutlineDashboard size={20} />,
        },
        {
            type: 'item',
            key: 'home-preview',
            name: 'Home Preview',
            path: '/admin/home-preview',
            icon: <MdOutlinePreview size={20} />,
        },
        {
            type: 'submenu',
            key: 'banners',
            name: 'Banners',
            icon: <PiFlagBanner size={20} />,
            children: [
                { name: 'Hero Banner', path: '/admin/hero-banner' },
                { name: 'Offer Banner', path: '/admin/offer-banner' },
            ]
        },
        // { type: 'item', key: 'categories', name: 'Categories', path: '/admin/categories', icon: <MdOutlineCategory size={20} /> },
        // { type: 'item', key: 'subcategories', name: 'Subcategories', path: '/admin/subcategories', icon: <MdOutlineClass size={20} /> },
        {
            type: 'submenu',
            key: 'categories',
            name: 'Categories',
            icon: <MdOutlineCategory size={20} />,
            children: [
                { name: 'Main Categories', path: '/admin/main-categories' },
                { name: 'Categories', path: '/admin/categories' },
                { name: 'Subcategories', path: '/admin/subcategories' },
            ]
        },
        {
            type: 'submenu',
            key: 'products',
            name: 'Products',
            icon: <MdOutlineInventory size={20} />,
            children: [
                { name: 'Listing', path: '/admin/products' },
                { name: 'Add Product', path: '/admin/add-product' },
            ]
        },
        {
            type: 'item',
            key: 'orders',
            name: 'Orders',
            path: '/admin/orders',
            icon: <MdOutlineReceiptLong size={20} />,

        },
        {
            type: 'item',
            key: 'reviews',
            name: 'Reviews',
            path: '/admin/reviews',
            icon: <MdOutlineRateReview size={20} />,
        },
        {
            type: 'submenu',
            key: 'offers',
            name: 'Offer-Zone',
            icon: <MdOutlineLocalOffer size={20} />,
            children: [
                { name: 'Offers', path: '/admin/offers' },
                { name: 'Add Offer', path: '/admin/add-offer' },
            ]
        },
        {
            type: 'submenu',
            key: 'settings',
            name: 'Settings',
            icon: <MdOutlineSettings size={20} />,
            children: [
                { name: 'Pick Up Address', path: '/admin/settings' },
                { name: 'Maintenance', path: '/admin/maintenance' },
            ]
        },
        {
            type: 'submenu',
            key: 'page-management',
            name: 'Page Management',
            icon: <LuFile size={20} />,
            children: [
                { name: 'Privacy Policy', path: '/admin/privacy-policy' },
                { name: 'Terms & Conditions', path: '/admin/terms-conditions' },
                { name: 'Refund & Return Policy', path: '/admin/refund-return-policy' },
                { name: 'Shipping Policy', path: '/admin/shipping-policy' },
            ]
        },
    ];

    const isActive = (path) => location.pathname === path;
    const isSubMenuActive = (children) => children.some(child => location.pathname === child.path);

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <div className={`fixed lg:sticky top-0 h-screen bg-white text-gray-700 flex flex-col shadow-xl font-sans text-sm transition-all duration-300 border-r border-gray-100 z-40
                ${isCollapsed ? 'lg:w-[70px]' : 'lg:w-64'}
                ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Logo Section */}
                <div className={`h-[70px] flex items-center ${isCollapsed ? 'justify-center' : 'px-6'} border-b border-gray-100 sticky top-0 bg-white z-10 transition-all duration-300`}>
                    <div className="flex items-center gap-2 text-gray-900">
                        <div className="w-8 h-8 bg-black rounded flex items-center justify-center font-bold text-lg text-white shrink-0">
                            V
                        </div>
                        {!isCollapsed && (
                            <span className="text-xl font-bold tracking-wide transition-opacity duration-300">Velora</span>
                        )}
                    </div>
                </div>

                {/* Menu Items */}
                <nav className={`flex-1 py-4 custom-scrollbar ${isCollapsed ? 'overflow-visible' : 'overflow-y-auto overflow-x-hidden'}`}>
                    <ul className="space-y-1">
                        {menuData.map((item, index) => {
                            if (item.type === 'header') {
                                if (isCollapsed) return null; // Hide headers when collapsed
                                return (
                                    <li key={index} className="px-6 py-3 mt-2 text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                                        {item.label}
                                    </li>
                                );
                            }

                            if (item.type === 'submenu') {
                                const isExpanded = expandedMenus.includes(item.key) && !isCollapsed;
                                const active = isSubMenuActive(item.children);

                                return (
                                    <li key={item.key} className="relative group">
                                        {/* Base Button (Visible when not hovering in collapsed mode, or always in expanded) */}
                                        <button
                                            onClick={() => toggleMenu(item.key)}
                                            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-6'} py-2.5 transition-colors duration-200 
                                            ${active || isExpanded ? 'text-black font-semibold bg-gray-50' : 'hover:text-black hover:bg-gray-50'}
                                            ${isCollapsed ? 'group-hover:opacity-0' : ''}`} // Hide base on hover when collapsed to let overlay take over
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={`${active ? 'text-black' : 'text-gray-500'}`}>{item.icon}</span>
                                                {!isCollapsed && <span>{item.name}</span>}
                                            </div>
                                            {!isCollapsed && (
                                                <span className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                                                    <MdKeyboardArrowRight size={16} />
                                                </span>
                                            )}
                                        </button>

                                        {/* Collapsed Hover Overlay (The "Mega Menu" Card) */}
                                        {isCollapsed && (
                                            <div className="absolute left-0 top-0 opacity-0 invisible group-hover:opacity-100 shadow-[4px_0_24px_rgba(0,0,0,0.08)] group-hover:visible transition-all duration-200 z-50">
                                                {/* 1. The Header Part (extends directly from sidebar) */}
                                                <div className="w-52 bg-white flex items-center h-[44px] relative z-20">
                                                    <div className="w-[70px] flex items-center justify-center shrink-0 text-black">
                                                        {item.icon}
                                                    </div>
                                                    <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">
                                                        {item.name}
                                                    </span>
                                                </div>

                                                {/* 2. The Children Part (Drops down and indented) */}
                                                <div className="absolute top-[44px] left-[70px] w-[138px] bg-white py-2 z-10 border-t border-gray-200">
                                                    <ul className="space-y-1">
                                                        {item.children.map((child) => (
                                                            <li key={child.path}>
                                                                <NavLink
                                                                    to={child.path}
                                                                    className={({ isActive }) =>
                                                                        `flex items-center justify-between px-4 py-2 text-sm transition-colors duration-200 ${isActive
                                                                            ? 'text-black font-semibold bg-gray-50'
                                                                            : 'text-gray-500 hover:text-black hover:bg-gray-50'
                                                                        }`
                                                                    }
                                                                >
                                                                    {child.name}
                                                                </NavLink>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}

                                        {/* Expanded Submenu (Standard Accordion) */}
                                        {!isCollapsed && (
                                            <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-screen mb-2' : 'max-h-0'}`}>
                                                <ul className="pl-14 space-y-1">
                                                    {item.children.map((child) => (
                                                        <li key={child.path}>
                                                            <NavLink
                                                                to={child.path}
                                                                className={({ isActive }) =>
                                                                    `block py-1.5 transition-colors duration-200 ${isActive ? 'text-black font-semibold border-r-4 border-black' : 'hover:text-black'}`
                                                                }
                                                            >
                                                                {child.name}
                                                            </NavLink>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </li>
                                );
                            }

                            // Regular Item (Link)
                            return (
                                <li key={item.key} className="relative group">
                                    {/* Base Link */}
                                    <NavLink
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-6'} py-2.5 transition-colors duration-200
                                        ${isActive
                                                ? `text-black font-semibold bg-gray-50 ${!isCollapsed ? 'border-r-4 border-black' : ''}`
                                                : 'hover:text-black hover:bg-gray-50'
                                            }
                                        ${isCollapsed ? 'group-hover:opacity-0' : ''}`
                                        }
                                        title={isCollapsed ? item.name : ''}
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* Icon color changes when active */}
                                            <span className={isActive(item.path) ? 'text-black' : 'text-gray-500'}>{item.icon}</span>
                                            {!isCollapsed && <span className={isActive(item.path) ? 'text-black' : ''}>{item.name}</span>}
                                        </div>
                                        {item.badge && !isCollapsed && (
                                            <span className={`${item.badge.color} text-white text-[10px] font-bold px-1.5 py-0.5 rounded`}>
                                                {item.badge.text}
                                            </span>
                                        )}
                                    </NavLink>

                                    {isCollapsed && (
                                        <NavLink
                                            to={item.path}
                                            className={({ isActive }) =>
                                                `absolute left-0 top-0 w-52 bg-white shadow-[4px_0_24px_rgba(0,0,0,0.08)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex items-center h-full overflow-hidden
                                                ${isActive ? 'bg-gray-50' : ''}`
                                            }
                                        >
                                            <div className={`w-[70px] flex items-center justify-center shrink-0 ${isActive(item.path) ? 'text-black' : 'text-gray-500'}`}>
                                                {item.icon}
                                            </div>
                                            <span className={`font-semibold text-sm whitespace-nowrap ${isActive(item.path) ? 'text-black' : 'text-gray-900'}`}>
                                                {item.name}
                                            </span>
                                            {item.badge && (
                                                <span className={`${item.badge.color} text-white text-[10px] font-bold px-1.5 py-0.5 rounded ml-auto mr-4`}>
                                                    {item.badge.text}
                                                </span>
                                            )}
                                        </NavLink>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Optional User Profile at Bottom (not in image description but good practice) */}
                {/* Removed to match image precisely which ends with items generally */}
            </div>
        </>
    );
};

export default Sidebar;
