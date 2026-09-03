-- =============================================================
-- Migration: Add home_phone to driver_profiles
-- Version: 2.2
-- Date: 2026-07-12
-- =============================================================

ALTER TABLE driver_profiles ADD COLUMN IF NOT EXISTS home_phone VARCHAR(20);
