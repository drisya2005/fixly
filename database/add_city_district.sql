-- Migration: Add city and district columns to users and workers tables
-- Run this once on your database

USE household_service_db;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS city VARCHAR(100) NULL AFTER address,
  ADD COLUMN IF NOT EXISTS district VARCHAR(100) NULL AFTER city;

ALTER TABLE workers
  ADD COLUMN IF NOT EXISTS city VARCHAR(100) NULL AFTER address,
  ADD COLUMN IF NOT EXISTS district VARCHAR(100) NULL AFTER city;