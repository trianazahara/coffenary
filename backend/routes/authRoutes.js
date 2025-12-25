const router = require('express').Router();
const { AuthController } = require('../controllers/AuthController');

const Pengguna = require('../models/penggunaModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const transporter = require('../config/mailer');

const auth = new AuthController({
  Pengguna,
  bcrypt,
  jwt,
  transporter,
  jwtSecret: process.env.JWT_SECRET
});

router.post('/login', auth.login);
router.post('/register', auth.register);
router.post('/forgot-password', auth.forgotPassword);
router.post('/reset-password', auth.resetPassword);

module.exports = router;
