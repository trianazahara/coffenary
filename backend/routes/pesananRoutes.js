const express = require('express');
const { getAllPesananByCabang, updateStatusPesanan, getStatsByCabang, getPesananById,getOrderHistory} = require('../controllers/pesananController');
const db = require('../config/db'); 
const { protect, checkRole } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/history', protect, checkRole(['pelanggan']), getOrderHistory);


router.get('/:id_cabang', protect, checkRole(['admin', 'staff']), getAllPesananByCabang);
router.put('/:id_pesanan/status', protect, checkRole(['admin', 'staff']), updateStatusPesanan);
router.get('/:id_cabang/stats', protect, checkRole(['admin', 'staff']), getStatsByCabang);
router.get('/detail/:id_pesanan', protect, checkRole(['admin', 'staff']), getPesananById);
router.get('/:id_cabang/pending-count', protect, async (req, res) => {
  try {
    const { id_cabang } = req.params;
    
    const [result] = await db.query(
      `SELECT COUNT(*) as count 
       FROM pesanan 
       WHERE id_cabang = ? AND status = 'pending'`,
      [id_cabang]
    );
    
    res.json({ count: result[0].count });
  } catch (error) {
    console.error('Error fetching pending count:', error);
    res.status(500).json({ error: 'Gagal mengambil jumlah pesanan pending' });
  }
});



module.exports = router;