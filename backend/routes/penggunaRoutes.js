// backend/routes/penggunaRoutes.js
const express = require('express');
const { getAllPengguna, updatePenggunaByAdmin, updateProfilSaya, createPenggunaByAdmin } = require('../controllers/penggunaController');
const { protect, checkRole } = require('../middleware/authMiddleware');
const router = express.Router();

router.put('/me', protect, checkRole(['pelanggan']), updateProfilSaya);

// Hanya admin yang bisa mengakses data pengguna
router.get('/', protect, checkRole(['admin']), getAllPengguna);
router.put('/:id', protect, checkRole(['admin', 'staff']), updatePenggunaByAdmin);
router.post('/', protect, checkRole(['admin']), createPenggunaByAdmin); 

module.exports = router;