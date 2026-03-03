import axiosInstance from './axiosInstance';

/**
 * Lấy danh sách phim với tùy chọn search, genre, sort
 * @param {Object} params - { search, genre, sort }
 */
export const fetchMovies = (params = {}) =>
    axiosInstance.get('/movies', { params });

/**
 * Lấy chi tiết một phim theo ID
 * @param {number|string} id
 */
export const fetchMovieById = (id) =>
    axiosInstance.get(`/movies/${id}`);

/**
 * Tạo phim mới (Admin only)
 * @param {Object} data - { title, description, thumbnail_url, video_url, genre }
 */
export const createMovie = (data) =>
    axiosInstance.post('/movies', data);

/**
 * Cập nhật phim (Admin only)
 * @param {number|string} id
 * @param {Object} data
 */
export const updateMovie = (id, data) =>
    axiosInstance.put(`/movies/${id}`, data);

/**
 * Xóa phim (Admin only)
 * @param {number|string} id
 */
export const deleteMovie = (id) =>
    axiosInstance.delete(`/movies/${id}`);
