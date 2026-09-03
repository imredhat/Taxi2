const pool = require('../models/db');
const bcrypt = require('bcrypt');
const path = require('path');

const SERVER_PORT = process.env.PORT || 3001;
const BASE_URL = `http://localhost:${SERVER_PORT}`;

// ─── CREATE DRIVER (کاربر + پروفایل + کیف پول در یک تراکنش) ──
exports.createDriver = async (req, res) => {
  const client = await pool.connect();
  try {
    const b = req.body || {};

    // اعتبارسنجی فیلدهای الزامی
    if (!b.phone || !b.password) return res.status(400).json({ error: 'شماره تلفن و رمز عبور الزامی است' });
    if (!/^\d{10,15}$/.test(String(b.phone).replace(/\D/g, ''))) return res.status(400).json({ error: 'شماره تلفن نامعتبر است' });
    if (String(b.password).length < 4) return res.status(400).json({ error: 'رمز عبور حداقل ۴ کاراکتر است' });

    const password_hash = await bcrypt.hash(b.password, 10);

    await client.query('BEGIN');

    // ۱) ساخت کاربر با نقش راننده
    const userRes = await client.query(
      `INSERT INTO users
         (role, phone, password_hash, national_code, first_name, last_name, email, gender, birth_date)
       VALUES ('driver', $1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, phone, first_name, last_name, email, role`,
      [
        b.phone,
        password_hash,
        b.national_code || null,
        b.first_name || null,
        b.last_name || null,
        b.email || null,
        b.gender || null,        // 'male' | 'female' | 'other'
        b.birth_date || null
      ]
    );
    const userId = userRes.rows[0].id;

    // ۲) ساخت پروفایل راننده
    const profileRes = await client.query(
      `INSERT INTO driver_profiles
         (user_id, status, is_verified, license_number, license_expiry,
          insurance_number, insurance_expiry, bank_name, bank_account_number,
          bank_card_number, bank_account_holder, training_completed)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        userId,
        'online',
        true,
        b.license_number || null,
        b.license_expiry || null,
        b.insurance_number || null,
        b.insurance_expiry || null,
        b.bank_name || null,
        b.bank_account_number || null,
        b.bank_card_number || null,
        b.bank_account_holder || null,
        b.training_completed === true || b.training_completed === 'true'
      ]
    );

    // ۳) ساخت کیف پول برای راننده
    await client.query(
      `INSERT INTO wallets (user_id, balance, frozen_balance) VALUES ($1, 0, 0) ON CONFLICT (user_id) DO NOTHING`,
      [userId]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'راننده با موفقیت افزوده شد',
      user: userRes.rows[0],
      driver_profile: profileRes.rows[0]
    });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {
      const field = err.constraint && err.constraint.includes('phone') ? 'شماره تلفن'
                  : err.constraint && err.constraint.includes('national_code') ? 'کد ملی'
                  : err.constraint && err.constraint.includes('email') ? 'ایمیل' : 'اطلاعات';
      return res.status(409).json({ error: `${field} تکراری است` });
    }
    console.error('Create driver error:', err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
};

// ─── CREATE DRIVER FROM FORM (فرم چند مرحله‌ای با آپلود فایل) ──
exports.createDriverFromForm = async (req, res) => {
  const client = await pool.connect();
  try {
    const b = req.body || {};
    const files = req.files || {};

    // اعتبارسنجی فیلدهای الزامی
    if (!b.phone || !b.password) return res.status(400).json({ error: 'شماره تلفن و رمز عبور الزامی است' });
    if (String(b.password).length < 4) return res.status(400).json({ error: 'رمز عبور حداقل ۴ کاراکتر است' });

    const password_hash = await bcrypt.hash(b.password, 10);

    await client.query('BEGIN');

    // ۱) ساخت کاربر با نقش راننده
    const genderMap = { 'مرد': 'male', 'زن': 'female' };
    const userRes = await client.query(
      `INSERT INTO users
         (role, phone, password_hash, national_code, first_name, last_name, email, gender, birth_date)
       VALUES ('driver', $1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, phone, first_name, last_name, role`,
      [
        b.phone,
        password_hash,
        b.national_id || null,
        b.first_name || null,
        b.last_name || null,
        b.email || null,
        genderMap[b.gender] || 'other',
        b.birth_date || null
      ]
    );
    const userId = userRes.rows[0].id;

    // ۲) ساخت پروفایل راننده با اطلاعات تکمیلی
    const profileRes = await client.query(
      `INSERT INTO driver_profiles
         (user_id, status, is_verified, license_number, license_expiry,
          insurance_number, insurance_expiry, bank_name, bank_account_number,
          bank_card_number, bank_account_holder, training_completed, notes,
          mobile, mobile_2, education_level, foreign_language,
          foreign_language_proficiency, address, postal_code, iban, home_phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
       RETURNING *`,
      [
        userId,
        'online',
        true,
        b.license_number || null,
        b.license_expiry || null,
        b.insurance_number || null,
        b.insurance_expiry || null,
        b.bank_name || null,
        b.bank_account_number || null,
        b.bank_card_number || null,
        b.bank_account_holder || null,
        b.training_completed === true || b.training_completed === 'true',
        b.notes || null,
        b.mobile || null,
        b.mobile_2 || null,
        b.education_level || null,
        b.foreign_language || null,
        b.foreign_language_proficiency || null,
        b.address || null,
        b.postal_code || null,
        b.iban || null,
        b.home_phone || null
      ]
    );
    const driverId = profileRes.rows[0].id;

    // ۳) ساخت کیف پول برای راننده
    await client.query(
      `INSERT INTO wallets (user_id, balance, frozen_balance) VALUES ($1, 0, 0) ON CONFLICT (user_id) DO NOTHING`,
      [userId]
    );

    // ۴) ذخیره خودرو (اگر اطلاعات خودرو وارد شده باشد)
    if (b.brand || b.plate_part1 || b.plate_part2) {
      const licensePlate = `${b.plate_part1 || ''} ${b.plate_part2 || ''} ${b.plate_letter || ''} ${b.plate_part3 || ''}`.trim();
      if (licensePlate && licensePlate !== ' ') {
        // پیدا کردن model_id بر اساس brand name
        let modelId = null;
        if (b.brand) {
          const modelRes = await client.query(
            `SELECT cm.id FROM car_models cm JOIN car_brands cb ON cm.brand_id = cb.id WHERE cb.name = $1 OR cb.name_fa = $1 LIMIT 1`,
            [b.brand]
          );
          if (modelRes.rows.length > 0) {
            modelId = modelRes.rows[0].id;
          }
        }

        await client.query(
          `INSERT INTO vehicles (driver_id, model_id, license_plate, color, year, vin, insurance_expiry, owner_name, fuel_type, plate_letter)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            driverId,
            modelId,
            licensePlate,
            b.color || null,
            b.year || null,
            b.vin || null,
            b.insurance_expiry_date || null,
            b.owner || null,
            b.fuel_type || null,
            b.plate_letter || null
          ]
        );
      }
    }

    // ۵) ذخیره مدارک آپلود شده
    const documentTypes = {
      'ax': 'selfie',
      'scan_melli': 'national_card',
      'scan_govahiname': 'driver_license',
      'scan_car_card': 'vehicle_registration_front',
      'scan_car_card_back': 'vehicle_registration_back',
      'scan_insurance': 'insurance',
      'scan_insurance_Addendum': 'insurance_addendum',
      'scan_so_pishineh': 'background_check',
      'scan_salamat': 'health_certificate'
    };

    for (const [fieldName, docType] of Object.entries(documentTypes)) {
      if (files[fieldName] && files[fieldName][0]) {
        const fileUrl = `${BASE_URL}/uploads/${files[fieldName][0].filename}`;
        await client.query(
          `INSERT INTO driver_documents (driver_id, document_type, file_url, file_name, is_verified)
           VALUES ($1, $2, $3, $4, $5)`,
          [driverId, docType, fileUrl, files[fieldName][0].originalname, false]
        );
      }
    }

    // ۶) ذخیره تصاویر خودرو
    const photoTypes = {
      'pic_front': 'vehicle_front',
      'pic_back': 'vehicle_back',
      'pic_in_front': 'vehicle_interior_front',
      'pic_in_back': 'vehicle_interior_back'
    };

    for (const [fieldName, photoType] of Object.entries(photoTypes)) {
      if (files[fieldName] && files[fieldName][0]) {
        const fileUrl = `${BASE_URL}/uploads/${files[fieldName][0].filename}`;
        await client.query(
          `INSERT INTO driver_documents (driver_id, document_type, file_url, file_name, is_verified)
           VALUES ($1, $2, $3, $4, $5)`,
          [driverId, photoType, fileUrl, files[fieldName][0].originalname, false]
        );
      }
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'راننده با موفقیت ثبت شد',
      user: userRes.rows[0],
      driver_profile: profileRes.rows[0]
    });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {
      const field = err.constraint && err.constraint.includes('phone') ? 'شماره تلفن'
                  : err.constraint && err.constraint.includes('national_code') ? 'کد ملی'
                  : err.constraint && err.constraint.includes('email') ? 'ایمیل' : 'اطلاعات';
      return res.status(409).json({ error: `${field} تکراری است` });
    }
    console.error('Create driver from form error:', err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
};

