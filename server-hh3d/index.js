const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors()); // Giúp React gọi được API
app.use(express.json());

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'yanhh3d_db'
});

// API lấy toàn bộ phim kèm thể loại
app.get('/api/movies', (req, res) => {
    const sql = `
        SELECT movies.*, categories.name AS category_name, categories.color_class 
        FROM movies 
        LEFT JOIN categories ON movies.category_id = categories.id
    `;
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.json(data);
    });
});

// Chạy server tại cổng 5000
app.listen(5000, () => {
    console.log("Server HH3D đang chạy tại http://localhost:5000");
});