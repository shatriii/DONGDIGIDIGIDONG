// controllers/ticketController.js
const { ethers } = require('ethers');
const pool = require('../config/db');
const { ticketRegistry } = require('../config/blockchain');
const { encrypt, decrypt } = require('../utils/crypto');
const { generateQR } = require('../utils/qrGenerator');
const { sendTicketEmail } = require('../utils/mailer');

// ── POST /api/tickets/generate ────────────────────────────────────────────────
async function generateTicket(req, res) {
  const { userid, eventname } = req.body;

  if (!userid || !eventname) {
    return res.status(400).json({ error: 'userid and eventname are required.' });
  }

  try {
// 1. Fetch student details from User table
    const studentResult = await pool.query(
      'SELECT email, firstname, lastname, course FROM "User" WHERE userid = $1',
      [userid]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    // Check if student already has a ticket
    const existingTicket = await pool.query(
      'SELECT ticketid FROM "User" WHERE userid = $1 AND ticketid IS NOT NULL',
      [userid]
    );
    if (existingTicket.rows.length > 0) {
      return res.status(409).json({ error: 'Student already has a ticket.' });
    }

    const student = studentResult.rows[0];

    // 2. Insert a placeholder row first so we have a real ticketid to embed
    //    in the QR payload (previously this used the literal string
    //    'pending', which meant every QR forever claimed the wrong id).
    const ticketResult = await pool.query(
      `INSERT INTO ticket (qrcode, status, datecreated)
       VALUES ('', 'issued', NOW())
       RETURNING ticketid`
    );
    const ticketid = ticketResult.rows[0].ticketid;
    console.log('✅ Ticket inserted, ticketid:', ticketid);

    // 3. Build and encrypt the payload using the real ticketid
    const payload = JSON.stringify({
      ticketid,
      userid,
      studentname: `${student.firstname} ${student.lastname}`,
      email: student.email,
      course: student.course,
      eventname,
      issued_at: new Date().toISOString(),
    });
    const encryptedPayload = encrypt(payload);

    // 4. Generate the QR image (for the API response / email) from the
    //    encrypted payload — this is the exact string a scanner will read.
    const qrDataUrl = await generateQR(encryptedPayload);

    // 5. Store the encrypted payload itself as qrcode, not the rendered
    //    image. validateTicket() looks tickets up by the scanned QR
    //    *content*, so the DB column has to hold that same string.
    await pool.query(
      'UPDATE ticket SET qrcode = $1 WHERE ticketid = $2',
      [encryptedPayload, ticketid]
    );

    // 4. Convert ticketid UUID to bytes32 for the smart contract
    const ticketHash = ethers.keccak256(ethers.toUtf8Bytes(ticketid));
    console.log('⏳ Registering on blockchain, hash:', ticketHash);

    // 5. Call issueTicket on the smart contract
    const tx = await ticketRegistry.issueTicket(ticketHash);
    const receipt = await tx.wait();
    console.log('✅ Blockchain confirmed, tx hash:', receipt.hash);

    // 7. Link ticket to user
    await pool.query(
      'UPDATE "User" SET ticketid = $1 WHERE userid = $2',
      [ticketid, userid]
    );

    // 8. Send ticket email
    const userResult = await pool.query(
      'SELECT email, firstname FROM "User" WHERE userid = $1',
      [userid]
    );
    if (userResult.rows.length > 0) {
      const { email, firstname } = userResult.rows[0];
      await sendTicketEmail(email, firstname, eventname, qrDataUrl);
    }

    
    res.status(201).json({
      message: 'Ticket generated successfully.',
      ticketid,
      tx_hash: receipt.hash,
      qr_code: qrDataUrl,
    });

  } catch (err) {
    console.error('[ticketController.generateTicket]', err.message);
    res.status(500).json({ error: 'Ticket generation failed.', detail: err.message });
  }
}

// ── POST /api/tickets/validate ────────────────────────────────────────────────
async function validateTicket(req, res) {
  const { qrcode, organizerid, scannerid } = req.body;

  if (!qrcode || !organizerid) {
    return res.status(400).json({ error: 'qrcode and organizerid are required.' });
  }

  try {
    // 1. Find ticket by qrcode
    const ticketResult = await pool.query(
      'SELECT ticketid, status FROM ticket WHERE qrcode = $1',
      [qrcode]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ valid: false, reason: 'Ticket not found.' });
    }

    const ticket = ticketResult.rows[0];

    if (ticket.status === 'used') {
      return res.status(409).json({ valid: false, reason: 'Ticket already used.' });
    }

    // 2. Check blockchain status
    const ticketHash = ethers.keccak256(ethers.toUtf8Bytes(ticket.ticketid));
    const isValid = await ticketRegistry.isTicketValid(ticketHash);

    if (!isValid) {
      return res.status(400).json({ valid: false, reason: 'Ticket not valid on blockchain.' });
    }

    // 3. Redeem on blockchain
    const tx = await ticketRegistry.redeemTicket(ticketHash);
    const receipt = await tx.wait();

    // 4. Update ticket status in DB
    await pool.query(
      'UPDATE ticket SET status = $1 WHERE ticketid = $2',
      ['used', ticket.ticketid]
    );

    // 5. Insert into validation table
    await pool.query(
      `INSERT INTO validation (ticketid, organizerid, validationstatus, scannerid)
       VALUES ($1, $2, 'valid', $3)`,
      [ticket.ticketid, organizerid, scannerid || null]
    );

    // 6. Decrypt the payload so the scanner UI can show who/what it's for
    let details = null;
    try {
      details = JSON.parse(decrypt(qrcode));
    } catch (decryptErr) {
      console.error('[ticketController.validateTicket] decrypt failed:', decryptErr.message);
    }

    res.json({
      valid: true,
      ticketid: ticket.ticketid,
      tx_hash: receipt.hash,
      message: 'Ticket validated successfully.',
      details,
    });
  } catch (err) {
    console.error('[ticketController.validateTicket]', err.message);
    res.status(500).json({ error: 'Validation failed.', detail: err.message });
  }
}

