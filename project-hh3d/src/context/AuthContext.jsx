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
        const savedToken = localStorage.getItem('token');
        if (savedUser) {
            try { setUser(JSON.parse(savedUser)); } catch {}
        }
        if (savedToken) {
            setToken(savedToken);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        const handleLogoutEvent = () => {
            setToken(null);
            setUser(null);
        };

        const handleUserUpdated = (event) => {
            const nextUser = event?.detail?.user;
            if (!nextUser) return;
            setUser(nextUser);
            localStorage.setItem('user', JSON.stringify(nextUser));
        };

        window.addEventListener('auth:logout', handleLogoutEvent);
        window.addEventListener('auth:user-updated', handleUserUpdated);
        return () => {
            window.removeEventListener('auth:logout', handleLogoutEvent);
            window.removeEventListener('auth:user-updated', handleUserUpdated);
        };
    }, []);

    /**
     * Đăng nhập: gọi API, lưu user vào state và localStorage
     */
    const login = async (email, password) => {
        const res = await authApi.login({ email, password });
        const newToken = res.data?.token;
        const newUser = res.data?.user || res.data?.data?.user;
        if (!newUser) throw new Error(res.data?.message || 'Đăng nhập thất bại');

        setToken(newToken || null);
        setUser(newUser);
        if (newToken) {
            localStorage.setItem('token', newToken);
        }
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

    const refreshMe = async () => {
        const res = await authApi.getMe();
        const me = res?.data;
        if (me) {
            setUser(me);
            localStorage.setItem('user', JSON.stringify(me));
        }
        return me;
    };

    const isAdmin = user?.role === 'admin';
    const isVip = Boolean(user?.is_vip);

    return (
        <AuthContext.Provider value={{ user, token, loading, isAdmin, isVip, login, register, logout, refreshMe }}>
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
