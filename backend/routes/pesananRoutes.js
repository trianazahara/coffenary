const express = require('express');
const { getAllPesananByCabang, updateStatusPesanan, getStatsByCabang, getPesananById} = require('../controllers/pesananController');
const { protect, checkRole } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/:id_cabang', protect, checkRole(['admin', 'staff']), getAllPesananByCabang);
router.put('/:id_pesanan/status', protect, checkRole(['admin', 'staff']), updateStatusPesanan);
router.get('/:id_cabang/stats', protect, checkRole(['admin', 'staff']), getStatsByCabang);
router.get('/detail/:id_pesanan', protect, checkRole(['admin', 'staff']), getPesananById);

module.exports = router;