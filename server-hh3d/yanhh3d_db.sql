-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th2 05, 2026 lúc 03:20 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `yanhh3d_db`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `color_class` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `categories`
--

INSERT INTO `categories` (`id`, `name`, `color_class`) VALUES
(1, 'Huyền Huyễn', 'text-green-500'),
(2, 'Xuyên Không', 'text-orange-400'),
(3, 'Trùng Sinh', 'text-red-400'),
(4, 'Tiên Hiệp', 'text-purple-400'),
(5, 'Cổ Trang', 'text-cyan-400'),
(6, 'Anime 3D', 'text-cyan-400'),
(7, 'Anime 4K', 'text-orange-400');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `comments`
--

CREATE TABLE `comments` (
  `id` int(11) NOT NULL,
  `movie_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `episodes`
--

CREATE TABLE `episodes` (
  `id` int(11) NOT NULL,
  `movie_id` int(11) DEFAULT NULL,
  `episode_number` int(11) DEFAULT NULL,
  `video_url` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `favorites`
--

CREATE TABLE `favorites` (
  `user_id` int(11) NOT NULL,
  `movie_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `movies`
--

CREATE TABLE `movies` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `episode_display` varchar(50) DEFAULT NULL,
  `quality` varchar(50) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `show_schedule` varchar(50) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `views` int(11) DEFAULT 0,
  `video_url` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `movies`
--

INSERT INTO `movies` (`id`, `title`, `episode_display`, `quality`, `image`, `show_schedule`, `category_id`, `status`, `description`, `views`, `video_url`) VALUES
(1, 'Già Thiên', '147/156 [4K]', '4K TM-VS', '/image/Dau-pha-thuong-khung.jpg', 'Thứ 2', 1, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM'),
(2, 'Thế Giới Hoàn Mỹ', '182/200', 'Full HD', '/image/Dau-pha-thuong-khung.jpg', 'Thứ 6', 6, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM'),
(3, 'Thần Ấn Vương Tọa', '125/150', '4K', '/image/Dau-pha-thuong-khung.jpg', 'Thứ 5', 7, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM'),
(4, 'Đấu Phá Thương Khung', '110/120', '4K TM', '/image/Dau-pha-thuong-khung.jpg', 'Chủ nhật', 6, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM'),
(5, 'Phàm Nhân Tu Tiên', '80/100', '2K', '/image/Pham-nhan-tu-tien.jpg', 'Thứ 7', 6, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM'),
(6, 'Tiên Nghịch', '50/75', '4K TM-VS', '/image/Tien-nghich.jpg', 'Thứ 2', 6, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM'),
(7, 'Vũ Canh Kỷ', '80/100', '2K', '/image/Pham-nhan-tu-tien.jpg', 'Thứ 4', 6, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM'),
(8, 'Đấu La Đại Lục', '80/100', '2K', '/image/Pham-nhan-tu-tien.jpg', 'Thứ 7', 6, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM'),
(9, 'Thôn Phệ Tinh Không', '80/100', '2K', '/image/Pham-nhan-tu-tien.jpg', 'Thứ 3', 6, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM'),
(10, 'Mộ Lục Đạo', '80/100', '2K', '/image/Pham-nhan-tu-tien.jpg', 'Thứ 5', 6, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM'),
(11, 'Bách Luyện Thành Thần', '80/100', '2K', '/image/Pham-nhan-tu-tien.jpg', 'Thứ 6', 6, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM'),
(12, 'Nghịch Thiên Chí Tôn', '80/100', '2K', '/image/Pham-nhan-tu-tien.jpg', 'Thứ 2', 6, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM'),
(13, 'Vạn Giới Độc Tôn', '80/100', '2K', '/image/Pham-nhan-tu-tien.jpg', 'Thứ 4', 6, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM'),
(14, 'Luyện Khí 10 vạn năm', '80/100', '2K', '/image/Pham-nhan-tu-tien.jpg', 'Thứ 3', 6, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM'),
(15, 'Tuyệt Thế Vũ Thần', '80/100', '2K', '/image/Pham-nhan-tu-tien.jpg', 'Thứ 5', 6, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM'),
(16, 'Linh Kiếm Tôn', '80/100', '2K', '/image/Pham-nhan-tu-tien.jpg', 'Thứ 6', 6, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM'),
(17, 'Thế Giới Võ Thần', '80/100', '2K', '/image/Pham-nhan-tu-tien.jpg', 'Thứ 3', 6, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM'),
(18, 'Vạn Cổ Thần Thoại', '80/100', '2K', '/image/Pham-nhan-tu-tien.jpg', 'Thứ 3', 6, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM'),
(19, 'Độc Bộ Tiêu Dao', '80/100', '2K', '/image/Pham-nhan-tu-tien.jpg', 'Thứ 2', 6, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM'),
(20, 'Thần Khống Thiên Hạ', '80/100', '2K', '/image/Pham-nhan-tu-tien.jpg', 'Chủ nhật', 6, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM'),
(21, 'Kiếm Đạo Độc Tôn', '80/100', '2K', '/image/Pham-nhan-tu-tien.jpg', 'Thứ 7', 6, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM'),
(22, 'Võ Thần Chúa Tể', '80/100', '2K', '/image/Pham-nhan-tu-tien.jpg', 'Thứ 6', 6, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM'),
(23, 'Tuyệt Thế Chiến Thần', '80/100', '2K', '/image/Pham-nhan-tu-tien.jpg', 'Thứ 5', 6, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM'),
(24, 'Trường Sinh Giới', '80/100', '2K', '/image/Pham-nhan-tu-tien.jpg', 'Thứ 4', 6, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM'),
(25, 'Tử Xuyên', '80/100', '2K', '/image/Pham-nhan-tu-tien.jpg', 'Thứ 3', 6, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `avatar` varchar(255) DEFAULT '/image/default-avatar.png',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `avatar`, `created_at`) VALUES
(1, 'nguoidung1', 'user@gmail.com', '123456', '/image/default-avatar.png', '2026-02-05 03:21:04');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `watch_history`
--

CREATE TABLE `watch_history` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `movie_id` int(11) DEFAULT NULL,
  `episode_id` int(11) DEFAULT NULL,
  `watched_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `movie_id` (`movie_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Chỉ mục cho bảng `episodes`
--
ALTER TABLE `episodes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `movie_id` (`movie_id`);

--
-- Chỉ mục cho bảng `favorites`
--
ALTER TABLE `favorites`
  ADD PRIMARY KEY (`user_id`,`movie_id`),
  ADD KEY `movie_id` (`movie_id`);

--
-- Chỉ mục cho bảng `movies`
--
ALTER TABLE `movies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Chỉ mục cho bảng `watch_history`
--
ALTER TABLE `watch_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `movie_id` (`movie_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `episodes`
--
ALTER TABLE `episodes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `movies`
--
ALTER TABLE `movies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `watch_history`
--
ALTER TABLE `watch_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `episodes`
--
ALTER TABLE `episodes`
  ADD CONSTRAINT `episodes_ibfk_1` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `favorites`
--
ALTER TABLE `favorites`
  ADD CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `movies`
--
ALTER TABLE `movies`
  ADD CONSTRAINT `movies_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `watch_history`
--
ALTER TABLE `watch_history`
  ADD CONSTRAINT `watch_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `watch_history_ibfk_2` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
