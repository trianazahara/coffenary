// backend/models/adminModel.js

const pool = require('../config/db');

class Admin {
    /**
     * Menemukan admin berdasarkan alamat email.
     * Mengembalikan semua data termasuk password hash untuk verifikasi.
     * @param {string} email - Alamat email admin.
     * @returns {Promise<Object|null>}
     */
    static async findByEmail(email) {
        const [rows] = await pool.query('SELECT * FROM admin WHERE email = ?', [email]);
        return rows[0];
    }

    /**
     * Menemukan admin berdasarkan ID.
     * Tidak mengembalikan password untuk keamanan.
     * @param {number} id - ID admin.
     * @returns {Promise<Object|null>}
     */
    static async findById(id) {
        const [rows] = await pool.query('SELECT id_admin, username, nama, email, role FROM admin WHERE id_admin = ?', [id]);
        return rows[0];
    }
}

module.exports = Admin;