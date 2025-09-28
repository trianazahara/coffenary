// routes/pembayaranRoutes.js
const express = require('express');
const router = express.Router();
const { initiatePayment } = require('../controllers/pembayaranController');
const { notificationHandler } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// inisiasi: user (frontend) memanggil ini -> membutuhkan token
router.post('/initiate', protect, initiatePayment);

// notification dari midtrans server-to-server (no auth)
router.post('/notification', express.json(), notificationHandler);

module.exports = router;
