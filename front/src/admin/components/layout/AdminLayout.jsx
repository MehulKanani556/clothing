import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useSelector } from 'react-redux';
import AdminLockScreen from '../common/AdminLockScreen';

const AdminLayout = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
    const [isMobileOpen, setIsMobileOpen] = React.useState(false);
    const { isLocked } = useSelector((state) => state.auth);

    const toggleSidebar = () => {
        if (window.innerWidth < 1024) {
            setIsMobileOpen(!isMobileOpen);
        } else {
            setIsSidebarCollapsed(!isSidebarCollapsed);
        }
    };

    return (
        <div className="flex h-screen bg-[#fafbfe] overflow-hidden font-sans text-[#6c757d]">
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header toggleSidebar={toggleSidebar} />
                <main className={`flex-1 overflow-x-hidden overflow-y-auto relative ${isLocked ? 'blur-sm pointer-events-none select-none' : ''}`}>
                    {!isLocked && <Outlet />}
                </main>
            </div>
            {isLocked && <AdminLockScreen />}
        </div>
    );
};

export default AdminLayout;
