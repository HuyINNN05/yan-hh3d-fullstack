# 🎬 YanHH3D - Website Xem Phim Hoạt Hình 3D

Một ứng dụng web fullstack hiện đại để xem phim với đầy đủ chức năng quản lý nội dung, xác thực người dùng, và bình luận.

---

## 🚀 Công Nghệ Sử Dụng

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Axios** - HTTP client
- **React Router** - Navigation

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MySQL** - Database
- **MySQL2/Promise** - Database driver
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Orchestration
- **Nginx** - Reverse proxy

---

## 📋 Yêu Cầu Hệ Thống

- Docker & Docker Compose (khuyến nghị)
- Hoặc Node.js 20+ và MySQL 8.0+
- Git

---

## 🛠️ Cài Đặt & Chạy

### Option 1: Dùng Docker (Khuyến nghị)

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd IT
   ```

2. **Build và chạy containers**
   ```bash
   docker-compose up --build
   ```

3. **Truy cập ứng dụng**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000
   - API Docs: http://localhost:5000/health

4. **Dừng containers**
   ```bash
   docker-compose down
   ```

### Option 2: Chạy Locally

#### Backend Setup

1. **Cài đặt dependencies**
   ```bash
   cd server-hh3d
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env - set DB_HOST=localhost
   ```

3. **Import database**
   ```bash
   # Dùng MySQL client:
   mysql -u root < yanhh3d_db.sql
   ```

4. **Chạy server**
   ```bash
   npm start      # Production
   npm run dev    # Development
   ```

Server sẽ chạy tại: `http://localhost:5000`

#### Frontend Setup

1. **Cài đặt dependencies**
   ```bash
   cd project-hh3d
   npm install
   ```

2. **Development server**
   ```bash
   npm run dev
   ```

3. **Build cho production**
   ```bash
   npm run build
   npm run preview
   ```

Frontend sẽ chạy tại: `http://localhost:5173`

---

## 🔐 Tài Khoản Test

Sau khi database được import, bạn có thể dùng các tài khoản sau:

| Role  | Email                | Password    |
|-------|----------------------|-------------|
| User  | user@hh3d.com       | 123456     |
| Admin | admin@hh3d.com      | Admin@123  |

---

## 📁 Cấu Trúc Project

```
IT/
├── docker-compose.yml         # Docker setup
├── README.md                  # Documentation
├── PROJECT_ANALYSIS.txt       # Analysis & issues
│
├── server-hh3d/              # Backend
│   ├── index.js              # Main server file
│   ├── package.json          # Dependencies
│   ├── .env                  # Environment variables
│   ├── .env.example          # Environment template
│   ├── Dockerfile            # Docker config
│   ├── config/               # Configuration
│   │   ├── db.js            # Database connection
│   │   └── migrate.sql       # Migration script
│   ├── middleware/           # Express middleware
│   │   ├── authMiddleware.js # JWT authentication
│   │   └── errorMiddleware.js
│   ├── controllers/          # Business logic
│   ├── models/               # Database models
│   ├── routes/               # API routes
│   └── utils/                # Helper functions
│
├── project-hh3d/            # Frontend
│   ├── src/
│   │   ├── App.jsx          # Main component
│   │   ├── main.jsx         # Entry point
│   │   ├── api/             # API integration
│   │   │   ├── axiosInstance.js
│   │   │   ├── authApi.js
│   │   │   └── movieApi.js
│   │   ├── config/          # Configuration
│   │   │   └── api.js
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   └── context/         # React context
│   ├── package.json
│   ├── .env
│   ├── .env.production
│   ├── nginx.conf           # Nginx configuration
│   └── Dockerfile           # Docker config
│
├── k8s/                     # Kubernetes manifests (optional)
└── write_ui.js              # Utility scripts
```

---

## 🔑 Environment Variables

### Backend (.env)

```env
# Database
DB_HOST=db              # Docker: 'db', Local: 'localhost'
DB_USER=root
DB_PASSWORD=root123
DB_NAME=yanhh3d_db

# Server
PORT=5000
NODE_ENV=production

# JWT
JWT_SECRET=your_secure_secret_key
JWT_EXPIRES_IN=7d

# Upload
UPLOAD_DIR=/app/uploads/image
MAX_FILE_SIZE=10485760

# Bcrypt
BCRYPT_ROUNDS=10
```

### Frontend (.env / .env.production)

```env
# API URL - leave empty for Vite proxy / Docker nginx proxy
VITE_API_URL=
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/login` - Đăng nhập
- `POST /api/register` - Đăng ký

### Movies
- `GET /api/movies` - Lấy danh sách phim
- `GET /api/movies/:id` - Chi tiết phim
- `GET /api/search?q=` - Tìm kiếm phim
- `GET /api/movies/category/:id` - Phim theo thể loại
- `GET /api/categories` - Danh sách thể loại

### Episodes
- `GET /api/episodes/:movieId` - Lấy tập phim

