const express = require('express');
const router = express.Router();

const episodeController = require('../controllers/episodeController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// ── Public routes ──────────────────────────────────────────────────────────
// GET /api/episodes/:movieId - Lấy tất cả tập của một bộ phim
router.get('/:movieId', episodeController.getEpisodesByMovie);

// GET /api/episodes/detail/:id - Lấy chi tiết một tập
router.get('/detail/:id', episodeController.getEpisodeById);

// ── Protected routes (cần token + quyền Admin) ────────────────────────────
// POST /api/admin/episodes - Tạo tập phim mới
router.post(
    '/',
    authMiddleware,
    adminMiddleware,
    episodeController.createEpisode
);

// PUT /api/admin/episodes/:id - Cập nhật tập phim
router.put(
    '/:id',
    authMiddleware,
    adminMiddleware,
    episodeController.updateEpisode
);

// DELETE /api/admin/episodes/:id - Xoá tập phim
router.delete(
    '/:id',
    authMiddleware,
    adminMiddleware,
    episodeController.deleteEpisode
);

module.exports = router;
