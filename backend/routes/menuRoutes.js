// routes/menuRoutes.js
const router = require('express').Router();
const pool = require('../config/db');
const MenuModel = require('../models/menuModel');
const { Menu } = require('../controllers/Menu');
const { protect, checkRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const menu = new Menu({ repo: MenuModel, pool });

// 1) Static dulu
router.get('/featured', menu.unggulan);
router.get('/detail/:id_menu', menu.byId);

// 2) Yang lebih spesifik
router.get('/:id_cabang/menu', menu.tersediaByCabang);

// 3) Yang paling generik terakhir
router.get('/:id_cabang', menu.semuaByCabang);

// Admin/Staff (tanpa regex, tetap aman krn urutan)
router.post(
  '/:id_cabang',
  protect, checkRole(['admin','staff']),
  upload.single('gambar'),
  menu.buat
);

router.put(
  '/:id_cabang/:id_menu',
  protect, checkRole(['admin','staff']),
  upload.single('gambar'),
  menu.ubah
);

router.delete(
  '/:id_cabang/:id_menu',
  protect, checkRole(['admin','staff']),
  menu.hapus
);

module.exports = router;
