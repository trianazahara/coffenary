const router = require('express').Router();
const pool = require('../config/db');
const MidtransClient = require('midtrans-client');
const { PembayaranController } = require('../controllers/PembayaranController');
const { protect } = require('../middleware/authMiddleware');

const snap = new MidtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
});

const ctrl = new PembayaranController({ pool, snap });

router.post('/initiate', protect, ctrl.initiate);
router.post('/reinitiate', protect, ctrl.reinitiate);

const crypto = require('crypto');
const { NotifikasiController } = require('../controllers/NotifikasiController');
const notif = new NotifikasiController({ pool, serverKey: process.env.MIDTRANS_SERVER_KEY, crypto });
router.post('/notification', require('express').json(), notif.handle);

module.exports = router;
