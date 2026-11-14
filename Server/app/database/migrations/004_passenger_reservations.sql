ALTER TABLE ride_requests ADD COLUMN IF NOT EXISTS client_reference VARCHAR(100);
ALTER TABLE ride_requests ADD COLUMN IF NOT EXISTS booking_details JSONB;
CREATE UNIQUE INDEX IF NOT EXISTS ride_requests_passenger_reference
  ON ride_requests(passenger_id, client_reference) WHERE client_reference IS NOT NULL;
