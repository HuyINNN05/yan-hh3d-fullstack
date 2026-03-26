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
let hasUserVipColumns = false;
let hasEpisodeSourcesTable = false;
const viewThrottle = new Map();
const QUALITY_ORDER = ['360p', '720p', '1080p', '4k'];
const EPISODE_REQUIRED_QUALITIES = ['360p', '720p', '1080p', '4k'];

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

function extractYoutubeVideoId(input = '') {
    const raw = String(input || '').trim();
    if (!raw) return null;

    if (/^[\w-]{11}$/.test(raw)) return raw;

    const regexPatterns = [
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?(?:.*&)?v=([\w-]{11})/i,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/watch\?v=([\w-]{11})/i,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([\w-]{11})/i,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([\w-]{11})/i,
        /(?:https?:\/\/)?youtu\.be\/([\w-]{11})/i,
    ];

    for (const pattern of regexPatterns) {
        const matched = raw.match(pattern);
        if (matched && matched[1]) return matched[1];
    }

    try {
        if (/^https?:\/\//i.test(raw)) {
            const parsed = new URL(raw);
            const fromQuery = parsed.searchParams.get('v');
            if (fromQuery && /^[\w-]{11}$/.test(fromQuery)) return fromQuery;

            const parts = parsed.pathname.split('/').filter(Boolean);
            if (parts.length > 0) {
                const tail = parts[parts.length - 1];
                if (/^[\w-]{11}$/.test(tail)) return tail;
            }
        }
    } catch (err) {
        return null;
    }

    return null;
}

