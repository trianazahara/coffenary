const express = require('express');
const { getAllCabang } = require('../controllers/cabangController');
const { protect, checkRole } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', protect, checkRole(['admin', 'staff']), getAllCabang);

module.exports = router;