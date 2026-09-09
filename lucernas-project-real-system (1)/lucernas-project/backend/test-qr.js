// test-qr.js
const { encrypt } = require('./utils/crypto');
const { generateQR } = require('./utils/qrGenerator');

(async () => {
  const payload = JSON.stringify({ ticketId: 'test-123', student: 'Ariel' });
  const encrypted = encrypt(payload);
  const qr = await generateQR(encrypted);

  console.log('QR generated:', qr.startsWith('data:image/png;base64,') ? '✅ YES' : '❌ NO');
  console.log('QR length:', qr.length, 'chars');
})();