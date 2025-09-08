const Menu = require('../models/menuModel');


// Untuk pelanggan (hanya menu yang tersedia)
const getAllMenu = async (req, res) => {
    try {
        // Gunakan Menu.findAll dari model
        const menuItems = await Menu.findAll();
        res.json(menuItems);
    } catch (error) {
        console.error("Error saat mengambil menu:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

// Khusus Admin: Mendapatkan semua menu (termasuk yang tidak tersedia)
const getAllMenuForAdmin = async (req, res) => {
    try {
        // Gunakan Menu.findAllForAdmin dari model
        const menuItems = await Menu.findAllForAdmin();
        res.json(menuItems);
    } catch (error) {
        console.error("Error saat mengambil menu admin:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

// Admin: Membuat menu baru
const createMenu = async (req, res) => {
    try {
        const menuData = {
            ...req.body,
            gambar: req.file ? req.file.path.replace(/\\/g, "/") : null // Mengganti backslash menjadi forward slash untuk kompatibilitas
        };
        
        // Gunakan Menu.create untuk membuat data baru
        const newMenu = await Menu.create(menuData);
        res.status(201).json({ message: 'Menu berhasil ditambahkan', data: newMenu });
    } catch (error) {
        console.error("Error saat membuat menu:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

// Admin: Mengupdate menu
const updateMenu = async (req, res) => {
    try {
        const { id } = req.params;
        const menuData = { ...req.body };

        if (req.file) {
            menuData.gambar = req.file.path.replace(/\\/g, "/");
        }
        
        // Gunakan Menu.update untuk memperbarui data
        const result = await Menu.update(id, menuData);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Menu tidak ditemukan' });
        }
        res.json({ message: 'Menu berhasil diperbarui' });
    } catch (error) {
        console.error("Error saat mengupdate menu:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

// Admin: Menghapus menu
const deleteMenu = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Gunakan Menu.delete untuk menghapus data
        const result = await Menu.delete(id);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Menu tidak ditemukan' });
        }
        res.json({ message: 'Menu berhasil dihapus' });
    } catch (error) {
        console.error("Error saat menghapus menu:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};


// --- Ekspor semua fungsi ---
module.exports = {
    getAllMenu,
    getAllMenuForAdmin,
    createMenu,
    updateMenu,
    deleteMenu
};