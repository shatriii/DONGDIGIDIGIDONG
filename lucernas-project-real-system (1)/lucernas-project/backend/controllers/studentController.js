// controllers/studentController.js
const pool = require('../config/db');

// ── GET /api/students ────────────────────────────────────────────────────────
// Real student roster, sourced from the same "User" table ticketController
// already queries (userid, firstname, lastname, email, course, ticketid).
// There is no "college" column in this schema — only `course` — so this
// intentionally does not invent a college/department grouping that isn't
// backed by real data.
async function getAllStudents(req, res) {
  try {
    const result = await pool.query(
      `SELECT userid, firstname, lastname, email, course, ticketid
       FROM "User"
       ORDER BY lastname, firstname`
    );
    res.json({
      students: result.rows.map(r => ({
        userid: r.userid,
        name: `${r.firstname} ${r.lastname}`,
        email: r.email,
        course: r.course,
        hasTicket: r.ticketid !== null,
        ticketid: r.ticketid,
      })),
    });
  } catch (err) {
    console.error('[studentController.getAllStudents]', err.message);
    res.status(500).json({ error: 'Failed to fetch students.' });
  }
}

module.exports = { getAllStudents };
