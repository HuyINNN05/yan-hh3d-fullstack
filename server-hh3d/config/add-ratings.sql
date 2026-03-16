-- ============================================================
-- ADD RATINGS TABLE FOR MOVIE RATINGS
-- Date: 2026-03-16
-- ============================================================

USE yanhh3d_db;

-- Create ratings table
CREATE TABLE IF NOT EXISTS `ratings` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `movie_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `rating` INT NOT NULL COMMENT '1-5 sao',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_user_movie_rating` (`user_id`, `movie_id`),
  KEY `idx_ratings_movie_id` (`movie_id`),
  KEY `idx_ratings_user_id` (`user_id`),
  CONSTRAINT `fk_ratings_movie`
    FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_ratings_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add avg_rating column to movies table (optional, for caching)
ALTER TABLE `movies` ADD COLUMN `avg_rating` DECIMAL(3,2) DEFAULT NULL AFTER `views`;

-- Add vote_count column to movies table (optional, for caching)
ALTER TABLE `movies` ADD COLUMN `vote_count` INT DEFAULT 0 AFTER `avg_rating`;

SET FOREIGN_KEY_CHECKS = 1;
-- ============================================================
-- END
-- ============================================================