// ─── DRIVER PROFILES (پروفایل رانندگان) ──────────────────
exports.getDriverProfiles = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];

    let query = `
      SELECT dp.id, dp.status, dp.rating, dp.total_rides, dp.total_earnings,
             dp.is_verified, dp.license_number, dp.license_expiry,
             dp.bank_name, dp.bank_account_number,
             dp.created_at,
             u.first_name, u.last_name, u.phone, u.email, u.avatar_url,
             (SELECT dd.file_url FROM driver_documents dd WHERE dd.driver_id = dp.id AND dd.document_type = 'selfie' LIMIT 1) AS selfie_url
      FROM driver_profiles dp
      LEFT JOIN users u ON dp.user_id = u.id
    `;
    let countQuery = `SELECT COUNT(*) FROM driver_profiles dp LEFT JOIN users u ON dp.user_id = u.id`;

    if (status) { params.push(status); conditions.push(`dp.status = $${params.length}`); }
    else { conditions.push(`dp.status != 'deleted'`); }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(u.first_name ILIKE $${params.length} OR u.last_name ILIKE $${params.length} OR u.phone ILIKE $${params.length} OR dp.license_number ILIKE $${params.length})`);
    }

    if (conditions.length) { const w = ' WHERE ' + conditions.join(' AND '); query += w; countQuery += w; }
    query += ` ORDER BY dp.created_at DESC`;
    params.push(limit); query += ` LIMIT $${params.length}`;
    params.push(offset); query += ` OFFSET $${params.length}`;

    const [result, countResult] = await Promise.all([pool.query(query, params), pool.query(countQuery, params.slice(0, -2))]);
    res.json({ drivers: result.rows, total: parseInt(countResult.rows[0].count), page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { console.error('Get drivers error:', err); res.status(500).json({ error: 'Server error' }); }
};

exports.getDriverById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT dp.*, u.first_name, u.last_name, u.phone, u.email, u.avatar_url, u.gender, u.birth_date, u.national_code
      FROM driver_profiles dp LEFT JOIN users u ON dp.user_id = u.id WHERE dp.id = $1
    `, [id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Driver not found' });
    res.json(result.rows[0]);
  } catch (err) { console.error('Get driver error:', err); res.status(500).json({ error: 'Server error' }); }
};

