import axiosInstance from './axiosInstance';

/**
 * Đăng ký tài khoản
 * @param {Object} data - { email, password }
 */
export const register = (data) =>
    axiosInstance.post('/auth/register', data);

/**
 * Đăng nhập
 * @param {Object} data - { email, password }
 */
export const login = (data) =>
    axiosInstance.post('/auth/login', data);

/**
 * Lấy thông tin user hiện tại (cần token)
 */
export const getMe = () =>
    axiosInstance.get('/auth/me');
