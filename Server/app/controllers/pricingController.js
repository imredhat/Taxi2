const pool = require('../models/db');

function nullIfEmpty(val) { return val === '' || val === undefined ? 'all' : val; }

// ─── BASE FARES (نرخ پایه) ──────────────────────────────
exports.getBaseFares = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const [result, countResult] = await Promise.all([
      pool.query('SELECT * FROM base_fares ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]),
      pool.query('SELECT COUNT(*) FROM base_fares')
    ]);
    res.json({ items: result.rows, total: parseInt(countResult.rows[0].count), page: parseInt(page) });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
};

exports.createBaseFare = async (req, res) => {
  try {
    const { car_class, ride_type, base_fare, per_km_rate, per_minute_rate, min_fare, max_fare, waiting_per_minute, is_active, city } = req.body;
    if (!car_class || !base_fare) return res.status(400).json({ error: 'car_class and base_fare required' });
    const result = await pool.query(
      `INSERT INTO base_fares (car_class, ride_type, base_fare, per_km_rate, per_minute_rate, min_fare, max_fare, waiting_per_minute, is_active, city)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [car_class, ride_type || 'normal', base_fare, per_km_rate || 0, per_minute_rate || 0, min_fare || 0, max_fare, waiting_per_minute || 0, is_active !== false, city || 'default']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
};

exports.updateBaseFare = async (req, res) => {
  try {
    const { id } = req.params;
    const { car_class, ride_type, base_fare, per_km_rate, per_minute_rate, min_fare, max_fare, waiting_per_minute, is_active, city } = req.body;
    const result = await pool.query(
      `UPDATE base_fares SET car_class=COALESCE($1, car_class), ride_type=$2, base_fare=COALESCE($3, base_fare), per_km_rate=$4, per_minute_rate=$5, min_fare=$6, max_fare=$7, waiting_per_minute=$8, is_active=$9, city=$10 WHERE id=$11 RETURNING *`,
      [car_class, ride_type, base_fare, per_km_rate, per_minute_rate, min_fare, max_fare, waiting_per_minute, is_active, city, id]
    );
    if (!result.rowCount) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
};

exports.deleteBaseFare = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM base_fares WHERE id=$1 RETURNING id', [id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'حذف شد' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
};

// ─── INTERCITY PRICING (قیمت بین شهری) ─────────────────
exports.getIntercityPricing = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const [result, countResult] = await Promise.all([
      pool.query('SELECT * FROM intercity_pricing ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]),
      pool.query('SELECT COUNT(*) FROM intercity_pricing')
    ]);
    res.json({ items: result.rows, total: parseInt(countResult.rows[0].count), page: parseInt(page) });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
};

exports.createIntercityPricing = async (req, res) => {
  try {
    const { origin_city, destination_city, car_class, base_fare, per_km_rate, min_fare, is_active } = req.body;
    if (!origin_city || !destination_city || !car_class) return res.status(400).json({ error: 'origin_city, destination_city, car_class required' });
    const result = await pool.query(
      `INSERT INTO intercity_pricing (origin_city, destination_city, car_class, base_fare, per_km_rate, min_fare, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [origin_city, destination_city, car_class, base_fare || 0, per_km_rate || 0, min_fare || 0, is_active !== false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
};

exports.updateIntercityPricing = async (req, res) => {
  try {
    const { id } = req.params;
    const { origin_city, destination_city, car_class, base_fare, per_km_rate, min_fare, is_active } = req.body;
    const result = await pool.query(
      `UPDATE intercity_pricing SET origin_city=COALESCE($1, origin_city), destination_city=COALESCE($2, destination_city), car_class=COALESCE($3, car_class), base_fare=$4, per_km_rate=$5, min_fare=$6, is_active=$7 WHERE id=$8 RETURNING *`,
      [origin_city, destination_city, car_class, base_fare, per_km_rate, min_fare, is_active, id]
    );
    if (!result.rowCount) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
};

exports.deleteIntercityPricing = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM intercity_pricing WHERE id=$1 RETURNING id', [id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'حذف شد' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
};

// ─── SURGE RULES (افزایش قیمت) ─────────────────────────
exports.getSurgeRules = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM surge_rules ORDER BY priority ASC, created_at DESC');
    res.json({ items: result.rows });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
};

exports.createSurgeRule = async (req, res) => {
  try {
    const { name, car_class, min_drivers, max_wait_seconds, multiplier, max_multiplier, is_active, priority } = req.body;
    if (!name || !multiplier) return res.status(400).json({ error: 'name and multiplier required' });
    const result = await pool.query(
      `INSERT INTO surge_rules (name, car_class, min_drivers, max_wait_seconds, multiplier, max_multiplier, is_active, priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, nullIfEmpty(car_class), min_drivers, max_wait_seconds || 300, multiplier, max_multiplier || 3.00, is_active !== false, priority || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
};

exports.updateSurgeRule = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, car_class, min_drivers, max_wait_seconds, multiplier, max_multiplier, is_active, priority } = req.body;
    const result = await pool.query(
      `UPDATE surge_rules SET name=COALESCE($1, name), car_class=$2, min_drivers=$3, max_wait_seconds=$4, multiplier=COALESCE($5, multiplier), max_multiplier=$6, is_active=$7, priority=$8 WHERE id=$9 RETURNING *`,
      [name, nullIfEmpty(car_class), min_drivers, max_wait_seconds, multiplier, max_multiplier, is_active, priority, id]
    );
    if (!result.rowCount) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
};

exports.deleteSurgeRule = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM surge_rules WHERE id=$1 RETURNING id', [id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'حذف شد' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
};

// ─── TIME PRICING (قیمت زمانی) ─────────────────────────
exports.getTimePricing = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM time_pricing_rules ORDER BY created_at DESC');
    res.json({ items: result.rows });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
};

exports.createTimePricing = async (req, res) => {
  try {
    const { name, day_of_week, start_time, end_time, multiplier, car_class, is_active } = req.body;
    if (!name || !start_time || !end_time || !multiplier) return res.status(400).json({ error: 'name, start_time, end_time, multiplier required' });
    const result = await pool.query(
      `INSERT INTO time_pricing_rules (name, day_of_week, start_time, end_time, multiplier, car_class, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, day_of_week, start_time, end_time, multiplier, nullIfEmpty(car_class), is_active !== false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
};

exports.updateTimePricing = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, day_of_week, start_time, end_time, multiplier, car_class, is_active } = req.body;
    const result = await pool.query(
      `UPDATE time_pricing_rules SET name=COALESCE($1, name), day_of_week=$2, start_time=$3, end_time=$4, multiplier=COALESCE($5, multiplier), car_class=$6, is_active=$7 WHERE id=$8 RETURNING *`,
      [name, day_of_week, start_time, end_time, multiplier, nullIfEmpty(car_class), is_active, id]
    );
    if (!result.rowCount) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
};

exports.deleteTimePricing = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM time_pricing_rules WHERE id=$1 RETURNING id', [id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'حذف شد' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
};

// ─── WEATHER PRICING (قیمت آب و هوا) ───────────────────
exports.getWeatherPricing = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM weather_pricing_rules ORDER BY created_at DESC');
    res.json({ items: result.rows });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
};

exports.createWeatherPricing = async (req, res) => {
  try {
    const { name, weather_condition, multiplier, car_class, is_active } = req.body;
    if (!name || !weather_condition || !multiplier) return res.status(400).json({ error: 'name, weather_condition, multiplier required' });
    const result = await pool.query(
      `INSERT INTO weather_pricing_rules (name, weather_condition, multiplier, car_class, is_active)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, weather_condition, multiplier, nullIfEmpty(car_class), is_active !== false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
};

exports.updateWeatherPricing = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, weather_condition, multiplier, car_class, is_active } = req.body;
    const result = await pool.query(
      `UPDATE weather_pricing_rules SET name=COALESCE($1, name), weather_condition=COALESCE($2, weather_condition), multiplier=COALESCE($3, multiplier), car_class=$4, is_active=$5 WHERE id=$6 RETURNING *`,
      [name, weather_condition, multiplier, nullIfEmpty(car_class), is_active, id]
    );
    if (!result.rowCount) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
};

exports.deleteWeatherPricing = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM weather_pricing_rules WHERE id=$1 RETURNING id', [id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'حذف شد' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
};

// ─── ROAD CONDITION PRICING (قیمت وضعیت جاده) ──────────
exports.getRoadConditionPricing = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM road_condition_pricing ORDER BY created_at DESC');
    res.json({ items: result.rows });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
};

exports.createRoadConditionPricing = async (req, res) => {
  try {
    const { name, condition_type, multiplier, is_active } = req.body;
    if (!name || !condition_type || !multiplier) return res.status(400).json({ error: 'name, condition_type, multiplier required' });
    const result = await pool.query(
      `INSERT INTO road_condition_pricing (name, condition_type, multiplier, is_active) VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, condition_type, multiplier, is_active !== false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
};

exports.updateRoadConditionPricing = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, condition_type, multiplier, is_active } = req.body;
    const result = await pool.query(
      `UPDATE road_condition_pricing SET name=COALESCE($1, name), condition_type=COALESCE($2, condition_type), multiplier=COALESCE($3, multiplier), is_active=$4 WHERE id=$5 RETURNING *`,
      [name, condition_type, multiplier, is_active, id]
    );
    if (!result.rowCount) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
};

exports.deleteRoadConditionPricing = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM road_condition_pricing WHERE id=$1 RETURNING id', [id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'حذف شد' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
};

// ─── TOLL RULES (عوارض) ────────────────────────────────
exports.getTollRules = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM toll_rules ORDER BY created_at DESC');
    res.json({ items: result.rows });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
};

exports.createTollRule = async (req, res) => {
  try {
    const { name, name_fa, amount, toll_type, is_active } = req.body;
    if (!name || !amount || !toll_type) return res.status(400).json({ error: 'name, amount, toll_type required' });
    const result = await pool.query(
      `INSERT INTO toll_rules (name, name_fa, amount, toll_type, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, name_fa || name, amount, toll_type, is_active !== false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
};

exports.updateTollRule = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, name_fa, amount, toll_type, is_active } = req.body;
    const result = await pool.query(
      `UPDATE toll_rules SET name=COALESCE($1, name), name_fa=COALESCE($2, name_fa), amount=COALESCE($3, amount), toll_type=COALESCE($4, toll_type), is_active=$5 WHERE id=$6 RETURNING *`,
      [name, name_fa, amount, toll_type, is_active, id]
    );
    if (!result.rowCount) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
};

exports.deleteTollRule = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM toll_rules WHERE id=$1 RETURNING id', [id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'حذف شد' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
};
