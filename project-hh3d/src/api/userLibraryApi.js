import axiosInstance from './axiosInstance';

/* ────────────────────────────────────────── FAVORITES ────────────────────────────────────────── */

/**
 * Lấy danh sách phim yêu thích của user (từ MySQL backend)
 */
export const getFavorites = async () => {
    try {
        const response = await axiosInstance.get('/users/me/favorites');
        const payload = response?.data;
        if (Array.isArray(payload)) return payload;
        if (Array.isArray(payload?.data)) return payload.data;
        return [];
    } catch (error) {
        console.error('Lỗi lấy danh sách yêu thích:', error);
        return [];
    }
};

/**
 * Thêm phim vào danh sách yêu thích
 */
export const addFavorite = async (movieId) => {
    try {
        const response = await axiosInstance.post('/users/me/favorites', { movieId });
        return response.data;
    } catch (error) {
        console.error('Lỗi thêm yêu thích:', error);
        throw error;
    }
};

/**
 * Xóa phim khỏi danh sách yêu thích
 */
export const removeFavorite = async (movieId) => {
    try {
        const response = await axiosInstance.delete(`/users/me/favorites/${movieId}`);
        return response.data;
    } catch (error) {
        console.error('Lỗi xóa yêu thích:', error);
        throw error;
    }
};

/**
 * Kiểm tra phim có là yêu thích của user không
 */
export const isFavorited = async (movieId, favorites) => {
    if (!favorites) return false;
    return favorites.some(movie => movie.id === movieId);
};

/* ────────────────────────────────────────── WATCH HISTORY ────────────────────────────────────────── */

/**
 * Lấy lịch sử xem của user (từ MySQL backend)
 */
export const getWatchHistory = async () => {
    try {
        const response = await axiosInstance.get('/users/me/history');
        const payload = response?.data;
        if (Array.isArray(payload)) return payload;
        if (Array.isArray(payload?.data)) return payload.data;
        return [];
    } catch (error) {
        console.error('Lỗi lấy lịch sử xem:', error);
        return [];
    }
};

/**
 * Thêm phim vào lịch sử xem (hoặc update nếu đã tồn tại)
 */
export const addToWatchHistory = async (movieId, episodeId = null) => {
    try {
        const response = await axiosInstance.post('/users/me/history', {
            movieId,
            episodeId
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi thêm lịch sử xem:', error);
        throw error;
    }
};

/**
 * Xóa phim khỏi lịch sử xem
 */
export const removeFromWatchHistory = async (movieId) => {
    try {
        const response = await axiosInstance.delete(`/users/me/history/${movieId}`);
        return response.data;
    } catch (error) {
        console.error('Lỗi xóa lịch sử xem:', error);
        throw error;
    }
};

/* ────────────────────────────────────────── FALLBACK UTILITIES ────────────────────────────────────────── */

/**
 * Fallback: Sử dụng localStorage khi user chưa đăng nhập
 * Các phương thức dưới đây là local-only alternatives
 */

export const getLocalFavorites = () => {
    try {
        return JSON.parse(localStorage.getItem('favorite_movies')) || [];
    } catch {
        return [];
    }
};

export const setLocalFavorites = (favorites) => {
    localStorage.setItem('favorite_movies', JSON.stringify(favorites));
};

export const getLocalWatchHistory = () => {
    try {
        return JSON.parse(localStorage.getItem('viewing_history')) || [];
    } catch {
        return [];
    }
};

export const setLocalWatchHistory = (history) => {
    localStorage.setItem('viewing_history', JSON.stringify(history));
};

export const clearLocalLibrary = () => {
    localStorage.removeItem('favorite_movies');
    localStorage.removeItem('viewing_history');
};
