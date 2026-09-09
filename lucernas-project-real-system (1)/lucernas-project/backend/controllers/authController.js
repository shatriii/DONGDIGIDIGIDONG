// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = '8h';

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required.' });
  }

  try {
    // Check system_admin table first
    const adminResult = await pool.query(
      'SELECT adminid, sysadmail, passwordhash FROM system_admin WHERE sysadmail = $1',
      [email]
    );

    if (adminResult.rows.length > 0) {
      const admin = adminResult.rows[0];
      const isMatch = await bcrypt.compare(password, admin.passwordhash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }

      const token = jwt.sign(
        { id: admin.adminid, email: admin.sysadmail, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY }
      );

      res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 8 * 60 * 60 * 1000 });
      return res.json({ message: 'Login successful.', token, role: 'admin', id: admin.adminid, email: admin.sysadmail });
    }

    // Check organizers table
    const organizerResult = await pool.query(
      'SELECT organizerid, organizermail, passwordhash, organizername FROM organizers WHERE organizermail = $1',
      [email]
    );

    if (organizerResult.rows.length > 0) {
      const organizer = organizerResult.rows[0];
      const isMatch = await bcrypt.compare(password, organizer.passwordhash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }

      const token = jwt.sign(
        { id: organizer.organizerid, email: organizer.organizermail, role: 'organizer' },
        process.env.JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY }
      );

      res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 8 * 60 * 60 * 1000 });
      return res.json({ message: 'Login successful.', token, role: 'organizer', id: organizer.organizerid, email: organizer.organizermail, name: organizer.organizername });
    }

    // Check governors table
    const governorResult = await pool.query(
      'SELECT governorid, governormail, passwordhash, governorname FROM governors WHERE governormail = $1',
      [email]
    );

    if (governorResult.rows.length > 0) {
      const governor = governorResult.rows[0];
      const isMatch = await bcrypt.compare(password, governor.passwordhash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }

      const token = jwt.sign(
        { id: governor.governorid, email: governor.governormail, role: 'governor' },
        process.env.JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY }
      );

      res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 8 * 60 * 60 * 1000 });
      return res.json({ message: 'Login successful.', token, role: 'governor', id: governor.governorid, email: governor.governormail, name: governor.governorname });
    }

    // No table matched
    return res.status(401).json({ error: 'Invalid credentials.' });

  } catch (err) {
    console.error('[authController.login]', err.message);
    res.status(500).json({ error: 'Login failed.', detail: err.message });
  }
}

function logout(req, res) {
  res.clearCookie('token');
  res.json({ message: 'Logged out.' });
}

// Returns the identity encoded in the caller's token. Mounted behind
// verifyToken so the frontend can restore a session after a page reload
// (the token itself lives in an httpOnly cookie the client can't read).
function me(req, res) {
  res.json({ id: req.user.id, email: req.user.email, role: req.user.role });
}

module.exports = { login, logout, me };