const otpService = require('../services/otpService');
const jwt = require('jsonwebtoken');

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

    // Generate JWT after successful verification
    const token = jwt.sign(
      { userId, role: 'passenger' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    return res.json({
      message: 'تایید موفقیت‌آمیز',
      token,
      userId
    });
  } catch (err) {
    console.error('Verify OTP error:', err.message);
    return res.status(400).json({ error: err.message });
  }
};
