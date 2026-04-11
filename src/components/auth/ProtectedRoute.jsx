import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthGuard from '../../hooks/useAuthGuard';
import FullScreenLoader from './FullScreenLoader';

const ProtectedRoute = ({ children }) => {
    const { user, loading, location } = useAuthGuard();

    if (loading) {
        return <FullScreenLoader />;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