function normalizeYoutubeEmbedUrl(input = '') {
    const videoId = extractYoutubeVideoId(input);
    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}`;
}

function normalizeQuality(input = '') {
    const raw = String(input || '').trim().toLowerCase();
    if (raw === '4k' || raw === '2160p') return '4k';
    if (raw === '1080p' || raw === 'fullhd' || raw === 'fhd') return '1080p';
    if (raw === '720p' || raw === 'hd') return '720p';
    if (raw === '360p' || raw === 'sd') return '360p';
    return '720p';
}

function isUserVipActive(user = null) {
    if (!user) return false;
    if (!user.is_vip) return false;
    if (!user.vip_expires_at) return true;
    return new Date(user.vip_expires_at).getTime() > Date.now();
}

function parseOptionalUserFromRequest(req) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    try {
        return jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    } catch {
        return null;
    }
}

function collectEpisodeSourcesFromBody(body = {}) {
    const nested = body.sources || {};
    const sourceMap = {
        '360p': nested['360p'] || body.video_url_360 || body.video360 || body.url_360,
        '720p': nested['720p'] || body.video_url_720 || body.video720 || body.video_url,
        '1080p': nested['1080p'] || body.video_url_1080 || body.video1080 || body.url_1080,
        '4k': nested['4k'] || nested['2160p'] || body.video_url_4k || body.video4k || body.url_4k,
    };

    const normalized = {};
    for (const quality of EPISODE_REQUIRED_QUALITIES) {
        const parsed = normalizeYoutubeEmbedUrl(sourceMap[quality] || '');
        if (!parsed) return { ok: false, message: `Nguồn ${quality} không hợp lệ hoặc để trống` };
        normalized[quality] = parsed;
    }

    return { ok: true, sources: normalized };
}

async function loadEpisodeSourcesByMovie(movieId) {
    if (!hasEpisodeSourcesTable) return new Map();
    const [rows] = await db.query(
        `SELECT movie_id, episode_number, quality, video_url, is_vip_only
         FROM episode_sources
         WHERE movie_id = ?`,
        [movieId]
    );

    const mapping = new Map();
    for (const row of rows) {
        const key = Number(row.episode_number);
        if (!mapping.has(key)) mapping.set(key, []);
        mapping.get(key).push({
            quality: normalizeQuality(row.quality),
            video_url: row.video_url,
            is_vip_only: Number(row.is_vip_only) === 1,
        });
    }

    for (const [ep, items] of mapping.entries()) {
        items.sort((a, b) => QUALITY_ORDER.indexOf(a.quality) - QUALITY_ORDER.indexOf(b.quality));
        mapping.set(ep, items);
    }

    return mapping;
}

async function listEpisodesWithSources(movieId) {
    const [episodes] = await db.query(
        `SELECT * FROM episodes WHERE movie_id = ? ORDER BY CAST(episode_number AS UNSIGNED) ASC`,
        [movieId]
    );

    const sourceMap = await loadEpisodeSourcesByMovie(movieId);
    return episodes.map((ep) => {
        const episodeNo = Number(ep.episode_number);
        let sources = sourceMap.get(episodeNo) || [];

        if (sources.length === 0 && ep.video_url) {
            sources = [{ quality: '720p', video_url: ep.video_url, is_vip_only: false }];
        }

        return {
            ...ep,
            sources,
            available_qualities: sources.map((s) => s.quality),
        };
    });
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
        const data = await listEpisodesWithSources(movieId);
        return res.json(data);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Lỗi lấy tập phim" });
    }
});

app.get('/api/movies/:id/episodes', async (req, res) => {
    try {
        const movieId = req.params.id;
        const data = await listEpisodesWithSources(movieId);
        return res.json(data);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Lỗi lấy tập phim" });
    }
});

app.get('/api/movies/:movieId/episodes/:episodeNumber/stream', async (req, res) => {
    try {
        const movieId = Number(req.params.movieId);
        const episodeNumber = Number(req.params.episodeNumber);
        const requestedQuality = normalizeQuality(req.query.quality || '720p');

        if (!Number.isFinite(movieId) || !Number.isFinite(episodeNumber)) {
            return res.status(400).json({ message: 'Thông tin tập phim không hợp lệ' });
        }

        const [episodeRows] = await db.query(
            'SELECT * FROM episodes WHERE movie_id = ? AND episode_number = ? LIMIT 1',
            [movieId, episodeNumber]
        );
        if (!episodeRows.length) {
            return res.status(404).json({ message: 'Không tìm thấy tập phim' });
        }

        const [sourceRows] = hasEpisodeSourcesTable
            ? await db.query(
                `SELECT quality, video_url, is_vip_only
                 FROM episode_sources
                 WHERE movie_id = ? AND episode_number = ?`,
                [movieId, episodeNumber]
            )
            : [[]];

        const fallbackSource = episodeRows[0].video_url
            ? [{ quality: '720p', video_url: episodeRows[0].video_url, is_vip_only: 0 }]
            : [];

        const sources = (sourceRows.length ? sourceRows : fallbackSource)
            .map((row) => ({
                quality: normalizeQuality(row.quality),
                video_url: row.video_url,
                is_vip_only: Number(row.is_vip_only) === 1,
            }))
            .sort((a, b) => QUALITY_ORDER.indexOf(a.quality) - QUALITY_ORDER.indexOf(b.quality));

        if (!sources.length) {
            return res.status(404).json({ message: 'Tập phim chưa có nguồn phát' });
        }

        const picked = sources.find((s) => s.quality === requestedQuality) || sources[0];
        if (!picked) {
            return res.status(404).json({ message: 'Không có chất lượng video phù hợp' });
        }

        const optionalUser = parseOptionalUserFromRequest(req);
        const userVip = isUserVipActive(optionalUser);
        if (picked.is_vip_only && !userVip) {
            return res.status(402).json({
                message: 'Chất lượng 4K chỉ dành cho tài khoản VIP',
                requires_vip: true,
                quality: picked.quality,
            });
        }

        return res.json({
            movie_id: movieId,
            episode_number: episodeNumber,
            quality: picked.quality,
            video_url: picked.video_url,
            requires_vip: Boolean(picked.is_vip_only),
            available_qualities: sources.map((s) => ({
                quality: s.quality,
                requires_vip: Boolean(s.is_vip_only),
            })),
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Lỗi lấy nguồn phát video' });
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

app.post('/api/movies/:id/view', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const episode = Number(req.body?.episode || 0);

        if (!Number.isFinite(id) || id <= 0) {
            return res.status(400).json({ message: 'ID phim không hợp lệ' });
        }

        const [movieRows] = await db.query('SELECT id FROM movies WHERE id = ? LIMIT 1', [id]);
        if (movieRows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy phim' });
        }

        const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown';
        const key = `${clientIp}:${id}:${episode}`;
        const now = Date.now();
        const lastAt = viewThrottle.get(key) || 0;

        // Chống cộng dồn do gọi lặp nhanh (double render, retry, click đúp).
        if (now - lastAt < 15000) {
            return res.json({ incremented: false, reason: 'throttled' });
        }

        viewThrottle.set(key, now);
        await db.query('UPDATE movies SET views = COALESCE(views, 0) + 1 WHERE id = ?', [id]);

        return res.json({ incremented: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Lỗi cập nhật lượt xem' });
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
        const identifier = String(email || '').trim();
        
        if (!identifier || !password) {
            return res.status(400).json({ message: "Email hoặc tên đăng nhập và mật khẩu không được để trống" });
        }

        const [rows] = await db.query(
            `SELECT id, username, email, password AS hashed, role,
                    COALESCE(is_vip, 0) AS is_vip,
                    vip_expires_at
             FROM users
             WHERE LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?)
             LIMIT 1`,
            [identifier, identifier]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: "Tài khoản không tồn tại" });
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

        // Auto-upgrade plain text password to bcrypt for better security.
        if (!isBcryptHash) {
            try {
                const secureHash = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS) || 10);
                await db.query('UPDATE users SET password = ? WHERE id = ?', [secureHash, user.id]);
            } catch (hashErr) {
                console.warn('Password upgrade warning:', hashErr.message);
            }
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
                role: user.role,
                is_vip: Boolean(user.is_vip),
                vip_expires_at: user.vip_expires_at || null,
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

app.get('/api/users/me', authMiddleware, async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT id, username, email, role,
                    COALESCE(is_vip, 0) AS is_vip,
                    vip_expires_at
             FROM users
             WHERE id = ?
             LIMIT 1`,
            [req.user.id]
        );

        if (!rows.length) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        const user = rows[0];
        return res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            is_vip: Boolean(user.is_vip) && isUserVipActive(user),
            vip_expires_at: user.vip_expires_at || null,
        });
    } catch (err) {
        console.error('Me API error:', err);
        return res.status(500).json({ message: 'Lỗi lấy thông tin người dùng' });
    }
});

