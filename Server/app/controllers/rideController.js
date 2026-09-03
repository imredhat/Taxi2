const pool = require('../models/db');

// ─── RIDES (لیست سفرها) ───────────────────────────────
exports.getRides = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];

    let query = `
      SELECT r.id, r.ride_type, r.car_class, r.status, r.fare, r.distance_km,
             r.duration_minutes, r.payment_method, r.payment_status,
             r.started_at, r.completed_at, r.cancelled_at, r.created_at,
             u1.first_name AS passenger_first, u1.last_name AS passenger_last, u1.phone AS passenger_phone,
             u2.first_name AS driver_first, u2.last_name AS driver_last, u2.phone AS driver_phone,
             r.pickup_address, r.dropoff_address
      FROM rides r
      LEFT JOIN users u1 ON r.passenger_id = u1.id
      LEFT JOIN driver_profiles dp ON r.driver_id = dp.id
      LEFT JOIN users u2 ON dp.user_id = u2.id
    `;

    let countQuery = `SELECT COUNT(*) FROM rides r`;

    if (status) {
      params.push(status);
      conditions.push(`r.status = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(u1.first_name ILIKE $${params.length} OR u1.last_name ILIKE $${params.length} OR u1.phone ILIKE $${params.length} OR u2.first_name ILIKE $${params.length} OR u2.last_name ILIKE $${params.length} OR u2.phone ILIKE $${params.length} OR r.pickup_address ILIKE $${params.length} OR r.dropoff_address ILIKE $${params.length})`);
    }

    if (conditions.length) {
      const where = ' WHERE ' + conditions.join(' AND ');
      query += where;
      countQuery += where;
    }

    query += ` ORDER BY r.created_at DESC`;
    params.push(limit);
    query += ` LIMIT $${params.length}`;
    params.push(offset);
    query += ` OFFSET $${params.length}`;

    const [result, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, -2))
    ]);

    res.json({ rides: result.rows, total: parseInt(countResult.rows[0].count), page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('Get rides error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getRideById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT r.*,
             u1.first_name AS passenger_first, u1.last_name AS passenger_last, u1.phone AS passenger_phone,
             u2.first_name AS driver_first, u2.last_name AS driver_last, u2.phone AS driver_phone
      FROM rides r
      LEFT JOIN users u1 ON r.passenger_id = u1.id
      LEFT JOIN driver_profiles dp ON r.driver_id = dp.id
      LEFT JOIN users u2 ON dp.user_id = u2.id
      WHERE r.id = $1
    `, [id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Ride not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get ride error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── RIDE REQUESTS (درخواستهای سفر) ─────────────────────
exports.getRideRequests = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];

    let query = `
      SELECT rr.id, rr.ride_type, rr.car_class, rr.status, rr.estimated_fare,
             rr.distance_km, rr.duration_minutes, rr.surge_multiplier,
             rr.passenger_count, rr.notes, rr.scheduled_at, rr.created_at,
             rr.pickup_address, rr.dropoff_address, rr.pickup_poi, rr.dropoff_poi,
             u.first_name, u.last_name, u.phone
      FROM ride_requests rr
      LEFT JOIN users u ON rr.passenger_id = u.id
    `;
    let countQuery = `SELECT COUNT(*) FROM ride_requests rr LEFT JOIN users u ON rr.passenger_id = u.id`;

    if (status) {
      params.push(status);
      conditions.push(`rr.status = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(u.first_name ILIKE $${params.length} OR u.last_name ILIKE $${params.length} OR u.phone ILIKE $${params.length} OR rr.pickup_address ILIKE $${params.length} OR rr.dropoff_address ILIKE $${params.length})`);
    }

    if (conditions.length) {
      const where = ' WHERE ' + conditions.join(' AND ');
      query += where;
      countQuery += where;
    }

    query += ` ORDER BY rr.created_at DESC`;
    params.push(limit);
    query += ` LIMIT $${params.length}`;
    params.push(offset);
    query += ` OFFSET $${params.length}`;

    const [result, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, -2))
    ]);

    res.json({ requests: result.rows, total: parseInt(countResult.rows[0].count), page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('Get ride requests error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── RIDE LOCATIONS (موقعیتهای سفر) ─────────────────────
exports.getRideLocations = async (req, res) => {
  try {
    const { ride_id, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];

    let query = `
      SELECT rl.id, rl.ride_id, rl.heading, rl.speed, rl.recorded_at,
             ST_X(rl.location::geometry) AS lng, ST_Y(rl.location::geometry) AS lat
      FROM ride_locations rl
    `;
    let countQuery = `SELECT COUNT(*) FROM ride_locations rl`;

    if (ride_id) {
      params.push(ride_id);
      conditions.push(`rl.ride_id = $${params.length}`);
    }

    if (conditions.length) {
      const where = ' WHERE ' + conditions.join(' AND ');
      query += where;
      countQuery += where;
    }

    query += ` ORDER BY rl.recorded_at DESC`;
    params.push(limit);
    query += ` LIMIT $${params.length}`;
    params.push(offset);
    query += ` OFFSET $${params.length}`;

    const [result, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, -2))
    ]);

    res.json({ locations: result.rows, total: parseInt(countResult.rows[0].count), page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('Get ride locations error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── RIDE STOPS (توقفهای سفر) ───────────────────────────
exports.getRideStops = async (req, res) => {
  try {
    const { ride_id, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];

    let query = `
      SELECT rs.id, rs.ride_id, rs.stop_order, rs.address,
             rs.arrival_time, rs.departure_time, rs.created_at,
             ST_X(rs.location::geometry) AS lng, ST_Y(rs.location::geometry) AS lat
      FROM ride_stops rs
    `;
    let countQuery = `SELECT COUNT(*) FROM ride_stops rs`;

    if (ride_id) {
      params.push(ride_id);
      conditions.push(`rs.ride_id = $${params.length}`);
    }

    if (conditions.length) {
      const where = ' WHERE ' + conditions.join(' AND ');
      query += where;
      countQuery += where;
    }

    query += ` ORDER BY rs.created_at DESC`;
    params.push(limit);
    query += ` LIMIT $${params.length}`;
    params.push(offset);
    query += ` OFFSET $${params.length}`;

    const [result, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, -2))
    ]);

    res.json({ stops: result.rows, total: parseInt(countResult.rows[0].count), page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('Get ride stops error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── RIDE SCHEDULES (برنامهریزی سفرها) ──────────────────
exports.getRideSchedules = async (req, res) => {
  try {
    const { is_active, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];

    let query = `
      SELECT rs.id, rs.recurrence, rs.recurrence_days, rs.next_trigger_at,
             rs.last_triggered_at, rs.is_active, rs.created_at, rs.request_template,
             u.first_name, u.last_name, u.phone
      FROM ride_schedules rs
      LEFT JOIN users u ON rs.user_id = u.id
    `;
    let countQuery = `SELECT COUNT(*) FROM ride_schedules rs`;

    if (is_active !== undefined && is_active !== '') {
      params.push(is_active === 'true');
      conditions.push(`rs.is_active = $${params.length}`);
    }

    if (conditions.length) {
      const where = ' WHERE ' + conditions.join(' AND ');
      query += where;
      countQuery += where;
    }

    query += ` ORDER BY rs.created_at DESC`;
    params.push(limit);
    query += ` LIMIT $${params.length}`;
    params.push(offset);
    query += ` OFFSET $${params.length}`;

    const [result, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, -2))
    ]);

    res.json({ schedules: result.rows, total: parseInt(countResult.rows[0].count), page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('Get ride schedules error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── RIDE MESSAGES (پیامهای سفر) ─────────────────────────
exports.getRideMessages = async (req, res) => {
  try {
    const { ride_id, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];

    let query = `
      SELECT rm.id, rm.ride_id, rm.message, rm.message_type, rm.is_read, rm.created_at,
             u.first_name, u.last_name, u.phone, u.role
      FROM ride_messages rm
      LEFT JOIN users u ON rm.sender_id = u.id
    `;
    let countQuery = `SELECT COUNT(*) FROM ride_messages rm`;

    if (ride_id) {
      params.push(ride_id);
      conditions.push(`rm.ride_id = $${params.length}`);
    }

    if (conditions.length) {
      const where = ' WHERE ' + conditions.join(' AND ');
      query += where;
      countQuery += where;
    }

    query += ` ORDER BY rm.created_at DESC`;
    params.push(limit);
    query += ` LIMIT $${params.length}`;
    params.push(offset);
    query += ` OFFSET $${params.length}`;

    const [result, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, -2))
    ]);

    res.json({ messages: result.rows, total: parseInt(countResult.rows[0].count), page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('Get ride messages error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── CREATE RIDE STOP ────────────────────────────────────
exports.createRide = async (req, res) => {
  try {
    const {
      passenger_id,
      driver_id,
      ride_type,
      car_class,
      status,
      fare,
      distance_km,
      duration_minutes,
      payment_method,
      payment_status,
      pickup_address,
      dropoff_address,
      started_at,
      completed_at,
      cancelled_at,
    } = req.body;
    // Basic validation
    if (!passenger_id || !driver_id) return res.status(400).json({ error: 'passenger_id and driver_id required' });
    const result = await pool.query(
      `INSERT INTO rides (
        passenger_id,
        driver_id,
        ride_type,
        car_class,
        status,
        fare,
        distance_km,
        duration_minutes,
        payment_method,
        payment_status,
        pickup_address,
        dropoff_address,
        started_at,
        completed_at,
        cancelled_at,
        created_at
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,NOW()
      ) RETURNING *`,
      [
        passenger_id,
        driver_id,
        ride_type || 'pending',
        car_class || 'economy',
        status || 'pending',
        fare || 0,
        distance_km || 0,
        duration_minutes || 0,
        payment_method || 'cash',
        payment_status || 'pending',
        pickup_address || null,
        dropoff_address || null,
        started_at || null,
        completed_at || null,
        cancelled_at || null,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create ride error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createRideStop = async (req, res) => {
  try {
    const { ride_id, stop_order, address, lat, lng } = req.body;
    if (!ride_id) return res.status(400).json({ error: 'ride_id required' });
    const result = await pool.query(
      `INSERT INTO ride_stops (ride_id, stop_order, location, address) VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography, $5) RETURNING id, ride_id, stop_order, address, created_at`,
      [ride_id, stop_order || 1, lng || 0, lat || 0, address || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create ride stop error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
