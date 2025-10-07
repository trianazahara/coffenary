// config/midtrans.js
const MidtransClient = require('midtrans-client');

const snap = new MidtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY
});

module.exports = snap;
