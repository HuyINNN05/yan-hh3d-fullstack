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

// --- CÁC API CŨ CỦA BẠN (GIỮ NGUYÊN) ---

app.get('/api/movies', (req, res) => {
    const sql = "SELECT * FROM movies ORDER BY id DESC";
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

// API TÌM KIẾM (GIỮ NGUYÊN)
app.get('/api/search', (req, res) => {
    const searchTerm = req.query.q;
    if (!searchTerm) return res.json([]);
    const sql = "SELECT * FROM movies WHERE title LIKE ? LIMIT 5";
    db.query(sql, [`%${searchTerm}%`], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

// --- SỬA LẠI API TẬP PHIM (Để không bị lỗi 404 khi xem phim) ---
app.get('/api/episodes/:movieId', (req, res) => {
    const movieId = req.params.movieId;
    // Thêm server_type vào SELECT để frontend phân loại được Vietsub/Thuyết minh
    const sql = "SELECT * FROM episodes WHERE movie_id = ? ORDER BY episode_number ASC";
    db.query(sql, [movieId], (err, data) => {
        if (err) return res.status(500).json(err);
        // Ngay cả khi không có tập nào cũng trả về mảng rỗng [] thay vì lỗi
        return res.json(data);
    });
});

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

app.get('/api/categories', (req, res) => {
    const sql = "SELECT * FROM categories";
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

// --- API AUTH (GIỮ NGUYÊN) ---

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