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
    const { nama_lengkap = null, telepon = null, peran, is_aktif, kata_sandi_hash } = data;

    const [oldRows] = await pool.query('SELECT * FROM pengguna WHERE id_pengguna = ?', [id]);
    const oldData = oldRows[0];

    const finalPeran = typeof peran !== 'undefined' ? peran : oldData.peran;
    const finalIsAktif = typeof is_aktif !== 'undefined' ? is_aktif : oldData.is_aktif;

    let query = 'UPDATE pengguna SET nama_lengkap = ?, telepon = ?, peran = ?, is_aktif = ?';
    const params = [nama_lengkap ?? oldData.nama_lengkap, telepon ?? oldData.telepon, finalPeran, finalIsAktif];

    if (kata_sandi_hash) { query += ', kata_sandi_hash = ?'; params.push(kata_sandi_hash); }

    query += ' WHERE id_pengguna = ?'; params.push(id);

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

    static async updateProfile(id, data) {
        const allowed = [
        'nama_lengkap',
        'email',
        'telepon',
        'kata_sandi_hash',
        ];

        const sets = [];
        const vals = [];

        for (const key of allowed) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            sets.push(`${key} = ?`);
            vals.push(data[key]);
        }
        }

        if (!sets.length) return { affectedRows: 0, changedRows: 0 };

        const sql = `
        UPDATE pengguna
        SET ${sets.join(', ')}, tanggal_diupdate = NOW()
        WHERE id_pengguna = ?
        `;
        vals.push(id);

        const [result] = await pool.query(sql, vals);
        return result;
    }

 
}


module.exports = Pengguna;