// ── GET /api/tickets ──────────────────────────────────────────────────────────
async function getAllTickets(req, res) {
  try {
    const result = await pool.query(
      'SELECT ticketid, status, datecreated FROM ticket ORDER BY datecreated DESC'
    );
    res.json({ tickets: result.rows });
  } catch (err) {
    console.error('[ticketController.getAllTickets]', err.message);
    res.status(500).json({ error: 'Failed to fetch tickets.' });
  }
}

// ── POST /api/tickets/generate-batch ─────────────────────────────────────────
async function generateBatchTickets(req, res) {
  const { userids, eventname } = req.body;

  if (!userids || !Array.isArray(userids) || userids.length === 0) {
    return res.status(400).json({ error: 'userids must be a non-empty array.' });
  }
  if (!eventname) {
    return res.status(400).json({ error: 'eventname is required.' });
  }

  const results = [];
  const errors = [];

  for (const userid of userids) {
    try {
      // 1. Fetch student details
      const studentResult = await pool.query(
        'SELECT email, firstname, lastname, course FROM "User" WHERE userid = $1',
        [userid]
      );

      if (studentResult.rows.length === 0) {
        errors.push({ userid, error: 'Student not found.' });
        continue;
      }

      // Check if student already has a ticket
      const existingTicket = await pool.query(
        'SELECT ticketid FROM "User" WHERE userid = $1 AND ticketid IS NOT NULL',
        [userid]
      );
      if (existingTicket.rows.length > 0) {
        errors.push({ userid, error: 'Student already has a ticket.' });
        continue;
      }

      const student = studentResult.rows[0];

      // 2. Insert a placeholder row first so we have a real ticketid
      const ticketResult = await pool.query(
        `INSERT INTO ticket (qrcode, status, datecreated)
         VALUES ('', 'issued', NOW())
         RETURNING ticketid`
      );
      const ticketid = ticketResult.rows[0].ticketid;

      // 3. Build and encrypt payload using the real ticketid
      const payload = JSON.stringify({
        ticketid,
        userid,
        studentname: `${student.firstname} ${student.lastname}`,
        email: student.email,
        course: student.course,
        eventname,
        issued_at: new Date().toISOString(),
      });
      const encryptedPayload = encrypt(payload);

      // 4. Generate QR image from the encrypted payload, then store that
      //    same encrypted string (not the image) as qrcode
      const qrDataUrl = await generateQR(encryptedPayload);
      await pool.query(
        'UPDATE ticket SET qrcode = $1 WHERE ticketid = $2',
        [encryptedPayload, ticketid]
      );

      // 5. Register on blockchain
      const { ethers } = require('ethers');
      const ticketHash = ethers.keccak256(ethers.toUtf8Bytes(ticketid));
      const tx = await ticketRegistry.issueTicket(ticketHash);
      const receipt = await tx.wait();

      // 6. Link ticket to user
      await pool.query(
        'UPDATE "User" SET ticketid = $1 WHERE userid = $2',
        [ticketid, userid]
      );

      // 7. Send email
      await sendTicketEmail(student.email, student.firstname, eventname, qrDataUrl);

      results.push({
        userid,
        ticketid,
        tx_hash: receipt.hash,
        email: student.email,
        qr_code: qrDataUrl,
        status: 'success',
      });

    } catch (err) {
      console.error(`[Batch] Error for userid ${userid}:`, err.message);
      errors.push({ userid, error: err.message });
    }
  }

  res.status(201).json({
    message: `Batch complete. ${results.length} succeeded, ${errors.length} failed.`,
    results,
    errors,
  });
}

