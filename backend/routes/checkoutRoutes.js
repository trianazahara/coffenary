// routes/checkoutRoutes.js
const router = require('express').Router();
const pool = require('../config/db');
const LogModel = require('../models/logModel');        
const { CheckoutController } = require('../controllers/checkoutController'); 
const { protect, checkRole } = require('../middleware/authMiddleware');

// instansiasi controller dengan dependency injection
const ctrl = new CheckoutController({ pool, LogModel });

// izinkan pelanggan, admin, dan staff melakukan checkout
router.post('/', protect, checkRole(['pelanggan', 'admin', 'staff']), ctrl.checkout);

module.exports = router;
