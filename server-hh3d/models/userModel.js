const db = require('../config/db');

/**
 * Tìm user theo email
 * @param {string} email
 */
const findByEmail = async (email) => {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await db.query(sql, [email]);
    return rows[0] || null;
};

/**
 * Tìm user theo ID
 * @param {number} id
 */
const findById = async (id) => {
    const sql = 'SELECT id, email, role, created_at FROM users WHERE id = ?';
    const [rows] = await db.query(sql, [id]);
    return rows[0] || null;
};

/**
 * Tạo user mới
 * @param {string} email
 * @param {string} hashedPassword - Mật khẩu đã được hash bởi bcrypt
 * @param {string} role - 'user' hoặc 'admin'
 * @param {string} username - Tên người dùng (tự sinh từ email nếu không truyền)
 */
const create = async (email, hashedPassword, role = 'user', username = null) => {
    // Tự sinh username từ phần trước @ + random suffix để tránh trùng
    const base  = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
    const uname = username || `${base}_${Math.floor(Math.random() * 90000 + 10000)}`;
    const sql = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
    const [result] = await db.query(sql, [uname, email, hashedPassword, role]);
    return result.insertId;
};

module.exports = { findByEmail, findById, create };
