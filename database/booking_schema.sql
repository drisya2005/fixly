-- Booking/Appointment System Tables
-- Run this to add booking functionality to your database

USE household_service_db;

-- -----------------------------
-- WORKER AVAILABILITY
-- Stores available time slots for workers
-- -----------------------------
CREATE TABLE IF NOT EXISTS worker_availability (
  id INT AUTO_INCREMENT PRIMARY KEY,
  worker_id INT NOT NULL,
  time_slot VARCHAR(50) NOT NULL, -- e.g., "09:00 AM - 10:00 AM"
  day_of_week VARCHAR(20), -- Optional: "Monday", "Tuesday", etc. or NULL for any day
  is_active TINYINT(1) DEFAULT 1, -- 1 = active, 0 = inactive
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
  INDEX idx_worker_active (worker_id, is_active)
);

-- -----------------------------
-- APPOINTMENTS
-- Stores user bookings/appointments
-- -----------------------------
CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  worker_id INT NOT NULL,
  booking_date DATE NOT NULL,
  time_slot VARCHAR(50) NOT NULL, -- e.g., "09:00 AM - 10:00 AM"
  service_type VARCHAR(50) NOT NULL,
  address VARCHAR(255),
  status ENUM('Booked', 'Confirmed', 'InProgress', 'Completed', 'Cancelled') DEFAULT 'Booked',
  notes TEXT, -- Optional notes from user
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
  INDEX idx_user_appointments (user_id, booking_date),
  INDEX idx_worker_appointments (worker_id, booking_date),
  INDEX idx_date_slot (booking_date, time_slot, worker_id)
);

-- Prevent double booking: same worker, same date, same time slot
CREATE UNIQUE INDEX idx_unique_booking ON appointments(worker_id, booking_date, time_slot, status) 
WHERE status IN ('Booked', 'Confirmed', 'InProgress');