app.post('/api/users/me/vip/purchase', authMiddleware, async (req, res) => {
    try {
        const months = Number(req.body?.months || 1);
        if (![1, 3, 12].includes(months)) {
            return res.status(400).json({ message: 'Gói VIP không hợp lệ. Chỉ hỗ trợ 1, 3 hoặc 12 tháng.' });
        }

        await db.query(
            `UPDATE users
             SET is_vip = 1,
                 vip_expires_at = CASE
                     WHEN vip_expires_at IS NULL OR vip_expires_at < NOW() THEN DATE_ADD(NOW(), INTERVAL ? MONTH)
                     ELSE DATE_ADD(vip_expires_at, INTERVAL ? MONTH)
                 END
             WHERE id = ?`,
            [months, months, req.user.id]
        );

        const [rows] = await db.query(
            `SELECT id, username, email, role,
                    COALESCE(is_vip, 0) AS is_vip,
                    vip_expires_at
             FROM users
             WHERE id = ?
             LIMIT 1`,
            [req.user.id]
        );

        const user = rows[0];
        return res.json({
            message: `Nâng cấp VIP ${months} tháng thành công`,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                is_vip: Boolean(user.is_vip) && isUserVipActive(user),
                vip_expires_at: user.vip_expires_at || null,
            }
        });
    } catch (err) {
        console.error('VIP purchase error:', err);
        return res.status(500).json({ message: 'Lỗi xử lý nâng cấp VIP' });
    }
});

