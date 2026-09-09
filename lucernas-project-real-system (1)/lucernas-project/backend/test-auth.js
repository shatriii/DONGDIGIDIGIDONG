// test-auth.js
const pool = require('./config/db');
const bcrypt = require('bcryptjs');

async function seedAndTest() {
  // Insert a test admin
  const hash = await bcrypt.hash('admin123', 12);
  await pool.query(
    `INSERT INTO system_admin (sysadmail, passwordhash, tixgenerator, sysaccessauthorization, eventcreator)
     VALUES ($1, $2, true, true, true)
     ON CONFLICT DO NOTHING`,
    ['admin@tsu.edu', hash]
  );

  // Try to fetch it back
  const result = await pool.query(
    'SELECT adminid, sysadmail FROM system_admin WHERE sysadmail = $1',
    ['admin@tsu.edu']
  );

  if (result.rows.length > 0) {
    console.log('✅ Admin found:', result.rows[0]);
  } else {
    console.log('❌ Admin not found.');
  }

  pool.end();
}

seedAndTest().catch(console.error);