-- Migration script to add experience column to workers table
-- Run this if your workers table doesn't have the experience column

USE household_service_db;

ALTER TABLE workers 
ADD COLUMN IF NOT EXISTS experience INT DEFAULT 0 AFTER is_blocked;

