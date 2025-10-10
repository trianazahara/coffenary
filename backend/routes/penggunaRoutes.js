// backend/routes/penggunaRoutes.js
const express = require('express');
const { 
  getAllPengguna, 
  updatePengguna, 
  createPenggunaByAdmin, 
  updateProfile, 
  getProfile 
} = require('../controllers/penggunaController');

const { protect, checkRole } = require('../middleware/authMiddleware');
const upload = require("../middleware/uploadMiddleware"); // untuk foto
const router = express.Router();

// Hanya admin yang bisa mengakses data pengguna
router.get('/', protect, checkRole(['admin']), getAllPengguna);
router.put('/:id', protect, checkRole(['admin']), updatePengguna);
router.post('/', protect, checkRole(['admin']), createPenggunaByAdmin); 
// 🔥 Tambahan baru:

// Profil untuk user yang login
router.get("/profile", protect,  getProfile);
router.put("/:id/profile", protect, upload.single("foto"), updateProfile);


module.exports = router;