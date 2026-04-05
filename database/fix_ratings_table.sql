-- Fix ratings table for media (photo/video) support
-- Run this in MySQL: mysql -u root -p household_service_db < fix_ratings_table.sql

USE household_service_db;

-- Drop the old broken ratings table (wrong FK to 'bookings' which doesn't exist)
-- This is safe only if you have no review data yet.
DROP TABLE IF EXISTS ratings;

-- Recreate ratings table with:
--   - correct FK to 'appointments' (not 'bookings')
--   - media_paths column for storing uploaded file names
--   - comment as TEXT (not VARCHAR 255) for longer reviews
CREATE TABLE ratings (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  worker_id   INT NOT NULL,
  booking_id  INT NOT NULL,
  stars       INT NOT NULL,
  comment     TEXT NOT NULL,
  media_paths TEXT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)    REFERENCES users(id)        ON DELETE CASCADE,
  FOREIGN KEY (worker_id)  REFERENCES workers(id)      ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES appointments(id) ON DELETE CASCADE,
  CONSTRAINT chk_stars CHECK (stars BETWEEN 1 AND 5),
  UNIQUE KEY unique_booking_review (booking_id, user_id)
);