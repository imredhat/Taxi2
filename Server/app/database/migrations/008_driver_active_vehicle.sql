ALTER TABLE driver_profiles ADD COLUMN IF NOT EXISTS active_vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL;
