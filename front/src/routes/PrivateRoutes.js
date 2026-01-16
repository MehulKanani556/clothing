
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoutes = () => {
    const { isAuthenticated } = useSelector((state) => state.auth);

    // If not authenticated, redirect to home (or could trigger login modal if we had a mechanism)
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default PrivateRoutes;
