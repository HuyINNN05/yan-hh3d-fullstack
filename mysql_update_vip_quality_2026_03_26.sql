-- ============================================================
-- HH3D MySQL Incremental Update: VIP + Multi-quality episodes
-- Date: 2026-03-26
-- Safe to import on existing database (idempotent)
-- ============================================================

USE yanhh3d;

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- 1) Add VIP columns to users (if missing)
-- ------------------------------------------------------------
SET @has_is_vip := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'is_vip'
);
SET @sql := IF(
  @has_is_vip = 0,
  'ALTER TABLE users ADD COLUMN is_vip TINYINT(1) NOT NULL DEFAULT 0 AFTER role',
  'SELECT ''users.is_vip already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_vip_expires_at := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'vip_expires_at'
);
SET @sql := IF(
  @has_vip_expires_at = 0,
  'ALTER TABLE users ADD COLUMN vip_expires_at DATETIME NULL AFTER is_vip',
  'SELECT ''users.vip_expires_at already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ------------------------------------------------------------
-- 2) Create episode_sources table (multi-quality per episode)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS episode_sources (
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

-- ------------------------------------------------------------
-- 3) Backfill 720p source from legacy episodes.video_url
-- ------------------------------------------------------------
INSERT INTO episode_sources (movie_id, episode_number, quality, video_url, is_vip_only)
SELECT
  e.movie_id,
  e.episode_number,
  '720p' AS quality,
  e.video_url,
  0 AS is_vip_only
FROM episodes e
LEFT JOIN episode_sources s
  ON s.movie_id = e.movie_id
 AND s.episode_number = e.episode_number
 AND s.quality = '720p'
WHERE s.id IS NULL
  AND e.video_url IS NOT NULL
  AND e.video_url <> '';

-- Ensure any existing 4k rows are marked VIP-only
UPDATE episode_sources
SET is_vip_only = 1
WHERE LOWER(quality) IN ('4k', '2160p');

SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------
-- Verification
-- ------------------------------------------------------------
SELECT 'users columns' AS check_name,
       SUM(CASE WHEN COLUMN_NAME = 'is_vip' THEN 1 ELSE 0 END) AS has_is_vip,
       SUM(CASE WHEN COLUMN_NAME = 'vip_expires_at' THEN 1 ELSE 0 END) AS has_vip_expires_at
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'yanhh3d'
  AND TABLE_NAME = 'users'
  AND COLUMN_NAME IN ('is_vip', 'vip_expires_at');

SELECT 'episode_sources rows' AS check_name, COUNT(*) AS total_rows
FROM yanhh3d.episode_sources;

-- ============================================================
-- End
-- ============================================================
