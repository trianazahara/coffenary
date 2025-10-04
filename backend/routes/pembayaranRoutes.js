const express = require('express');
const router = express.Router();
const { initiatePayment } = require('../controllers/pembayaranController');
const { notificationHandler } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// user memulai pembayaran → butuh auth
router.post('/initiate', /*protect, */initiatePayment);

// webhook Midtrans → JANGAN pakai protect
router.post('/notification', express.json(), notificationHandler);

module.exports = router;
