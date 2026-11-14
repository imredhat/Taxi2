const pool = require('../models/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'pooyesh_taxi_jwt_secret_2026';
const JWT_EXPIRES = '24h';

// Login controller — returns JWT token for frontend routing
exports.login = async (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || !username.trim() || typeof password !== 'string' || !password) {
    return res.status(400).json({ error: 'Missing username or password' });
  }

  try {
    const result = await pool.query(
      'SELECT id, username, password_hash, role, first_name, last_name, phone, email, is_active, is_blocked FROM users WHERE phone = $1 OR email = $1 OR LOWER(username) = LOWER($1)',
      [username.trim()]
    );
    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = result.rows[0];
    const match = user.is_active && !user.is_blocked && user.password_hash && await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    // Update last login
    await pool.query(
      'UPDATE users SET last_login_at = NOW(), last_login_ip = $1 WHERE id = $2',
      [req.ip, user.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    return res.json({
      message: 'Login successful',
      token,
      userId: user.id,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      email: user.email
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
