require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./config/db');
const authMiddleware = require('./middleware/authMiddleware');
const { adminMiddleware } = require('./middleware/authMiddleware');

let hasMovieTotalEpisodesColumn = false;

function slugify(text = '') {
    return String(text)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 120);
}

function normalizeMovie(row) {
    const categoryName = row.category_name || row.category || null;
    const poster = row.poster || row.image || null;
    return {
        ...row,
        slug: row.slug || slugify(row.title || ''),
        poster,
        image: poster,
        category: categoryName,
        category_name: categoryName,
    };
}

async function resolveCategoryId(category, categoryId) {
    if (categoryId) return Number(categoryId);
    if (!category || !String(category).trim()) return null;

    const name = String(category).trim();
    const [existing] = await db.query('SELECT id FROM categories WHERE name = ? LIMIT 1', [name]);
    if (existing.length > 0) return existing[0].id;

    const [created] = await db.query('INSERT INTO categories (name, color_class) VALUES (?, ?)', [name, null]);
    return created.insertId;
}

// Cấu hình multer - lưu ảnh vào thư mục uploads
const uploadDir = process.env.NODE_ENV === 'production' 
    ? '/app/uploads/image'
    : path.join(__dirname, '..', 'project-hh3d', 'public', 'image');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Chỉ chấp nhận file ảnh!'), false);
    }
});

const app = express();
app.use(cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static images
app.use('/image', express.static(uploadDir));

// --- UPLOAD ẢNH ---
app.post('/api/admin/upload-image', authMiddleware, adminMiddleware, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Không có file ảnh' });
        }
        const imagePath = '/image/' + req.file.filename;
        return res.json({ path: imagePath });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Lỗi upload ảnh' });
    }
});

// --- PROXY ẢNH NGOÀI (Google Images, Pinterest, etc) ---
app.get('/api/proxy-image', async (req, res) => {
    try {
        const imageUrl = req.query.url;
        if (!imageUrl) {
            return res.status(400).json({ message: 'URL ảnh không được để trống' });
        }

        // Validate URL
        const url = new URL(imageUrl);
        if (!url.protocol.startsWith('http')) {
            return res.status(400).json({ message: 'URL không hợp lệ' });
        }

        // Fetch ảnh từ URL
        const protocol = imageUrl.startsWith('https') ? require('https') : require('http');
        
        return new Promise((resolve, reject) => {
            protocol.get(imageUrl, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            }, (response) => {
                if (response.statusCode !== 200) {
                    return res.status(response.statusCode).json({ message: 'Không thể tải ảnh từ URL' });
                }
                
                res.set('Content-Type', response.headers['content-type']);
                res.set('Cache-Control', 'public, max-age=86400');
                response.pipe(res);
                resolve();
            }).on('error', (err) => {
                console.error('Proxy image error:', err.message);
                return res.status(500).json({ message: 'Lỗi tải ảnh: ' + err.message });
            });
        });
    } catch (err) {
        console.error('Proxy image error:', err.message);
        return res.status(500).json({ message: 'Không thể tải ảnh từ URL' });
    }
});

app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError || err.message) {
        return res.status(400).json({ message: err.message });
    }
    next(err);
});

// ═══════════════════════════════════════════════════════════════════════════
// MIDDLEWARE SETUP
// ═══════════════════════════════════════════════════════════════════════════

// --- API PHIM ---
app.get('/api/movies', async (req, res) => {
    try {
        const [data] = await db.query(
            `SELECT movies.*, categories.name AS category_name
             FROM movies
             LEFT JOIN categories ON movies.category_id = categories.id
             ORDER BY movies.id DESC
             LIMIT 100`
        );
        return res.json(data.map(normalizeMovie));
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Lỗi lấy danh sách phim" });
    }
});

app.get('/api/search', async (req, res) => {
    try {
        const searchTerm = req.query.q;
        if (!searchTerm) return res.json([]);
        
        const [data] = await db.query(
            `SELECT movies.*, categories.name AS category_name
             FROM movies
             LEFT JOIN categories ON movies.category_id = categories.id
             WHERE movies.title LIKE ?
             ORDER BY movies.id DESC
             LIMIT 20`,
            [`%${searchTerm}%`]
        );
        return res.json(data.map(normalizeMovie));
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Lỗi tìm kiếm" });
    }
});

