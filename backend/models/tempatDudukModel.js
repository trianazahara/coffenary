// backend/models/tempatDudukModel.js
const pool = require('../config/db');

class TempatDuduk {
  static async findAllByCabang(id_cabang) {
    const [rows] = await pool.query(
      `SELECT id_meja, id_cabang, nomor_meja, kapasitas, catatan, tanggal_dibuat
       FROM tempat_duduk
       WHERE id_cabang = ?
       ORDER BY CAST(nomor_meja AS UNSIGNED), nomor_meja`,
      [id_cabang]
    );
    return rows;
  }

  static async findById(id_meja) {
    const [rows] = await pool.query(
      `SELECT id_meja, id_cabang, nomor_meja, kapasitas, catatan, tanggal_dibuat
       FROM tempat_duduk
       WHERE id_meja = ?`,
      [id_meja]
    );
    return rows[0];
  }

  // Cek nomor meja unik per cabang (tanpa mengubah DB)
  static async isNomorExist(id_cabang, nomor_meja, excludeId = null) {
    let sql = `SELECT 1 FROM tempat_duduk WHERE id_cabang = ? AND nomor_meja = ?`;
    const params = [id_cabang, String(nomor_meja)];
    if (excludeId) {
      sql += ` AND id_meja <> ?`;
      params.push(excludeId);
    }
    const [rows] = await pool.query(sql, params);
    return rows.length > 0;
  }

  static async create({ id_cabang, nomor_meja, kapasitas = null, catatan = null }) {
    const [result] = await pool.query(
      `INSERT INTO tempat_duduk (id_cabang, nomor_meja, kapasitas, catatan, tanggal_dibuat)
       VALUES (?, ?, ?, ?, NOW())`,
      [id_cabang, String(nomor_meja), kapasitas !== null ? Number(kapasitas) : null, catatan]
    );
    return { id_meja: result.insertId, id_cabang, nomor_meja: String(nomor_meja), kapasitas, catatan };
  }

  static async update(id_meja, data = {}) {
    const fields = [];
    const params = [];

    if (Object.prototype.hasOwnProperty.call(data, 'nomor_meja')) {
      fields.push('nomor_meja = ?');
      params.push(String(data.nomor_meja));
    }
    if (Object.prototype.hasOwnProperty.call(data, 'kapasitas')) {
      fields.push('kapasitas = ?');
      params.push(data.kapasitas !== null ? Number(data.kapasitas) : null);
    }
    if (Object.prototype.hasOwnProperty.call(data, 'catatan')) {
      fields.push('catatan = ?');
      params.push(data.catatan);
    }

    if (!fields.length) return { affectedRows: 0, changedRows: 0 };

    const sql = `UPDATE tempat_duduk SET ${fields.join(', ')} WHERE id_meja = ?`;
    params.push(id_meja);

    const [result] = await pool.query(sql, params);
    return result;
  }

  static async remove(id_meja) {
    const [result] = await pool.query(`DELETE FROM tempat_duduk WHERE id_meja = ?`, [id_meja]);
    return result;
  }
  static async hasActiveOrders(id_meja) {
    // aktif = semua status KECUALI selesai & dibatalkan
    const [rows] = await pool.query(
        `SELECT COUNT(*) AS cnt
        FROM pesanan
        WHERE id_meja = ? AND status NOT IN ('selesai','dibatalkan')`,
        [id_meja]
    );
    return rows[0].cnt > 0;
    }
}

module.exports = TempatDuduk;
