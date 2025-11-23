class PesananController {
  constructor({ repo, snap, LogModel, now = () => Date.now() }) {
    this.repo = repo;
    this.snap = snap;
    this.LogModel = LogModel;
    this.now = now;

    this.checkout = this.checkout.bind(this);
    this.semuaByCabang = this.semuaByCabang.bind(this);
    this.ubahStatus = this.ubahStatus.bind(this);
    this.statistikCabang = this.statistikCabang.bind(this);
    this.detail = this.detail.bind(this);
    this.riwayatPengguna = this.riwayatPengguna.bind(this);
    this.detailPelanggan = this.detailPelanggan.bind(this);
    this.recreatePembayaran = this.recreatePembayaran.bind(this);
    this.pembayaranTerbaru = this.pembayaranTerbaru.bind(this);
    this.jumlahPending = this.jumlahPending.bind(this);
  }

  #subtotal(items) {
    return items.reduce((s, it) => {
      const harga = Number(it.harga) || 0;
      const qty = Number(it.jumlah ?? it.qty) || 0;
      return s + harga * qty;
    }, 0);
  }

  async checkout(req, res, next) {
    const { id_pengguna, id_cabang, tipe_pesanan, items } = req.body || {};
    if (!id_pengguna || !id_cabang || !tipe_pesanan || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Data checkout tidak lengkap' });
    }

    const conn = await this.repo.koneksi();
    try {
      await conn.beginTransaction();

      const subtotal = Math.round(this.#subtotal(items));
      const total = subtotal;
      const nomorPesanan = `ORD-${this.now()}`;

      const id_pesanan = await this.repo.buatPesanan(conn, {
        nomor_pesanan: nomorPesanan, id_pengguna, id_cabang, tipe_pesanan, total
      });

      for (const it of items) {
        await this.repo.tambahItemPesanan(conn, {
          id_pesanan,
          id_menu: it.id_menu,
          qty: Number(it.jumlah ?? it.qty) || 0,
          catatan: it.catatan ?? it.note,
          harga: Number(it.harga) || 0
        });
      }

      await this.repo.buatPembayaranStub(conn, { id_pesanan, total, order_id: nomorPesanan });
      await conn.commit();

      return res.status(201).json({
        message: 'Checkout berhasil',
        id_pesanan,
        nomorPesanan,
        subtotal,
        total_harga: total,
        status: 'pending'
      });
    } catch (e) {
      try { await conn.rollback(); } catch {}
      return next(e);
    } finally {
      try { conn.release(); } catch {}
    }
  }

  async semuaByCabang(req, res, next) {
    try {
      res.json(await this.repo.semuaByCabang(req.params.id_cabang));
    } catch (e) { next(e); }
  }

  async ubahStatus(req, res, next) {
    try {
      const { id_pesanan } = req.params;
      const { status } = req.body;
      const r = await this.repo.ubahStatus(id_pesanan, status);
      if (r.affectedRows === 0) return res.status(404).json({ message: 'Pesanan tidak ditemukan' });

      try {
        if (this.LogModel && req.user?.id) {
          await this.LogModel.addLog({
            id_admin: req.user.id,
            aksi: 'status_change',
            entitas: 'pesanan',
            entitas_id: id_pesanan,
            keterangan: `Ubah status pesanan ${id_pesanan} -> ${status}`,
            user_agent: req.get('user-agent') || null
          });
        }
      } catch (logErr) {
        console.warn('Gagal menulis log ubah status pesanan:', logErr.message);
      }

      res.json({ message: `Status pesanan berhasil diubah menjadi ${status}` });
    } catch (e) { next(e); }
  }

  async statistikCabang(req, res, next) {
    try { res.json(await this.repo.statistikCabang(req.params.id_cabang)); }
    catch (e) { next(e); }
  }

  async detail(req, res, next) {
    try {
      const d = await this.repo.detailById(req.params.id_pesanan);
      if (!d) return res.status(404).json({ message: 'Detail pesanan tidak ditemukan' });
      res.json(d);
    } catch (e) { next(e); }
  }

  async riwayatPengguna(req, res, next) {
    try {
      const id_pengguna = req.user?.id;
      if (!id_pengguna) return res.status(400).json({ message: 'id_pengguna tidak ditemukan pada token' });

      const orders = await this.repo.pesananByPengguna(id_pengguna);
      if (!orders.length) return res.json([]);

      const ids = orders.map(o => o.id);
      const items = await this.repo.itemByOrderIds(ids);

      const bucket = {};
      for (const it of items) {
        (bucket[it.id_pesanan] ||= []).push({
          id_menu: it.id_menu,
          nama_menu: it.nama_menu,
          jumlah: it.jumlah,
          catatan: it.catatan || null,
          harga_satuan: Number(it.harga_satuan || 0),
          subtotal: Number(it.subtotal || 0)
        });
      }
      const result = orders.map(o => ({
        ...o,
        metode_pembayaran: o.metode_pembayaran || '-',
        items: bucket[o.id] || []
      }));
      res.json(result);
    } catch (e) { next(e); }
  }

  async detailPelanggan(req, res, next) {
    try {
      const { id_pesanan } = req.params;
      const id_pengguna = req.user?.id;

      const own = await this.repo.milikPengguna(id_pesanan, id_pengguna);
      if (!own) return res.status(404).json({ message: 'Pesanan tidak ditemukan' });

      const p = await this.repo.detailById(id_pesanan);
      const latest = await this.repo.latestPembayaran(id_pesanan);

      res.json({
        pesanan: {
          id: p.id_pesanan,
          nomor_pesanan: p.nomor_pesanan,
          tanggal_dibuat: p.tanggal_dibuat,
          status: p.status,
          total_harga: p.total_harga,
          tipe_pesanan: p.tipe_pesanan,
          cabang: p.cabang,         // tergantung kolom di view kamu
          items: p.items.map(i => ({
            id_menu: i.id_menu, nama_menu: i.nama_menu, jumlah: i.jumlah,
            harga_satuan: i.harga_satuan, subtotal: i.subtotal, catatan: i.catatan
          }))
        },
        pembayaran_terakhir: latest
      });
    } catch (e) { next(e); }
  }

  async recreatePembayaran(req, res, next) {
    try {
      const { id_pesanan } = req.params;
      const id_pengguna = req.user?.id;

      const own = await this.repo.milikPengguna(id_pesanan, id_pengguna);
      if (!own) return res.status(404).json({ message: 'Pesanan tidak ditemukan' });

      const p = await this.repo.detailById(id_pesanan);
      if (!p) return res.status(404).json({ message: 'Pesanan tidak ditemukan' });

      const order_id = `ORDER-${p.id_pesanan}-${this.now()}`;
      const parameter = {
        transaction_details: { order_id, gross_amount: Number(p.total_harga) },
        credit_card: { secure: true },
        enabled_payments: ['qris','gopay','bank_transfer','credit_card']
      };

      const snapRes = await this.snap.createTransaction(parameter);
      const id_pembayaran = await this.repo.simpanPembayaranSnap({
        id_pesanan, order_id,
        snap_token: snapRes.token,
        snap_redirect_url: snapRes.redirect_url,
        payment_type: snapRes.payment_type || 'snap',
        jumlah_bayar: p.total_harga
      });

      res.json({
        pembayaran: {
          id_pembayaran, id_pesanan, order_id,
          snap_token: snapRes.token || null,
          snap_redirect_url: snapRes.redirect_url || null,
          metode_pembayaran: 'qris',
          payment_type: snapRes.payment_type || 'snap',
          status_pembayaran: 'pending',
          jumlah_bayar: p.total_harga
        }
      });
    } catch (e) { next(e); }
  }

  async pembayaranTerbaru(req, res, next) {
    try {
      const { id_pesanan } = req.params;
      const id_pengguna = req.user?.id;

      const own = await this.repo.milikPengguna(id_pesanan, id_pengguna);
      if (!own) return res.status(404).json({ message: 'Tidak ditemukan' });

      res.json(await this.repo.latestPembayaran(id_pesanan));
    } catch (e) { next(e); }
  }

  async jumlahPending(req, res, next) {
    try {
      res.json({ count: await this.repo.hitungPendingByCabang(req.params.id_cabang) });
    } catch (e) { next(e); }
  }
}

module.exports = { PesananController };
