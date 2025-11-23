class CheckoutController {
  constructor({ pool, LogModel }) {
    this.pool = pool;
    this.LogModel = LogModel;

    this.checkout = this.checkout.bind(this);
  }

  async checkout(req, res) {
    // id_pengguna boleh dari token, fallback ke body jika belum migrate FE
    const id_pengguna =
      req.user?.id ?? req.body.id_pengguna ?? null;

    const {
      id_cabang,
      tipe_pesanan,       // enum('makan_di_tempat','bawa_pulang')
      items,              // [{ id_menu, jumlah/qty, harga, catatan }]
    } = req.body || {};

    // --------- Validasi ringan ---------
    if (!id_pengguna || !id_cabang || !tipe_pesanan || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Data checkout tidak lengkap' });
    }
    const allowedTipe = ['makan_di_tempat','bawa_pulang'];
    if (!allowedTipe.includes(tipe_pesanan)) {
      return res.status(400).json({ message: 'Tipe pesanan tidak valid' });
    }

    const conn = await this.pool.getConnection();
    try {
      await conn.beginTransaction();

      // Hitung subtotal (integer Rupiah)
      let subtotal = 0;
      for (const it of items) {
        const harga = Number(it.harga ?? it.harga_satuan ?? 0);
        const qty   = Number(it.jumlah ?? it.qty ?? 0);
        subtotal += harga * qty;
      }
      const total = subtotal;

      const nomorPesanan = `ORD-${Date.now()}`;

      // Insert pesanan (sekalian simpan catatan pesanan kalau ada)
      const [pesananRes] = await conn.query(
        `INSERT INTO pesanan
          (nomor_pesanan, id_pengguna, id_cabang, tipe_pesanan, status, total_harga, tanggal_dibuat)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          nomorPesanan,
          id_pengguna,
          id_cabang,
          tipe_pesanan,
          'pending',
          total
        ]
      );
      const id_pesanan = pesananRes.insertId;

      // Insert item-item pesanan
      for (const it of items) {
        const harga = Number(it.harga ?? it.harga_satuan ?? 0);
        const qty   = Number(it.jumlah ?? it.qty ?? 0);

        await conn.query(
          `INSERT INTO pesanan_item
            (id_pesanan, id_menu, jumlah, catatan, harga_satuan, subtotal, tanggal_dibuat)
           VALUES (?, ?, ?, ?, ?, ?, NOW())`,
          [
            id_pesanan,
            it.id_menu,
            qty,
            it.catatan || it.note || null,
            harga,
            harga * qty
          ]
        );
      }

      // Stub pembayaran (biar record pembayaran ada dari awal)
      await conn.query(
        `INSERT INTO pembayaran
           (id_pesanan, order_id, snap_token, snap_redirect_url, metode_pembayaran, payment_type, status_pembayaran, jumlah_bayar, referensi_pembayaran, respon_gateway, transaction_id, tanggal_pembayaran, tanggal_dibuat)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          id_pesanan,
          nomorPesanan,
          null,
          null,
          'qris',               // default awal, nanti bisa di-update saat initiate gateway
          null,
          'pending',
          total,
          null,
          JSON.stringify({ stage: 'stub' }),
          null,
          null
        ]
      );

      await conn.commit();

      return res.status(201).json({
        message: 'Checkout berhasil',
        id_pesanan,
        nomorPesanan,
        subtotal,
        total_harga: total,
        status: 'pending'
      });
    } catch (err) {
      await conn.rollback();
      console.error('checkout error:', err);
      return res.status(500).json({ message: 'Gagal checkout', error: err.message });
    } finally {
      conn.release();
    }
  }
}

module.exports = { CheckoutController };