app.get('/api/episodes/:movieId', async (req, res) => {
    try {
        const movieId = req.params.movieId;
        const [data] = await db.query(
            "SELECT * FROM episodes WHERE movie_id = ? ORDER BY CAST(episode_number AS UNSIGNED) ASC",
            [movieId]
        );
        return res.json(data);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Lỗi lấy tập phim" });
    }
});

app.get('/api/movies/:id/episodes', async (req, res) => {
    try {
        const movieId = req.params.id;
        const [data] = await db.query(
            "SELECT * FROM episodes WHERE movie_id = ? ORDER BY CAST(episode_number AS UNSIGNED) ASC",
            [movieId]
        );
        return res.json(data);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Lỗi lấy tập phim" });
    }
});

app.get('/api/movies/category/:id', async (req, res) => {
    try {
        const categoryId = req.params.id;
        const [data] = await db.query(
            `SELECT movies.*, categories.name AS category_name 
             FROM movies 
             LEFT JOIN categories ON movies.category_id = categories.id
             WHERE movies.category_id = ?
             ORDER BY movies.id DESC`,
            [categoryId]
        );
        return res.json(data.map(normalizeMovie));
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Lỗi lấy phim theo thể loại" });
    }
});

app.get('/api/movies/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const [data] = await db.query(
            `SELECT movies.*, categories.name AS category_name 
             FROM movies 
             LEFT JOIN categories ON movies.category_id = categories.id
             WHERE movies.id = ?`,
            [id]
        );
        
        if (data.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy phim" });
        }
        
        return res.json(normalizeMovie(data[0]));
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Lỗi lấy chi tiết phim" });
    }
});

app.get('/api/categories', async (req, res) => {
    try {
        const [data] = await db.query("SELECT * FROM categories");
        return res.json(data);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Lỗi lấy danh sách thể loại" });
    }
});

// --- API AUTH ---
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: "Email và mật khẩu không được để trống" });
        }

        const [rows] = await db.query(
            "SELECT id, username, email, password AS hashed, role FROM users WHERE email = ?",
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: "Email không tồn tại" });
        }

        const user = rows[0];
        
        // Support cả hashed và plain text password
        let passwordMatch = false;
        
        // Check if password in database is a bcrypt hash (starts with $2)
        const isBcryptHash = user.hashed && user.hashed.startsWith('$2');
        
        if (isBcryptHash) {
            // Try bcrypt compare for hashed passwords
            try {
                passwordMatch = await bcrypt.compare(password, user.hashed);
            } catch (e) {
                passwordMatch = false;
            }
        } else {
            // Plain text password comparison
            passwordMatch = (password === user.hashed);
        }
        
        if (!passwordMatch) {
            return res.status(401).json({ message: "Mật khẩu không chính xác" });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        return res.json({ 
            message: "Đăng nhập thành công", 
            token,
            user: { 
                id: user.id, 
                username: user.username, 
                email: user.email, 
                role: user.role 
            } 
        });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Lỗi đăng nhập" });
    }
});

app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Mật khẩu không khớp" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự" });
        }

        // Check if email exists
        const [existing] = await db.query(
            "SELECT id FROM users WHERE email = ? OR username = ?",
            [email, username]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: "Email hoặc username đã tồn tại" });
        }

        // Hash password
        const hashed = await bcrypt.hash(password, process.env.BCRYPT_ROUNDS || 10);

        // Create user
        const [result] = await db.query(
            "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
            [username, email, hashed, 'user']
        );

        return res.status(201).json({ 
            message: "Đăng ký thành công! Vui lòng đăng nhập" 
        });
    } catch (err) {
        console.error("Register error:", err);
        return res.status(500).json({ message: "Lỗi đăng ký" });
    }
});

// --- API ADMIN ---
app.get('/api/admin/movies', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const [data] = await db.query(
            "SELECT movies.*, categories.name AS category_name FROM movies LEFT JOIN categories ON movies.category_id = categories.id ORDER BY movies.id DESC"
        );
        return res.json(data.map(normalizeMovie));
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Lỗi lấy dữ liệu phim" });
    }
});

