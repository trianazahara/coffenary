const express = require('express');
const { createMenu, getAllMenu } = require('../controllers/menuController');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

// Public route - semua orang bisa lihat menu
router.get('/', getAllMenu);

// Admin routes - hanya admin yang bisa CUD
router.post('/', protect, isAdmin, createMenu);
// router.put('/:id', protect, isAdmin, updateMenu);
// router.delete('/:id', protect, isAdmin, deleteMenu);

module.exports = router;