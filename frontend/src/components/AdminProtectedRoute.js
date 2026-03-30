import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminProtectedRoute = ({ children }) => {
    const isAdminAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';

    if (!isAdminAuthenticated) {
        return <Navigate to="/admin-login" replace />;
    }

    return children;
};

export default AdminProtectedRoute;