exports.softDeleteDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE driver_profiles SET status = 'deleted', updated_at = NOW() WHERE id = $1 RETURNING id, status`,
      [id]
    );
    if (!result.rowCount) return res.status(404).json({ error: 'Driver not found' });
    res.json({ message: 'راننده با موفقیت حذف شد' });
  } catch (err) { console.error('Delete driver error:', err); res.status(500).json({ error: 'Server error' }); }
};

exports.verifyDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_verified } = req.body;
    const result = await pool.query(
      `UPDATE driver_profiles SET is_verified = $1, verified_at = CASE WHEN $1 = true THEN NOW() ELSE NULL END, updated_at = NOW() WHERE id = $2 RETURNING id, is_verified, verified_at`,
      [is_verified, id]
    );
    if (!result.rowCount) return res.status(404).json({ error: 'Driver not found' });
    res.json(result.rows[0]);
  } catch (err) { console.error('Verify driver error:', err); res.status(500).json({ error: 'Server error' }); }
};

exports.updateDriver = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const b = req.body || {};

    await client.query('BEGIN');

    // Get the driver profile to find the user_id
    const dpRes = await client.query('SELECT user_id FROM driver_profiles WHERE id = $1', [id]);
    if (!dpRes.rowCount) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Driver not found' }); }
    const userId = dpRes.rows[0].user_id;

    // Update users table
    const genderMap = { 'مرد': 'male', 'زن': 'female', 'male': 'male', 'female': 'female', 'other': 'other' };
    const genderVal = b.gender ? (genderMap[b.gender] || b.gender) : null;
    if (b.first_name !== undefined || b.last_name !== undefined || b.phone !== undefined || b.email !== undefined || b.gender !== undefined || b.birth_date !== undefined || b.national_id !== undefined) {
      await client.query(
        `UPDATE users SET first_name = COALESCE($1, first_name), last_name = COALESCE($2, last_name), phone = COALESCE($3, phone), email = COALESCE($4, email), gender = COALESCE($5, gender), birth_date = COALESCE($6, birth_date), national_code = COALESCE($7, national_code) WHERE id = $8`,
        [b.first_name, b.last_name, b.phone, b.email, genderVal, b.birth_date, b.national_id, userId]
      );
    }

    // Update driver_profiles table
    await client.query(
      `UPDATE driver_profiles SET
        status = COALESCE($1, status), is_verified = COALESCE($2, is_verified),
        license_number = COALESCE($3, license_number), license_expiry = COALESCE($4, license_expiry),
        insurance_number = COALESCE($5, insurance_number), insurance_expiry = COALESCE($6, insurance_expiry),
        bank_name = COALESCE($7, bank_name), bank_account_number = COALESCE($8, bank_account_number),
        bank_card_number = COALESCE($9, bank_card_number), bank_account_holder = COALESCE($10, bank_account_holder),
        training_completed = COALESCE($11, training_completed), notes = COALESCE($12, notes),
        mobile = COALESCE($13, mobile), mobile_2 = COALESCE($14, mobile_2),
        education_level = COALESCE($15, education_level), foreign_language = COALESCE($16, foreign_language),
        foreign_language_proficiency = COALESCE($17, foreign_language_proficiency), address = COALESCE($18, address),
        postal_code = COALESCE($19, postal_code), iban = COALESCE($20, iban),
        verified_at = CASE WHEN $2 = true AND verified_at IS NULL THEN NOW() WHEN $2 = false THEN NULL ELSE verified_at END
       WHERE id = $21`,
      [
        b.status, b.is_verified,
        b.license_number, b.license_expiry,
        b.insurance_number, b.insurance_expiry,
        b.bank_name, b.bank_account_number,
        b.bank_card_number, b.bank_account_holder,
        b.training_completed, b.notes,
        b.mobile, b.mobile_2,
        b.education_level, b.foreign_language,
        b.foreign_language_proficiency, b.address,
        b.postal_code, b.iban, id
      ]
    );

    await client.query('COMMIT');
    res.json({ message: 'راننده با موفقیت بروزرسانی شد' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Update driver error:', err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
};

// ─── DRIVER DOCUMENTS (مدارک رانندگان) ───────────────────
exports.getDriverDocuments = async (req, res) => {
  try {
    const { driver_id, is_verified, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];

    let query = `
      SELECT dd.id, dd.document_type, dd.file_url, dd.file_name, dd.is_verified,
             dd.verified_at, dd.rejection_reason, dd.expires_at, dd.created_at,
             dd.driver_id,
             u.first_name, u.last_name, u.phone,
             v.license_plate, cm.name_fa AS model_name, cb.name_fa AS brand_name
      FROM driver_documents dd
      LEFT JOIN driver_profiles dp ON dd.driver_id = dp.id
      LEFT JOIN users u ON dp.user_id = u.id
      LEFT JOIN vehicles v ON v.driver_id = dp.id
      LEFT JOIN car_models cm ON v.model_id = cm.id
      LEFT JOIN car_brands cb ON cm.brand_id = cb.id
    `;
    let countQuery = `SELECT COUNT(*) FROM driver_documents dd`;

    if (driver_id) { params.push(driver_id); conditions.push(`dd.driver_id = $${params.length}`); }
    if (is_verified !== undefined && is_verified !== '') { params.push(is_verified === 'true'); conditions.push(`dd.is_verified = $${params.length}`); }

    if (conditions.length) { const w = ' WHERE ' + conditions.join(' AND '); query += w; countQuery += w; }
    query += ` ORDER BY dd.created_at DESC`;
    params.push(limit); query += ` LIMIT $${params.length}`;
    params.push(offset); query += ` OFFSET $${params.length}`;

    const [result, countResult] = await Promise.all([pool.query(query, params), pool.query(countQuery, params.slice(0, -2))]);
    res.json({ documents: result.rows, total: parseInt(countResult.rows[0].count), page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { console.error('Get documents error:', err); res.status(500).json({ error: 'Server error' }); }
};

exports.verifyDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_verified, rejection_reason } = req.body;
    const result = await pool.query(
      `UPDATE driver_documents SET is_verified = $1, rejection_reason = $2, verified_at = CASE WHEN $1 = true THEN NOW() ELSE NULL END WHERE id = $3 RETURNING id, is_verified, verified_at`,
      [is_verified, rejection_reason || null, id]
    );
    if (!result.rowCount) return res.status(404).json({ error: 'Document not found' });
    res.json(result.rows[0]);
  } catch (err) { console.error('Verify document error:', err); res.status(500).json({ error: 'Server error' }); }
};

exports.createDriverDocument = async (req, res) => {
  try {
    const { driver_id, document_type, is_verified } = req.body;
    if (!driver_id || !document_type) return res.status(400).json({ error: 'driver_id and document_type are required' });

    let fileUrl = null;
    let fileName = null;
    if (req.file) {
      fileUrl = `${BASE_URL}/uploads/${req.file.filename}`;
      fileName = req.file.originalname;
    }

    const verified = is_verified === true || is_verified === 'true';

    // Check if document already exists for this driver and type
    const existing = await pool.query(
      'SELECT id FROM driver_documents WHERE driver_id = $1 AND document_type = $2',
      [driver_id, document_type]
    );

    let result;
    if (existing.rowCount > 0) {
      // Update existing document
      result = await pool.query(
        `UPDATE driver_documents SET file_url = COALESCE($1, file_url), file_name = COALESCE($2, file_name), is_verified = $3
         WHERE id = $4 RETURNING *`,
        [fileUrl, fileName, verified, existing.rows[0].id]
      );
    } else {
      // Insert new document
      result = await pool.query(
        `INSERT INTO driver_documents (driver_id, document_type, file_url, file_name, is_verified)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [driver_id, document_type, fileUrl, fileName, verified]
      );
    }

    res.status(201).json(result.rows[0]);
  } catch (err) { console.error('Create document error:', err); res.status(500).json({ error: 'Server error' }); }
};

