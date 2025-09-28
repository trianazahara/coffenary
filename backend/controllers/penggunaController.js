// backend/controllers/penggunaController.js
const Pengguna = require('../models/penggunaModel');
const bcrypt = require('bcryptjs');
const LogModel = require('../models/logModel');



// ==================== GET ALL ====================
const getAllPengguna = async (req, res) => {
    try {
        // Ambil filter dari query URL, contoh: /api/pengguna?peran=staff
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

    // Validasi peran
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

        // Tambahkan log
        const adminName = req.user?.nama_lengkap || "Unknown Admin";
        await LogModel.addLog(`Menambahkan pengguna '${nama_lengkap}' sebagai ${peran}`, adminName);

        res.status(201).json({ message: 'Pengguna baru berhasil ditambahkan.', data: newUser });
    } catch (error) {
        console.error("Error saat create pengguna:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};


// ==================== UPDATE ====================
const updatePengguna = async (req, res) => {
    try {
        const { id } = req.params;
        const { password, ...otherData } = req.body;
        
        const updateData = { ...otherData };

        // Jika ada password baru
        if (password && password.trim() !== '') {
            updateData.kata_sandi_hash = await bcrypt.hash(password, 10);
        }

        const result = await Pengguna.update(id, updateData);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
        }

        // Tambahkan log
        const adminName = req.user?.nama_lengkap || "Unknown Admin";
        await LogModel.addLog(`Mengupdate data pengguna ID ${id}`, adminName);

        res.json({ message: 'Data pengguna berhasil diperbarui' });
    } catch (error) {
        console.error("Error saat update pengguna:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};


const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_lengkap, identitas } = req.body;

    let updateData = { nama_lengkap, identitas };

    if (req.file) {
      updateData.foto = req.file.path.replace(/\\/g, "/");
    }

    const result = await Pengguna.update(id, updateData);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan" });
    }

    res.json({ message: "Profil berhasil diperbarui" });
  } catch (error) {
    console.error("Error update profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = { getAllPengguna, createPenggunaByAdmin, updatePengguna, updateProfile };
