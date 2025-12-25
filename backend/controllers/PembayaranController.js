// controllers/Pembayaran.js
class PembayaranController {
  constructor({ pool, snap, now = () => Date.now() }) {
    this.pool = pool;
    this.snap = snap;
    this.now = now;

    this.initiate = this.initiate.bind(this);
    this.reinitiate = this.reinitiate.bind(this);
  }

  async initiate(req, res, next) {
    try {
      const { id_pesanan, total_harga, customer, items } = req.body || {};
      if (!id_pesanan) {
        return res.status(400).json({ message: 'id_pesanan wajib' });
      }

      // Ambil pesanan (untuk total default & validasi eksistensi)
      const [pesananRows] = await this.pool.query(
        'SELECT id_pesanan, nomor_pesanan, total_harga FROM pesanan WHERE id_pesanan=? LIMIT 1',
        [id_pesanan]
      );
      const pesanan = pesananRows?.[0];
      if (!pesanan) return res.status(404).json({ message: 'Pesanan tidak ditemukan' });

      const grossAmount = Number(total_harga ?? pesanan.total_harga);

      let item_details = [];
      if (Array.isArray(items) && items.length) {
        item_details = items.map(i => ({
          id: String(i.id_menu ?? i.id ?? ''),
          price: Number(i.harga) || 0,
          quantity: Number(i.jumlah ?? i.qty ?? 1) || 1,
          name: i.nama_menu || i.nama || 'Item'
        }));
      } else {
        // fallback: tarik dari DB
        const [rows] = await this.pool.query(
          `SELECT pi.id_menu, m.nama_menu, pi.jumlah, pi.harga_satuan
           FROM pesanan_item pi
           JOIN menu m ON m.id_menu = pi.id_menu
           WHERE pi.id_pesanan = ?`,
          [id_pesanan]
        );
        item_details = rows.map(r => ({
          id: String(r.id_menu),
          price: Number(r.harga_satuan) || 0,
          quantity: Number(r.jumlah) || 0,
          name: r.nama_menu
        }));
      }

      const orderId = `ORDER-${id_pesanan}-${this.now()}`;
      const payload = {
        transaction_details: { order_id: orderId, gross_amount: grossAmount },
        item_details,
        customer_details: {
          first_name: customer?.first_name || 'Pelanggan',
          last_name: customer?.last_name || '',
          email: customer?.email || '',
          phone: customer?.phone || ''
        },
        credit_card: { secure: true }
      };

      const snapResponse = await this.snap.createTransaction(payload);
      // { token, redirect_url, ... }

      // Update baris pembayaran terakhir utk pesanan ini
      await this.pool.query(
        `UPDATE pembayaran
           SET status_pembayaran = ?,
               jumlah_bayar = ?,
               referensi_pembayaran = ?,
               respon_gateway = ?,
               tanggal_pembayaran = NULL
         WHERE id_pesanan = ?
         ORDER BY id_pembayaran DESC
         LIMIT 1`,
        ['pending', grossAmount, orderId, JSON.stringify({ initiate: snapResponse }), id_pesanan]
      );

      // Kolom tambahan (jika ada di skema)
      try {
        await this.pool.query(
          `UPDATE pembayaran
             SET snap_token = ?, snap_redirect_url = ?, payment_type = ?
           WHERE id_pesanan = ?
           ORDER BY id_pembayaran DESC
           LIMIT 1`,
          [snapResponse.token || null, snapResponse.redirect_url || null, 'snap', id_pesanan]
        );
      } catch (_) {
        // abaikan bila kolom belum ada
      }

      return res.json({
        message: 'Inisiasi pembayaran sukses',
        order_id: orderId,
        snap: snapResponse
      });
    } catch (err) {
      return next(err);
    }
  }

  // Alias: reinitiate cukup panggil initiate lagi
  async reinitiate(req, res, next) {
    return this.initiate(req, res, next);
  }
}

module.exports = { PembayaranController };
