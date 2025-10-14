// backend/routes/penggunaRoutes.js
const express = require('express');
const { getAllPengguna, updatePengguna, createPenggunaByAdmin, updateProfile, updateProfilSaya } = require('../controllers/penggunaController');
const { protect, checkRole } = require('../middleware/authMiddleware');
const router = express.Router();

router.put('/me', protect, checkRole(['pelanggan']), updateProfilSaya);

// Hanya admin yang bisa mengakses data pengguna
router.get('/', protect, checkRole(['admin']), getAllPengguna);
router.post('/', protect, checkRole(['admin']), createPenggunaByAdmin);
router.put('/profile/:id', protect, updateProfile);
router.put('/:id', protect, checkRole(['admin']), updatePengguna);



module.exports = router;