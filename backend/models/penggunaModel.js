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
static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM pengguna WHERE id_pengguna = ?', [id]);
    return rows[0];
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
    const { nama_lengkap, telepon, peran, is_aktif, kata_sandi_hash } = data;

    // Ambil data lama dari database
    const [oldRows] = await pool.query('SELECT * FROM pengguna WHERE id_pengguna = ?', [id]);
    const oldData = oldRows[0];

    // Gunakan nilai lama jika data baru tidak dikirim
    const finalPeran = peran ?? oldData.peran;
    const finalIsAktif = is_aktif ?? oldData.is_aktif;

    let query = 'UPDATE pengguna SET nama_lengkap = ?, telepon = ?, peran = ?, is_aktif = ?';
    const params = [nama_lengkap, telepon, finalPeran, finalIsAktif];

    if (kata_sandi_hash) {
        query += ', kata_sandi_hash = ?';
        params.push(kata_sandi_hash);
    }

    query += ' WHERE id_pengguna = ?';
    params.push(id);

    const [result] = await pool.query(query, params);
    return result;
}
    static async setOtp(email, otp_hash, otp_expiry) {
        const [result] = await pool.query(
            'UPDATE pengguna SET otp_hash = ?, otp_expiry = ? WHERE email = ?',
            [otp_hash, otp_expiry, email]
        );
        return result;
    }

    static async resetPassword(email, kata_sandi_hash) {
        const [result] = await pool.query(
            'UPDATE pengguna SET kata_sandi_hash = ?, otp_hash = NULL, otp_expiry = NULL WHERE email = ?',
            [kata_sandi_hash, email]
        );
        return result;
    }

 
}


module.exports = Pengguna;