// --- API ADMIN ---
app.get('/api/admin/movies', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const [data] = await db.query(
            "SELECT movies.*, COALESCE(movies.views, 0) AS views, categories.name AS category_name FROM movies LEFT JOIN categories ON movies.category_id = categories.id ORDER BY movies.id DESC"
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
        const data = await listEpisodesWithSources(movieId);
        return res.json(data);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Lỗi lấy danh sách tập phim" });
    }
});

app.post('/api/admin/episodes', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { movie_id, episode_number } = req.body;
        const normalizedEpisodeNumber = parseInt(episode_number, 10);
        const sourceResult = collectEpisodeSourcesFromBody(req.body);
        
        if (!movie_id || !normalizedEpisodeNumber) {
            return res.status(400).json({ message: "Movie ID và Episode số không được để trống" });
        }

        if (normalizedEpisodeNumber < 1) {
            return res.status(400).json({ message: 'Episode number phải lớn hơn 0' });
        }

        if (!sourceResult.ok) {
            return res.status(400).json({ message: sourceResult.message });
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

        const conn = await db.getConnection();
        let insertId = null;
        try {
            await conn.beginTransaction();
            const [result] = await conn.query(
                "INSERT INTO episodes (movie_id, episode_number, video_url) VALUES (?, ?, ?)",
                [movie_id, normalizedEpisodeNumber, sourceResult.sources['720p']]
            );
            insertId = result.insertId;

            await conn.query(
                `INSERT INTO episode_sources (movie_id, episode_number, quality, video_url, is_vip_only)
                 VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?), (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)`,
                [
                    movie_id, normalizedEpisodeNumber, '360p', sourceResult.sources['360p'], 0,
                    movie_id, normalizedEpisodeNumber, '720p', sourceResult.sources['720p'], 0,
                    movie_id, normalizedEpisodeNumber, '1080p', sourceResult.sources['1080p'], 0,
                    movie_id, normalizedEpisodeNumber, '4k', sourceResult.sources['4k'], 1,
                ]
            );

            await conn.commit();
        } catch (txErr) {
            await conn.rollback();
            throw txErr;
        } finally {
            conn.release();
        }

        return res.status(201).json({ 
            message: "Thêm tập phim thành công!", 
            id: insertId 
        });
    } catch (err) {
        console.error("Error adding episode:", err);
        return res.status(500).json({ message: "Lỗi thêm tập phim" });
    }
});

app.put('/api/admin/episodes/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const id = req.params.id;
        const { movie_id, episode_number } = req.body;
        const normalizedEpisodeNumber = parseInt(episode_number, 10);
        const sourceResult = collectEpisodeSourcesFromBody(req.body);
        
        if (!normalizedEpisodeNumber) {
            return res.status(400).json({ message: "Episode số không được để trống" });
        }

        if (!sourceResult.ok) {
            return res.status(400).json({ message: sourceResult.message });
        }

        // Lấy thông tin tập cũ để so sánh
        const [oldEpisode] = await db.query("SELECT movie_id, episode_number FROM episodes WHERE id = ?", [id]);
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

        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();
            await conn.query(
                "UPDATE episodes SET episode_number=?, video_url=? WHERE id=?",
                [normalizedEpisodeNumber, sourceResult.sources['720p'], id]
            );

            await conn.query(
                `DELETE FROM episode_sources
                 WHERE movie_id = ? AND episode_number = ?`,
                [movieIdToCheck, oldEpisode[0].episode_number]
            );

            await conn.query(
                `INSERT INTO episode_sources (movie_id, episode_number, quality, video_url, is_vip_only)
                 VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?), (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)`,
                [
                    movieIdToCheck, normalizedEpisodeNumber, '360p', sourceResult.sources['360p'], 0,
                    movieIdToCheck, normalizedEpisodeNumber, '720p', sourceResult.sources['720p'], 0,
                    movieIdToCheck, normalizedEpisodeNumber, '1080p', sourceResult.sources['1080p'], 0,
                    movieIdToCheck, normalizedEpisodeNumber, '4k', sourceResult.sources['4k'], 1,
                ]
            );

            await conn.commit();
        } catch (txErr) {
            await conn.rollback();
            throw txErr;
        } finally {
            conn.release();
        }

        return res.json({ message: "Cập nhật tập phim thành công!" });
    } catch (err) {
        console.error("Error updating episode:", err);
        return res.status(500).json({ message: "Lỗi cập nhật tập phim" });
    }
});

