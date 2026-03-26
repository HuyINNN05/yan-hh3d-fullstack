-- ============================================================
-- HH3D FULLSTACK DATABASE INITIALIZATION
-- Database: yanhh3d
-- Date: 2026-03-26
-- Description: Complete schema with all tables, relationships,
--              sample data, and indexes
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing database if exists (optional, comment out for safety)
-- DROP DATABASE IF EXISTS yanhh3d;

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS yanhh3d
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE yanhh3d;

-- ============================================================
-- 1. CATEGORIES - Thể loại phim
-- ============================================================
DROP TABLE IF EXISTS categories;
CREATE TABLE categories (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  color_class VARCHAR(50) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO categories (id, name, color_class) VALUES
(1, 'Huyen Huyen', 'text-green-500'),
(2, 'Xuyen Khong', 'text-orange-400'),
(3, 'Trung Sinh', 'text-red-400'),
(4, 'Tien Hiep', 'text-purple-400'),
(5, 'Co Trang', 'text-cyan-400'),
(6, 'Anime 3D', 'text-cyan-400'),
(7, 'Anime 4K', 'text-orange-400'),
(8, 'Hoat hinh 2D', 'text-green-500');

-- ============================================================
-- 2. USERS - Người dùng / Tài khoản
-- ============================================================
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  avatar VARCHAR(255) DEFAULT '/image/default-avatar.png',
  role VARCHAR(20) DEFAULT 'user' COMMENT 'user, admin',
  is_vip TINYINT(1) NOT NULL DEFAULT 0,
  vip_expires_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_username (username),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO users (id, username, email, password, avatar, role) VALUES
(1, 'user_demo', 'user@gmail.com', '123456', '/image/default-avatar.png', 'user'),
(2, 'Admin_Yan', 'admin@yanhh3d.gg', 'admin123456', '/image/default-avatar.png', 'admin'),
(3, 'admin_hh3d', 'admin@hh3d.com', 'Admin@123', '/image/default-avatar.png', 'admin');

-- ============================================================
-- 3. MOVIES - Danh sách phim
-- ============================================================
DROP TABLE IF EXISTS movies;
CREATE TABLE movies (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) DEFAULT NULL,
  poster LONGTEXT,
  image LONGTEXT,
  category VARCHAR(100),
  category_id INT,
  episode_display VARCHAR(50),
  quality VARCHAR(50) DEFAULT 'HD',
  show_schedule VARCHAR(255),
  status VARCHAR(50) DEFAULT 'ongoing' COMMENT 'ongoing, hoàn thành, sắp chiếu',
  total_episodes INT DEFAULT 0,
  description TEXT,
  views INT DEFAULT 0,
  video_url VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_movies_slug (slug),
  KEY idx_movies_category_id (category_id),
  KEY idx_movies_status (status),
  KEY idx_movies_created_at (created_at),
  KEY idx_movies_views (views),
  CONSTRAINT fk_movies_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO movies (id, title, slug, poster, image, category, category_id, episode_display, quality, show_schedule, status, total_episodes, description, views, video_url) VALUES
(1, 'Dau Pha Thuong Khung', 'dau-pha-thuong-khung', '/image/Dau-pha-thuong-khung.jpg', '/image/Dau-pha-thuong-khung.jpg', 'Anime 3D', 6, '3/3', '4K', 'Thu 2', 'hoàn thành', 3, 'Bộ phim hoạt hình 3D nổi tiếng.', 12000, 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
(2, 'The Gioi Hoan My', 'the-gioi-hoan-my', '/image/Pham-nhan-tu-tien.jpg', '/image/Pham-nhan-tu-tien.jpg', 'Anime 3D', 6, '2/12', 'FHD', 'Thu 6', 'ongoing', 12, 'Phiêu lưu trong thế giới tư tiên.', 9800, 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
(3, 'Than An Vuong Toa', 'than-an-vuong-toa', '/image/Tien-nghich.jpg', '/image/Tien-nghich.jpg', 'Anime 4K', 7, '1/24', '4K', 'Thu 5', 'ongoing', 24, 'Hành trình chiến đấu và trưởng thành.', 7400, 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
(4, 'Doc Bo Tieu Dao', 'doc-bo-tieu-dao', '/image/Tien-de-tro-ve.jpg', '/image/Tien-de-tro-ve.jpg', 'Anime 3D', 6, '2/2', 'HD', 'Thu 3', 'hoàn thành', 2, 'Series ngắn để test hệ thống.', 3600, 'https://www.youtube.com/embed/dQw4w9WgXcQ');

-- ============================================================
-- 4. EPISODES - Tập phim
-- ============================================================
DROP TABLE IF EXISTS episodes;
CREATE TABLE episodes (
  id INT NOT NULL AUTO_INCREMENT,
  movie_id INT NOT NULL,
  episode_number INT DEFAULT NULL,
  video_url VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_movie_episode_number (movie_id, episode_number),
  KEY idx_episodes_movie_id (movie_id),
  KEY idx_episodes_created_at (created_at),
  CONSTRAINT fk_episodes_movie
    FOREIGN KEY (movie_id) REFERENCES movies(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS episode_sources;
CREATE TABLE episode_sources (
  id INT NOT NULL AUTO_INCREMENT,
  movie_id INT NOT NULL,
  episode_number INT NOT NULL,
  quality VARCHAR(10) NOT NULL,
  video_url VARCHAR(500) NOT NULL,
  is_vip_only TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_episode_quality (movie_id, episode_number, quality),
  KEY idx_episode_sources_movie_episode (movie_id, episode_number),
  CONSTRAINT fk_episode_sources_movie
    FOREIGN KEY (movie_id) REFERENCES movies(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO episodes (id, movie_id, episode_number, video_url) VALUES
(1, 1, 1, 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
(2, 1, 2, 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
(3, 1, 3, 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
(4, 2, 1, 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
(5, 2, 2, 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
(6, 3, 1, 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
(7, 4, 1, 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
(8, 4, 2, 'https://www.youtube.com/embed/dQw4w9WgXcQ');

-- ============================================================
-- 5. WATCH_HISTORY - Lịch sử xem phim
-- ============================================================
DROP TABLE IF EXISTS watch_history;
CREATE TABLE watch_history (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  movie_id INT NOT NULL,
  episode_id INT,
  watched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_watch_history_user_id (user_id),
  KEY idx_watch_history_movie_id (movie_id),
  KEY idx_watch_history_episode_id (episode_id),
  KEY idx_watch_history_watched_at (watched_at),
  CONSTRAINT fk_watch_history_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_watch_history_movie
    FOREIGN KEY (movie_id) REFERENCES movies(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_watch_history_episode
    FOREIGN KEY (episode_id) REFERENCES episodes(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. FAVORITES - Phim yêu thích
-- ============================================================
DROP TABLE IF EXISTS favorites;
CREATE TABLE favorites (
  user_id INT NOT NULL,
  movie_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, movie_id),
  KEY idx_favorites_movie_id (movie_id),
  KEY idx_favorites_created_at (created_at),
  CONSTRAINT fk_favorites_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_favorites_movie
    FOREIGN KEY (movie_id) REFERENCES movies(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. COMMENTS - Bình luận về phim
-- ============================================================
DROP TABLE IF EXISTS comments;
CREATE TABLE comments (
  id INT NOT NULL AUTO_INCREMENT,
  movie_id INT NOT NULL,
  user_id INT,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_comments_movie_id (movie_id),
  KEY idx_comments_user_id (user_id),
  KEY idx_comments_created_at (created_at),
  CONSTRAINT fk_comments_movie
    FOREIGN KEY (movie_id) REFERENCES movies(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_comments_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO comments (id, movie_id, user_id, content) VALUES
(1, 1, 1, 'Phim rất thú vị!'),
(2, 2, 1, 'Hóng tập tiếp theo!'),
(3, 3, 2, 'Chất lượng tuyệt vời!');

-- ============================================================
-- 8. RATINGS - Đánh giá phim
-- ============================================================
DROP TABLE IF EXISTS ratings;
CREATE TABLE ratings (
  id INT NOT NULL AUTO_INCREMENT,
  movie_id INT NOT NULL,
  user_id INT NOT NULL,
  rating INT NOT NULL COMMENT '1-5 stars',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_movie_user_rating (movie_id, user_id),
  KEY idx_ratings_movie_id (movie_id),
  KEY idx_ratings_user_id (user_id),
  KEY idx_ratings_rating (rating),
  CONSTRAINT fk_ratings_movie
    FOREIGN KEY (movie_id) REFERENCES movies(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_ratings_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT ck_rating_range
    CHECK (rating >= 1 AND rating <= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. SETTINGS - Cấu hình hệ thống
-- ============================================================
DROP TABLE IF EXISTS settings;
CREATE TABLE settings (
  id INT NOT NULL AUTO_INCREMENT,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value LONGTEXT,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_settings_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 10. CREATE INDEXES FOR PERFORMANCE
-- ============================================================

-- Additional search indexes
ALTER TABLE movies ADD FULLTEXT INDEX ft_movies_title (title);
ALTER TABLE users ADD INDEX idx_users_email (email);
ALTER TABLE episodes ADD INDEX idx_episodes_video_url (video_url);

-- ============================================================
-- 11. SET FOREIGN_KEY_CHECKS BACK ON
-- ============================================================
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- VERIFICATION QUERIES (run these to verify setup)
-- ============================================================
-- SELECT 'Database initialization complete!' AS status;
-- SHOW TABLES;
-- SELECT COUNT(*) as total_movies FROM movies;
-- SELECT COUNT(*) as total_users FROM users;
-- SELECT COUNT(*) as total_episodes FROM episodes;
