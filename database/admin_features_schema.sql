-- Admin Features Schema Updates
-- Worker Verification, Complaint Management, User/Worker Control

USE household_service_db;

-- -----------------------------
-- Update Workers Table
-- Add verification_status field
-- -----------------------------
ALTER TABLE workers 
ADD COLUMN IF NOT EXISTS verification_status ENUM('pending', 'approved', 'blocked') DEFAULT 'pending' AFTER is_blocked;

-- Update existing workers to 'approved' status (so they still work)
UPDATE workers SET verification_status = 'approved' WHERE verification_status IS NULL OR verification_status = 'pending';

-- -----------------------------
-- Update Users Table
-- Add status field for blocking
-- -----------------------------
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS status ENUM('active', 'blocked') DEFAULT 'active' AFTER pincode;

-- Update existing users to 'active' status
UPDATE users SET status = 'active' WHERE status IS NULL;

-- -----------------------------
-- COMPLAINTS TABLE
-- For user complaints against workers
-- -----------------------------
CREATE TABLE IF NOT EXISTS complaints (
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

-- Update complaint_count in workers table when complaint is created
-- This will be handled in backend code

