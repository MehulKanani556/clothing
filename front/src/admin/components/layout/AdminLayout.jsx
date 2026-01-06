import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const AdminLayout = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    return (
        <div className="flex h-screen bg-[#fafbfe] overflow-hidden font-sans text-[#6c757d]">
            <Sidebar isCollapsed={isSidebarCollapsed} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header toggleSidebar={toggleSidebar} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto relative">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
