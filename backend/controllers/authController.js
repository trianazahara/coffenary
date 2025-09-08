// backend/controllers/authController.js
const Pelanggan = require('../models/pelangganModel');
const Admin = require('../models/adminModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const registerPelanggan = async (req, res) => {
    const { username, password, nama, email, no_telp } = req.body;
    try {
        const existingUser = await Pelanggan.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email sudah terdaftar.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const customerData = {
            username,
            password: hashedPassword,
            nama,
            email,
            no_telp
        };

        const newUser = await Pelanggan.create(customerData);

        res.status(201).json({ message: 'Registrasi berhasil!', userId: newUser.id });
    } catch (error) {
        console.error("Error saat registrasi:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

const loginPelanggan = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await Pelanggan.findByEmail(email);
        
        if (!user) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }

        const token = jwt.sign(
            { id: user.id_pelanggan, role: 'pelanggan' },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        const { password: _, ...userWithoutPassword } = user;
        res.json({ token, user: userWithoutPassword });
        
    } catch (error) {
        console.error("Error saat login pelanggan:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

const loginAdmin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = await Admin.findByEmail(email);

        if (!admin) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }
        
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }

        const token = jwt.sign(
            { id: admin.id_admin, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        const { password: _, ...adminWithoutPassword } = admin;
        res.json({ token, admin: adminWithoutPassword });

    } catch (error) {
        console.error("Error saat login admin:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// --- Ekspor semua fungsi dalam satu objek ---
module.exports = {
    registerPelanggan,
    loginPelanggan,
    loginAdmin
};