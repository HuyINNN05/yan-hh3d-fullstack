const db = require('../config/db');

/**
 * Lấy tất cả tập phim của một bộ phim
 * @param {number} movie_id
 */
const findByMovieId = async (movie_id) => {
    const sql = `SELECT * FROM episodes WHERE movie_id = ? ORDER BY episode_number ASC`;
    const [rows] = await db.query(sql, [movie_id]);
    return rows;
};

/**
 * Lấy một tập phim cụ thể
 * @param {number} id
 */
const findById = async (id) => {
    const sql = `SELECT * FROM episodes WHERE id = ?`;
    const [rows] = await db.query(sql, [id]);
    return rows[0] || null;
};

/**
 * Tạo tập phim mới
 * @param {Object} episodeData
 */
const create = async ({ movie_id, episode_number, title, duration, video_url, server_type = 'Thuyết Minh', is_end = 0 }) => {
    const sql = `
        INSERT INTO episodes (movie_id, episode_number, title, duration, video_url, server_type, is_end)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [
        movie_id, 
        episode_number, 
        title || null, 
        duration || null, 
        video_url || null, 
        server_type, 
        is_end
    ]);
    return result.insertId;
};

/**
 * Cập nhật tập phim
 * @param {number} id
 * @param {Object} episodeData
 */
const update = async (id, { episode_number, title, duration, video_url, server_type, is_end }) => {
    const sql = `
        UPDATE episodes
        SET episode_number = ?, title = ?, duration = ?, video_url = ?, server_type = ?, is_end = ?
        WHERE id = ?
    `;
    const [result] = await db.query(sql, [
        episode_number, 
        title, 
        duration, 
        video_url, 
        server_type, 
        is_end, 
        id
    ]);
    return result.affectedRows;
};

/**
 * Xoá tập phim
 * @param {number} id
 */
const remove = async (id) => {
    const sql = 'DELETE FROM episodes WHERE id = ?';
    const [result] = await db.query(sql, [id]);
    return result.affectedRows;
};

/**
 * Xoá tất cả tập của một bộ phim
 * @param {number} movie_id
 */
const removeByMovieId = async (movie_id) => {
    const sql = 'DELETE FROM episodes WHERE movie_id = ?';
    const [result] = await db.query(sql, [movie_id]);
    return result.affectedRows;
};

module.exports = {
    findByMovieId,
    findById,
    create,
    update,
    remove,
    removeByMovieId
};
