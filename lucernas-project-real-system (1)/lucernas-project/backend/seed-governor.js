// seed-governor.js
const pool = require('./config/db');
const bcrypt = require('bcryptjs');

async function seedGovernor() {
  const hash = await bcrypt.hash('governor123', 12);
  const result = await pool.query(
    `INSERT INTO governors (governormail, passwordhash, governorname)
     VALUES ($1, $2, $3)
     RETURNING governorid`,
    ['governor@tsu.edu', hash, 'Test Governor']
  );
  console.log('Governor ID:', result.rows[0].governorid);
  pool.end();
}

seedGovernor().catch(console.error);
