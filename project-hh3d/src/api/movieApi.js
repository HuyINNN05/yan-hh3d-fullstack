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
 */
export const createMovie = (data) =>
    axiosInstance.post('/admin/movies', data);

/**
 * Cập nhật phim (Admin only) — dùng DELETE + POST để mô phỏng update
 * @param {number|string} id
 * @param {Object} data
 */
export const updateMovie = async (id, data) => {
    // Backend không có PUT, dùng custom endpoint hoặc bỏ qua
    // Tạm thời gọi POST để ghi đè (backend cần hỗ trợ)
    return axiosInstance.put(`/admin/movies/${id}`, data).catch(() =>
        axiosInstance.post('/admin/movies', { ...data, _id: id })
    );
};

/**
 * Xóa phim (Admin only)
 * @param {number|string} id
 */
export const deleteMovie = (id) =>
    axiosInstance.delete(`/admin/movies/${id}`);