app.post('/api/admin/movies', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { title, image, poster, description, category_id, category, total_episodes, slug } = req.body;
        const finalPoster = (poster || image || '').trim();
        const resolvedCategoryId = await resolveCategoryId(category, category_id);
        
        if (!title || !description || !finalPoster || !resolvedCategoryId) {
            return res.status(400).json({ message: "Cần nhập đủ title, description, poster và category" });
        }

        const [result] = await db.query(
            "INSERT INTO movies (title, image, description, category_id, status, total_episodes, quality, episode_display, show_schedule, video_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())",
            [title.trim(), finalPoster, description.trim(), resolvedCategoryId, 'Ongoing', Number(total_episodes) || 0, 'HD', slug || null, null, null]
        );

        return res.status(201).json({ 
            message: "Thêm phim thành công!", 
            id: result.insertId 
        });
    } catch (err) {
        console.error("Error adding movie:", err);
        return res.status(500).json({ message: "Lỗi thêm phim" });
    }
});

app.put('/api/admin/movies/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const id = req.params.id;
        const {
            title,
            image,
            poster,
            description,
            category_id,
            category,
            status,
            episode_display,
            show_schedule,
            video_url,
            quality,
            total_episodes,
            slug,
        } = req.body;
        const finalPoster = (poster || image || '').trim();
        const resolvedCategoryId = await resolveCategoryId(category, category_id);
        
        if (!title || !finalPoster) {
            return res.status(400).json({ message: "Tên phim và ảnh không được để trống" });
        }

        await db.query(
            "UPDATE movies SET title=?, image=?, description=?, category_id=?, status=?, total_episodes=?, episode_display=?, show_schedule=?, video_url=?, quality=?, updated_at=NOW() WHERE id=?",
            [title, finalPoster, description, resolvedCategoryId, status, Number(total_episodes) || 0, episode_display || slug || null, show_schedule, video_url, quality, id]
        );

        return res.json({ message: "Cập nhật phim thành công!" });
    } catch (err) {
        console.error("Error updating movie:", err);
        return res.status(500).json({ message: "Lỗi cập nhật phim" });
    }
});

app.delete('/api/admin/movies/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const id = req.params.id;
        await db.query("DELETE FROM movies WHERE id = ?", [id]);
        return res.json({ message: "Đã xóa phim!" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Lỗi xóa phim" });
    }
});

// ═══════════════════════════════════════════════════════════════════════════
// EPISODES MANAGEMENT (Quản lý tập phim)
// ═══════════════════════════════════════════════════════════════════════════
app.get('/api/admin/episodes/:movieId', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const movieId = req.params.movieId;
        const [data] = await db.query(
            `SELECT id, movie_id, episode_number, video_url, video_url AS youtube_url, created_at
             FROM episodes
             WHERE movie_id = ?
             ORDER BY CAST(episode_number AS UNSIGNED) ASC`,
            [movieId]
        );
        return res.json(data);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Lỗi lấy danh sách tập phim" });
    }
});

