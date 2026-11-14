ALTER TABLE driver_documents ADD COLUMN IF NOT EXISTS vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_driver_documents_vehicle ON driver_documents(vehicle_id);
UPDATE driver_documents d SET vehicle_id=v.id FROM vehicles v
WHERE d.vehicle_id IS NULL AND d.driver_id=v.driver_id
  AND d.document_type IN ('vehicle_registration_front','vehicle_registration_back','insurance','insurance_addendum',
    'vehicle_front','vehicle_back','vehicle_interior_front','vehicle_interior_back')
  AND NOT EXISTS(SELECT 1 FROM vehicles other WHERE other.driver_id=v.driver_id AND other.id<>v.id);
