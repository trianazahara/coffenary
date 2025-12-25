const pool = require('../../../config/db');

let poolClosed = false;

/**
 * Reset tabel-tabel utama agar state test bersih.
 * Note: gunakan DB khusus test. Truncate dilakukan dengan FK dimatikan sementara.
 */
async function resetDatabase() {
  const conn = await pool.getConnection();
  try {
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    const tables = [
      'pembayaran',
      'pesanan_item',
      'pesanan',
      'menu',
      'cabang',
      'log_aktivitas',
      'pengguna'
    ];
    for (const tbl of tables) {
      // TRUNCATE lebih cepat dan reset auto_increment
      await conn.query(`TRUNCATE TABLE ${tbl}`);
    }
  } finally {
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    conn.release();
  }
}

async function closePool() {
  if (poolClosed) return;
  poolClosed = true;
  try {
    await pool.end();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Gagal menutup pool DB:', err.message);
  }
}

module.exports = { resetDatabase, closePool };