### Comments
- `GET /api/comments/:movieId` - Lấy bình luận
- `POST /api/comments` - Tạo bình luận

### Admin (Yêu cầu JWT token + Admin role)
- `GET /api/admin/movies` - Danh sách phim
- `POST /api/admin/movies` - Tạo phim
- `PUT /api/admin/movies/:id` - Cập nhật phim
- `DELETE /api/admin/movies/:id` - Xóa phim
- `POST /api/admin/episodes` - Thêm tập
- `DELETE /api/admin/episodes/:id` - Xóa tập
- `GET /api/admin/users` - Danh sách người dùng
- `DELETE /api/admin/users/:id` - Xóa người dùng
- `POST /api/admin/upload-image` - Upload ảnh

### Health Check
- `GET /health` - Kiểm tra trạng thái server

---

## 🔐 Authentication

Hệ thống dùng JWT (JSON Web Tokens) cho authentication:

1. User đăng nhập → Backend trả về JWT token
2. Frontend lưu token vào `localStorage`
3. Mỗi request tới API admin sẽ include token: `Authorization: Bearer <token>`
4. Backend xác thực token và kiểm tra role

---

## 🐛 Troubleshooting

### Database Connection Error

**Problem:** Backend không connect tới database

**Solutions:**
- Kiểm tra `.env` file: `DB_HOST`, `DB_USER`, `DB_PASSWORD`
- Docker: đảm bảo MySQL service đang chạy: `docker-compose ps`
- Local: MySQL service đang chạy
- Kiểm tra port: 3306 (Local) hoặc 3307 (Docker)

### API Request Failed

**Problem:** Frontend request tới /api/... bị lỗi

**Solutions:**
- Kiểm tra backend đang chạy: `http://localhost:5000/health`
- Kiểm trap CORS headers (nếu chạy trên domain khác)
- Check browser console cho chi tiết lỗi
- JWT token hết hạn → đăng nhập lại

### Docker Build Failed

**Problem:** `docker-compose up --build` bị lỗi

**Solutions:**
```bash
# Clear Docker cache
docker system prune -a

# Rebuild
docker-compose down
docker-compose up --build
```

### Port Already in Use

**Problem:** Port 3000/5000 đã được sử dụng

**Solutions:**
```bash
# Thay đổi port trong docker-compose.yml:
# change "3000:80" to "3001:80"

# Hoặc kill process:
# Windows: netstat -ano | findstr :5000
# Linux: lsof -i :5000
```

---

## 📈 Performance Tips

1. **Database Optimization**
   - Add indexes trên `movies.title`, `episodes.movie_id`
   - Use pagination khi query lớn

2. **Caching**
   - Implement Redis cho session/cache
   - Browser caching cho static assets

3. **Images**
   - Compress images trước upload
   - Use CDN cho static files

4. **API**
   - Implement rate limiting
   - Add request validation
   - Use connection pooling

---

## 🔒 Security Checklist

- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ CORS configured
- ✅ SQL injection protection (prepared statements)
- ⚠️ TODO: Add rate limiting
- ⚠️ TODO: Add request validation
- ⚠️ TODO: Environment variables security
- ⚠️ TODO: HTTPS in production
- ⚠️ TODO: API key authentication for admin

---

## 🚀 Deployment

### Deploy to Production

1. **Build images**
   ```bash
   docker build -t yanhh3d-backend:latest ./server-hh3d
   docker build -t yanhh3d-frontend:latest ./project-hh3d
   ```

2. **Push to registry**
   ```bash
   docker tag yanhh3d-backend:latest your-registry/yanhh3d-backend:latest
   docker push your-registry/yanhh3d-backend:latest
   ```

3. **Deploy with docker-compose hoặc K8s**

### Environment Changes for Production

- Change `JWT_SECRET` to secure value
- Set `NODE_ENV=production`
- Use proper database credentials
- Enable HTTPS
- Configure domain in Nginx

---

## 📝 Commit Convention

```
feat: Add new feature
fix: Fix bug
docs: Documentation
style: Code style
refactor: Code refactoring
perf: Performance improvement
test: Add tests
chore: Maintenance
```

---

## 📚 Resources

- [Express Documentation](https://expressjs.com)
- [React Documentation](https://react.dev)
- [MySQL Documentation](https://dev.mysql.com/doc)
- [Docker Documentation](https://docs.docker.com)
- [JWT Guide](https://jwt.io/introduction)

---

## 📞 Support

Nếu có vấn đề, vui lòng:

1. Check [PROJECT_ANALYSIS.txt](./PROJECT_ANALYSIS.txt) để xem các issue đã biết
2. Xem logs: `docker-compose logs -f backend`
3. Kiểm tra database: `docker exec hh3d-db mysql -u root -p yanhh3d_db`

---

## 📄 License

MIT License

---

**Last Updated:** March 14, 2026
**Version:** 1.0.0 (First Release)
