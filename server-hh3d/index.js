const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors()); 
app.use(express.json());

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'yanhh3d_db'
});

// 1. API Lấy toàn bộ phim (Dùng cho trang Home và Anime3D)
app.get('/api/movies', (req, res) => {
    const sql = "SELECT * FROM movies ORDER BY id DESC";
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

// 2. API lấy phim theo thể loại (Dùng cho Anime2D - ID 7)
app.get('/api/movies/category/:id', (req, res) => {
    const categoryId = req.params.id;
    const sql = `
        SELECT movies.*, categories.name AS category_name 
        FROM movies 
        LEFT JOIN categories ON movies.category_id = categories.id
        WHERE movies.category_id = ?
    `;
    db.query(sql, [categoryId], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

// 3. API Lấy chi tiết 1 phim
app.get('/api/movies/:id', (req, res) => {
    const id = req.params.id;
    const sql = `
        SELECT movies.*, categories.name AS category_name 
        FROM movies 
        LEFT JOIN categories ON movies.category_id = categories.id
        WHERE movies.id = ?
    `;
    db.query(sql, [id], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length === 0) return res.status(404).json({ message: "Không tìm thấy" });
        return res.json(data[0]);
    });
});

// 4. API Lấy danh sách thể loại cho Sidebar
app.get('/api/categories', (req, res) => {
    const sql = "SELECT * FROM categories";
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

// 5. Auth APIs (Đăng nhập/Đăng ký)
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
    db.query(sql, [email, password], (err, data) => {
        if (err) return res.status(500).json({ message: "Lỗi server" });
        if (data.length > 0) {
            const { password, ...user } = data[0];
            return res.json({ message: "Thành công", user });
        }
        return res.status(401).json({ message: "Sai tài khoản" });
    });
});

app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;
    const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    db.query(sql, [username, email, password], (err) => {
        if (err) return res.status(500).json({ message: "Lỗi đăng ký" });
        return res.json({ message: "Đăng ký thành công!" });
    });
});

app.listen(5000, () => console.log("✅ Server: http://localhost:5000"));