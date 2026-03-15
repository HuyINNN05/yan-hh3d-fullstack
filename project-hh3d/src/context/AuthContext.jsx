import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authApi from '../api/authApi';

// Tạo context
const AuthContext = createContext(null);

/**
 * AuthProvider: bao bọc toàn bộ app, cung cấp trạng thái đăng nhập
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser]       = useState(null);   // { id, email, role }
    const [token, setToken]     = useState(null);
    const [loading, setLoading] = useState(true);   // đang khôi phục session

    // Khôi phục session từ localStorage khi app khởi động
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try { setUser(JSON.parse(savedUser)); } catch {}
        }
        setLoading(false);
    }, []);

    /**
     * Đăng nhập: gọi API, lưu user vào state và localStorage
     */
    const login = async (email, password) => {
        const res = await authApi.login({ email, password });
        // Backend returns { message, user } — no JWT token
        const newUser = res.data?.user || res.data?.data?.user;
        if (!newUser) throw new Error(res.data?.message || 'Đăng nhập thất bại');
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        return newUser;
    };

    /**
     * Đăng ký
     */
    const register = async (email, password) => {
        const res = await authApi.register({ email, password });
        return res.data;
    };

    /**
     * Đăng xuất
     */
    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const isAdmin = user?.role === 'admin';

    return (
        <AuthContext.Provider value={{ user, token, loading, isAdmin, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Hook tiện ích để dùng AuthContext
 */
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth phải dùng bên trong AuthProvider');
    return ctx;
};
