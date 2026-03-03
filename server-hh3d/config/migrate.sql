-- ============================================================
-- Database : yanhh3d_db
-- Project  : HH3D Movie Streaming
-- Updated  : 2026-03-03
-- Cách dùng: C:\xampp\mysql\bin\mysql.exe -u root < migrate.sql
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS `yanhh3d_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE `yanhh3d_db`;

-- ────────────────────────────────────────────────────────────
-- Bảng: categories
-- ────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id`          INT(11)      NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(100) NOT NULL,
  `color_class` VARCHAR(50)  DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `categories` (`id`, `name`, `color_class`) VALUES
(1, 'Huyễn Huyễn',  'text-green-500'),
(2, 'Xuyên Không',  'text-orange-400'),
(3, 'Trùng Sinh',   'text-red-400'),
(4, 'Tiên Hiệp',    'text-purple-400'),
(5, 'Cổ Trang',     'text-cyan-400'),
(6, 'Anime 3D',     'text-cyan-400'),
(7, 'Anime 4K',     'text-orange-400'),
(8, 'Hoạt hình 2D', 'text-green-500');

-- ────────────────────────────────────────────────────────────
-- Bảng: users
-- Mật khẩu mẫu: user@hh3d.com = 123456 | admin@hh3d.com = Admin@123
-- ────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id`         INT(11)      NOT NULL AUTO_INCREMENT,
  `username`   VARCHAR(50)  NOT NULL,
  `email`      VARCHAR(100) NOT NULL,
  `password`   VARCHAR(255) NOT NULL,
  `avatar`     VARCHAR(255) DEFAULT '/image/default-avatar.png',
  `role`       VARCHAR(20)  DEFAULT 'user',
  `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`username`, `email`, `password`, `role`) VALUES
('user_demo',  'user@hh3d.com',  '$2b$10$aa85q1NGYuYuYrCUlj4hzOM6WOV1TuqChY3aXqJOMl1yd9B.g4OV.', 'user'),
('admin_hh3d', 'admin@hh3d.com', '$2b$10$2tHtRm65heKnT0T/kzFxLOLYmfn3yqLmkH0.BbIrS7ethS8qbKXYC', 'admin');

