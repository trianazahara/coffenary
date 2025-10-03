const Pengguna = require('../models/penggunaModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const transporter = require('../config/mailer');

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const pengguna = await Pengguna.findByEmail(email);
        if (!pengguna) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }
        
        const isMatch = await bcrypt.compare(password, pengguna.kata_sandi_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }

        const token = jwt.sign(
            { id: pengguna.id_pengguna, peran: pengguna.peran },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );
        
        const { kata_sandi_hash: _, ...dataPengguna } = pengguna;
        res.json({ token, pengguna: dataPengguna });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const register = async (req, res) => {
    const { username, email, password, nama_lengkap, telepon } = req.body;
    try {
        const existingUser = await Pengguna.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email sudah terdaftar.' });
        }
        const kata_sandi_hash = await bcrypt.hash(password, 10);
        const newUser = await Pengguna.create({ username, email, kata_sandi_hash, nama_lengkap, telepon, peran: 'pelanggan' });
        res.status(201).json({ message: 'Registrasi berhasil!', userId: newUser.id });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const pengguna = await Pengguna.findByEmail(email);
        if (!pengguna) {
            return res.status(404).json({ message: 'Pengguna dengan email ini tidak ditemukan.' });
        }

        // Buat OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otp_hash = await bcrypt.hash(otp, 10);
        const otp_expiry = new Date(Date.now() + 10 * 60 * 1000); // OTP berlaku 10 menit

        await Pengguna.setOtp(email, otp_hash, otp_expiry);

        // Kirim email
        await transporter.sendMail({
            from: `"Coffenary Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Kode OTP Reset Password Anda',
            text: `Kode OTP Anda adalah: ${otp}. Kode ini akan kedaluwarsa dalam 10 menit.`,
            html: `<p>Kode OTP Anda adalah: <b>${otp}</b>. Kode ini akan kedaluwarsa dalam 10 menit.</p>`,
        });

        res.json({ message: 'OTP telah dikirim ke email Anda.' });
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ message: 'Gagal mengirim email.' });
    }
};

const resetPassword = async (req, res) => {
    const { email, otp, password } = req.body;
    try {
        const pengguna = await Pengguna.findByEmail(email);
        if (!pengguna || !pengguna.otp_hash || !pengguna.otp_expiry) {
            return res.status(400).json({ message: 'Permintaan reset tidak valid.' });
        }

        if (new Date() > new Date(pengguna.otp_expiry)) {
            return res.status(400).json({ message: 'Kode OTP sudah kedaluwarsa.' });
        }

        const isMatch = await bcrypt.compare(otp, pengguna.otp_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Kode OTP salah.' });
        }

        const kata_sandi_hash = await bcrypt.hash(password, 10);
        await Pengguna.resetPassword(email, kata_sandi_hash);

        res.json({ message: 'Password berhasil direset. Silakan login.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { login, register, forgotPassword, resetPassword };