const pool = require('../models/db');

// List all users with optional filters
exports.getUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT id, role, phone, email, first_name, last_name, is_active, is_blocked, last_login_at, created_at FROM users';
    let countQuery = 'SELECT COUNT(*) FROM users';
    const conditions = [];
    const params = [];

    if (role) {
      params.push(role);
      conditions.push(`role = $${params.length}`);
    } else {
      conditions.push(`role != 'driver'`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(first_name ILIKE $${params.length} OR last_name ILIKE $${params.length} OR phone ILIKE $${params.length} OR email ILIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      const where = ' WHERE ' + conditions.join(' AND ');
      query += where;
      countQuery += where;
    }

    query += ' ORDER BY created_at DESC';
    params.push(limit);
    query += ` LIMIT $${params.length}`;
    params.push(offset);
    query += ` OFFSET $${params.length}`;

    const [result, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, -2))
    ]);

    return res.json({
      users: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (err) {
    console.error('Get users error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Get single user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, role, phone, email, first_name, last_name, gender, birth_date, is_active, is_blocked, block_reason, last_login_at, created_at FROM users WHERE id = $1',
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    console.error('Get user error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Toggle user active/block status
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active, is_blocked, block_reason } = req.body;
    const result = await pool.query(
      'UPDATE users SET is_active = COALESCE($1, is_active), is_blocked = COALESCE($2, is_blocked), block_reason = COALESCE($3, block_reason), updated_at = NOW() WHERE id = $4 RETURNING id, is_active, is_blocked',
      [is_active, is_blocked, block_reason, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'User not found' });
    return res.json(result.rows[0]);
  } catch (err) { console.error('Update user error:', err); return res.status(500).json({ error: 'Server error' }); }
};

// Create new user
exports.createUser = async (req, res) => {
  try {
    const { phone, password, first_name, last_name, email, role } = req.body;
    if (!phone || !password) return res.status(400).json({ error: 'Phone and password required' });
    const bcrypt = require('bcrypt');
    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (phone, password_hash, first_name, last_name, email, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, phone, first_name, last_name, email, role, created_at`,
      [phone, password_hash, first_name || null, last_name || null, email || null, role || 'passenger']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'تلفن یا ایمیل تکراری است' });
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { phone, first_name, last_name, email, role, gender, birth_date } = req.body;
    const result = await pool.query(
      `UPDATE users SET phone=COALESCE($1, phone), first_name=COALESCE($2, first_name), last_name=COALESCE($3, last_name), email=COALESCE($4, email), role=COALESCE($5, role), gender=COALESCE($6, gender), birth_date=COALESCE($7, birth_date) WHERE id=$8 RETURNING id, phone, first_name, last_name, email, role, gender, birth_date`,
      [phone, first_name, last_name, email, role, gender, birth_date, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'User not found' });
    return res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'تلفن یا ایمیل تکراری است' });
    console.error('Update user error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
