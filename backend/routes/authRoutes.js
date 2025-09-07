const express = require('express');
const { registerPelanggan, loginPelanggan, loginAdmin } = require('../controllers/authController');
const router = express.Router();

router.post('/register', registerPelanggan);
router.post('/login', loginPelanggan);
router.post('/admin/login', loginAdmin);

module.exports = router;
