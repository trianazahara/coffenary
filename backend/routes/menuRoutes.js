const express = require('express');
const { createMenu, getAllMenu, updateMenu, deleteMenu } = require('../controllers/menuController');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();

// Public route - semua orang bisa lihat menu
router.get('/', getAllMenu);
router.post('/', protect, isAdmin, upload.single('gambar'), createMenu);
router.put('/:id', protect, isAdmin, upload.single('gambar'), updateMenu);
// Admin routes - hanya admin yang bisa CUD
router.post('/', protect, isAdmin, createMenu);
router.post('/', protect, isAdmin, createMenu);
router.put('/:id', protect, isAdmin, updateMenu);     // <-- TAMBAHKAN INI
router.delete('/:id', protect, isAdmin, deleteMenu); // <-- TAMBAHKAN INI


module.exports = router;