app.post('/api/admin/episodes', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { movie_id, episode_number, video_url, youtube_url } = req.body;
        const normalizedVideoUrl = (youtube_url || video_url || '').trim();
        const normalizedEpisodeNumber = parseInt(episode_number, 10);
        
        if (!movie_id || !normalizedEpisodeNumber || !normalizedVideoUrl) {
            return res.status(400).json({ message: "Movie ID, Episode số, và Video URL không được để trống" });
        }

        if (normalizedEpisodeNumber < 1) {
            return res.status(400).json({ message: 'Episode number phải lớn hơn 0' });
        }

        const isYoutubeLike = /^(https?:\/\/)?((www\.)?youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]{6,}|^[\w-]{11}$/.test(normalizedVideoUrl);
        if (!isYoutubeLike) {
            return res.status(400).json({ message: 'Youtube URL không hợp lệ' });
        }

        // Kiểm tra số tập không vượt quá tổng số tập của phim
        const [movieData] = await db.query("SELECT id FROM movies WHERE id = ?", [movie_id]);
        if (!movieData.length) {
            return res.status(404).json({ message: "Phim không tồn tại" });
        }

        if (hasMovieTotalEpisodesColumn) {
            const [movieMeta] = await db.query("SELECT total_episodes FROM movies WHERE id = ?", [movie_id]);
            const totalEpisodes = movieMeta[0]?.total_episodes || 0;
            if (totalEpisodes > 0 && normalizedEpisodeNumber > totalEpisodes) {
                return res.status(400).json({ 
                    message: `Episode số ${normalizedEpisodeNumber} vượt quá tổng số tập (${totalEpisodes}) của phim này` 
                });
            }
        }

        // Kiểm tra episode_number đã tồn tại chưa
        const [existing] = await db.query(
            "SELECT id FROM episodes WHERE movie_id = ? AND episode_number = ?",
            [movie_id, normalizedEpisodeNumber]
        );
        if (existing.length > 0) {
            return res.status(400).json({ message: `Tập ${normalizedEpisodeNumber} đã tồn tại cho phim này` });
        }

        const [result] = await db.query(
            "INSERT INTO episodes (movie_id, episode_number, video_url) VALUES (?, ?, ?)",
            [movie_id, normalizedEpisodeNumber, normalizedVideoUrl]
        );

        return res.status(201).json({ 
            message: "Thêm tập phim thành công!", 
            id: result.insertId 
        });
    } catch (err) {
        console.error("Error adding episode:", err);
        return res.status(500).json({ message: "Lỗi thêm tập phim" });
    }
});

app.put('/api/admin/episodes/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const id = req.params.id;
        const { movie_id, episode_number, video_url, youtube_url } = req.body;
        const normalizedVideoUrl = (youtube_url || video_url || '').trim();
        const normalizedEpisodeNumber = parseInt(episode_number, 10);
        
        if (!normalizedEpisodeNumber || !normalizedVideoUrl) {
            return res.status(400).json({ message: "Episode số và Video URL không được để trống" });
        }

        // Lấy thông tin tập cũ để so sánh
        const [oldEpisode] = await db.query("SELECT movie_id FROM episodes WHERE id = ?", [id]);
        if (!oldEpisode.length) {
            return res.status(404).json({ message: "Tập phim không tồn tại" });
        }

        const movieIdToCheck = movie_id || oldEpisode[0].movie_id;
        
        // Kiểm tra số tập không vượt quá tổng số tập của phim (nếu thay đổi episode_number)
        if (hasMovieTotalEpisodesColumn) {
            const [movieData] = await db.query("SELECT total_episodes FROM movies WHERE id = ?", [movieIdToCheck]);
            if (movieData.length && movieData[0].total_episodes > 0 && normalizedEpisodeNumber > movieData[0].total_episodes) {
                return res.status(400).json({ 
                    message: `Episode số ${normalizedEpisodeNumber} vượt quá tổng số tập (${movieData[0].total_episodes}) của phim này` 
                });
            }
        }

        // Chặn trùng số tập trong cùng phim khi update
        const [existing] = await db.query(
            "SELECT id FROM episodes WHERE movie_id = ? AND episode_number = ? AND id <> ?",
            [movieIdToCheck, normalizedEpisodeNumber, id]
        );
        if (existing.length > 0) {
            return res.status(400).json({ message: `Tập ${normalizedEpisodeNumber} đã tồn tại cho phim này` });
        }

        await db.query(
            "UPDATE episodes SET episode_number=?, video_url=? WHERE id=?",
            [normalizedEpisodeNumber, normalizedVideoUrl, id]
        );

        return res.json({ message: "Cập nhật tập phim thành công!" });
    } catch (err) {
        console.error("Error updating episode:", err);
        return res.status(500).json({ message: "Lỗi cập nhật tập phim" });
    }
});

app.delete('/api/admin/episodes/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const id = req.params.id;
        await db.query("DELETE FROM episodes WHERE id = ?", [id]);
        return res.json({ message: "Đã xóa tập phim!" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Lỗi xóa tập phim" });
    }
});

app.get('/api/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const [data] = await db.query(
            "SELECT id, username, email, role, created_at FROM users ORDER BY id DESC"
        );
        return res.json(data);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Lỗi lấy danh sách người dùng" });
    }
});

