const QRCode = require("qrcode");

async function generateQR(data) {
  const buffer = await QRCode.toBuffer(data, { type: "png", width: 256, margin: 2 });
  return buffer.toString("base64");
}

module.exports = { generateQR };
