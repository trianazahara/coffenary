const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');

router.post('/', checkoutController.checkout); // POST /api/checkout

module.exports = router;
