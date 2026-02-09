-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th2 09, 2026 lúc 02:19 PM
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
(7, 'Anime 4K', 'text-orange-400'),
(8, 'Hoạt hình 2D', 'text-green-500');

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
  `video_url` varchar(500) DEFAULT NULL,
  `server_type` varchar(50) DEFAULT 'Thuyết Minh',
  `is_end` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `episodes`
--

INSERT INTO `episodes` (`id`, `movie_id`, `episode_number`, `video_url`, `server_type`, `is_end`) VALUES
(1, 19, 1, 'https://www.youtube.com/embed/8h1MJuBAu_Q', 'Thuyết Minh', 0),
(2, 19, 2, 'https://www.youtube.com/embed/8h1MJuBAu_Q', 'Thuyết Minh', 0),
(3, 19, 3, 'https://www.youtube.com/embed/8h1MJuBAu_Q', 'Thuyết Minh', 0),
(4, 19, 4, 'https://www.youtube.com/embed/8h1MJuBAu_Q', 'Thuyết Minh', 0),
(5, 19, 5, 'https://www.youtube.com/embed/8h1MJuBAu_Q', 'Thuyết Minh', 0),
(6, 19, 6, 'https://www.youtube.com/embed/8h1MJuBAu_Q', 'Thuyết Minh', 0),
(7, 19, 7, 'https://www.youtube.com/embed/8h1MJuBAu_Q', 'Thuyết Minh', 0),
(8, 19, 8, 'https://www.youtube.com/embed/8h1MJuBAu_Q', 'Thuyết Minh', 0),
(9, 19, 9, 'https://www.youtube.com/embed/8h1MJuBAu_Q', 'Thuyết Minh', 0),
(10, 19, 10, 'https://www.youtube.com/embed/8h1MJuBAu_Q', 'Thuyết Minh', 1),
(11, 19, 1, 'https://www.youtube.com/embed/8h1MJuBAu_Q', 'Vietsub', 0),
(12, 19, 2, 'https://www.youtube.com/embed/8h1MJuBAu_Q', 'Vietsub', 0),
(13, 19, 3, 'https://www.youtube.com/embed/8h1MJuBAu_Q', 'Vietsub', 1),
(14, 24, 1, 'https://www.youtube.com/embed/8h1MJuBAu_Q', 'Thuyết Minh', 0),
(15, 24, 2, 'https://www.youtube.com/embed/8h1MJuBAu_Q', 'Thuyết Minh', 1),
(16, 25, 1, 'https://www.youtube.com/embed/8h1MJuBAu_Q', 'Thuyết Minh', 1);

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
  `image` longtext DEFAULT NULL,
  `show_schedule` varchar(255) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `views` int(11) DEFAULT 0,
  `video_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `movies`
--

INSERT INTO `movies` (`id`, `title`, `episode_display`, `quality`, `image`, `show_schedule`, `category_id`, `status`, `description`, `views`, `video_url`, `created_at`) VALUES
(1, 'Già Thiên', '147/156 [4K]', '4K TM-VS', '/image/Dau-pha-thuong-khung.jpg', 'Thứ 2', 1, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM', '2026-02-09 11:21:45'),
(2, 'Thế Giới Hoàn Mỹ', '182/200', 'Full HD', '/image/Dau-pha-thuong-khung.jpg', 'Thứ 6', 6, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM', '2026-02-09 11:21:45'),
(3, 'Thần Ấn Vương Tọa', '125/150', '4K', '/image/Dau-pha-thuong-khung.jpg', 'Thứ 5', 7, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM', '2026-02-09 11:21:45'),
(4, 'Đấu Phá Thương Khung', '110/120', '4K TM', '/image/Dau-pha-thuong-khung.jpg', 'Chủ nhật', 6, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM', '2026-02-09 11:21:45'),
(5, 'Phàm Nhân Tu Tiên', '80/100', '2K', '/image/Pham-nhan-tu-tien.jpg', 'Thứ 7', 6, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM', '2026-02-09 11:21:45'),
(6, 'Tiên Nghịch', '50/75', '4K TM-VS', '/image/Tien-nghich.jpg', 'Thứ 2', 6, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM', '2026-02-09 11:21:45'),
(7, 'Vũ Canh Kỷ', '80/100', '2K', '/image/Pham-nhan-tu-tien.jpg', 'Thứ 4', 6, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM', '2026-02-09 11:21:45'),
(8, 'Đấu La Đại Lục', '80/100', '2K', '/image/Pham-nhan-tu-tien.jpg', 'Thứ 7', 8, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM', '2026-02-09 11:21:45'),
(9, 'Thôn Phệ Tinh Không', '80/100', '2K', '/image/Pham-nhan-tu-tien.jpg', 'Thứ 3', 8, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM', '2026-02-09 11:21:45'),
(10, 'Mộ Lục Đạo', '80/100', '2K', '/image/Pham-nhan-tu-tien.jpg', 'Thứ 5', 6, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM', '2026-02-09 11:21:45'),
(11, 'Bách Luyện Thành Thần', '80/100', '2K', '/image/Pham-nhan-tu-tien.jpg', 'Thứ 6', 6, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM', '2026-02-09 11:21:45'),
(12, 'Nghịch Thiên Chí Tôn', '80/100', '2K', '/image/Pham-nhan-tu-tien.jpg', 'Thứ 2', 6, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM', '2026-02-09 11:21:45'),
(13, 'Vạn Giới Độc Tôn', '80/100', '2K', '/image/Pham-nhan-tu-tien.jpg', 'Thứ 4', 8, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM', '2026-02-09 11:21:45'),
(14, 'Luyện Khí 10 vạn năm', '80/100', '2K', '/image/Pham-nhan-tu-tien.jpg', 'Thứ 3', 6, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM', '2026-02-09 11:21:45'),
(15, 'Tuyệt Thế Vũ Thần', '80/100', '2K', '/image/Pham-nhan-tu-tien.jpg', 'Thứ 5', 6, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM', '2026-02-09 11:21:45'),
(16, 'Linh Kiếm Tôn', '80/100', '2K', '/image/Pham-nhan-tu-tien.jpg', 'Thứ 6', 6, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM', '2026-02-09 11:21:45'),
(17, 'Thế Giới Võ Thần', '80/100', '2K', '/image/Pham-nhan-tu-tien.jpg', 'Thứ 3', 6, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM', '2026-02-09 11:21:45'),
(18, 'Vạn Cổ Thần Thoại', '80/100', '2K', '/image/Pham-nhan-tu-tien.jpg', 'Thứ 3', 6, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM', '2026-02-09 11:21:45'),
(19, 'Độc Bộ Tiêu Dao', '80/100', '2K', '/image/Pham-nhan-tu-tien.jpg', 'Thứ 2', 6, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM', '2026-02-09 11:21:45'),
(20, 'Thần Khống Thiên Hạ', '80/100', '2K', '/image/Pham-nhan-tu-tien.jpg', 'Chủ nhật', 6, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM', '2026-02-09 11:21:45'),
(21, 'Kiếm Đạo Độc Tôn', '80/100', '2K', '/image/Pham-nhan-tu-tien.jpg', 'Thứ 7', 6, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM', '2026-02-09 11:21:45'),
(22, 'Võ Thần Chúa Tể', '80/100', '2K', '/image/Pham-nhan-tu-tien.jpg', 'Thứ 6', 6, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM', '2026-02-09 11:21:45'),
(23, 'Tuyệt Thế Chiến Thần', '80/100', '2K', '/image/Pham-nhan-tu-tien.jpg', 'Thứ 5', 6, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM', '2026-02-09 11:21:45'),
(24, 'Trường Sinh Giới', '80/100', '2K', '/image/Pham-nhan-tu-tien.jpg', 'Thứ 4', 6, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM', '2026-02-09 11:21:45'),
(25, 'Tử Xuyên', '80/100', '2K', '/image/Pham-nhan-tu-tien.jpg', 'Thứ 3', 6, 'Đang chiếu', NULL, 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM', '2026-02-09 11:21:45'),
(27, 'Phim con heo', '1', NULL, 'data:image/jpeg;base64,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', '2', 4, 'Đang tiến hành', 'Phim dành cbo người lớn', 0, 'https://www.youtube.com/embed/watch?v=lSfZZIeMFOM', '2026-02-09 12:58:37');

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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `role` varchar(20) DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `avatar`, `created_at`, `role`) VALUES
(1, 'nguoidung1', 'user@gmail.com', '123456', '/image/default-avatar.png', '2026-02-05 03:21:04', 'user'),
(2, 'Admin_Yan', 'admin@yanhh3d.gg', 'admin123456', '/image/default-avatar.png', '2026-02-09 11:21:24', 'admin'),
(3, 'Huy đẹp trai', 'lehuy110205@gmail.com', 'Huy11022005', '/image/default-avatar.png', '2026-02-09 12:20:27', 'user');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `episodes`
--
ALTER TABLE `episodes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT cho bảng `movies`
--
ALTER TABLE `movies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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
