const db = require('../config/db');

/**
 * Lấy danh sách phim với hỗ trợ search, filter genre, sort theo views
 * @param {string} search - Tìm theo title
 * @param {string} genre  - Lọc theo thể loại
 * @param {string} sort   - Sắp xếp (views | created_at)
 */
const findAll = async ({ search = '', category_id = '', sort = '' } = {}) => {
    let sql = `SELECT m.*, c.name AS category_name
               FROM movies m
               LEFT JOIN categories c ON m.category_id = c.id
               WHERE 1=1`;
    const params = [];

    if (search) {
        sql += ' AND m.title LIKE ?';
        params.push(`%${search}%`);
    }

    if (category_id) {
        sql += ' AND m.category_id = ?';
        params.push(category_id);
    }

    const allowedSort = ['views', 'created_at', 'title'];
    if (sort && allowedSort.includes(sort)) {
        sql += ` ORDER BY m.${sort} DESC`;
    } else {
        sql += ' ORDER BY m.created_at DESC';
    }

    const [rows] = await db.query(sql, params);
    return rows;
};

/**
 * Tìm phim theo ID
 * @param {number} id
 */
const findById = async (id) => {
    const sql = `SELECT m.*, c.name AS category_name
                 FROM movies m
                 LEFT JOIN categories c ON m.category_id = c.id
                 WHERE m.id = ?`;
    const [rows] = await db.query(sql, [id]);
    return rows[0] || null;
};

/**
 * Tạo phim mới
 * @param {Object} movieData
 */
const create = async ({ title, description, image, video_url, category_id, quality, status, episode_display, show_schedule }) => {
    const sql = `
        INSERT INTO movies (title, description, image, video_url, category_id, quality, status, episode_display, show_schedule)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [
        title, description || null, image || null, video_url || null,
        category_id || null, quality || null, status || null,
        episode_display || null, show_schedule || null
    ]);
    return result.insertId;
};

/**
 * Cập nhật phim theo ID
 * @param {number} id
 * @param {Object} movieData
 */
const update = async (id, { title, description, image, video_url, category_id, quality, status, episode_display, show_schedule }) => {
    const sql = `
        UPDATE movies
        SET title = ?, description = ?, image = ?, video_url = ?,
            category_id = ?, quality = ?, status = ?, episode_display = ?, show_schedule = ?
        WHERE id = ?
    `;
    const [result] = await db.query(sql, [
        title, description, image, video_url,
        category_id, quality, status, episode_display, show_schedule, id
    ]);
    return result.affectedRows;
};

/**
 * Xoá phim theo ID
 * @param {number} id
 */
const remove = async (id) => {
    const sql = 'DELETE FROM movies WHERE id = ?';
    const [result] = await db.query(sql, [id]);
    return result.affectedRows;
};

/**
 * Tăng lượt xem của phim
 * @param {number} id
 */
const incrementViews = async (id) => {
    const sql = 'UPDATE movies SET views = views + 1 WHERE id = ?';
    await db.query(sql, [id]);
};

module.exports = { findAll, findById, create, update, remove, incrementViews };
