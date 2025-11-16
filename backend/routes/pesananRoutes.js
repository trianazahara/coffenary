const router = require('express').Router();
const pool = require('../config/db');
const midtransClient = require('midtrans-client');

const { Pesanan } = require('../controllers/Pesanan');
const PesananM  = require('../models/pesananModel');
const { protect, checkRole } = require('../middleware/authMiddleware');

const repo = new PesananM(pool);
const snap = new midtransClient.Snap({ isProduction: false, serverKey: process.env.MIDTRANS_SERVER_KEY });
const pesanan = new Pesanan({ repo, snap });

// Pelanggan
router.get('/history', protect, checkRole(['pelanggan']), pesanan.riwayatPengguna);
router.get('/detail-pelanggan/:id_pesanan', protect, checkRole(['pelanggan']), pesanan.detailPelanggan);
router.post('/:id_pesanan/pay/recreate', protect, checkRole(['pelanggan']), pesanan.recreatePembayaran);
router.get('/pembayaran/:id_pesanan/latest', protect, checkRole(['pelanggan']), pesanan.pembayaranTerbaru);

// Checkout (umum)
router.post('/checkout', protect, checkRole(['pelanggan','staff','admin']), pesanan.checkout);

// Admin/Staff
router.get('/:id_cabang', protect, checkRole(['admin','staff']), pesanan.semuaByCabang);
router.put('/:id_pesanan/status', protect, checkRole(['admin','staff']), pesanan.ubahStatus);
router.get('/:id_cabang/stats', protect, checkRole(['admin','staff']), pesanan.statistikCabang);
router.get('/detail/:id_pesanan', protect, checkRole(['admin','staff']), pesanan.detail);
router.get('/:id_cabang/pending-count', protect, checkRole(['admin','staff']), pesanan.jumlahPending);

module.exports = router;