app.delete('/api/admin/episodes/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const id = req.params.id;
        const [episodeRows] = await db.query('SELECT movie_id, episode_number FROM episodes WHERE id = ? LIMIT 1', [id]);
        if (episodeRows.length > 0) {
            await db.query(
                'DELETE FROM episode_sources WHERE movie_id = ? AND episode_number = ?',
                [episodeRows[0].movie_id, episodeRows[0].episode_number]
            );
        }
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
            "SELECT id, username, email, role, created_at, COALESCE(is_vip, 0) AS is_vip, vip_expires_at FROM users ORDER BY id DESC"
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
// COMMENTS MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

// GET comments cho phim
app.get('/api/movies/:movieId/comments', async (req, res) => {
    try {
        const { movieId } = req.params;
        const [comments] = await db.query(
            `SELECT comments.id, comments.content, comments.created_at,
                    users.id as user_id, users.username, users.avatar
             FROM comments
             JOIN users ON comments.user_id = users.id
             WHERE comments.movie_id = ?
             ORDER BY comments.created_at DESC`,
            [movieId]
        );
        res.json(comments || []);
    } catch (err) {
        console.error('Lỗi lấy comments:', err);
        res.status(500).json({ message: 'Lỗi lấy bình luận' });
    }
});

// POST comment mới (cần login)
app.post('/api/movies/:movieId/comments', authMiddleware, async (req, res) => {
    try {
        const { movieId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: 'Bình luận không được để trống' });
        }

        if (content.trim().length > 1000) {
            return res.status(400).json({ message: 'Bình luận tối đa 1000 ký tự' });
        }

        // Kiểm tra phim tồn tại
        const [movie] = await db.query('SELECT id FROM movies WHERE id = ?', [movieId]);
        if (!movie.length) {
            return res.status(404).json({ message: 'Phim không tồn tại' });
        }

        const [result] = await db.query(
            'INSERT INTO comments (movie_id, user_id, content) VALUES (?, ?, ?)',
            [movieId, userId, content.trim()]
        );

        res.status(201).json({ 
            message: 'Bình luận đã được thêm',
            id: result.insertId
        });
    } catch (err) {
        console.error('Lỗi thêm comment:', err);
        res.status(500).json({ message: 'Lỗi thêm bình luận' });
    }
});

