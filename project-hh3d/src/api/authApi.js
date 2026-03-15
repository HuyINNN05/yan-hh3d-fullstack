import axiosInstance from './axiosInstance';

/**
 * Đăng ký tài khoản
 * @param {Object} data - { username, email, password }
 */
export const register = (data) =>
    axiosInstance.post('/register', data);

/**
 * Đăng nhập
 * @param {Object} data - { email, password }
 */
export const login = (data) =>
    axiosInstance.post('/login', data);

/**
 * Lấy thông tin user hiện tại (cần token)
 */
export const getMe = () =>
    axiosInstance.get('/auth/me');
