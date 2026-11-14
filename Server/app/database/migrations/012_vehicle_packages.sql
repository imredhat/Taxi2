DO $$
DECLARE
  legacy boolean;
BEGIN
  SELECT EXISTS(SELECT 1 FROM pg_enum WHERE enumtypid='vehicle_class'::regtype AND enumlabel='motorcycle') INTO legacy;
  IF legacy THEN
    IF EXISTS(SELECT 1 FROM car_models WHERE vehicle_class IN ('motorcycle','tuk_tuk'))
      OR EXISTS(SELECT 1 FROM vehicles WHERE car_class IN ('motorcycle','tuk_tuk'))
      OR EXISTS(SELECT 1 FROM ride_requests WHERE car_class IN ('motorcycle','tuk_tuk'))
      OR EXISTS(SELECT 1 FROM rides WHERE car_class IN ('motorcycle','tuk_tuk')) THEN
      RAISE EXCEPTION 'Historical motorcycle/tuk-tuk records require a migration decision before changing vehicle classes';
    END IF;
    DELETE FROM base_fares WHERE car_class IN ('motorcycle','tuk_tuk');
    DELETE FROM intercity_pricing WHERE car_class IN ('motorcycle','tuk_tuk');
    DELETE FROM surge_rules WHERE car_class IN ('motorcycle','tuk_tuk');
    DELETE FROM time_pricing_rules WHERE car_class IN ('motorcycle','tuk_tuk');
    DELETE FROM weather_pricing_rules WHERE car_class IN ('motorcycle','tuk_tuk');
    UPDATE packages SET applicable_classes=array_remove(array_remove(applicable_classes,'motorcycle'),'tuk_tuk')
      WHERE applicable_classes && ARRAY['motorcycle','tuk_tuk']::vehicle_class[];
    UPDATE promotions SET applicable_classes=array_remove(array_remove(applicable_classes,'motorcycle'),'tuk_tuk')
      WHERE applicable_classes && ARRAY['motorcycle','tuk_tuk']::vehicle_class[];

    ALTER TYPE vehicle_class RENAME VALUE 'eco' TO 'eco_city';
    ALTER TYPE vehicle_class RENAME VALUE 'economy' TO 'eco_intercity';
    ALTER TYPE vehicle_class RENAME VALUE 'comfort' TO 'eco_plus';
    ALTER TYPE vehicle_class RENAME VALUE 'premium' TO 'vip';
    ALTER TYPE vehicle_class RENAME VALUE 'motorcycle' TO 'vip_plus';
    ALTER TYPE vehicle_class RENAME VALUE 'tuk_tuk' TO 'suv';

    UPDATE base_fares b SET ride_type='intercity' WHERE b.car_class='eco_intercity' AND b.ride_type='normal'
      AND NOT EXISTS(SELECT 1 FROM base_fares other WHERE other.car_class=b.car_class AND other.ride_type='intercity'
        AND other.city IS NOT DISTINCT FROM b.city AND other.is_active);
    UPDATE ride_requests SET car_class='eco_intercity' WHERE car_class='eco_city' AND ride_type='intercity';
    UPDATE rides SET car_class='eco_intercity' WHERE car_class='eco_city' AND ride_type='intercity';
    UPDATE ride_requests SET booking_details=jsonb_set(booking_details,'{vehicle}',to_jsonb(car_class::text))
      WHERE booking_details->>'vehicle' IN ('eco','economy','comfort','premium');

    UPDATE passenger_fare_quotes SET expires_at=LEAST(expires_at,NOW())
      WHERE expires_at>NOW() AND EXISTS(SELECT 1 FROM jsonb_array_elements(result->'packages') AS package
        WHERE package->>'car_class' IN ('eco','economy','comfort','premium','motorcycle','tuk_tuk'));
  END IF;
END;
$$;

ALTER TYPE vehicle_class ADD VALUE IF NOT EXISTS 'all';

DO $$
DECLARE
  target record;
  constraint_name text;
BEGIN
  FOR target IN SELECT * FROM (VALUES ('car_models','vehicle_class'),('vehicles','car_class'),
    ('ride_requests','car_class'),('rides','car_class'),('base_fares','car_class'),('intercity_pricing','car_class')) AS t(table_name,column_name)
  LOOP
    constraint_name := target.table_name || '_real_vehicle_class';
    IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conname=constraint_name AND conrelid=target.table_name::regclass) THEN
      EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I CHECK (%I::text <> %L)',target.table_name,constraint_name,target.column_name,'all');
    END IF;
  END LOOP;
END;
$$;
