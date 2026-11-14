-- Vehicle catalog supplied on 2026-11-14. BUS and MiniBus have no vehicle_class.
LOCK TABLE car_brands, car_models IN SHARE ROW EXCLUSIVE MODE;
DO $$
DECLARE
  entry record;
  target_brand uuid;
  target_model uuid;
BEGIN
  FOR entry IN SELECT * FROM (VALUES
    ('سمند', 'سمند', 'LX', 'eco_intercity', 'Samand', 'Iran Khodro'),
    ('Peugeot', 'پژو', '405', 'eco_intercity', NULL, 'Peugeot'),
    ('ولیکس', 'ولیکس', 'C30', 'eco_intercity', NULL, 'ولیکس'),
    ('جک', 'جک', 'J4', 'eco_plus', NULL, 'جک'),
    ('MVM', 'ام.وی.ام', '550', 'eco_plus', NULL, 'MVM'),
    ('MVM', 'ام.وی.ام', '530', 'eco_plus', NULL, 'MVM'),
    ('MVM', 'ام.وی.ام', 'هاچ بک x22', 'vip', NULL, 'MVM'),
    ('MVM', 'ام.وی.ام', 'x33', 'vip', 'X33', 'MVM'),
    ('MVM', 'ام.وی.ام', 'آریزو', 'vip', 'Arizo', 'Pars Khodro'),
    ('MVM', 'ام.وی.ام', 'تیگو', 'vip', NULL, 'MVM'),
    ('Hyundai', 'هیوندا', 'سوناتا بنزینی LF', 'vip_plus', NULL, 'Hyundai'),
    ('SAIPA', 'سایپا', 'آریو', 'eco_plus', NULL, 'SAIPA'),
    ('SAIPA', 'سایپا', 'H230', 'eco_plus', NULL, 'SAIPA'),
    ('Hyundai', 'هیوندا', 'اکسنت', 'vip', 'Accent', 'Hyundai'),
    ('Hyundai', 'هیوندا', 'سوناتا هیبرید LF', 'vip_plus', NULL, 'Hyundai'),
    ('Hyundai', 'هیوندا', 'سانتافه', 'suv', NULL, 'Hyundai'),
    ('Hyundai', 'هیوندا', 'النترا', 'vip', 'Elantra', 'Hyundai'),
    ('Hyundai', 'هیوندا', 'آزرا', 'vip_plus', NULL, 'Hyundai'),
    ('Hyundai', 'هیوندا', 'i30', 'eco_plus', NULL, 'Hyundai'),
    ('Hyundai', 'هیوندا', 'توسان', 'suv', NULL, 'Hyundai'),
    ('Hyundai', 'هیوندا', 'ورکروز ix55', 'suv', NULL, 'Hyundai'),
    ('مزدا', 'مزدا', '3N', 'vip_plus', NULL, 'مزدا'),
    ('مزدا', 'مزدا', '323', 'eco_plus', NULL, 'مزدا'),
    ('Nissan', 'نیسان', 'ماکسیما', 'vip_plus', NULL, 'Nissan'),
    ('هاوال', 'هاوال', 'هاچ بک H2', 'vip', NULL, 'هاوال'),
    ('دنا', 'دنا', 'EF7', 'eco_plus', 'Dena', 'Iran Khodro'),
    ('رانا', 'رانا', 'TU5', 'eco_plus', 'Runna', 'Iran Khodro'),
    ('SAIPA', 'سایپا', 'شاهین', 'eco_plus', NULL, 'SAIPA'),
    ('سیترئن', 'سیترئن', 'زانتیا', 'eco_intercity', NULL, 'سیترئن'),
    ('Renault', 'رنو', 'فلوئنس', 'vip_plus', NULL, 'Renault'),
    ('Renault', 'رنو', 'سفران', 'vip_plus', NULL, 'Renault'),
    ('Renault', 'رنو', 'تندر ال 90', 'eco_intercity', 'L90 (Tondar)', 'Renault'),
    ('Toyota', 'تویوتا', 'کمری بنزینی', 'vip_plus', 'Camry', 'Toyota'),
    ('Toyota', 'تویوتا', 'کرولا', 'vip_plus', 'Corolla', 'Toyota'),
    ('Toyota', 'تویوتا', 'پریوس هیبریدی', 'vip', NULL, 'Toyota'),
    ('Toyota', 'تویوتا', 'RAV4', 'suv', NULL, 'Toyota'),
    ('جک', 'جک', 'J5', 'eco_plus', NULL, 'جک'),
    ('جک', 'جک', 's3', 'eco_plus', NULL, 'جک'),
    ('جک', 'جک', 's5', 'vip', NULL, 'جک'),
    ('جیلی', 'جیلی', 'امگراند', 'vip', NULL, 'جیلی'),
    ('دانگ فنگ', 'دانگ فنگ', 'H30', 'eco_plus', NULL, 'دانگ فنگ'),
    ('Chery', 'چری', 'تیگو 5', 'vip', NULL, 'Chery'),
    ('Chery', 'چری', 'تیگو 7', 'suv', NULL, 'Chery'),
    ('Chery', 'چری', 'آریزو 5', 'vip', 'Arrizo 5', 'Chery'),
    ('فائو', 'فائو', 'B30', 'eco_plus', NULL, 'فائو'),
    ('فولکس', 'فولکس', 'کدی', 'vip', NULL, 'فولکس'),
    ('فونیکس', 'فونیکس', 'FX5', 'suv', NULL, 'فونیکس'),
    ('کی.ام.سی', 'کی.ام.سی', 'x5', 'suv', NULL, 'کی.ام.سی'),
    ('کی.ام.سی', 'کی.ام.سی', 's7', 'suv', NULL, 'کی.ام.سی'),
    ('Kia', 'کیا', 'سراتو', 'eco_plus', 'Cerato', 'Kia'),
    ('Kia', 'کیا', 'اسپورتج', 'suv', NULL, 'Kia'),
    ('لکسوس', 'لکسوس', 'NX200T', 'suv', NULL, 'لکسوس'),
    ('لیفان', 'لیفان', '520', 'eco_plus', NULL, 'لیفان'),
    ('لیفان', 'لیفان', '620', 'eco_plus', NULL, 'لیفان'),
    ('لیفان', 'لیفان', 'X60', 'vip', NULL, 'لیفان'),
    ('لیفان', 'لیفان', '820', 'vip', NULL, 'لیفان'),
    ('سمند', 'سمند', 'سورن پلاس', 'eco_intercity', NULL, 'سمند'),
    ('Peugeot', 'پژو', 'پارس', 'eco_plus', 'Pars', 'Peugeot'),
    ('SAIPA', 'سایپا', 'برلیانس H220', 'eco_plus', NULL, 'SAIPA'),
    ('SAIPA', 'سایپا', 'برلیانس H320', 'eco_plus', NULL, 'SAIPA'),
    ('Toyota', 'تویوتا', 'کمری هیبریدی', 'vip_plus', NULL, 'Toyota'),
    ('SAIPA', 'سایپا', 'برلیانس H330', 'eco_plus', NULL, 'SAIPA'),
    ('Hyundai', 'هیوندا', 'سوناتا بنزینی', 'vip_plus', NULL, 'Hyundai'),
    ('ون', 'ون', 'هیوندا اچ 350 - 13 نفره', 'van', NULL, 'ون'),
    ('تارا', 'تارا', 'TU5', 'eco_plus', NULL, 'تارا'),
    ('ون', 'ون', 'هایس-وانا', 'van', NULL, 'ون'),
    ('Renault', 'رنو', 'مگان', 'eco_plus', NULL, 'Renault'),
    ('Peugeot', 'پژو', 'ROA', 'eco_intercity', NULL, 'Peugeot'),
    ('Peugeot', 'پژو', 'SD 206', 'eco_intercity', NULL, 'Peugeot'),
    ('برلیانس', 'برلیانس', 'H230', 'eco_plus', NULL, 'برلیانس'),
    ('MVM', 'ام.وی.ام', '315', 'eco_intercity', '315', 'MVM'),
    ('SAIPA', 'سایپا', 'ساینا', 'eco_intercity', 'Saina', 'SAIPA'),
    ('ونوسیا', 'ونوسیا', 'وی آنلاین', 'suv', NULL, 'ونوسیا'),
    ('آیون', 'آیون', 'وی پلاس', 'suv', NULL, 'آیون'),
    ('MVM', 'ام.وی.ام', 'x22 - MT', 'eco_plus', NULL, 'MVM'),
    ('جک', 'جک', 'E50', 'vip', NULL, 'جک'),
    ('هایما', 'هایما', 'S7', 'vip', NULL, 'هایما'),
    ('هاچ بک', 'هاچ بک', 'ری را', 'vip', 'Rira', 'SAIPA Kodro'),
    ('Toyota', 'تویوتا', 'لوین', 'vip_plus', NULL, 'Toyota'),
    ('Kia', 'کیا', 'کارنیوال', 'vip', NULL, 'Kia'),
    ('فونیکس', 'فونیکس', 'تیگو 8', 'suv', NULL, 'فونیکس'),
    ('FMC', 'FMC', 'آلسون B511', 'eco_plus', NULL, 'FMC'),
    ('ام.جی', 'ام.جی', 'MG6', 'vip_plus', NULL, 'ام.جی')
  ) AS catalog(brand, brand_fa, model, package, legacy_model, legacy_brand)
  LOOP
    SELECT id INTO target_brand FROM car_brands
      WHERE name=entry.brand OR name_fa=entry.brand_fa
      ORDER BY (name=entry.brand) DESC, created_at, id LIMIT 1;
    IF target_brand IS NULL THEN
      INSERT INTO car_brands(name,name_fa) VALUES(entry.brand,entry.brand_fa) RETURNING id INTO target_brand;
    END IF;

    SELECT id INTO target_model FROM car_models
      WHERE brand_id=target_brand AND (lower(name)=lower(entry.model) OR lower(name_fa)=lower(entry.model))
      ORDER BY created_at,id LIMIT 1;
    IF target_model IS NULL AND entry.legacy_model IS NOT NULL THEN
      SELECT m.id INTO target_model FROM car_models m JOIN car_brands b ON b.id=m.brand_id
        WHERE b.name=entry.legacy_brand AND m.name=entry.legacy_model
        ORDER BY m.created_at,m.id LIMIT 1;
    END IF;
    IF target_model IS NULL THEN
      INSERT INTO car_models(brand_id,name,name_fa,vehicle_class)
        VALUES(target_brand,entry.model,entry.model,entry.package::vehicle_class)
        RETURNING id INTO target_model;
    ELSE
      UPDATE car_models SET brand_id=target_brand,name_fa=entry.model,vehicle_class=entry.package::vehicle_class
        WHERE id=target_model;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM car_models WHERE id=target_model AND brand_id=target_brand AND vehicle_class=entry.package::vehicle_class) THEN
      RAISE EXCEPTION 'Catalog update failed for % / %',entry.brand,entry.model;
    END IF;
  END LOOP;
END $$;
