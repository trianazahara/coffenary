// models/PesananM.js
class Pesanan {
  constructor(pool) {
    this.pool = pool;
  }

  async koneksi() {
    return this.pool.getConnection();
  }

  // CREATE
  async buatPesanan(conn, { nomor_pesanan, id_pengguna, id_cabang, tipe_pesanan, total }) {
    const [res] = await conn.query(
      `INSERT INTO pesanan
        (nomor_pesanan, id_pengguna, id_cabang, tipe_pesanan, status, total_harga, tanggal_dibuat)
       VALUES (?, ?, ?, ?, 'pending', ?, NOW())`,
      [nomor_pesanan, id_pengguna, id_cabang, tipe_pesanan, total]
    );
    return res.insertId;
  }

  async tambahItemPesanan(conn, { id_pesanan, id_menu, qty, catatan, harga }) {
    await conn.query(
      `INSERT INTO pesanan_item
        (id_pesanan, id_menu, jumlah, catatan, harga_satuan, subtotal, tanggal_dibuat)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [id_pesanan, id_menu, qty, catatan ?? null, harga, harga * qty]
    );
  }

  async buatPembayaranStub(conn, { id_pesanan, total, order_id }) {
    await conn.query(
      `INSERT INTO pembayaran
        (id_pesanan, order_id, snap_token, snap_redirect_url, metode_pembayaran, payment_type, status_pembayaran, jumlah_bayar, referensi_pembayaran, respon_gateway, transaction_id, tanggal_pembayaran, tanggal_dibuat)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [id_pesanan, order_id, null, null, 'qris', null, 'pending', total, null, JSON.stringify({ stage: 'stub' }), null, null]
    );
  }

  // READ
  async semuaByCabang(id_cabang) {
    const [rows] = await this.pool.query(
      `SELECT p.*, pg.nama_lengkap AS nama_pelanggan
       FROM pesanan p
       JOIN pengguna pg ON p.id_pengguna = pg.id_pengguna
       WHERE p.id_cabang = ?
       ORDER BY p.tanggal_dibuat DESC`,
      [id_cabang]
    );
    return rows;
  }

  async detailById(id_pesanan) {
    const [orderRows] = await this.pool.query(
      `SELECT p.*, pg.nama_lengkap AS nama_pelanggan, c.nama_cabang AS cabang
       FROM pesanan p
       JOIN pengguna pg ON p.id_pengguna = pg.id_pengguna
       LEFT JOIN cabang c ON p.id_cabang = c.id_cabang
       WHERE p.id_pesanan = ?`,
      [id_pesanan]
    );
    if (!orderRows.length) return null;

    const [itemRows] = await this.pool.query(
      `SELECT pi.*, m.nama_menu
       FROM pesanan_item pi
       JOIN menu m ON pi.id_menu = m.id_menu
       WHERE pi.id_pesanan = ?`,
      [id_pesanan]
    );

    const pesanan = orderRows[0];
    pesanan.items = itemRows;
    return pesanan;
  }

  async statistikCabang(id_cabang) {
    const [[harian]] = await this.pool.query(
      `SELECT COUNT(*) AS totalOrders
       FROM pesanan WHERE DATE(tanggal_dibuat)=CURDATE() AND id_cabang=?`,
      [id_cabang]
    );
    const [[revHarian]] = await this.pool.query(
      `SELECT SUM(total_harga) AS totalRevenue
       FROM pesanan WHERE DATE(tanggal_dibuat)=CURDATE() AND status='selesai' AND id_cabang=?`,
      [id_cabang]
    );
    const [topMenuRows] = await this.pool.query(
      `SELECT m.nama_menu, SUM(pi.jumlah) AS totalQuantity
       FROM pesanan_item pi
       JOIN menu m ON pi.id_menu=m.id_menu
       JOIN pesanan p ON pi.id_pesanan=p.id_pesanan
       WHERE p.id_cabang=? AND DATE(p.tanggal_dibuat)=CURDATE()
       GROUP BY m.nama_menu
       ORDER BY totalQuantity DESC LIMIT 1`,
      [id_cabang]
    );
    const [[lifeOrders]] = await this.pool.query(
      `SELECT COUNT(*) AS totalLifetimeOrders FROM pesanan WHERE id_cabang=?`,
      [id_cabang]
    );
    const [[lifeRevenue]] = await this.pool.query(
      `SELECT SUM(total_harga) AS totalLifetimeRevenue
       FROM pesanan WHERE status='selesai' AND id_cabang=?`,
      [id_cabang]
    );

    return {
      totalOrders: harian?.totalOrders || 0,
      totalRevenue: Number(revHarian?.totalRevenue || 0),
      topMenu: topMenuRows[0]?.nama_menu || 'Belum ada',
      totalLifetimeOrders: lifeOrders?.totalLifetimeOrders || 0,
      totalLifetimeRevenue: Number(lifeRevenue?.totalLifetimeRevenue || 0)
    };
  }

