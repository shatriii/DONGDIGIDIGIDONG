// test-middleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { verifyToken, requireRole } = require('./middleware/authMiddleware');

// Simulate a valid token
const token = jwt.sign(
  { id: '123', email: 'ariel@tsu.edu', role: 'admin' },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

// Simulate req, res, next
const req = { headers: { authorization: `Bearer ${token}` }, cookies: {} };
const res = { status: (c) => ({ json: (m) => console.log('Error:', c, m) }) };
const next = () => console.log('✅ Token verified! User:', req.user);

verifyToken(req, res, next);