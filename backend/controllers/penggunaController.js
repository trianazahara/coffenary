// backend/controllers/penggunaController.js
const Pengguna = require('../models/penggunaModel');
const bcrypt = require('bcryptjs');


const updatePenggunaByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const payload = { ...req.body };

    // Jika ada password plain, hash ke kata_sandi_hash dan HAPUS field password
    if (payload.password && payload.password.trim() !== '') {
      payload.kata_sandi_hash = await bcrypt.hash(payload.password, 10);
      delete payload.password;
    }

    // (Opsional) Cek unik email bila diubah
    if (payload.email) {
      const existing = await Pengguna.findByEmail(payload.email);
      if (existing && String(existing.id_pengguna) !== String(id)) {
        return res.status(400).json({ message: 'Email sudah digunakan pengguna lain.' });
      }
    }

    const result = await Pengguna.updateAdmin(id, payload);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    res.json({ message: 'Data pengguna berhasil diperbarui (admin).' });
  } catch (error) {
    console.error('updatePenggunaByAdmin error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * PROFIL diri sendiri: tidak boleh ubah peran/is_aktif
 * PUT /api/pengguna/me
 */
const updateProfilSaya = async (req, res) => {
  try {
    const id = req.user?.id;

    const { peran, is_aktif, password, ...others } = req.body; // buang field terlarang
    const payload = { ...others };

    if (password && password.trim() !== '') {
      payload.kata_sandi_hash = await bcrypt.hash(password, 10);
    }


    const result = await Pengguna.updateProfile(id, payload);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    res.json({ message: 'Profil berhasil diperbarui.' });
  } catch (error) {
    console.error('updateProfilSaya error:', error);
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



module.exports = { getAllPengguna, updatePenggunaByAdmin, updateProfilSaya, createPenggunaByAdmin };