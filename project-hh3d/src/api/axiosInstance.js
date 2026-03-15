import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';
const BASE_URL = `${API_URL}/api`;

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: tự động gắn JWT token vào header
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: tự động logout nếu token hết hạn (401) hoặc không hợp lệ (403)
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            // Token hết hạn hoặc không hợp lệ → xóa token và redirect login
            console.warn('Token không hợp lệ hoặc hết hạn');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('liked_movies');
            
            // Redirect to login page if not already there
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        
        // Log error for debugging
        console.error('API Error:', {
            status: error.response?.status,
            message: error.response?.data?.message || error.message,
            path: error.config?.url
        });
        
        return Promise.reject(error);
    }
);

export default axiosInstance;

