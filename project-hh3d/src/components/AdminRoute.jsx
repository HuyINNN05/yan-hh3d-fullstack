import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * AdminRoute: chỉ cho phép user có role = 'admin' truy cập
 * Nếu chưa đăng nhập → /login | Đã đăng nhập nhưng không phải admin → /
 */
const AdminRoute = ({ children }) => {
    const { user, isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user)    return <Navigate to="/login" replace />;
    if (!isAdmin) return <Navigate to="/" replace />;

    return children;
};

export default AdminRoute;
