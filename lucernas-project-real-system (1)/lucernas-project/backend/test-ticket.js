// test-ticket.js
const { ethers } = require('ethers');
const { encrypt } = require('./utils/crypto');
const { generateQR } = require('./utils/qrGenerator');
const pool = require('./config/db');
const { ticketRegistry } = require('./config/blockchain');

async function testGenerateTicket() {
  const userid = 'b86ca9cc-8476-401e-80c9-354548a1f338';

  const payload = JSON.stringify({
    userid,
    eventname: 'Test Event',
    issued_at: new Date().toISOString(),
  });

  // 1. Encrypt
  const encryptedPayload = encrypt(payload);
  console.log('✅ Encrypted payload generated');

  // 2. Generate QR
  const qrDataUrl = await generateQR(encryptedPayload);
  console.log('✅ QR code generated, length:', qrDataUrl.length);

  // 3. Insert into ticket table
  const ticketResult = await pool.query(
    `INSERT INTO ticket (qrcode, status, datecreated)
     VALUES ($1, 'issued', NOW())
     RETURNING ticketid`,
    [qrDataUrl]
  );
  const ticketid = ticketResult.rows[0].ticketid;
  console.log('✅ Ticket inserted, ticketid:', ticketid);

  // 4. Convert to bytes32 and call issueTicket
  const ticketHash = ethers.keccak256(ethers.toUtf8Bytes(ticketid));
  console.log('⏳ Registering on blockchain...');
  const tx = await ticketRegistry.issueTicket(ticketHash);
  const receipt = await tx.wait();
  console.log('✅ Blockchain confirmed, tx hash:', receipt.hash);

  // 5. Insert into blockchain_network
await pool.query(
    `INSERT INTO blockchain_network (transactionid, hashvalue)
     VALUES ($1, $2)`,
    [receipt.blockNumber.toString(), receipt.hash]
  );
  console.log('✅ Blockchain record saved to DB');

  pool.end();
}

testGenerateTicket().catch(console.error);