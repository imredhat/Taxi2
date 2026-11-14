CREATE TABLE IF NOT EXISTS dispatch_outbox (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  request_id uuid NOT NULL,
  passenger_id uuid NOT NULL,
  previous_class text,
  previous_lat double precision,
  previous_lng double precision
);

CREATE OR REPLACE FUNCTION queue_dispatch_change() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  request ride_requests%ROWTYPE;
  prior ride_requests%ROWTYPE;
BEGIN
  IF TG_TABLE_NAME = 'rides' THEN
    IF TG_OP = 'DELETE' THEN
      SELECT * INTO request FROM ride_requests WHERE id = OLD.request_id;
    ELSE
      SELECT * INTO request FROM ride_requests WHERE id = NEW.request_id;
    END IF;
    prior := request;
  ELSE
    IF TG_OP <> 'INSERT' THEN prior := OLD; END IF;
    IF TG_OP = 'DELETE' THEN request := OLD; ELSE request := NEW; END IF;
  END IF;
  IF request.id IS NOT NULL AND request.ride_type = 'intercity' THEN
    INSERT INTO dispatch_outbox(request_id, passenger_id, previous_class, previous_lat, previous_lng)
      VALUES (request.id, request.passenger_id, prior.car_class::text,
              ST_Y(prior.pickup_location::geometry), ST_X(prior.pickup_location::geometry));
    PERFORM pg_notify('taxi2_dispatch_changed', '');
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS dispatch_request_change ON ride_requests;
CREATE TRIGGER dispatch_request_change AFTER INSERT OR UPDATE OR DELETE ON ride_requests
  FOR EACH ROW EXECUTE FUNCTION queue_dispatch_change();

DROP TRIGGER IF EXISTS dispatch_ride_change ON rides;
CREATE TRIGGER dispatch_ride_change AFTER INSERT OR UPDATE OF status, driver_id, vehicle_id OR DELETE ON rides
  FOR EACH ROW EXECUTE FUNCTION queue_dispatch_change();
