-- Migration: Add media support to ratings table
-- Run this once on your database

USE household_service_db;

-- Add media_paths column to store uploaded photo/video filenames as JSON
ALTER TABLE ratings
  ADD COLUMN IF NOT EXISTS media_paths TEXT NULL COMMENT 'JSON array of uploaded file names';