const episodeModel = require('../models/episodeModel');
const movieModel = require('../models/movieModel');

/**
 * GET /api/episodes/:movieId - Lấy tất cả tập phim của một bộ phim
 */
const getEpisodesByMovie = async (req, res) => {
    try {
        const { movieId } = req.params;
        const episodes = await episodeModel.findByMovieId(movieId);
        res.json(episodes);
    } catch (err) {
        console.error('Lỗi lấy episodes:', err);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

/**
 * GET /api/episodes/detail/:id - Lấy chi tiết một tập phim
 */
const getEpisodeById = async (req, res) => {
    try {
        const { id } = req.params;
        const episode = await episodeModel.findById(id);
        if (!episode) {
            return res.status(404).json({ message: 'Không tìm thấy tập phim' });
        }
        res.json(episode);
    } catch (err) {
        console.error('Lỗi lấy episode:', err);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

/**
 * POST /api/admin/episodes - Tạo tập phim mới
 */
const createEpisode = async (req, res) => {
    try {
        const { movie_id, episode_number, title, duration, video_url, server_type, is_end } = req.body;

        if (!movie_id || !episode_number || !video_url) {
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc (movie_id, episode_number, video_url)' });
        }

        // Kiểm tra bộ phim có tồn tại
        const movie = await movieModel.findById(movie_id);
        if (!movie) {
            return res.status(404).json({ message: 'Không tìm thấy bộ phim' });
        }

        // Kiểm tra số tập không vượt quá total_episodes
        if (episode_number > movie.total_episodes) {
            return res.status(400).json({ 
                message: `Tập ${episode_number} vượt quá tổng số tập (${movie.total_episodes})` 
            });
        }

        const episodeId = await episodeModel.create({
            movie_id,
            episode_number,
            title,
            duration,
            video_url,
            server_type: server_type || 'Thuyết Minh',
            is_end: is_end ? 1 : 0
        });

        res.status(201).json({ 
            message: 'Tập phim đã được tạo thành công',
            id: episodeId 
        });
    } catch (err) {
        console.error('Lỗi tạo episode:', err);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

/**
 * PUT /api/admin/episodes/:id - Cập nhật tập phim
 */
const updateEpisode = async (req, res) => {
    try {
        const { id } = req.params;
        const { episode_number, title, duration, video_url, server_type, is_end } = req.body;

        const episode = await episodeModel.findById(id);
        if (!episode) {
            return res.status(404).json({ message: 'Không tìm thấy tập phim' });
        }

        const affected = await episodeModel.update(id, {
            episode_number,
            title,
            duration,
            video_url,
            server_type,
            is_end
        });

        res.json({ 
            message: 'Tập phim đã được cập nhật',
            affected 
        });
    } catch (err) {
        console.error('Lỗi cập nhật episode:', err);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

/**
 * DELETE /api/admin/episodes/:id - Xoá tập phim
 */
const deleteEpisode = async (req, res) => {
    try {
        const { id } = req.params;

        const episode = await episodeModel.findById(id);
        if (!episode) {
            return res.status(404).json({ message: 'Không tìm thấy tập phim' });
        }

        const affected = await episodeModel.remove(id);
        res.json({ 
            message: 'Tập phim đã được xoá',
            affected 
        });
    } catch (err) {
        console.error('Lỗi xoá episode:', err);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

module.exports = {
    getEpisodesByMovie,
    getEpisodeById,
    createEpisode,
    updateEpisode,
    deleteEpisode
};
