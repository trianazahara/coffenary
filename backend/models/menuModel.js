const pool = require('../config/db');

class Menu {
    static async findAllByCabang(id_cabang) {
        const [rows] = await pool.query('SELECT * FROM menu WHERE id_cabang = ? ORDER BY id_menu DESC', [id_cabang]);
        return rows;
    }

    static async create(data) {
        const { id_cabang, nama_menu, deskripsi_menu, kategori, harga, gambar, is_tersedia } = data;
        const [result] = await pool.query(
            'INSERT INTO menu (id_cabang, nama_menu, deskripsi_menu, kategori, harga, gambar, is_tersedia) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id_cabang, nama_menu, deskripsi_menu, kategori, harga, gambar, is_tersedia]
        );
        return { id: result.insertId, ...data };
    }
    
    static async update(id_menu, id_cabang, data) {
        const { nama_menu, deskripsi_menu, kategori, harga, gambar, is_tersedia } = data;
        const [result] = await pool.query(
            'UPDATE menu SET nama_menu = ?, deskripsi_menu = ?, kategori = ?, harga = ?, gambar = ?, is_tersedia = ? WHERE id_menu = ? AND id_cabang = ?',
            [nama_menu, deskripsi_menu, kategori, harga, gambar, is_tersedia, id_menu, id_cabang]
        );
        return result;
    }

    static async delete(id_menu, id_cabang) {
        const [result] = await pool.query('DELETE FROM menu WHERE id_menu = ? AND id_cabang = ?', [id_menu, id_cabang]);
        return result;
    }
}
module.exports = Menu;