const MovieModel = require('../models/movieModel');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * GET /api/movies
 * Lấy danh sách phim - hỗ trợ ?search= ?genre= ?sort=
 */
const getAllMovies = async (req, res, next) => {
    try {
        const { search, category_id, sort } = req.query;
        const movies = await MovieModel.findAll({ search, category_id, sort });
        return successResponse(res, 200, 'Lấy danh sách phim thành công', movies);
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/movies/:id
 * Lấy chi tiết một phim theo ID, đồng thời tăng lượt xem
 */
const getMovieById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const movie = await MovieModel.findById(id);

        if (!movie) {
            return errorResponse(res, 404, `Không tìm thấy phim với ID: ${id}`);
        }

        // Tăng lượt xem async (không ảnh hưởng tốc độ response)
        MovieModel.incrementViews(id).catch(console.error);

        return successResponse(res, 200, 'Lấy chi tiết phim thành công', movie);
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/movies
 * Tạo phim mới - chỉ Admin
 */
const createMovie = async (req, res, next) => {
    try {
        const { title, description, image, video_url, category_id, quality, status, episode_display, show_schedule, total_episodes } = req.body;

        if (!title) {
            return errorResponse(res, 400, 'Thiếu dữ liệu bắt buộc: title');
        }

        const newId = await MovieModel.create({ title, description, image, video_url, category_id, quality, status, episode_display, show_schedule, total_episodes });
        const newMovie = await MovieModel.findById(newId);

        return successResponse(res, 201, 'Thêm phim thành công', newMovie);
    } catch (err) {
        next(err);
    }
};

/**
 * PUT /api/movies/:id
 * Cập nhật phim theo ID - chỉ Admin
 */
const updateMovie = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, image, video_url, category_id, quality, status, episode_display, show_schedule, total_episodes } = req.body;

        // Kiểm tra phim tồn tại
        const existing = await MovieModel.findById(id);
        if (!existing) {
            return errorResponse(res, 404, `Không tìm thấy phim với ID: ${id}`);
        }

        // Giữ nguyên giá trị cũ nếu không truyền lên
        await MovieModel.update(id, {
            title:            title            ?? existing.title,
            description:      description      ?? existing.description,
            image:            image            ?? existing.image,
            video_url:        video_url        ?? existing.video_url,
            category_id:      category_id      ?? existing.category_id,
            quality:          quality          ?? existing.quality,
            status:           status           ?? existing.status,
            episode_display:  episode_display  ?? existing.episode_display,
            show_schedule:    show_schedule    ?? existing.show_schedule,
            total_episodes:   total_episodes   ?? existing.total_episodes,
        });

        const updatedMovie = await MovieModel.findById(id);
        return successResponse(res, 200, 'Cập nhật phim thành công', updatedMovie);
    } catch (err) {
        next(err);
    }
};

/**
 * DELETE /api/movies/:id
 * Xoá phim theo ID - chỉ Admin
 */
const deleteMovie = async (req, res, next) => {
    try {
        const { id } = req.params;

        const existing = await MovieModel.findById(id);
        if (!existing) {
            return errorResponse(res, 404, `Không tìm thấy phim với ID: ${id}`);
        }

        await MovieModel.remove(id);
        return successResponse(res, 200, `Đã xoá phim "${existing.title}" thành công`);
    } catch (err) {
        next(err);
    }
};

module.exports = { getAllMovies, getMovieById, createMovie, updateMovie, deleteMovie };
