const express = require('express');
const { getAllPesananByCabang, updateStatusPesanan, getStatsByCabang, getPesananById,getOrderHistory,getPesananDetailForCustomer,recreatePaymentForCustomer} = require('../controllers/pesananController');
const { protect, checkRole } = require('../middleware/authMiddleware');
const router = express.Router();
const pool = require('../config/db');

router.get('/history', protect, checkRole(['pelanggan']), getOrderHistory);
router.get('/detail-pelanggan/:id_pesanan', protect, checkRole(['pelanggan']), getPesananDetailForCustomer);
router.post('/:id_pesanan/pay/recreate', protect, checkRole(['pelanggan']), recreatePaymentForCustomer);
router.get('/pembayaran/:id_pesanan/latest', protect, checkRole(['pelanggan']), async (req,res)=>{
  const { id_pesanan } = req.params;
  const id_pengguna = req.user?.id_pengguna;
  const [own] = await pool.query(`SELECT 1 FROM pesanan WHERE id_pesanan=? AND id_pengguna=?`, [id_pesanan, id_pengguna]);
  if (!own.length) return res.status(404).json({message:'Tidak ditemukan'});

  const [rows] = await pool.query(`SELECT * FROM pembayaran WHERE id_pesanan=? ORDER BY id_pembayaran DESC LIMIT 1`, [id_pesanan]);
  res.json(rows[0] || null);
});



router.get('/:id_cabang', protect, checkRole(['admin', 'staff']), getAllPesananByCabang);
router.put('/:id_pesanan/status', protect, checkRole(['admin', 'staff']), updateStatusPesanan);
router.get('/:id_cabang/stats', protect, checkRole(['admin', 'staff']), getStatsByCabang);
router.get('/detail/:id_pesanan', protect, checkRole(['admin', 'staff']), getPesananById);
router.get('/:id_cabang/pending-count', protect, async (req, res) => {
  try {
    const { id_cabang } = req.params;
    
    const [result] = await pool.query(
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