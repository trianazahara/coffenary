// backend/controllers/penggunaController.js
const Pengguna = require('../models/penggunaModel');
const bcrypt = require('bcryptjs');
const LogModel = require('../models/logModel');
const path = require('path');
const fs = require('fs');

// ==================== GET ALL ====================
const getAllPengguna = async (req, res) => {
    try {
        const filter = req.query; 
        const pengguna = await Pengguna.findAll(filter);
        res.json(pengguna);
    } catch (error) {
        console.error("Error saat ambil pengguna:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// ==================== CREATE ====================
const createPenggunaByAdmin = async (req, res) => {
    const { nama_lengkap, email, password, telepon, peran } = req.body;

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

        const adminName = req.user?.nama_lengkap || "Unknown Admin";
        await LogModel.addLog(`Menambahkan pengguna '${nama_lengkap}' sebagai ${peran}`, adminName);

        res.status(201).json({ message: 'Pengguna baru berhasil ditambahkan.', data: newUser });
    } catch (error) {
        console.error("Error saat create pengguna:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// ==================== UPDATE (FIXED) ====================
const updatePengguna = async (req, res) => {
    try {
        const { id } = req.params;
        const { password, ...otherData } = req.body;

        const pengguna = await Pengguna.findByPk(id);
        if (!pengguna) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
        }

        // Jika ada password baru
        if (password && password.trim() !== '') {
            otherData.kata_sandi_hash = await bcrypt.hash(password, 10);
        }

        // Update data
        await pengguna.update(otherData);

        // Tambahkan log
        const adminName = req.user?.nama_lengkap || "Unknown Admin";
        await LogModel.addLog(`Mengupdate data pengguna '${pengguna.nama_lengkap}' (ID: ${id})`, adminName);

        res.json({ message: 'Data pengguna berhasil diperbarui', data: pengguna });
    } catch (error) {
        console.error("Error saat update pengguna:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// ==================== PROFILE ====================
const getProfile = async (req, res) => {
  try {
    console.log("📥 Mengambil profil user ID:", req.user.id);

    const pengguna = await Pengguna.findById(req.user.id);
    if (!pengguna) {
      console.error("❌ Pengguna tidak ditemukan:", req.user.id);
      return res.status(404).json({ message: "Pengguna tidak ditemukan" });
    }

    delete pengguna.kata_sandi_hash; // jangan kirim password
    res.json(pengguna);

  } catch (err) {
    console.error("❌ Error getProfile:", err);
    res.status(500).json({ message: "Gagal mengambil data profil", error: err.message });
  }
};


const updateProfile = async (req, res) => {
    const id = req.params.id;
    const { nama_lengkap, telepon } = req.body;

    try {
        await Pengguna.update(id, { nama_lengkap, telepon });
        console.log(`✅ Update profil user ID: ${id}`);
        res.json({ message: 'Profil berhasil diperbarui' });
    } catch (error) {
        console.error(`❌ Error updateProfile:`, error);
        res.status(500).json({ message: 'Gagal memperbarui profil' });
    }
};


module.exports = {
  getAllPengguna,
  createPenggunaByAdmin,
  updatePengguna, // ✅ versi baru
  updateProfile,
  getProfile
};
