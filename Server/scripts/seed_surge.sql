INSERT INTO surge_rules (name, car_class, min_drivers, max_wait_seconds, multiplier, max_multiplier, is_active, priority) VALUES
('trafic_sangan_hame', NULL, 3, 300, 1.50, 3.00, true, 1),
('trafic_khili_sangan_hame', NULL, 1, 300, 2.00, 3.00, true, 2),
('rannede_kam_economy', 'economy', 2, 600, 1.75, 2.50, true, 3),
('rannede_kam_comfort', 'comfort', 2, 600, 2.00, 2.50, true, 4),
('rannede_kam_premium', 'premium', 1, 600, 1.80, 2.50, true, 5),
('saat_sholugh_sobh_hame', NULL, 5, 180, 1.25, 2.00, true, 6),
('saat_sholugh_asr_hame', NULL, 5, 180, 1.30, 2.00, true, 7),
('shab_dir_hame', NULL, 4, 300, 1.40, 2.00, true, 8),
('rouydad_khas_hame', NULL, 0, 900, 2.50, 3.00, true, 9),
('barsh_baran_hame', NULL, 5, 600, 1.50, 2.50, true, 10);
