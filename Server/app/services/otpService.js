const pool = require('../models/db');
const smsService = require('./smsService');

const OTP_PATTERN_ID = 'tyxk74ikj5';

const OTP_LENGTH = 5;
const OTP_EXPIRY_MINUTES = 3;
const MAX_OTP_ATTEMPTS = 3;
const RATE_LIMIT_SECONDS = 60;

function generateCode() {
  let code = '';
  for (let i = 0; i < OTP_LENGTH; i++) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
}

exports.sendOTP = async (phone, ip, userAgent) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Find or create user by phone
    let userResult = await client.query('SELECT id FROM users WHERE phone = $1', [phone]);
    let userId;
    if (userResult.rowCount === 0) {
      const insertResult = await client.query(
        'INSERT INTO users (phone, role) VALUES ($1, $2) RETURNING id',
        [phone, 'passenger']
      );
      userId = insertResult.rows[0].id;
    } else {
      userId = userResult.rows[0].id;
    }

    // Rate limit: check if last OTP was sent less than RATE_LIMIT_SECONDS ago
    const lastOtp = await client.query(
      `SELECT created_at FROM otp_tokens
       WHERE user_id = $1 AND channel = 'sms'
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
    if (lastOtp.rowCount > 0) {
      const secondsSince = (Date.now() - new Date(lastOtp.rows[0].created_at).getTime()) / 1000;
      if (secondsSince < RATE_LIMIT_SECONDS) {
        await client.query('ROLLBACK');
        const waitSeconds = Math.ceil(RATE_LIMIT_SECONDS - secondsSince);
        throw new Error(`لطفاً ${waitSeconds} ثانیه صبر کنید`);
      }
    }

    // Invalidate any pending OTPs for this user
    await client.query(
      `UPDATE otp_tokens SET status = 'expired'
       WHERE user_id = $1 AND status = 'pending' AND channel = 'sms'`,
      [userId]
    );

    // Generate and store OTP
    const code = generateCode();
    console.log('[OTP SEND] userId:', userId, 'code:', code, 'phone:', phone);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await client.query(
      `INSERT INTO otp_tokens (user_id, channel, code, status, max_attempts, expires_at, ip_address, user_agent)
       VALUES ($1, 'sms', $2, 'pending', $3, $4, $5, $6)`,
      [userId, code, MAX_OTP_ATTEMPTS, expiresAt, ip, userAgent]
    );

    await client.query('COMMIT');

    // Send SMS via pattern (outside transaction)
    try {
      await smsService.sendPattern(OTP_PATTERN_ID, phone, { code });
    } catch (smsErr) {
      console.error('SMS send error:', smsErr.message);
      // Don't fail the request — OTP is stored in DB, can be resent
    }

    return { userId, expiresAt };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

exports.verifyOTP = async (userId, code) => {
  const result = await pool.query(
    `SELECT id, code, status, attempts, max_attempts, expires_at
     FROM otp_tokens
     WHERE user_id = $1 AND channel = 'sms'
     ORDER BY created_at DESC LIMIT 1`,
    [userId]
  );

  if (result.rowCount === 0) {
    throw new Error('کد تایید یافت نشد');
  }

  const otp = result.rows[0];
  console.log('[OTP VERIFY] userId:', userId, 'received code:', code, 'db code:', otp.code, 'status:', otp.status, 'expires_at:', otp.expires_at);

  if (otp.status === 'verified') {
    throw new Error('این کد قبلاً استفاده شده');
  }

  if (otp.status === 'expired') {
    throw new Error('کد تایید منقضی شده');
  }

  if (new Date(otp.expires_at) < new Date()) {
    await pool.query(`UPDATE otp_tokens SET status = 'expired' WHERE id = $1`, [otp.id]);
    throw new Error('کد تایید منقضی شده');
  }

  if (otp.attempts >= otp.max_attempts) {
    await pool.query(`UPDATE otp_tokens SET status = 'failed' WHERE id = $1`, [otp.id]);
    throw new Error('تعداد تلاش‌ها به پایان رسیده');
  }

  // Increment attempts
  await pool.query(
    'UPDATE otp_tokens SET attempts = attempts + 1 WHERE id = $1',
    [otp.id]
  );

  if (otp.code !== code) {
    throw new Error('کد تایید نادرست است');
  }

  // Mark as verified
  await pool.query(
    `UPDATE otp_tokens SET status = 'verified', verified_at = NOW() WHERE id = $1`,
    [otp.id]
  );

  // Mark phone as verified
  await pool.query(
    'UPDATE users SET phone_verified = TRUE WHERE id = $1',
    [userId]
  );

  return { userId };
};