exports.deleteDriverDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM driver_documents WHERE id = $1 RETURNING id', [id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Document not found' });
    res.json({ message: 'مدرک با موفقیت حذف شد' });
  } catch (err) { console.error('Delete document error:', err); res.status(500).json({ error: 'Server error' }); }
};

// ─── DRIVER LOCATIONS (موقعیت رانندگان) ──────────────────
exports.getDriverLocations = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const query = `
      SELECT dl.id, dl.heading, dl.speed, dl.accuracy, dl.updated_at,
             ST_X(dl.location::geometry) AS lng, ST_Y(dl.location::geometry) AS lat,
             u.first_name, u.last_name, u.phone, dp.status AS driver_status, dp.rating
      FROM driver_locations dl
      LEFT JOIN driver_profiles dp ON dl.driver_id = dp.id
      LEFT JOIN users u ON dp.user_id = u.id
      ORDER BY dl.updated_at DESC LIMIT $1 OFFSET $2
    `;
    const countQuery = `SELECT COUNT(*) FROM driver_locations`;

    const [result, countResult] = await Promise.all([pool.query(query, [limit, offset]), pool.query(countQuery)]);
    res.json({ locations: result.rows, total: parseInt(countResult.rows[0].count), page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { console.error('Get driver locations error:', err); res.status(500).json({ error: 'Server error' }); }
};

// ─── DRIVER SCHEDULES (برنامه کاری رانندگان) ─────────────
exports.getDriverSchedules = async (req, res) => {
  try {
    const { driver_id, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];

    let query = `
      SELECT ds.id, ds.day_of_week, ds.start_time, ds.end_time, ds.is_active, ds.created_at,
             ds.driver_id,
             u.first_name, u.last_name, u.phone
      FROM driver_schedules ds
      LEFT JOIN driver_profiles dp ON ds.driver_id = dp.id
      LEFT JOIN users u ON dp.user_id = u.id
    `;
    let countQuery = `SELECT COUNT(*) FROM driver_schedules ds`;

    if (driver_id) { params.push(driver_id); conditions.push(`ds.driver_id = $${params.length}`); }
    if (conditions.length) { const w = ' WHERE ' + conditions.join(' AND '); query += w; countQuery += w; }
    query += ` ORDER BY ds.day_of_week ASC, ds.start_time ASC`;
    params.push(limit); query += ` LIMIT $${params.length}`;
    params.push(offset); query += ` OFFSET $${params.length}`;

    const [result, countResult] = await Promise.all([pool.query(query, params), pool.query(countQuery, params.slice(0, -2))]);
    res.json({ schedules: result.rows, total: parseInt(countResult.rows[0].count), page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { console.error('Get driver schedules error:', err); res.status(500).json({ error: 'Server error' }); }
};

// ─── VEHICLES (خودروها) ──────────────────────────────────
exports.getVehicles = async (req, res) => {
  try {
    const { car_class, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];

    let query = `
      SELECT v.id, v.color, v.color_fa, v.license_plate, v.year, v.car_class,
             v.is_active, v.insurance_expiry, v.inspection_expiry, v.created_at,
             u.first_name, u.last_name, u.phone,
             cm.name AS model_name, cm.name_fa AS model_name_fa,
             cb.name AS brand_name, cb.name_fa AS brand_name_fa
      FROM vehicles v
      LEFT JOIN driver_profiles dp ON v.driver_id = dp.id
      LEFT JOIN users u ON dp.user_id = u.id
      LEFT JOIN car_models cm ON v.model_id = cm.id
      LEFT JOIN car_brands cb ON cm.brand_id = cb.id
    `;
    let countQuery = `SELECT COUNT(*) FROM vehicles v`;

    if (car_class) { params.push(car_class); conditions.push(`v.car_class = $${params.length}`); }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(u.first_name ILIKE $${params.length} OR u.last_name ILIKE $${params.length} OR v.license_plate ILIKE $${params.length} OR cm.name ILIKE $${params.length} OR cb.name ILIKE $${params.length})`);
    }

    if (conditions.length) { const w = ' WHERE ' + conditions.join(' AND '); query += w; countQuery += w; }
    query += ` ORDER BY v.created_at DESC`;
    params.push(limit); query += ` LIMIT $${params.length}`;
    params.push(offset); query += ` OFFSET $${params.length}`;

    const [result, countResult] = await Promise.all([pool.query(query, params), pool.query(countQuery, params.slice(0, -2))]);
    res.json({ vehicles: result.rows, total: parseInt(countResult.rows[0].count), page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { console.error('Get vehicles error:', err); res.status(500).json({ error: 'Server error' }); }
};

// ─── CAR BRANDS (برندهای خودرو) ──────────────────────────
exports.getCarBrands = async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];

    let query = `SELECT id, name, name_fa, logo_url, is_active, created_at FROM car_brands`;
    let countQuery = `SELECT COUNT(*) FROM car_brands`;

    if (search) { params.push(`%${search}%`); conditions.push(`(name ILIKE $${params.length} OR name_fa ILIKE $${params.length})`); }
    if (conditions.length) { const w = ' WHERE ' + conditions.join(' AND '); query += w; countQuery += w; }
    query += ` ORDER BY name ASC`;
    params.push(limit); query += ` LIMIT $${params.length}`;
    params.push(offset); query += ` OFFSET $${params.length}`;

    const [result, countResult] = await Promise.all([pool.query(query, params), pool.query(countQuery, params.slice(0, -2))]);
    res.json({ brands: result.rows, total: parseInt(countResult.rows[0].count), page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { console.error('Get car brands error:', err); res.status(500).json({ error: 'Server error' }); }
};

exports.createCarBrand = async (req, res) => {
  try {
    const { name, name_fa, logo_url } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const result = await pool.query(
      `INSERT INTO car_brands (name, name_fa, logo_url) VALUES ($1, $2, $3) RETURNING *`,
      [name, name_fa || null, logo_url || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { console.error('Create brand error:', err); res.status(500).json({ error: 'Server error' }); }
};

exports.updateCarBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, name_fa, logo_url, is_active } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const result = await pool.query(
      `UPDATE car_brands SET name = $1, name_fa = $2, logo_url = $3, is_active = $4 WHERE id = $5 RETURNING *`,
      [name, name_fa || null, logo_url || null, is_active !== undefined ? is_active : true, id]
    );
    if (!result.rowCount) return res.status(404).json({ error: 'Brand not found' });
    res.json(result.rows[0]);
  } catch (err) { console.error('Update brand error:', err); res.status(500).json({ error: 'Server error' }); }
};

exports.deleteCarBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM car_brands WHERE id = $1 RETURNING id', [id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Brand not found' });
    res.json({ message: 'برند با موفقیت حذف شد', id: result.rows[0].id });
  } catch (err) {
    if (err.code === '23503') return res.status(400).json({ error: 'این برند دارای مدل‌های فعال است و قابل حذف نیست' });
    console.error('Delete brand error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── CAR MODELS (مدلهای خودرو) ──────────────────────────
exports.getCarModels = async (req, res) => {
  try {
    const { brand_id, vehicle_class, search, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];

    let query = `
      SELECT cm.id, cm.name, cm.name_fa, cm.vehicle_class, cm.is_active, cm.created_at,
             cm.brand_id, cb.name AS brand_name, cb.name_fa AS brand_name_fa
      FROM car_models cm
      LEFT JOIN car_brands cb ON cm.brand_id = cb.id
    `;
    let countQuery = `SELECT COUNT(*) FROM car_models cm`;

    if (brand_id) { params.push(brand_id); conditions.push(`cm.brand_id = $${params.length}`); }
    if (vehicle_class) { params.push(vehicle_class); conditions.push(`cm.vehicle_class = $${params.length}`); }
    if (search) { params.push(`%${search}%`); conditions.push(`(cm.name ILIKE $${params.length} OR cm.name_fa ILIKE $${params.length})`); }

    if (conditions.length) { const w = ' WHERE ' + conditions.join(' AND '); query += w; countQuery += w; }
    query += ` ORDER BY cb.name ASC, cm.name ASC`;
    params.push(limit); query += ` LIMIT $${params.length}`;
    params.push(offset); query += ` OFFSET $${params.length}`;

    const [result, countResult] = await Promise.all([pool.query(query, params), pool.query(countQuery, params.slice(0, -2))]);
    res.json({ models: result.rows, total: parseInt(countResult.rows[0].count), page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { console.error('Get car models error:', err); res.status(500).json({ error: 'Server error' }); }
};

exports.createCarModel = async (req, res) => {
  try {
    const { brand_id, name, name_fa, vehicle_class } = req.body;
    if (!brand_id || !name || !vehicle_class) return res.status(400).json({ error: 'brand_id, name, vehicle_class required' });
    const result = await pool.query(
      `INSERT INTO car_models (brand_id, name, name_fa, vehicle_class) VALUES ($1, $2, $3, $4) RETURNING *`,
      [brand_id, name, name_fa || null, vehicle_class]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { console.error('Create model error:', err); res.status(500).json({ error: 'Server error' }); }
};

exports.updateCarModel = async (req, res) => {
  try {
    const { id } = req.params;
    const { brand_id, name, name_fa, vehicle_class, is_active } = req.body;
    if (!brand_id || !name || !vehicle_class) return res.status(400).json({ error: 'brand_id, name, vehicle_class required' });
    const result = await pool.query(
      `UPDATE car_models SET brand_id = $1, name = $2, name_fa = $3, vehicle_class = $4, is_active = $5 WHERE id = $6 RETURNING *`,
      [brand_id, name, name_fa || null, vehicle_class, is_active !== undefined ? is_active : true, id]
    );
    if (!result.rowCount) return res.status(404).json({ error: 'Model not found' });
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23503') return res.status(400).json({ error: 'برند مورد نظر یافت نشد' });
    console.error('Update model error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteCarModel = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM car_models WHERE id = $1 RETURNING id', [id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Model not found' });
    res.json({ message: 'مدل با موفقیت حذف شد', id: result.rows[0].id });
  } catch (err) {
    if (err.code === '23503') return res.status(400).json({ error: 'این مدل دارای خودروهای فعال است و قابل حذف نیست' });
    console.error('Delete model error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── CREATE DRIVER SCHEDULE ──────────────────────────────
exports.createDriverSchedule = async (req, res) => {
  try {
    const { driver_id, day_of_week, start_time, end_time } = req.body;
    if (!driver_id || day_of_week === undefined || !start_time || !end_time) return res.status(400).json({ error: 'All fields required' });
    const result = await pool.query(
      `INSERT INTO driver_schedules (driver_id, day_of_week, start_time, end_time) VALUES ($1, $2, $3, $4) RETURNING *`,
      [driver_id, day_of_week, start_time, end_time]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { console.error('Create schedule error:', err); res.status(500).json({ error: 'Server error' }); }
};

// ─── CREATE VEHICLE ──────────────────────────────────────
exports.createVehicle = async (req, res) => {
  try {
    const { driver_id, model_id, license_plate, color, year, car_class } = req.body;
    if (!driver_id || !license_plate) return res.status(400).json({ error: 'driver_id and license_plate required' });
    const result = await pool.query(
      `INSERT INTO vehicles (driver_id, model_id, license_plate, color, year, car_class) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [driver_id, model_id || null, license_plate, color || null, year || null, car_class || 'economy']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'پلاک تکراری است' });
    console.error('Create vehicle error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { driver_id, model_id, license_plate, color, year, car_class, is_active, insurance_expiry, inspection_expiry } = req.body;
    if (!driver_id || !license_plate) return res.status(400).json({ error: 'driver_id and license_plate required' });
    const result = await pool.query(
      `UPDATE vehicles SET driver_id = $1, model_id = $2, license_plate = $3, color = $4, year = $5, car_class = $6, is_active = $7, insurance_expiry = $8, inspection_expiry = $9, updated_at = NOW() WHERE id = $10 RETURNING *`,
      [driver_id, model_id || null, license_plate, color || null, year || null, car_class || 'economy', is_active !== undefined ? is_active : true, insurance_expiry || null, inspection_expiry || null, id]
    );
    if (!result.rowCount) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'پلاک تکراری است' });
    console.error('Update vehicle error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM vehicles WHERE id = $1 RETURNING id', [id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Vehicle not found' });
    res.json({ message: 'خودرو با موفقیت حذف شد', id: result.rows[0].id });
  } catch (err) {
    console.error('Delete vehicle error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getDrivers = async (req, res) => {
  try {
    const { search, page = 1, limit = 100 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];

    let query = `
      SELECT dp.id, u.first_name, u.last_name, u.phone
      FROM driver_profiles dp
      LEFT JOIN users u ON dp.user_id = u.id
    `;
    let countQuery = `SELECT COUNT(*) FROM driver_profiles dp`;

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(u.first_name ILIKE $${params.length} OR u.last_name ILIKE $${params.length} OR u.phone ILIKE $${params.length})`);
    }

    if (conditions.length) { const w = ' WHERE ' + conditions.join(' AND '); query += w; countQuery += w; }
    query += ` ORDER BY u.first_name ASC, u.last_name ASC`;
    params.push(limit); query += ` LIMIT $${params.length}`;
    params.push(offset); query += ` OFFSET $${params.length}`;

    const [result, countResult] = await Promise.all([pool.query(query, params), pool.query(countQuery, params.slice(0, -2))]);
    res.json({ drivers: result.rows, total: parseInt(countResult.rows[0].count), page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { console.error('Get drivers error:', err); res.status(500).json({ error: 'Server error' }); }
};
