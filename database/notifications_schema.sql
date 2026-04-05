-- Notifications Table for Workers
-- Run this to add notification system

USE household_service_db;

-- -----------------------------
-- NOTIFICATIONS
-- Stores notifications for workers when users book appointments
-- -----------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  worker_id INT NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
  INDEX idx_worker_unread (worker_id, is_read)
);

