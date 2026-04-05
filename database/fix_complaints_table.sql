-- Fix Complaints Table Schema
-- This script drops and recreates the complaints table with the correct column names

USE household_service_db;

-- Drop the old table if it exists
DROP TABLE IF EXISTS complaints;

-- Recreate with correct schema
CREATE TABLE complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  worker_id INT NOT NULL,
  complaint_text TEXT NOT NULL,
  status ENUM('pending', 'resolved') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
  INDEX idx_worker_complaints (worker_id, status),
  INDEX idx_user_complaints (user_id)
);