// DELETE comment (chỉ admin hoặc chủ comment)
app.delete('/api/comments/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const [comment] = await db.query('SELECT user_id FROM comments WHERE id = ?', [id]);
        if (!comment.length) {
            return res.status(404).json({ message: 'Bình luận không tồn tại' });
        }

        if (comment[0].user_id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Không có quyền xóa bình luận' });
        }

        await db.query('DELETE FROM comments WHERE id = ?', [id]);
        res.json({ message: 'Bình luận đã bị xóa' });
    } catch (err) {
        console.error('Lỗi xóa comment:', err);
        res.status(500).json({ message: 'Lỗi xóa bình luận' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════
// RATINGS MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

// GET rating stats của phim
app.get('/api/movies/:movieId/ratings', async (req, res) => {
    try {
        const { movieId } = req.params;

        // Lấy thống kê rating
        const [stats] = await db.query(
            `SELECT 
                COUNT(*) as total_votes,
                COALESCE(ROUND(AVG(rating), 1), 0) as avg_rating,
                COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
                COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
                COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
                COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
                COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
             FROM ratings
             WHERE movie_id = ?`,
            [movieId]
        );

        const ratingData = stats[0] || {
            total_votes: 0,
            avg_rating: 0,
            five_star: 0,
            four_star: 0,
            three_star: 0,
            two_star: 0,
            one_star: 0
        };

        res.json(ratingData);
    } catch (err) {
        console.error('Lỗi lấy ratings:', err);
        res.status(500).json({ message: 'Lỗi lấy đánh giá' });
    }
});

// GET user's rating cho phim (cần login)
app.get('/api/movies/:movieId/my-rating', authMiddleware, async (req, res) => {
    try {
        const { movieId } = req.params;
        const userId = req.user.id;

        const [userRating] = await db.query(
            'SELECT rating FROM ratings WHERE movie_id = ? AND user_id = ? LIMIT 1',
            [movieId, userId]
        );

        if (userRating.length) {
            res.json({ rating: userRating[0].rating });
        } else {
            res.json({ rating: null });
        }
    } catch (err) {
        console.error('Lỗi lấy rating user:', err);
        res.status(500).json({ message: 'Lỗi lấy đánh giá của bạn' });
    }
});

// POST/PUT rating (cần login)
app.post('/api/movies/:movieId/ratings', authMiddleware, async (req, res) => {
    try {
        const { movieId } = req.params;
        const { rating } = req.body;
        const userId = req.user.id;

        if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Đánh giá phải từ 1 đến 5 sao' });
        }

        const ratingValue = Math.round(rating);

        // Kiểm tra phim tồn tại
        const [movie] = await db.query('SELECT id FROM movies WHERE id = ?', [movieId]);
        if (!movie.length) {
            return res.status(404).json({ message: 'Phim không tồn tại' });
        }

        // Insert hoặc update rating
        const [existing] = await db.query(
            'SELECT id FROM ratings WHERE movie_id = ? AND user_id = ?',
            [movieId, userId]
        );

        if (existing.length > 0) {
            // Update
            await db.query(
                'UPDATE ratings SET rating = ?, updated_at = NOW() WHERE movie_id = ? AND user_id = ?',
                [ratingValue, movieId, userId]
            );
            res.json({ message: 'Cập nhật đánh giá thành công' });
        } else {
            // Insert
            const [result] = await db.query(
                'INSERT INTO ratings (movie_id, user_id, rating) VALUES (?, ?, ?)',
                [movieId, userId, ratingValue]
            );
            res.status(201).json({ message: 'Đánh giá đã được thêm', id: result.insertId });
        }
    } catch (err) {
        console.error('Lỗi xử lý rating:', err);
        res.status(500).json({ message: 'Lỗi xử lý đánh giá' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════
// FAVORITES MANAGEMENT (Yêu thích)
// ═══════════════════════════════════════════════════════════════════════════

// GET user's favorites
app.get('/api/users/me/favorites', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const [favorites] = await db.query(
            `SELECT movies.* FROM movies 
             INNER JOIN favorites ON movies.id = favorites.movie_id 
             WHERE favorites.user_id = ? 
             ORDER BY favorites.created_at DESC`,
            [userId]
        );
        res.json(favorites.map(normalizeMovie));
    } catch (err) {
        console.error('Lỗi lấy danh sách yêu thích:', err);
        res.status(500).json({ message: 'Lỗi lấy danh sách yêu thích' });
    }
});

// ADD to favorites
app.post('/api/users/me/favorites', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { movieId } = req.body;

        if (!movieId) {
            return res.status(400).json({ message: 'Cần cung cấp movieId' });
        }

        // Kiểm tra phim tồn tại
        const [movie] = await db.query('SELECT id FROM movies WHERE id = ?', [movieId]);
        if (!movie.length) {
            return res.status(404).json({ message: 'Phim không tồn tại' });
        }

        // Kiểm tra đã like chưa
        const [existing] = await db.query(
            'SELECT 1 FROM favorites WHERE user_id = ? AND movie_id = ?',
            [userId, movieId]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'Phim đã có trong danh sách yêu thích' });
        }

        // Thêm vào favorites
        const [result] = await db.query(
            'INSERT INTO favorites (user_id, movie_id) VALUES (?, ?)',
            [userId, movieId]
        );

        res.status(201).json({ message: 'Đã thêm vào danh sách yêu thích', id: result.insertId });
    } catch (err) {
        console.error('Lỗi thêm yêu thích:', err);
        res.status(500).json({ message: 'Lỗi thêm vào danh sách yêu thích' });
    }
});

// REMOVE from favorites
app.delete('/api/users/me/favorites/:movieId', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { movieId } = req.params;

        const [result] = await db.query(
            'DELETE FROM favorites WHERE user_id = ? AND movie_id = ?',
            [userId, movieId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Phim không có trong danh sách yêu thích' });
        }

        res.json({ message: 'Đã xóa khỏi danh sách yêu thích' });
    } catch (err) {
        console.error('Lỗi xóa yêu thích:', err);
        res.status(500).json({ message: 'Lỗi xóa khỏi danh sách yêu thích' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════
// WATCH HISTORY MANAGEMENT (Lịch sử xem)
// ═══════════════════════════════════════════════════════════════════════════

// GET user's watch history
app.get('/api/users/me/history', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const [history] = await db.query(
            `SELECT movies.*, watch_history.id as history_id, watch_history.watched_at, watch_history.episode_id
             FROM movies
             INNER JOIN watch_history ON movies.id = watch_history.movie_id
             WHERE watch_history.user_id = ?
             ORDER BY watch_history.watched_at DESC
             LIMIT 100`,
            [userId]
        );
        res.json(history.map(item => ({
            ...normalizeMovie(item),
            history_id: item.history_id,
            watched_at: item.watched_at,
            episode_id: item.episode_id
        })));
    } catch (err) {
        console.error('Lỗi lấy lịch sử xem:', err);
        res.status(500).json({ message: 'Lỗi lấy lịch sử xem' });
    }
});

// ADD to watch history
app.post('/api/users/me/history', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { movieId, episodeId } = req.body;

        if (!movieId) {
            return res.status(400).json({ message: 'Cần cung cấp movieId' });
        }

        // Kiểm tra phim tồn tại
        const [movie] = await db.query('SELECT id FROM movies WHERE id = ?', [movieId]);
        if (!movie.length) {
            return res.status(404).json({ message: 'Phim không tồn tại' });
        }

        // Thêm vào watch history (allow duplicates, but update existed timestamp)
        const [existing] = await db.query(
            'SELECT id FROM watch_history WHERE user_id = ? AND movie_id = ?',
            [userId, movieId]
        );

        if (existing.length > 0) {
            // Update watched_at
            const [result] = await db.query(
                'UPDATE watch_history SET watched_at = NOW(), episode_id = ? WHERE user_id = ? AND movie_id = ?',
                [episodeId || null, userId, movieId]
            );
            return res.json({ message: 'Cập nhật lịch sử xem', id: existing[0].id });
        }

        // Insert new
        const [result] = await db.query(
            'INSERT INTO watch_history (user_id, movie_id, episode_id) VALUES (?, ?, ?)',
            [userId, movieId, episodeId || null]
        );

        res.status(201).json({ message: 'Đã thêm vào lịch sử xem', id: result.insertId });
    } catch (err) {
        console.error('Lỗi thêm lịch sử xem:', err);
        res.status(500).json({ message: 'Lỗi thêm lịch sử xem' });
    }
});

// REMOVE from watch history
app.delete('/api/users/me/history/:movieId', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { movieId } = req.params;

        const [result] = await db.query(
            'DELETE FROM watch_history WHERE user_id = ? AND movie_id = ?',
            [userId, movieId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy trong lịch sử xem' });
        }

        res.json({ message: 'Đã xóa khỏi lịch sử xem' });
    } catch (err) {
        console.error('Lỗi xóa lịch sử xem:', err);
        res.status(500).json({ message: 'Lỗi xóa lịch sử xem' });
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

        const [vipCols] = await db.query(
            `SELECT COLUMN_NAME
             FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = 'users'
               AND COLUMN_NAME IN ('is_vip', 'vip_expires_at')`
        );
        hasUserVipColumns = vipCols.length === 2;

        const [episodeSourceTable] = await db.query(
            "SELECT 1 FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'episode_sources' LIMIT 1"
        );
        hasEpisodeSourcesTable = episodeSourceTable.length > 0;

        console.log(
            `Schema flags: movies.total_episodes=${hasMovieTotalEpisodesColumn}, users.vip=${hasUserVipColumns}, episode_sources=${hasEpisodeSourcesTable}`
        );
    } catch (err) {
        console.warn('⚠️ Không thể đọc schema flags:', err.message);
    }
}

async function ensureVipAndQualitySchema() {
    try {
        const [vipFlagColumn] = await db.query(
            "SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'is_vip' LIMIT 1"
        );
        if (!vipFlagColumn.length) {
            await db.query("ALTER TABLE users ADD COLUMN is_vip TINYINT(1) NOT NULL DEFAULT 0");
        }

        const [vipExpiryColumn] = await db.query(
            "SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'vip_expires_at' LIMIT 1"
        );
        if (!vipExpiryColumn.length) {
            await db.query("ALTER TABLE users ADD COLUMN vip_expires_at DATETIME NULL");
        }

        await db.query(
            `CREATE TABLE IF NOT EXISTS episode_sources (
                id INT NOT NULL AUTO_INCREMENT,
                movie_id INT NOT NULL,
                episode_number INT NOT NULL,
                quality VARCHAR(10) NOT NULL,
                video_url VARCHAR(500) NOT NULL,
                is_vip_only TINYINT(1) NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                UNIQUE KEY uniq_episode_quality (movie_id, episode_number, quality),
                KEY idx_episode_sources_movie_episode (movie_id, episode_number),
                CONSTRAINT fk_episode_sources_movie FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
        );

        // Backfill 720p source from legacy episodes.video_url for old data.
        await db.query(
            `INSERT INTO episode_sources (movie_id, episode_number, quality, video_url, is_vip_only)
             SELECT e.movie_id, e.episode_number, '720p', e.video_url, 0
             FROM episodes e
             LEFT JOIN episode_sources s
               ON s.movie_id = e.movie_id AND s.episode_number = e.episode_number AND s.quality = '720p'
             WHERE s.id IS NULL AND e.video_url IS NOT NULL AND e.video_url <> ''`
        );
    } catch (err) {
        console.warn('⚠️ Không thể bootstrap schema VIP/quality:', err.message);
    }
}

const PORT = process.env.PORT || 5000;
let server;

async function startServer() {
    await ensureVipAndQualitySchema();
    await detectSchemaFlags();

    server = app.listen(PORT, () => {
        console.log(`
╔════════════════════════════════════════════════════════════════╗
║  🎬 YanHH3D Server - Online                                    ║
║  PORT: ${PORT}                                                   ║
║  ENV: ${process.env.NODE_ENV || 'development'}                                       ║
║  URL: http://localhost:${PORT}                                 ║
╚════════════════════════════════════════════════════════════════╝
    `);
    });
}

startServer().catch((err) => {
    console.error('❌ Không thể khởi động server:', err);
    process.exit(1);
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