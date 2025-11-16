const router = require('express').Router();
const { Cabang } = require('../controllers/Cabang');
const CabangModel = require('../models/cabangModel');

const { protect, checkRole } = require('../middleware/authMiddleware');

const cabang = new Cabang({ CabangRepo: CabangModel });

// urutan: protect -> checkRole -> handler
router.get('/', protect, checkRole(['admin', 'staff', 'pelanggan']), cabang.getAllCabang);

module.exports = router;
