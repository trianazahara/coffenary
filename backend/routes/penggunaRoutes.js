const router = require('express').Router();
const Model = require('../models/penggunaModel'); // expose: findAll, findByEmail, updateAdmin, updateProfile, create
const bcrypt = require('bcryptjs');
const { Pengguna } = require('../controllers/Pengguna');
const { protect, checkRole } = require('../middleware/authMiddleware');

const ctrl = new Pengguna({ repo: Model, bcrypt });

// pelanggan update profil sendiri
router.put('/me', protect, checkRole(['pelanggan']), ctrl.updateMe);

// admin area
router.get('/', protect, checkRole(['admin']), ctrl.semua);
router.post('/', protect, checkRole(['admin']), ctrl.createByAdmin);

// admin/staff update user lain
router.put('/:id', protect, checkRole(['admin', 'staff']), ctrl.updateByAdmin);

module.exports = router;
