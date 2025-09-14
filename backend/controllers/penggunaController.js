// backend/controllers/penggunaController.js
const Pengguna = require('../models/penggunaModel');
const bcrypt = require('bcryptjs');


const updatePengguna = async (req, res) => {
    try {
        const { id } = req.params;
        const { password, ...otherData } = req.body;
        
        const updateData = { ...otherData };

        // Jika admin mengirim password baru, hash password tersebut
        if (password && password.trim() !== '') {
            updateData.kata_sandi_hash = await bcrypt.hash(password, 10);
        }

        const result = await Pengguna.update(id, updateData);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
        }
        res.json({ message: 'Data pengguna berhasil diperbarui' });
    } catch (error) {
        console.error("Error saat update pengguna:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getAllPengguna = async (req, res) => {
    try {
        // Ambil filter dari query URL, contoh: /api/pengguna?tipe=staff
        const filter = req.query; 
        const pengguna = await Pengguna.findAll(filter);
        res.json(pengguna);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const createPenggunaByAdmin = async (req, res) => {
    const { nama_lengkap, email, password, telepon, peran } = req.body;

    // Validasi peran, hanya admin dan staff yang boleh dibuat di sini
    if (!['admin', 'staff'].includes(peran)) {
        return res.status(400).json({ message: 'Peran yang diizinkan hanya admin atau staff.' });
    }

    try {
        const existingUser = await Pengguna.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email sudah terdaftar.' });
        }
        
        const kata_sandi_hash = await bcrypt.hash(password, 10);
        
        const newUserData = { nama_lengkap, email, kata_sandi_hash, telepon, peran };
        const newUser = await Pengguna.create(newUserData);

        res.status(201).json({ message: 'Pengguna baru berhasil ditambahkan.', data: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};



module.exports = { getAllPengguna, updatePengguna, createPenggunaByAdmin };