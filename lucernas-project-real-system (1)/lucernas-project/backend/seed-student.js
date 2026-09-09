// seed-student.js
const pool = require('./config/db');

async function seedStudent() {
  const result = await pool.query(
    `INSERT INTO "User" (email, firstname, lastname, course)
     VALUES ($1, $2, $3, $4)
     RETURNING userid, email, firstname, lastname, course`,
    ['erwinrommel.614@gmail.com', 'Test', 'Student', 'BSCS']
  );
  console.log('Student created:', result.rows[0]);
  pool.end();
}

seedStudent().catch(console.error);