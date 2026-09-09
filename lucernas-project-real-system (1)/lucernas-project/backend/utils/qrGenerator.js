// utils/qrGenerator.js
const QRCode = require('qrcode');

async function generateQR(encryptedPayload) {
  try {
    const dataUrl = await QRCode.toDataURL(encryptedPayload, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      width: 300,
    });
    return dataUrl;
  } catch (err) {
    throw new Error(`QR generation failed: ${err.message}`);
  }
}

async function generateQRBuffer(encryptedPayload) {
  try {
    const buffer = await QRCode.toBuffer(encryptedPayload, {
      errorCorrectionLevel: 'H',
      type: 'png',
      margin: 2,
      width: 300,
    });
    return buffer;
  } catch (err) {
    throw new Error(`QR buffer generation failed: ${err.message}`);
  }
}

module.exports = { generateQR, generateQRBuffer };