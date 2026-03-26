-- ============================================================
-- Fill missing episode qualities from existing 720p source
-- Date: 2026-03-26
-- Purpose: make old episodes selectable at all quality levels
-- ============================================================

USE yanhh3d;

-- 1) Ensure episode_sources exists
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

-- 2) Seed 720p from legacy episodes.video_url if missing
INSERT INTO episode_sources (movie_id, episode_number, quality, video_url, is_vip_only)
SELECT e.movie_id, e.episode_number, '720p', e.video_url, 0
FROM episodes e
LEFT JOIN episode_sources s
  ON s.movie_id = e.movie_id
 AND s.episode_number = e.episode_number
 AND s.quality = '720p'
WHERE s.id IS NULL
  AND e.video_url IS NOT NULL
  AND e.video_url <> '';

-- 3) Clone 720p into 360p if missing
INSERT INTO episode_sources (movie_id, episode_number, quality, video_url, is_vip_only)
SELECT s.movie_id, s.episode_number, '360p', s.video_url, 0
FROM episode_sources s
LEFT JOIN episode_sources t
  ON t.movie_id = s.movie_id
 AND t.episode_number = s.episode_number
 AND t.quality = '360p'
WHERE s.quality = '720p'
  AND t.id IS NULL;

-- 4) Clone 720p into 1080p if missing
INSERT INTO episode_sources (movie_id, episode_number, quality, video_url, is_vip_only)
SELECT s.movie_id, s.episode_number, '1080p', s.video_url, 0
FROM episode_sources s
LEFT JOIN episode_sources t
  ON t.movie_id = s.movie_id
 AND t.episode_number = s.episode_number
 AND t.quality = '1080p'
WHERE s.quality = '720p'
  AND t.id IS NULL;

-- 5) Clone 720p into 4k if missing (VIP-only)
INSERT INTO episode_sources (movie_id, episode_number, quality, video_url, is_vip_only)
SELECT s.movie_id, s.episode_number, '4k', s.video_url, 1
FROM episode_sources s
LEFT JOIN episode_sources t
  ON t.movie_id = s.movie_id
 AND t.episode_number = s.episode_number
 AND t.quality = '4k'
WHERE s.quality = '720p'
  AND t.id IS NULL;

-- 6) Force 4k to VIP-only
UPDATE episode_sources
SET is_vip_only = 1
WHERE LOWER(quality) IN ('4k', '2160p');

-- 7) Verification
SELECT quality, COUNT(*) AS total_rows
FROM episode_sources
GROUP BY quality
ORDER BY FIELD(quality, '360p', '720p', '1080p', '4k');
