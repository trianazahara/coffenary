// backend/models/menuModel.js

const pool = require('../config/db');

class Menu {
    /**
     * Mengambil semua menu yang tersedia (untuk pelanggan).
     * @returns {Promise<Array>}
     */
    static async findAll() {
        const [rows] = await pool.query('SELECT * FROM menu WHERE is_available = TRUE');
        return rows;
    }

    /**
     * Mengambil semua menu (untuk admin).
     * @returns {Promise<Array>}
     */
    static async findAllForAdmin() {
        const [rows] = await pool.query('SELECT * FROM menu ORDER BY id_menu DESC');
        return rows;
    }

    /**
     * Membuat menu baru.
     * @param {Object} menuData - Data dari form.
     * @returns {Promise<Object>}
     */
    static async create(menuData) {
        const { nama_menu, deskripsi_menu, kategori, harga, gambar, is_available, stok } = menuData;
        const [result] = await pool.query(
            'INSERT INTO menu (nama_menu, deskripsi_menu, kategori, harga, gambar, is_available, stok) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nama_menu, deskripsi_menu, kategori, harga, gambar, is_available, stok || null]
        );
        return { id: result.insertId, ...menuData };
    }

    /**
     * Mengupdate menu berdasarkan ID.
     * @param {number} id - ID menu.
     * @param {Object} menuData - Data dari form.
     * @returns {Promise<Object>}
     */
    static async update(id, menuData) {
        const { nama_menu, deskripsi_menu, kategori, harga, gambar, is_available, stok } = menuData;
        const [result] = await pool.query(
            'UPDATE menu SET nama_menu = ?, deskripsi_menu = ?, kategori = ?, harga = ?, gambar = ?, is_available = ?, stok = ? WHERE id_menu = ?',
            [nama_menu, deskripsi_menu, kategori, harga, gambar, is_available, stok || null, id]
        );
        return result;
    }

    /**
     * Menghapus menu berdasarkan ID.
     * @param {number} id - ID menu.
     * @returns {Promise<Object>}
     */
    static async delete(id) {
        const [result] = await pool.query('DELETE FROM menu WHERE id_menu = ?', [id]);
        return result;
    }
}

module.exports = Menu;