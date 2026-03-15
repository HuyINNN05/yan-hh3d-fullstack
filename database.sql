-- ============================================================
-- HH3D FULL DATABASE RESET
-- Date: 2026-03-15
-- WARNING: This script WILL DELETE old database and create new one.
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP DATABASE IF EXISTS yanhh3d_db;
CREATE DATABASE yanhh3d_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE yanhh3d_db;

-- ============================================================
-- 1) categories
-- ============================================================
CREATE TABLE categories (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  color_class VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (id)
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
-- 2) users
-- Note: login currently supports both plain and bcrypt password.
-- ============================================================
CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  avatar VARCHAR(255) DEFAULT '/image/default-avatar.png',
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_username (username),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO users (id, username, email, password, avatar, role) VALUES
(1, 'user_demo', 'user@gmail.com', '123456', '/image/default-avatar.png', 'user'),
(2, 'Admin_Yan', 'admin@yanhh3d.gg', 'admin123456', '/image/default-avatar.png', 'admin'),
(3, 'admin_hh3d', 'admin@hh3d.com', 'Admin@123', '/image/default-avatar.png', 'admin');

-- ============================================================
-- 3) movies
-- ============================================================
CREATE TABLE movies (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) DEFAULT NULL,
  poster LONGTEXT DEFAULT NULL,
  category VARCHAR(100) DEFAULT NULL,
  episode_display VARCHAR(50) DEFAULT NULL,
  quality VARCHAR(50) DEFAULT NULL,
  image LONGTEXT DEFAULT NULL,
  show_schedule VARCHAR(255) DEFAULT NULL,
  category_id INT DEFAULT NULL,
  status VARCHAR(50) DEFAULT NULL,
  total_episodes INT DEFAULT 0,
  description TEXT DEFAULT NULL,
  views INT DEFAULT 0,
  video_url VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_movies_category_id (category_id),
  KEY idx_movies_status (status),
  KEY idx_movies_created_at (created_at),
  CONSTRAINT fk_movies_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO movies (
  id, title, slug, poster, category, episode_display, quality, image, show_schedule, category_id,
  status, total_episodes, description, views, video_url
) VALUES
(1, 'Dau Pha Thuong Khung', 'dau-pha-thuong-khung', '/image/Dau-pha-thuong-khung.jpg', 'Anime 3D', '3/3', '4K', '/image/Dau-pha-thuong-khung.jpg', 'Thu 2', 6,
 'Hoan thanh', 3, 'Bo phim hoat hinh 3D noi tieng.', 12000, 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
(2, 'The Gioi Hoan My', 'the-gioi-hoan-my', '/image/Pham-nhan-tu-tien.jpg', 'Anime 3D', '2/12', 'FHD', '/image/Pham-nhan-tu-tien.jpg', 'Thu 6', 6,
 'Dang tien hanh', 12, 'Phieu luu trong the gioi tu tien.', 9800, 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
(3, 'Than An Vuong Toa', 'than-an-vuong-toa', '/image/Tien-nghich.jpg', 'Anime 4K', '1/24', '4K', '/image/Tien-nghich.jpg', 'Thu 5', 7,
 'Dang tien hanh', 24, 'Hanh trinh chien dau va truong thanh.', 7400, 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
(4, 'Doc Bo Tieu Dao', 'doc-bo-tieu-dao', '/image/Tien-de-tro-ve.jpg', 'Anime 3D', '2/2', 'HD', '/image/Tien-de-tro-ve.jpg', 'Thu 3', 6,
 'Hoan thanh', 2, 'Series ngan de test he thong.', 3600, 'https://www.youtube.com/embed/dQw4w9WgXcQ');

-- ============================================================
-- 4) episodes
-- ============================================================
CREATE TABLE episodes (
  id INT NOT NULL AUTO_INCREMENT,
  movie_id INT DEFAULT NULL,
  episode_number INT DEFAULT NULL,
  video_url VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_episodes_movie_id (movie_id),
  KEY idx_episodes_created_at (created_at),
  UNIQUE KEY uniq_movie_episode_number (movie_id, episode_number),
  CONSTRAINT fk_episodes_movie
    FOREIGN KEY (movie_id) REFERENCES movies(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO episodes (
  id, movie_id, episode_number, video_url
) VALUES
(1, 1, 1, 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
(2, 1, 2, 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
(3, 1, 3, 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
(4, 2, 1, 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
(5, 2, 2, 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
(6, 3, 1, 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
(7, 4, 1, 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
(8, 4, 2, 'https://www.youtube.com/embed/dQw4w9WgXcQ');

-- ============================================================
-- 5) comments
-- ============================================================
CREATE TABLE comments (
  id INT NOT NULL AUTO_INCREMENT,
  movie_id INT DEFAULT NULL,
  user_id INT DEFAULT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_comments_movie_id (movie_id),
  KEY idx_comments_user_id (user_id),
  CONSTRAINT fk_comments_movie
    FOREIGN KEY (movie_id) REFERENCES movies(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_comments_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO comments (movie_id, user_id, content) VALUES
(1, 1, 'Phim rat hay.'),
(1, 2, 'Noi dung on, hinh anh dep.'),
(2, 1, 'Dang cho tap moi.');

-- ============================================================
-- 6) favorites
-- ============================================================
CREATE TABLE favorites (
  user_id INT NOT NULL,
  movie_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, movie_id),
  KEY idx_favorites_movie_id (movie_id),
  CONSTRAINT fk_favorites_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_favorites_movie
    FOREIGN KEY (movie_id) REFERENCES movies(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7) watch_history
-- ============================================================
CREATE TABLE watch_history (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT DEFAULT NULL,
  movie_id INT DEFAULT NULL,
  episode_id INT DEFAULT NULL,
  watched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_watch_history_user_id (user_id),
  KEY idx_watch_history_movie_id (movie_id),
  KEY idx_watch_history_episode_id (episode_id),
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
-- 8) settings
-- ============================================================
CREATE TABLE settings (
  id INT NOT NULL AUTO_INCREMENT,
  key_name VARCHAR(100) NOT NULL,
  value TEXT DEFAULT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_settings_key_name (key_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO settings (key_name, value) VALUES
('site_name', 'YanHH3D'),
('site_logo', '/image/logo.png'),
('items_per_page', '20');

-- ============================================================
-- Final checks
-- ============================================================
SELECT 'users' AS table_name, COUNT(*) AS total_rows FROM users
UNION ALL
SELECT 'movies', COUNT(*) FROM movies
UNION ALL
SELECT 'episodes', COUNT(*) FROM episodes
UNION ALL
SELECT 'comments', COUNT(*) FROM comments;

SET FOREIGN_KEY_CHECKS = 1;
-- ============================================================
-- END
-- ============================================================