  async ubahStatus(id_pesanan, status) {
    const [result] = await this.pool.query(
      `UPDATE pesanan SET status=? WHERE id_pesanan=?`,
      [status, id_pesanan]
    );
    return result;
  }

  async pesananByPengguna(id_pengguna) {
    const [orders] = await this.pool.query(
      `SELECT 
        p.id_pesanan AS id, p.nomor_pesanan, p.tanggal_dibuat, p.status, p.total_harga,
        p.tipe_pesanan, c.nama_cabang AS cabang, pb.payment_type AS metode_pembayaran
       FROM pesanan p
       LEFT JOIN cabang c ON c.id_cabang=p.id_cabang
       LEFT JOIN (
         SELECT x.* FROM pembayaran x
         JOIN (
           SELECT id_pesanan, MAX(id_pembayaran) AS last_id
           FROM pembayaran GROUP BY id_pesanan
         ) y ON x.id_pesanan=y.id_pesanan AND x.id_pembayaran=y.last_id
       ) pb ON pb.id_pesanan=p.id_pesanan
       WHERE p.id_pengguna=?
       ORDER BY p.tanggal_dibuat DESC`,
      [id_pengguna]
    );
    return orders;
  }

  async itemByOrderIds(ids) {
    if (!ids.length) return [];
    const placeholders = ids.map(() => '?').join(',');
    const [items] = await this.pool.query(
      `SELECT 
         pi.id_pesanan, pi.id_item, pi.id_menu, m.nama_menu, pi.jumlah,
         pi.catatan, pi.harga_satuan, pi.subtotal
       FROM pesanan_item pi
       LEFT JOIN menu m ON m.id_menu=pi.id_menu
       WHERE pi.id_pesanan IN (${placeholders})
       ORDER BY pi.id_item ASC`,
      ids
    );
    return items;
  }

  async latestPembayaran(id_pesanan) {
    const [rows] = await this.pool.query(
      `SELECT * FROM pembayaran WHERE id_pesanan=? ORDER BY id_pembayaran DESC LIMIT 1`,
      [id_pesanan]
    );
    return rows[0] || null;
  }

  async simpanPembayaranSnap({ id_pesanan, order_id, snap_token, snap_redirect_url, payment_type='snap', jumlah_bayar }) {
    const [ins] = await this.pool.query(
      `INSERT INTO pembayaran
        (id_pesanan, order_id, snap_token, snap_redirect_url, metode_pembayaran, payment_type, status_pembayaran, jumlah_bayar, tanggal_dibuat)
       VALUES (?, ?, ?, ?, 'qris', ?, 'pending', ?, NOW())`,
      [id_pesanan, order_id, snap_token || null, snap_redirect_url || null, payment_type, jumlah_bayar]
    );
    return ins.insertId;
  }

  async hitungPendingByCabang(id_cabang) {
    const [[row]] = await this.pool.query(
      `SELECT COUNT(*) AS count FROM pesanan WHERE id_cabang=? AND status='pending'`,
      [id_cabang]
    );
    return row?.count || 0;
  }

  async milikPengguna(id_pesanan, id_pengguna) {
    const [rows] = await this.pool.query(
      `SELECT 1 FROM pesanan WHERE id_pesanan=? AND id_pengguna=? LIMIT 1`,
      [id_pesanan, id_pengguna]
    );
    return rows.length > 0;
  }
}

module.exports = Pesanan;
