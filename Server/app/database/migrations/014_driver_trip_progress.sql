ALTER TABLE rides ADD COLUMN IF NOT EXISTS driver_stops_reached integer
    CHECK (driver_stops_reached >= 0);