app.delete('/api/admin/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const id = req.params.id;
        
        // Prevent deleting admin/self
        if (req.user.id == id) {
            return res.status(400).json({ message: "Không thể xóa chính mình" });
        }

        await db.query("DELETE FROM users WHERE id = ?", [id]);
        return res.json({ message: "Đã xóa người dùng!" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Lỗi xóa người dùng" });
    }
});

app.get('/api/admin/episodes', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const [data] = await db.query(
            `SELECT episodes.*, movies.title as movie_title 
             FROM episodes 
             JOIN movies ON episodes.movie_id = movies.id 
             ORDER BY episodes.id DESC`
        );
        return res.json(data);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Lỗi lấy danh sách tập phim" });
    }
});

// --- API BÌNH LUẬN ---
app.get('/api/comments/:movieId', async (req, res) => {
    try {
        const movieId = req.params.movieId;
        const [data] = await db.query(
            `SELECT comments.*, users.username 
             FROM comments 
             JOIN users ON comments.user_id = users.id 
             WHERE comments.movie_id = ? 
             ORDER BY comments.created_at DESC
             LIMIT 50`,
            [movieId]
        );
        return res.json(data);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Lỗi lấy bình luận" });
    }
});

app.post('/api/comments', async (req, res) => {
    try {
        const { user_id, movie_id, content } = req.body;

        if (!user_id || !movie_id || !content) {
            return res.status(400).json({ message: "Dữ liệu bình luận không đầy đủ" });
        }

        if (content.trim().length === 0) {
            return res.status(400).json({ message: "Bình luận không được để trống" });
        }

        const [result] = await db.query(
            "INSERT INTO comments (user_id, movie_id, content, created_at) VALUES (?, ?, ?, NOW())",
            [user_id, movie_id, content.trim()]
        );

        return res.status(201).json({ 
            message: "Bình luận đã được thêm!", 
            id: result.insertId 
        });
    } catch (err) {
        console.error("Error posting comment:", err);
        return res.status(500).json({ message: "Lỗi thêm bình luận" });
    }
});

// ═══════════════════════════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════════════════════════
app.get('/health', async (req, res) => {
    try {
        await db.query('SELECT 1');
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    } catch (err) {
        res.status(503).json({ status: 'database error', message: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════════
// 404 & ERROR HANDLING
// ═══════════════════════════════════════════════════════════════════════════

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ 
        message: `API endpoint '${req.path}' không tồn tại`,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('ERROR:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    const status = err.status || 500;
    const message = err.message || 'Lỗi server nội bộ';

    res.status(status).json({ 
        message,
        ...(process.env.NODE_ENV === 'development' && { error: err.toString() })
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// SERVER STARTUP
// ═══════════════════════════════════════════════════════════════════════════
async function detectSchemaFlags() {
    try {
        const [totalEpisodesCol] = await db.query(
            "SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'movies' AND COLUMN_NAME = 'total_episodes' LIMIT 1"
        );
        hasMovieTotalEpisodesColumn = totalEpisodesCol.length > 0;

        console.log(`Schema flags: movies.total_episodes=${hasMovieTotalEpisodesColumn}`);
    } catch (err) {
        console.warn('⚠️ Không thể đọc schema flags:', err.message);
    }
}

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, async () => {
    await detectSchemaFlags();
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║  🎬 YanHH3D Server - Online                                    ║
║  PORT: ${PORT}                                                   ║
║  ENV: ${process.env.NODE_ENV || 'development'}                                       ║
║  URL: http://localhost:${PORT}                                 ║
╚════════════════════════════════════════════════════════════════╝
    `);
});

// ═══════════════════════════════════════════════════════════════════════════
// GRACEFUL SHUTDOWN
// ═══════════════════════════════════════════════════════════════════════════
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

async function gracefulShutdown() {
    console.log('\n📢 Nhận tín hiệu shutdown, đóng kết nối...');
    
    server.close(async () => {
        try {
            await db.end();
            console.log('✅ Đã đóng database connection');
            process.exit(0);
        } catch (err) {
            console.error('❌ Lỗi khi đóng database:', err);
            process.exit(1);
        }
    });

    // Force shutdown sau 30 giây
    setTimeout(() => {
        console.error('❌ Buộc shutdown sau 30 giây timeout');
        process.exit(1);
    }, 30000);
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});