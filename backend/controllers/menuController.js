const pool = require('../config/db');

// Admin: Membuat menu baru
exports.createMenu = async (req, res) => {
    // Data teks ada di req.body
    const { nama_menu, deskripsi_menu, kategori, harga, is_available, stok } = req.body;
    // Path gambar yang sudah disimpan ada di req.file
    const gambar = req.file ? req.file.path : null;

    try {
        const [result] = await pool.query(
            'INSERT INTO menu (nama_menu, deskripsi_menu, kategori, harga, gambar, is_available, stok) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nama_menu, deskripsi_menu, kategori, harga, gambar, is_available, stok || null]
        );
        res.status(201).json({ message: 'Menu berhasil ditambahkan', id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Error server', error: error.message });
    }
};

exports.updateMenu = async (req, res) => {
    const { id } = req.params;
    const { nama_menu, deskripsi_menu, kategori, harga, is_available, stok } = req.body;
    const gambar = req.file ? req.file.path : req.body.gambar; // Jika tidak ada file baru, gunakan path lama

    try {
        await pool.query(
            'UPDATE menu SET nama_menu = ?, deskripsi_menu = ?, kategori = ?, harga = ?, gambar = ?, is_available = ?, stok = ? WHERE id_menu = ?',
            [nama_menu, deskripsi_menu, kategori, harga, gambar, is_available, stok || null, id]
        );
        res.json({ message: 'Menu berhasil diperbarui' });
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



// Admin: Menghapus menu
exports.deleteMenu = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM menu WHERE id_menu = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Menu tidak ditemukan' });
        }
        res.json({ message: 'Menu berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Error server', error: error.message });
    }
};

// ... tambahkan fungsi updateMenu dan deleteMenu untuk admin ...