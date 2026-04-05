-- Update booking schema to ensure notifications table exists
-- Run this if notifications table doesn't exist

USE household_service_db;

-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  worker_id INT NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
  INDEX idx_worker_unread (worker_id, is_read)
);

