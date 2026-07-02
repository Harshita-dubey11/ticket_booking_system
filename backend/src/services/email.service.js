const nodemailer = require("nodemailer");

const emailConfigured = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);

const transporter = emailConfigured
  ? nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "sandbox.smtp.mailtrap.io",
      port: parseInt(process.env.EMAIL_PORT || "2525", 10),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  : null;

async function sendBookingConfirmation(to, name, eventTitle, date, seats, totalAmount, reference, qrBase64) {
  if (!emailConfigured) { console.log("EMAIL SKIPPED: set EMAIL_USER/EMAIL_PASS to enable"); return; }
  const seatList = seats.map((s) => `${s.label} (${s.category})`).join(", ");

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "noreply@ticketbook.com",
    to,
    subject: `Booking Confirmed — ${eventTitle}`,
    html: `
      <h1>Booking Confirmed!</h1>
      <p>Hi ${name},</p>
      <p>Your booking for <strong>${eventTitle}</strong> on ${date} is confirmed.</p>
      <p><strong>Seats:</strong> ${seatList}</p>
      <p><strong>Total:</strong> ₹${totalAmount}</p>
      <p><strong>Reference:</strong> ${reference}</p>
      <p>Show the QR code below at the venue for entry.</p>
      <img src="cid:qr" alt="QR Code" />
    `,
    attachments: [
      {
        filename: `ticket-${reference}.png`,
        content: Buffer.from(qrBase64, "base64"),
        cid: "qr",
      },
    ],
  });
}

async function sendWaitlistOffer(to, name, eventTitle, categoryName, offerLink, expiresAt) {
  if (!emailConfigured) { console.log("EMAIL SKIPPED: set EMAIL_USER/EMAIL_PASS to enable"); return; }
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "noreply@ticketbook.com",
    to,
    subject: `Seat Available! — ${eventTitle}`,
    html: `
      <h1>A seat just opened up!</h1>
      <p>Hi ${name},</p>
      <p>A <strong>${categoryName}</strong> seat for <strong>${eventTitle}</strong> is now available for you.</p>
      <p>Click the link below to claim it before it expires:</p>
      <p><a href="${offerLink}" style="display:inline-block;padding:12px 24px;background:#1a1a2e;color:#fff;text-decoration:none;border-radius:4px;">Claim Your Seat</a></p>
      <p>This offer expires at ${expiresAt}. If you don't claim it in time, it will be offered to the next person in line.</p>
    `,
  });
}

module.exports = { sendBookingConfirmation, sendWaitlistOffer };
