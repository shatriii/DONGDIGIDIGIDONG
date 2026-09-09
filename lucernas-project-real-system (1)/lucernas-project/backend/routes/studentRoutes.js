// routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const { getAllStudents } = require('../controllers/studentController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Admin, organizer, or governor: view the student roster (for College Dashboard)
router.get('/', verifyToken, requireRole(['admin', 'organizer', 'governor']), getAllStudents);

module.exports = router;
