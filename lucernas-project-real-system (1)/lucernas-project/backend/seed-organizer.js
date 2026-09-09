// seed-organizer.js
const pool = require('./config/db');
const bcrypt = require('bcryptjs');

async function seedOrganizer() {
  const hash = await bcrypt.hash('organizer123', 12);
  const result = await pool.query(
    `INSERT INTO organizers (organizermail, passwordhash, organizername, verifyscanresult)
     VALUES ($1, $2, $3, $4)
     RETURNING organizerid`,
    ['organizer@tsu.edu', hash, 'Test Organizer', 'pending']
  );
  console.log('Organizer ID:', result.rows[0].organizerid);
  pool.end();
}

seedOrganizer().catch(console.error);