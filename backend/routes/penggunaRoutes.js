// backend/routes/penggunaRoutes.js
const express = require('express');
const { getAllPengguna, updatePengguna, createPenggunaByAdmin, updateProfile } = require('../controllers/penggunaController');
const { protect, checkRole } = require('../middleware/authMiddleware');
const router = express.Router();

// Hanya admin yang bisa mengakses data pengguna
router.get('/', protect, checkRole(['admin']), getAllPengguna);
router.put('/:id', protect, checkRole(['admin']), updatePengguna);
router.post('/', protect, checkRole(['admin']), createPenggunaByAdmin); 
router.put('/profile/:id', protect, updateProfile);

module.exports = router;