-- ────────────────────────────────────────────────────────────
-- Bảng: movies
-- ────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `movies`;
CREATE TABLE `movies` (
  `id`              INT(11)      NOT NULL AUTO_INCREMENT,
  `title`           VARCHAR(255) NOT NULL,
  `episode_display` VARCHAR(50)  DEFAULT NULL,
  `quality`         VARCHAR(50)  DEFAULT NULL,
  `image`           LONGTEXT     DEFAULT NULL,
  `show_schedule`   VARCHAR(255) DEFAULT NULL,
  `category_id`     INT(11)      DEFAULT NULL,
  `status`          VARCHAR(50)  DEFAULT NULL,
  `description`     TEXT         DEFAULT NULL,
  `views`           INT(11)      DEFAULT 0,
  `video_url`       VARCHAR(500) DEFAULT NULL,
  `created_at`      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `movies_ibfk_1` FOREIGN KEY (`category_id`)
    REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `movies`
  (`title`, `episode_display`, `quality`, `image`, `show_schedule`, `category_id`, `status`, `description`, `views`, `video_url`)
VALUES
(
  'Đấu Phá Thương Khung', 'Tập 60', '4K',
  'https://m.media-amazon.com/images/M/MV5BYjc0MjYyN2EtZGRhOS00NmFiLWJlNDYtZTg5MjhhNWZhMjdjXkEyXkFqcGc@._V1_.jpg',
  'Thứ 2, 4, 6', 4, 'Completed',
  'Tiêu Viêm - một thiên tài bị phế bỏ nhưng nhận được sự giúp đỡ bí ẩn, lên đường trở thành Đấu Đế mạnh nhất.',
  125000, 'https://www.youtube.com/embed/dQw4w9WgXcQ'
),
(
  'Toàn Chức Pháp Sư', 'Tập 39', 'FHD',
  'https://upload.wikimedia.org/wikipedia/en/3/3b/Full_Time_Magister_poster.jpg',
  'Thứ 3, 5, 7', 4, 'Ongoing',
  'Mặc Phàm xuyên không vào thế giới phép thuật, sở hữu hệ Băng và Hỏa đôi hệ pháp sư.',
  98000, NULL
),
(
  'Hành Tinh Cực Hạn', 'Tập 12', 'HD',
  'https://upload.wikimedia.org/wikipedia/en/thumb/5/59/Planet_With_Volume_1_%28Japanese%29.jpg/220px-Planet_With_Volume_1_%28Japanese%29.jpg',
  'Thứ 7, CN', 6, 'Completed',
  'Cuộc chiến giữa con người và những sinh vật ngoài hành tinh bí ẩn.',
  44000, NULL
),
(
  'Diệt Thần Ký', 'Tập 80', '4K',
  'https://upload.wikimedia.org/wikipedia/en/thumb/5/5e/Dragon_Prince_Yuan_volume_1_cover.png/220px-Dragon_Prince_Yuan_volume_1_cover.png',
  'Hàng ngày', 2, 'Ongoing',
  'Chu Nguyên — hoàng tử bị phế bỏ — vươn lên với sức mạnh thần bí, tìm lại vinh quang.',
  230000, NULL
);

-- ────────────────────────────────────────────────────────────
-- Bảng: episodes
-- ────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `episodes`;
CREATE TABLE `episodes` (
  `id`             INT(11)      NOT NULL AUTO_INCREMENT,
  `movie_id`       INT(11)      DEFAULT NULL,
  `episode_number` INT(11)      DEFAULT NULL,
  `video_url`      VARCHAR(500) DEFAULT NULL,
  `server_type`    VARCHAR(50)  DEFAULT 'Thuyết Minh',
  `is_end`         TINYINT(1)   DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `movie_id` (`movie_id`),
  CONSTRAINT `episodes_ibfk_1` FOREIGN KEY (`movie_id`)
    REFERENCES `movies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `episodes` (`movie_id`, `episode_number`, `video_url`, `server_type`, `is_end`) VALUES
(1, 1,  'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Thuyết Minh', 0),
(1, 2,  'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Thuyết Minh', 0),
(1, 60, 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Thuyết Minh', 1),
(2, 1,  'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Vietsub', 0),
(3, 1,  'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Thuyết Minh', 0);

-- ────────────────────────────────────────────────────────────
-- Bảng: favorites
-- ────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `favorites`;
CREATE TABLE `favorites` (
  `user_id`    INT(11)   NOT NULL,
  `movie_id`   INT(11)   NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`, `movie_id`),
  KEY `movie_id` (`movie_id`),
  CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`movie_id`)
    REFERENCES `movies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- Bảng: comments
-- ────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments` (
  `id`         INT(11)   NOT NULL AUTO_INCREMENT,
  `movie_id`   INT(11)   DEFAULT NULL,
  `user_id`    INT(11)   DEFAULT NULL,
  `content`    TEXT      NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `movie_id` (`movie_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`movie_id`)
    REFERENCES `movies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- Bảng: watch_history
-- ────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `watch_history`;
CREATE TABLE `watch_history` (
  `id`         INT(11)   NOT NULL AUTO_INCREMENT,
  `user_id`    INT(11)   DEFAULT NULL,
  `movie_id`   INT(11)   DEFAULT NULL,
  `episode_id` INT(11)   DEFAULT NULL,
  `watched_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `movie_id` (`movie_id`),
  CONSTRAINT `watch_history_ibfk_1` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `watch_history_ibfk_2` FOREIGN KEY (`movie_id`)
    REFERENCES `movies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- Bảng: settings
-- ────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `id`         INT(11)      NOT NULL AUTO_INCREMENT,
  `key_name`   VARCHAR(100) NOT NULL,
  `value`      TEXT         DEFAULT NULL,
  `updated_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key_name` (`key_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `settings` (`key_name`, `value`) VALUES
('site_name',      'HH3D Streaming'),
('site_logo',      '/image/logo.png'),
('items_per_page', '20');

SET FOREIGN_KEY_CHECKS = 1;
-- ============================================================
-- END OF FILE
-- ============================================================
