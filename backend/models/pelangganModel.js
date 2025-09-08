// backend/models/pelangganModel.js

const pool = require('../config/db');

class Pelanggan {
    /**
     * Membuat pelanggan baru.
     * Password harus sudah di-hash di controller sebelum memanggil fungsi ini.
     * @param {Object} customerData - Data pelanggan.
     * @returns {Promise<Object>}
     */
    static async create(customerData) {
        const { username, password, nama, email, no_telp, alamat } = customerData;
        const [result] = await pool.query(
            'INSERT INTO pelanggan (username, password, nama, email, no_telp, alamat) VALUES (?, ?, ?, ?, ?, ?)',
            [username, password, nama, email, no_telp, alamat || null]
        );
        return { id: result.insertId, ...customerData };
    }

    /**
     * Menemukan pelanggan berdasarkan alamat email.
     * @param {string} email - Alamat email pelanggan.
     * @returns {Promise<Object|null>}
     */
    static async findByEmail(email) {
        const [rows] = await pool.query('SELECT * FROM pelanggan WHERE email = ?', [email]);
        return rows[0];
    }

    /**
     * Menemukan pelanggan berdasarkan ID.
     * @param {number} id - ID pelanggan.
     * @returns {Promise<Object|null>}
     */
    static async findById(id) {
        const [rows] = await pool.query('SELECT id_pelanggan, username, nama, email, no_telp, alamat FROM pelanggan WHERE id_pelanggan = ?', [id]);
        return rows[0];
    }
}

module.exports = Pelanggan;