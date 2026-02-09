const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors()); 

// SỬA TẠI ĐÂY: Tăng giới hạn nhận dữ liệu để không bị lỗi khi upload ảnh từ máy tính
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

app.get('/api/search', (req, res) => {
    const searchTerm = req.query.q;
    if (!searchTerm) return res.json([]);
    const sql = "SELECT * FROM movies WHERE title LIKE ? LIMIT 5";
    db.query(sql, [`%${searchTerm}%`], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

app.get('/api/episodes/:movieId', (req, res) => {
    const movieId = req.params.movieId;
    const sql = "SELECT * FROM episodes WHERE movie_id = ? ORDER BY episode_number ASC";
    db.query(sql, [movieId], (err, data) => {
        if (err) return res.status(500).json(err);
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
    const sql = "SELECT id, username, email, role FROM users WHERE email = ? AND password = ?";
    db.query(sql, [email, password], (err, data) => {
        if (err) return res.status(500).json({ message: "Lỗi server" });
        if (data.length > 0) {
            return res.json({ message: "Thành công", user: data[0] });
        }
        return res.status(401).json({ message: "Sai tài khoản" });
    });
});

app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;
    const sql = "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, 'user')";
    db.query(sql, [username, email, password], (err) => {
        if (err) return res.status(500).json({ message: "Lỗi đăng ký" });
        return res.json({ message: "Đăng ký thành công!" });
    });
});

// --- API DÀNH CHO ADMIN (CẬP NHẬT ĐỂ NHẬN ĐỦ DATA) ---
app.get('/api/admin/movies', (req, res) => {
    const sql = "SELECT movies.*, categories.name AS category_name FROM movies LEFT JOIN categories ON movies.category_id = categories.id ORDER BY id DESC";
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

app.post('/api/admin/movies', (req, res) => {
    // THÊM: video_url vào đây sếp nhé
    const { title, image, description, category_id, status, episode_display, show_schedule, video_url } = req.body;
    
    // SỬA: Câu lệnh SQL INSERT phải có 8 dấu chấm hỏi tương ứng với 8 cột
    const sql = "INSERT INTO movies (title, image, description, category_id, status, episode_display, show_schedule, video_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [title, image, description, category_id, status, episode_display, show_schedule, video_url];
    
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Lỗi thêm phim:", err); // In lỗi ra console để sếp dễ soi
            return res.status(500).json(err);
        }
        return res.json({ message: "Thêm phim thành công!", id: result.insertId });
    });
});

app.delete('/api/admin/movies/:id', (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM movies WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json({ message: "Đã xóa phim!" });
    });
});

app.get('/api/admin/users', (req, res) => {
    const sql = "SELECT id, username, email, role FROM users ORDER BY id DESC";
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

app.listen(5000, () => console.log("✅ Server: http://localhost:5000"));