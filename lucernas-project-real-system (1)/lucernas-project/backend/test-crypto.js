// test-crypto.js
const { encrypt, decrypt } = require('./utils/crypto');

const original = JSON.stringify({ ticketId: 'test-123', student: 'Ariel' });
console.log('Original:', original);

const encrypted = encrypt(original);
console.log('Encrypted:', encrypted);

const decrypted = decrypt(encrypted);
console.log('Decrypted:', decrypted);

console.log('Match:', original === decrypted ? '✅ YES' : '❌ NO');