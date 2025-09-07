const express = require('express');
const { getAllOrders, updateOrderStatus, getDashboardStats } = require('../controllers/orderController');const { protect, isAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

// Rute Admin untuk mendapatkan semua pesanan dan update status
router.get('/admin', protect, isAdmin, getAllOrders);
router.put('/admin/:id/status', protect, isAdmin, updateOrderStatus);
router.get('/admin/stats', protect, isAdmin, getDashboardStats);

// (Nantinya, di sini juga ada rute untuk pelanggan membuat pesanan)
// router.post('/', protect, createOrder);

module.exports = router;