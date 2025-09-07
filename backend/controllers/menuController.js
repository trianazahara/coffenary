const pool = require('../config/db');

// Admin: Membuat menu baru
exports.createMenu = async (req, res) => {
    const { nama_menu, deskripsi_menu, kategori, harga, gambar } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO menu (nama_menu, deskripsi_menu, kategori, harga, gambar) VALUES (?, ?, ?, ?, ?)',
            [nama_menu, deskripsi_menu, kategori, harga, gambar]
        );
        res.status(201).json({ message: 'Menu berhasil ditambahkan', id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Error server', error: error.message });
    }
};

// Pelanggan & Admin: Melihat semua menu
exports.getAllMenu = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM menu WHERE is_available = TRUE');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error server', error: error.message });
    }
};

// ... tambahkan fungsi updateMenu dan deleteMenu untuk admin ...