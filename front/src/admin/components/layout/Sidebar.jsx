import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    MdDashboard,
    MdShoppingCart,
    MdPeople,
    MdInventory,
    MdAssignmentReturn,
    MdLocalOffer,
    MdPayment,
    MdAssessment,
    MdGavel,
    MdStraighten,
    MdRssFeed,
    MdSupportAgent
} from 'react-icons/md';

const Sidebar = () => {
    const menuItems = [
        { path: '/admin/dashboard', name: 'Dashboard', icon: <MdDashboard /> },
        { path: '/admin/users', name: 'Users', icon: <MdPeople /> },
        { path: '/admin/products', name: 'Listings', icon: <MdInventory /> },
        // { path: '/admin/orders', name: 'Orders', icon: <MdShoppingCart /> },
        // { path: '/admin/returns', name: 'Returns', icon: <MdAssignmentReturn /> },
        // { path: '/admin/offer-zone', name: 'Offer Zone', icon: <MdLocalOffer /> },
        // { path: '/admin/payments', name: 'Payments', icon: <MdPayment /> },
        // { path: '/admin/reports', name: 'GST Reports', icon: <MdAssessment /> },
        // { path: '/admin/pricing-rules', name: 'Pricing Rules', icon: <MdGavel /> },
        // { path: '/admin/size-charts', name: 'Size Charts', icon: <MdStraighten /> },
        // { path: '/admin/blogs', name: 'Blogs', icon: <MdRssFeed /> },
        // { path: '/admin/support', name: 'Support', icon: <MdSupportAgent /> },
    ];

    return (
        <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col shadow-lg border-r border-gray-800">
            <div className="h-16 flex items-center justify-center border-b border-gray-800">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                    SellerPanel
                </h1>
            </div>

            <nav className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-1">
                    {menuItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center px-6 py-3 transition-colors duration-200
                                    ${isActive
                                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-r-4 border-pink-500'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }`
                                }
                            >
                                <span className="text-xl mr-3">{item.icon}</span>
                                <span className="font-medium">{item.name}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="p-4 border-t border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-lg font-bold">
                        A
                    </div>
                    <div>
                        <p className="font-medium">Admin User</p>
                        <p className="text-xs text-gray-500">Seller</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
