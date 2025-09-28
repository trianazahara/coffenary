// backend/routes/penggunaRoutes.js
const express = require('express');
const { getAllPengguna, updatePengguna, createPenggunaByAdmin } = require('../controllers/penggunaController');
const { protect, checkRole } = require('../middleware/authMiddleware');
const upload = require("../middleware/uploadMiddleware"); // untuk foto
const { updateProfile } = require("../controllers/penggunaController");
const router = express.Router();

// Hanya admin yang bisa mengakses data pengguna
router.get('/', protect, checkRole(['admin']), getAllPengguna);
router.put('/:id', protect, checkRole(['admin']), updatePengguna);
router.post('/', protect, checkRole(['admin']), createPenggunaByAdmin); 
// pengguna update profil sendiri (pakai foto dll)
router.put('/:id/profile', protect, upload.single("foto"), updateProfile);

module.exports = router;