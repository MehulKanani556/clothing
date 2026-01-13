import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, Navigate } from 'react-router-dom';
import { MdWarning } from 'react-icons/md';
import { fetchSettings } from '../redux/slice/settings.slice';
import MaintenancePage from '../pages/MaintenancePage';

const MaintenanceWrapper = ({ children }) => {
    const dispatch = useDispatch();
    const location = useLocation();
    const { settings, loading } = useSelector(state => state.settings);
    const { user, isAuthenticated } = useSelector(state => state.auth);

    useEffect(() => {
        dispatch(fetchSettings());
    }, [dispatch]);

    // Don't show maintenance mode while loading settings
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Find maintenance mode setting
    const maintenanceSetting = settings?.find(s => s.key === 'maintenance_mode');
    const isMaintenanceActive = maintenanceSetting?.value?.isActive || false;

    // If maintenance mode is not active, render children normally
    // But redirect away from maintenance page if someone tries to access it directly
    if (!isMaintenanceActive) {
        if (location.pathname === '/maintenance') {
            return <Navigate to="/" replace />;
        }
        return children;
    }

    // Check if user is admin
    const isAdmin = isAuthenticated && user?.role === 'admin';
    console.log(isAdmin,user);

    // If user is admin, show admin notice and allow access to everything
    if (isAdmin) {
        return (
            <>
                {/* Admin Notice Banner */}
                <div className="bg-orange-50 border-b border-orange-200 px-4 py-3">
                    <div className="flex items-center justify-center">
                        <MdWarning className="w-5 h-5 text-orange-600 mr-2" />
                        <p className="text-sm font-medium text-orange-800">
                            <span className="font-semibold">Admin Access:</span> Maintenance mode is active. Regular users cannot access the website.
                        </p>
                    </div>
                </div>
                {children}
            </>
        );
    }

    // If on admin routes and not admin, redirect to maintenance
    if (location.pathname.startsWith('/admin')) {
        return <Navigate to="/maintenance" replace />;
    }

    // If on maintenance route, show maintenance page
    if (location.pathname === '/maintenance') {
        return <MaintenancePage />;
    }

    // For all other routes when maintenance is active and user is not admin,
    // redirect to maintenance page
    return <Navigate to="/maintenance" replace />;
};

export default MaintenanceWrapper;