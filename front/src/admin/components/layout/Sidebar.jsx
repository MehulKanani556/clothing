import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    MdDashboard,
    MdShoppingCart,
    MdInventory,
    MdKeyboardArrowRight,
    MdEmail,
} from 'react-icons/md';

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
            icon: <MdDashboard size={20} />,
            // badge: { text: '02', color: 'bg-green-500' }
        },
        { type: 'item', key: 'categories', name: 'Categories', path: '/admin/categories', icon: <MdInventory size={20} /> },
        {
            type: 'submenu',
            key: 'products',
            name: 'Products',
            icon: <MdShoppingCart size={20} />,
            children: [
                { name: 'Listing', path: '/admin/products' }, // Was 'Listings'
                { name: 'Products Grid', path: '/admin/products-grid' },
                { name: 'Product Details', path: '/admin/product-details' },
                { name: 'Add Product', path: '/admin/add-product' },
            ]
        },
        {
            type: 'submenu',
            key: 'orders',
            name: 'Orders',
            icon: <MdShoppingCart size={20} />,
            children: [
                { name: 'Orders', path: '/admin/orders' },
                { name: 'Order Details', path: '/admin/order-details' },
            ]
        },
        {
            type: 'item',
            key: 'reviews',
            name: 'Reviews',
            path: '/admin/reviews',
            icon: <MdEmail size={20} />,
            // badge: { text: 'New', color: 'bg-red-500' }
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
                            L
                        </div>
                        {!isCollapsed && (
                            <span className="text-xl font-bold tracking-wide transition-opacity duration-300">LOGO</span>
                        )}
                    </div>
                </div>

                {/* Menu Items */}
                <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar overflow-x-hidden">
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
                                        <button
                                            onClick={() => toggleMenu(item.key)}
                                            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-6'} py-2.5 transition-colors duration-200 
                                            ${active || isExpanded ? 'text-black font-semibold' : 'hover:text-black hover:bg-gray-50'}`}
                                            title={isCollapsed ? item.name : ''}
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

                                        {/* Submenu Children */}
                                        <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-screen mb-2' : 'max-h-0'}`}>
                                            <ul className={`${isCollapsed ? 'hidden' : 'pl-14'} space-y-1`}>
                                                {item.children.map((child) => (
                                                    <li key={child.path}>
                                                        <NavLink
                                                            to={child.path}
                                                            className={({ isActive }) =>
                                                                `block py-1.5 transition-colors duration-200 ${isActive ? 'text-black font-semibold border-r-4 border-black' : 'hover:text-black'
                                                                }`
                                                            }
                                                        >
                                                            {child.name}
                                                        </NavLink>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </li>
                                );
                            }

                            // Regular Item
                            return (
                                <li key={item.key}>
                                    <NavLink
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-6'} py-2.5 transition-colors duration-200
                                        ${isActive
                                                ? `text-black font-semibold bg-gray-50 ${!isCollapsed ? 'border-r-4 border-black' : ''}`
                                                : 'hover:text-black hover:bg-gray-50'
                                            }`
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
