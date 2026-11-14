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
  IF request.id IS NOT NULL AND (request.ride_type='intercity' OR (request.ride_type='normal' AND request.client_reference IS NOT NULL)) THEN
    INSERT INTO dispatch_outbox(request_id, passenger_id, previous_class, previous_lat, previous_lng)
      VALUES (request.id, request.passenger_id, prior.car_class::text,
              ST_Y(prior.pickup_location::geometry), ST_X(prior.pickup_location::geometry));
    PERFORM pg_notify('taxi2_dispatch_changed', '');
  END IF;
  RETURN NULL;
END;
$$;

INSERT INTO base_fares(car_class,ride_type,city,base_fare,per_km_rate,per_minute_rate,min_fare)
SELECT rate.class::vehicle_class,'normal','default',rate.base,rate.km,rate.minute,rate.minimum
FROM (VALUES ('eco_city',165000,38500,5500,220000),('vip_plus',687500,123750,20625,825000),
 ('suv',770000,138600,23100,924000)) AS rate(class,base,km,minute,minimum)
WHERE NOT EXISTS(SELECT 1 FROM base_fares b WHERE b.car_class::text=rate.class AND b.ride_type='normal' AND COALESCE(b.city,'default')='default');
