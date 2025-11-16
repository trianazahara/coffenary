const router = require('express').Router();
const { Auth } = require('../controllers/Auth');

const Pengguna = require('../models/penggunaModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const transporter = require('../config/mailer');

const auth = new Auth({
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
