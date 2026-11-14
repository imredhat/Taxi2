ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS approval_pending BOOLEAN NOT NULL DEFAULT FALSE;
DO $$ BEGIN
  ALTER TABLE vehicles ADD CONSTRAINT vehicle_pending_must_be_inactive CHECK (NOT approval_pending OR is_active IS FALSE);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
