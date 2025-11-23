const router = require('express').Router();
const { CabangController } = require('../controllers/CabangController');
const CabangModel = require('../models/cabangModel');
const LogModel = require('../models/logModel');

const { protect, checkRole } = require('../middleware/authMiddleware');

const cabang = new CabangController({ CabangRepo: CabangModel, LogModel });

// urutan: protect -> checkRole -> handler
// Pelanggan/admin/staff melihat cabang aktif
router.get('/', protect, checkRole(['admin', 'staff', 'pelanggan']), cabang.getAllCabang);
// Admin/staff melihat semua cabang (termasuk non-aktif)
router.get('/admin/all', protect, checkRole(['admin', 'staff']), cabang.getAllCabangAdmin);
// Admin/staff CRUD
router.post('/', protect, checkRole(['admin', 'staff']), cabang.createCabang);
router.put('/:id_cabang', protect, checkRole(['admin', 'staff']), cabang.updateCabang);

module.exports = router;
