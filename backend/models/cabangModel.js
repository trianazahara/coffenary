const pool = require('../config/db');

class Cabang {
  static async findAll({ includeInactive = false } = {}) {
    const sql = includeInactive
      ? 'SELECT * FROM cabang ORDER BY tanggal_dibuat DESC'
      : 'SELECT * FROM cabang WHERE is_aktif = 1 ORDER BY tanggal_dibuat DESC';
    const [rows] = await pool.query(sql);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM cabang WHERE id_cabang = ? LIMIT 1', [id]);
    return rows[0];
  }

  static async create({ nama_cabang, alamat, telepon, is_aktif = 1 }) {
    const [res] = await pool.query(
      `INSERT INTO cabang (nama_cabang, alamat, telepon, is_aktif, tanggal_dibuat)
       VALUES (?, ?, ?, ?, NOW())`,
      [nama_cabang, alamat, telepon, is_aktif ? 1 : 0]
    );
    return res.insertId;
  }

  static async update(id, { nama_cabang, alamat, telepon, is_aktif }) {
    const fields = [];
    const vals = [];
    if (nama_cabang !== undefined) { fields.push('nama_cabang = ?'); vals.push(nama_cabang); }
    if (alamat !== undefined)      { fields.push('alamat = ?');      vals.push(alamat); }
    if (telepon !== undefined)     { fields.push('telepon = ?');     vals.push(telepon); }
    if (is_aktif !== undefined)    { fields.push('is_aktif = ?');    vals.push(is_aktif ? 1 : 0); }

    if (!fields.length) return { affectedRows: 0 };

    vals.push(id);
    const [res] = await pool.query(
      `UPDATE cabang SET ${fields.join(', ')} WHERE id_cabang = ?`,
      vals
    );
    return res;
  }

  static async softDelete(id) {
    const [res] = await pool.query(
      'UPDATE cabang SET is_aktif = 0 WHERE id_cabang = ?',
      [id]
    );
    return res;
  }
}
module.exports = Cabang;
