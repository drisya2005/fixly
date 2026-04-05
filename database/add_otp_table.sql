-- OTP Table for Password Reset
-- Stores temporary OTP codes that expire after 5 minutes

CREATE TABLE IF NOT EXISTS password_otp (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phone VARCHAR(20) NOT NULL,
  role ENUM('user', 'worker') NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_phone_role (phone, role)
);
