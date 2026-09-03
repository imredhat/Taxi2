-- =============================================================
-- Migration: Add fields for driver registration form
-- Version: 2.1
-- Date: 2026-07-10
-- =============================================================

-- Add missing columns to driver_profiles table
ALTER TABLE driver_profiles ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add missing columns to vehicles table
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS owner_name VARCHAR(200);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS fuel_type VARCHAR(50);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS plate_letter VARCHAR(10);

-- Make model_id nullable since not all drivers will have a model selected
ALTER TABLE vehicles ALTER COLUMN model_id DROP NOT NULL;

-- Update car_brands to use numeric IDs if needed (the form uses numeric IDs)
-- Check if car_brands has numeric IDs or UUID
DO $$
BEGIN
  -- If car_brands.id is UUID, we need to handle the brand mapping differently
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'car_brands' AND column_name = 'id' AND data_type = 'uuid') THEN
    -- Car brands use UUID, we'll map the numeric IDs from the form to brand names
    RAISE NOTICE 'Car brands use UUID - will map form IDs to brand names';
  END IF;
END $$;
