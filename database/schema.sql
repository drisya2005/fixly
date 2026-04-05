-- MySQL Schema for: Online Household Service Provider Management System
-- Keep it simple and viva-friendly: only essential tables + columns.

CREATE DATABASE IF NOT EXISTS household_service_db;
USE household_service_db;

-- -----------------------------
-- USERS
-- -----------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(120) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  address VARCHAR(255),
  area VARCHAR(100),
  pincode VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------
-- WORKERS
-- -----------------------------
CREATE TABLE IF NOT EXISTS workers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(120) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  service_type VARCHAR(50) NOT NULL, -- e.g., Plumber, Electrician, Cleaner
  area VARCHAR(100),
  pincode VARCHAR(10),
  status ENUM('Available','Busy','Offline') DEFAULT 'Offline',
  is_new TINYINT(1) DEFAULT 1, -- newly joined workers are "New"
  avg_rating DECIMAL(3,2) DEFAULT 0.00,
  rating_count INT DEFAULT 0,
  complaint_count INT DEFAULT 0,
  is_blocked TINYINT(1) DEFAULT 0,
  experience INT DEFAULT 0, -- Experience in years
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------
-- ADMIN (single or few accounts)
-- -----------------------------
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------
-- BOOKINGS
-- -----------------------------
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  worker_id INT NOT NULL,
  service_type VARCHAR(50) NOT NULL,
  is_emergency TINYINT(1) DEFAULT 0,
  address VARCHAR(255),
  area VARCHAR(100),
  pincode VARCHAR(10),
  status ENUM('Requested','Accepted','InProgress','Completed','Cancelled') DEFAULT 'Requested',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (worker_id) REFERENCES workers(id)
);

-- -----------------------------
-- COMPLAINTS
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

-- -----------------------------
-- RATINGS (1-5 stars)
-- -----------------------------
CREATE TABLE IF NOT EXISTS ratings (
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

-- Helpful indexes for filtering
CREATE INDEX idx_workers_service_pincode_status ON workers(service_type, pincode, status);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_worker ON bookings(worker_id);

-- Optional: create a default admin (change password later in backend)
-- Insert AFTER you decide your admin username/password and hash it.
-- INSERT INTO admins (username, password_hash) VALUES ('admin', '<hash>');


