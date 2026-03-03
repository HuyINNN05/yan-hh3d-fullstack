const mysql = require('mysql2');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

// Tạo connection pool dùng promise để hỗ trợ async/await
const pool = mysql.createPool({
    host:     process.env.DB_HOST     || 'localhost',
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'yanhh3d_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Bọc pool bằng promise để dùng async/await
const promisePool = pool.promise();

module.exports = promisePool;
