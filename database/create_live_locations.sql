-- Create live_locations table for GPS tracking
USE household_service_db;

CREATE TABLE IF NOT EXISTS live_locations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  worker_id INT NOT NULL UNIQUE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
);