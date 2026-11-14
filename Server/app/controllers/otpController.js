const otpService = require('../services/otpService');
const jwt = require('jsonwebtoken');
const pool = require('../models/db');

const JWT_SECRET = process.env.JWT_SECRET || 'pooyesh_taxi_jwt_secret_2026';
const JWT_EXPIRES = '24h';

exports.sendOtp = async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'شماره موبایل الزامی است' });
  }

  // Basic phone validation (Iranian numbers: 09XXXXXXXXX or +989XXXXXXXXX)
  const cleaned = phone.replace(/[\s\-]/g, '');
  const validFormats = /^(09\d{9}|\+989\d{9})$/.test(cleaned);
  if (!validFormats) {
    return res.status(400).json({ error: 'شماره موبایل معتبر نیست' });
  }

  // Normalize to +98 format
  const normalized = cleaned.startsWith('+98') ? cleaned : '+98' + cleaned.substring(1);

  try {
    const { userId, expiresAt } = await otpService.sendOTP(
      normalized,
      req.ip,
      req.headers['user-agent']
    );

    return res.json({
      message: 'کد تایید ارسال شد',
      userId,
      expiresAt
    });
  } catch (err) {
    console.error('Send OTP error:', err.message);
    return res.status(500).json({ error: err.message || 'خطا در ارسال کد تایید' });
  }
};

exports.verifyOtp = async (req, res) => {
  const { userId, code } = req.body;
  if (!userId || !code) {
    return res.status(400).json({ error: 'userId و کد تایید الزامی است' });
  }

  try {
    await otpService.verifyOTP(userId, code);

    let role = 'passenger';
    if (req.body.purpose === 'driver') {
      const result = await pool.query("SELECT id FROM users WHERE id=$1 AND role='driver' AND is_active AND NOT is_blocked", [userId]);
      if (!result.rowCount) return res.status(403).json({ error: 'حساب راننده فعال نیست.' });
      role = 'driver';
    }
    // Generate JWT after successful verification
    const token = jwt.sign(
      { userId, role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    return res.json({
      message: 'تایید موفقیت‌آمیز',
      token,
      role,
      userId
    });
  } catch (err) {
    console.error('Verify OTP error:', err.message);
    return res.status(400).json({ error: err.message });
  }
};
