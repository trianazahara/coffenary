// models/logModel.js
const pool = require('../config/db');

const ALLOWED_AKSI = ['create', 'update', 'delete', 'status_change'];
const ALLOWED_ENTITAS = ['menu', 'pengguna', 'pesanan', 'cabang', 'pembayaran'];

class Log {
  static #validate({ aksi, entitas }) {
    if (!ALLOWED_AKSI.includes(aksi)) throw new Error('aksi tidak valid');
    if (!ALLOWED_ENTITAS.includes(entitas)) throw new Error('entitas tidak valid');
  }

  // ————— CREATE
  static async addLog({ id_admin, aksi, entitas, entitas_id = null, keterangan = null, user_agent = null }) {
    this.#validate({ aksi, entitas });

    const sql = `
      INSERT INTO log_aktivitas
        (id_admin, aksi, entitas, entitas_id, keterangan, user_agent)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [id_admin, aksi, entitas, entitas_id, keterangan, user_agent];
    const [r] = await pool.query(sql, params);
    return { id_log: r.insertId };
  }

  // alias singkat jika mau dipakai: LogModel.add({...})
  static async add(args) { return this.addLog(args); }

  // ————— READ (list + filter + pagination)
  static async getLogs({
    page = 1,
    limit = 20,
    admin_id,
    entitas,
    aksi,
    q,
    date_from,
    date_to
  } = {}) {
    const wh = [];
    const ps = [];

    if (admin_id) { wh.push('l.id_admin = ?'); ps.push(admin_id); }
    if (entitas)  { wh.push('l.entitas = ?');  ps.push(entitas); }
    if (aksi)     { wh.push('l.aksi = ?');     ps.push(aksi); }
    if (date_from){ wh.push('DATE(l.tanggal_dibuat) >= ?'); ps.push(date_from); }
    if (date_to)  { wh.push('DATE(l.tanggal_dibuat) <= ?'); ps.push(date_to); }
    if (q)        { wh.push('(l.keterangan LIKE ? OR p.nama_lengkap LIKE ?)'); ps.push(`%${q}%`,`%${q}%`); }

    const whereSql = wh.length ? `WHERE ${wh.join(' AND ')}` : '';
    const pg  = Math.max(1, Number(page) || 1);
    const lim = Math.max(1, Number(limit) || 20);
    const offset = (pg - 1) * lim;

    const sql = `
      SELECT
        l.id_log,
        l.id_admin,
        p.nama_lengkap AS admin_nama,
        l.aksi,
        l.entitas,
        l.entitas_id,
        l.keterangan,
        l.user_agent,
        l.tanggal_dibuat
      FROM log_aktivitas l
      JOIN pengguna p ON p.id_pengguna = l.id_admin
      ${whereSql}
      ORDER BY l.tanggal_dibuat DESC
      LIMIT ? OFFSET ?
    `;
    const countSql = `
      SELECT COUNT(*) AS total
      FROM log_aktivitas l
      JOIN pengguna p ON p.id_pengguna = l.id_admin
      ${whereSql}
    `;

    const [rows]   = await pool.query(sql,   [...ps, lim, offset]);
    const [countR] = await pool.query(countSql, ps);

    return {
      data: rows,
      meta: { page: pg, limit: lim, total: countR[0]?.total || 0 }
    };
  }

  // alias singkat: LogModel.list(filters)
  static async list(filters) { return this.getLogs(filters); }

  // ————— DELETE ALL
  static async clearLogs() {
    const [r] = await pool.query('TRUNCATE TABLE log_aktivitas');
    return r;
  }

  // alias: LogModel.clear()
  static async clear() { return this.clearLogs(); }
}

module.exports = Log;
