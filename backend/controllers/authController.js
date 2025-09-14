const Pengguna = require('../models/penggunaModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

module.exports = { login, register };