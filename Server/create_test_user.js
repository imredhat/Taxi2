const pool = require('./app/models/db');
const bcrypt = require('bcrypt');

(async () => {
  try {
    const hash = await bcrypt.hash('admin123', 10);
    await pool.query(`
      INSERT INTO users (phone, password_hash, role, first_name, last_name, email, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
      ON CONFLICT (phone) DO UPDATE SET 
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        email = EXCLUDED.email,
        is_active = true,
        updated_at = NOW()
    `, ['09379062528', hash, 'super_admin', 'صابر', 'احمدپور', 'saber@example.com']);
    
    console.log('✅ User 09379062528 created/updated successfully with password: admin123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating user:', err.message);
    console.error('Stack:', err.stack);
    process.exit(1);
  }
})();