// test-db.js
const pool = require('./config/db');

pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('Query failed:', err.message);
  } else {
    console.log('DB time:', result.rows[0].now);
  }
  pool.end();
});