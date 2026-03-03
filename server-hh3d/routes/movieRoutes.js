const express = require('express');
const router = express.Router();

const movieController = require('../controllers/movieController');
const authMiddleware  = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// ── Public routes (không cần token) ─────────────────────────────────────────
// GET /api/movies?search=&genre=&sort=
router.get('/', movieController.getAllMovies);

// GET /api/movies/:id
router.get('/:id', movieController.getMovieById);

// ── Protected routes (cần token + quyền Admin) ──────────────────────────────
// POST /api/movies
router.post(
    '/',
    authMiddleware,
    adminMiddleware,
    movieController.createMovie
);

// PUT /api/movies/:id
router.put(
    '/:id',
    authMiddleware,
    adminMiddleware,
    movieController.updateMovie
);

// DELETE /api/movies/:id
router.delete(
    '/:id',
    authMiddleware,
    adminMiddleware,
    movieController.deleteMovie
);

module.exports = router;
