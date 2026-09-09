// routes/ticketRoutes.js
const express = require('express');
const router = express.Router();
const { generateTicket, validateTicket, getAllTickets, generateBatchTickets, getTicketById, resendTicketEmail } = require('../controllers/ticketController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Admin only: generate a new ticket
router.post('/generate', verifyToken, requireRole('admin'), generateTicket);

// Admin only: generate tickets in batch
router.post('/generate-batch', verifyToken, requireRole('admin'), generateBatchTickets);

// Admin only: resend a ticket's email
router.post('/resend', verifyToken, requireRole('admin'), resendTicketEmail);

// Organizer or admin: validate a scanned ticket
router.post('/validate', verifyToken, requireRole(['admin', 'organizer']), validateTicket);

// Admin, organizer, or governor: view all tickets
router.get('/', verifyToken, requireRole(['admin', 'organizer', 'governor']), getAllTickets);

// Admin, organizer, or governor: view one ticket's full details (QRViewer)
router.get('/:ticketid', verifyToken, requireRole(['admin', 'organizer', 'governor']), getTicketById);

module.exports = router;