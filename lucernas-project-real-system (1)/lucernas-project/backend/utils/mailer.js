// utils/mailer.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendTicketEmail(toEmail, studentName, eventName, qrDataUrl) {
  // Convert Base64 Data URL to a buffer for attachment
  const base64Data = qrDataUrl.replace('data:image/png;base64,', '');
  const qrBuffer = Buffer.from(base64Data, 'base64');

  const mailOptions = {
    from: `"Lucernas SSC Ticketing" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Your Ticket for ${eventName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #1A237E;">Lucernas SSC Ticketing System</h2>
        <p>Hello <strong>${studentName}</strong>,</p>
        <p>Your ticket for <strong>${eventName}</strong> has been generated successfully.</p>
        <p>Please present the QR code below at the event entrance:</p>
        <img src="cid:qrcode" alt="QR Code" style="width: 300px; height: 300px;" />
        <p style="color: #888; font-size: 12px;">Do not share this QR code with others. It is valid for one entry only.</p>
        <p>— Supreme Student Council, Tarlac State University</p>
      </div>
    `,
    attachments: [
      {
        filename: 'ticket-qr.png',
        content: qrBuffer,
        cid: 'qrcode', // referenced in the HTML above
      },
    ],
  };

  await transporter.sendMail(mailOptions);
  console.log(`[Mailer] Ticket email sent to ${toEmail}`);
}

module.exports = { sendTicketEmail };