const express = require('express');
const router = express.Router();
const { initiatePayment, reinitiatePayment } = require('../controllers/pembayaranController');
const { notificationHandler } = require('../controllers/notificationController');

// user memulai pembayaran → butuh auth
router.post('/initiate', initiatePayment);
router.post('/reinitiate', reinitiatePayment);

// webhook Midtrans → JANGAN pakai protect
router.post('/notification', express.json(), notificationHandler);

module.exports = router;