// ── GET /api/tickets/:ticketid ────────────────────────────────────────────────
// Fetches one ticket's full details for QRViewer, including the QR image
// regenerated on-the-fly from the stored encrypted payload — so the UI
// never has to fabricate or cache a QR separately from the DB.
async function getTicketById(req, res) {
  const { ticketid } = req.params;

  try {
    const result = await pool.query(
      'SELECT ticketid, qrcode, status, datecreated FROM ticket WHERE ticketid = $1',
      [ticketid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }

    const ticket = result.rows[0];

    let details = null;
    try {
      details = JSON.parse(decrypt(ticket.qrcode));
    } catch (decryptErr) {
      console.error('[ticketController.getTicketById] decrypt failed:', decryptErr.message);
    }

    const qrDataUrl = ticket.qrcode ? await generateQR(ticket.qrcode) : null;

    res.json({
      ticketid: ticket.ticketid,
      status: ticket.status,
      datecreated: ticket.datecreated,
      details,
      qr_code: qrDataUrl,
    });
  } catch (err) {
    console.error('[ticketController.getTicketById]', err.message);
    res.status(500).json({ error: 'Failed to fetch ticket.' });
  }
}

// ── POST /api/tickets/resend ───────────────────────────────────────────────────
// Re-sends the ticket email for a student who already has a ticket —
// useful from College Dashboard instead of pretending to "distribute via
// Bluetooth" (not a real, implementable web capability here).
async function resendTicketEmail(req, res) {
  const { userid } = req.body;

  if (!userid) {
    return res.status(400).json({ error: 'userid is required.' });
  }

  try {
    const userResult = await pool.query(
      'SELECT email, firstname, ticketid FROM "User" WHERE userid = $1',
      [userid]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    const { email, firstname, ticketid } = userResult.rows[0];

    if (!ticketid) {
      return res.status(409).json({ error: 'This student does not have a ticket yet.' });
    }

    const ticketResult = await pool.query(
      'SELECT qrcode FROM ticket WHERE ticketid = $1',
      [ticketid]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket record not found.' });
    }

    const { qrcode } = ticketResult.rows[0];
    let eventname = 'your event';
    try {
      eventname = JSON.parse(decrypt(qrcode)).eventname ?? eventname;
    } catch {
      // fall back to the generic label above if decryption fails
    }

    const qrDataUrl = await generateQR(qrcode);
    await sendTicketEmail(email, firstname, eventname, qrDataUrl);

    res.json({ message: `Ticket email resent to ${email}.` });
  } catch (err) {
    console.error('[ticketController.resendTicketEmail]', err.message);
    res.status(500).json({ error: 'Failed to resend ticket email.' });
  }
}

module.exports = { generateTicket, validateTicket, getAllTickets, generateBatchTickets, getTicketById, resendTicketEmail };