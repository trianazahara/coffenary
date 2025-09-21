const express = require('express');
const { getAllMenuByCabang, createMenu, updateMenu, deleteMenu, getMenuByCabang, getMenuById } = require('../controllers/menuController');
const { protect, checkRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();

router.get('/:id_cabang', getAllMenuByCabang); // Rute publik untuk pelanggan lihat menu
router.post('/:id_cabang', protect, checkRole(['admin', 'staff']), upload.single('gambar'), createMenu);
router.put('/:id_cabang/:id_menu', protect, checkRole(['admin', 'staff']), upload.single('gambar'), updateMenu);
router.delete('/:id_cabang/:id_menu', protect, checkRole(['admin', 'staff']), deleteMenu);
router.get('/:id_cabang/menu', getMenuByCabang);
router.get('/:id_menu', getMenuById);

module.exports = router;