// models/penggunaModel.js
const pool = require('../config/db');

class Pengguna {
  static async create(data) {
    const {
      username,
      email,
      kata_sandi_hash,
      nama_lengkap,
      telepon,
      peran = 'pelanggan',
      is_aktif = 1,
    } = data;

    const [result] = await pool.query(
      `INSERT INTO pengguna (username, email, kata_sandi_hash, nama_lengkap, telepon, peran, is_aktif)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [username, email, kata_sandi_hash, nama_lengkap, telepon, peran, is_aktif]
    );
    return { id: result.insertId, ...data };
  }

  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM pengguna WHERE id_pengguna = ? LIMIT 1',
      [id]
    );
    return rows[0];
  }

  static async findByEmail(email) {
    const [rows] = await pool.query(
      'SELECT * FROM pengguna WHERE email = ? LIMIT 1',
      [email]
    );
    return rows[0];
  }

  static async findAll(filter = {}) {
    let query = `
      SELECT id_pengguna, username, email, nama_lengkap, telepon, peran, is_aktif, tanggal_dibuat, tanggal_diupdate
      FROM pengguna
    `;
    const where = [];

    if (filter.tipe === 'staff') where.push(`peran IN ('admin','staff')`);
    else if (filter.tipe === 'pelanggan') where.push(`peran = 'pelanggan'`);

    if (where.length) query += ' WHERE ' + where.join(' AND ');
    query += ' ORDER BY tanggal_dibuat DESC';

    const [rows] = await pool.query(query);
    return rows;
  }

  /**
   * Update oleh ADMIN/STAFF.
   * Boleh set: nama_lengkap, email, telepon, kata_sandi_hash, peran, is_aktif
   * Hanya field yang dikirim yang akan di-update (dinamis).
   */
  static async updateAdmin(id, data) {
    const allowed = [
      'nama_lengkap',
      'email',
      'telepon',
      'kata_sandi_hash',
      'peran',
      'is_aktif',
    ];

    const sets = [];
    const vals = [];

    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        sets.push(`${key} = ?`);
        if (key === 'is_aktif') {
          const v = data[key];
          vals.push(v === true || v === 1 || v === '1' ? 1 : 0);
        } else {
          vals.push(data[key]);
        }
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

  /**
   * Update PROFIL oleh pemilik akun.
   * Boleh set: nama_lengkap, email, telepon, kata_sandi_hash
   * TIDAK boleh set: peran, is_aktif
   */
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
