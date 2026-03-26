# YanHH3D Fullstack

Website xem phim hoat hinh 3D voi kien truc fullstack:
- Frontend: React + Vite + Tailwind
- Backend: Node.js + Express + MySQL
- DevOps: Docker Compose + Nginx

## Tong quan kien truc

- Frontend chay qua Nginx tai `http://localhost:3000`
- Backend API chay tai `http://localhost:5000`
- MySQL chay trong Docker, map port `3307 -> 3306`
- Database chinh: `yanhh3d`

## Cong nghe su dung

### Frontend
- React 19
- React Router
- Axios
- Tailwind CSS
- Lucide React
- Vite

### Backend
- Express 5
- mysql2
- JWT
- bcrypt
- multer
- dotenv

### Database
- MySQL 8
- Script khoi tao: `yanhh3d_init.sql`

## Chay nhanh bang Docker (khuyen nghi)

Yeu cau:
- Docker Desktop
- Docker Compose

Lenh chay:

```bash
docker-compose up -d --build
```

Kiem tra trang thai:

```bash
docker-compose ps
```

Dung he thong:

```bash
docker-compose down
```

Neu muon reset ca du lieu DB volume:

```bash
docker-compose down -v
```

Sau do chay lai:

```bash
docker-compose up -d --build
```

## Chay local khong Docker

## 1) MySQL
- Tao database `yanhh3d`
- Import file `yanhh3d_init.sql`

Vi du:

```bash
mysql -u root -p < yanhh3d_init.sql
```

## 2) Backend

```bash
cd server-hh3d
npm install
npm start
```

Backend env can co:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root123
DB_NAME=yanhh3d
PORT=5000
NODE_ENV=production
JWT_SECRET=yanhh3d_super_secret_key_2026_change_in_production
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=10
```

## 3) Frontend

```bash
cd project-hh3d
npm install
npm run dev
```

Frontend env:

```env
VITE_API_URL=
```

Khi de rong, frontend goi API theo cung origin (`/api/...`) qua Nginx proxy.

## Tai khoan test mac dinh

Sau khi import `yanhh3d_init.sql`, co san mot so tai khoan:

- User: `user@gmail.com` / `123456`
- Admin: `admin@yanhh3d.gg` / `admin123456`
- Admin 2: `admin@hh3d.com` / `Admin@123`

## API chinh

### Auth
- `POST /api/login`
- `POST /api/register`

### Movies va episodes
- `GET /api/movies`
- `GET /api/movies/:id`
- `GET /api/search?q=...`
- `GET /api/categories`
- `GET /api/movies/category/:id`
- `GET /api/episodes/:movieId`
- `GET /api/movies/:id/episodes`
- `POST /api/movies/:id/view`

### Comments va ratings
- `GET /api/movies/:movieId/comments`
- `POST /api/movies/:movieId/comments` (can token)
- `DELETE /api/comments/:id` (can token)
- `GET /api/movies/:movieId/ratings`
- `GET /api/movies/:movieId/my-rating` (can token)
- `POST /api/movies/:movieId/ratings` (can token)

### Favorites va history
- `GET /api/users/me/favorites` (can token)
- `POST /api/users/me/favorites` (can token)
- `DELETE /api/users/me/favorites/:movieId` (can token)
- `GET /api/users/me/history` (can token)
- `POST /api/users/me/history` (can token)
- `DELETE /api/users/me/history/:movieId` (can token)

### Admin
- `GET /api/admin/movies`
- `POST /api/admin/movies`
- `PUT /api/admin/movies/:id`
- `DELETE /api/admin/movies/:id`
- `GET /api/admin/episodes/:movieId`
- `POST /api/admin/episodes`
- `PUT /api/admin/episodes/:id`
- `DELETE /api/admin/episodes/:id`
- `GET /api/admin/users`
- `DELETE /api/admin/users/:id`
- `POST /api/admin/upload-image`

Tat ca endpoint `/api/admin/*` yeu cau JWT token va role admin.

## Health check

- Backend: `GET /health`

## Cau truc thu muc

```text
IT/
|-- docker-compose.yml
|-- yanhh3d_init.sql
|-- README.md
|-- project-hh3d/
|   |-- src/
|   |-- Dockerfile
|   |-- nginx.conf
|   `-- package.json
`-- server-hh3d/
    |-- index.js
    |-- config/
    |-- middleware/
    |-- controllers/
    |-- models/
    |-- routes/
    `-- package.json
```

## Troubleshooting nhanh

### 1) Login bi 401
- Kiem tra dung tai khoan test ben tren
- Kiem tra DB dang la `yanhh3d`, khong phai `yanhh3d_db`
- Kiem tra backend dang chay: `http://localhost:5000/health`

### 2) Frontend bao loi removeChild tren F12
Neu gap loi dang:
- `Failed to execute 'removeChild' on 'Node'`

Thu theo thu tu:
1. Hard refresh (`Ctrl + F5`)
2. Mo tab an danh
3. Tat extension dich trang/inject script

### 3) API khong goi duoc
- Kiem tra container:

```bash
docker-compose ps
```

- Xem log:

```bash
docker logs hh3d-backend --tail=100
docker logs hh3d-frontend --tail=100
docker logs hh3d-db --tail=100
```

## Ghi chu

- Project dang uu tien Docker workflow.
- Cac thay doi moi nhat da dong bo database name ve `yanhh3d`.
- Password plain text cu se duoc backend tu dong nang cap sang bcrypt khi login thanh cong.
