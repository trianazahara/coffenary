const pool = require('../config/db');


class Pengguna {
    static async create(data) {
        const { username, email, kata_sandi_hash, nama_lengkap, telepon, peran } = data;
        const [result] = await pool.query(
            'INSERT INTO pengguna (username, email, kata_sandi_hash, nama_lengkap, telepon, peran) VALUES (?, ?, ?, ?, ?, ?)',
            [username, email, kata_sandi_hash, nama_lengkap, telepon, peran || 'pelanggan']
        );
        return { id: result.insertId, ...data };
    }

    static async findByEmail(email) {
        const [rows] = await pool.query('SELECT * FROM pengguna WHERE email = ?', [email]);
        return rows[0];
    }
static async findAll(filter = {}) {
    let query = 'SELECT id_pengguna, username, email, nama_lengkap, telepon, peran, is_aktif FROM pengguna';
    const params = [];

    // Filter untuk hanya mengambil staff & admin
    if (filter.tipe === 'staff') {
        query += " WHERE peran IN ('admin', 'staff')";
    } 
    // Filter untuk hanya mengambil pelanggan
    else if (filter.tipe === 'pelanggan') {
        query += " WHERE peran = 'pelanggan'";
    }
    // Jika tidak ada filter, ambil semua

    query += ' ORDER BY tanggal_dibuat DESC';
    const [rows] = await pool.query(query, params);
    return rows;
}

    static async update(id, data) {
        const { nama_lengkap, telepon, peran, is_aktif } = data;
        const [result] = await pool.query(
            'UPDATE pengguna SET nama_lengkap = ?, telepon = ?, peran = ?, is_aktif = ? WHERE id_pengguna = ?',
            [nama_lengkap, telepon, peran, is_aktif, id]
        );
        return result;
    }

    static async update(id, data) {
    // Ambil field yang mungkin diubah
    const { nama_lengkap, telepon, peran, is_aktif, kata_sandi_hash } = data;

    let query = 'UPDATE pengguna SET nama_lengkap = ?, telepon = ?, peran = ?, is_aktif = ?';
    const params = [nama_lengkap, telepon, peran, is_aktif];

    // Jika ada password baru (sudah di-hash), tambahkan ke query
    if (kata_sandi_hash) {
        query += ', kata_sandi_hash = ?';
        params.push(kata_sandi_hash);
    }

    query += ' WHERE id_pengguna = ?';
    params.push(id);

    const [result] = await pool.query(query, params);
    return result;
}
}





module.exports = Pengguna;