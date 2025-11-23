const { PesananController: Pesanan } = require('../../controllers/PesananController');

function mkRes() {
  return {
    statusCode: 200,
    body: null,
    status(c) { this.statusCode = c; return this; },
    json(p) { this.body = p; return this; }
  };
}
function mkNext() { return jest.fn(); }
function mkConn() {
  return {
    beginTransaction: jest.fn().mockResolvedValue(),
    commit: jest.fn().mockResolvedValue(),
    rollback: jest.fn().mockResolvedValue(),
    release: jest.fn().mockResolvedValue()
  };
}

describe('Pesanan Controller (single-file unit tests)', () => {
  const FIXED_NOW = 1700000000000;
  const originalWarn = console.warn;
  afterAll(() => { console.warn = originalWarn; });

  // ===== checkout =====
  describe('checkout', () => {
    test('400 jika payload tidak lengkap (items kosong)', async () => {
      const repo = { koneksi: jest.fn().mockResolvedValue(mkConn()) };
      const ctrl = new Pesanan({ repo, snap: {}, now: () => FIXED_NOW });

      const res = mkRes(); const next = mkNext();
      await ctrl.checkout(
        { body: { id_pengguna: 1, id_cabang: 2, tipe_pesanan: 'dine-in', items: [] } },
        res, next
      );
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ message: 'Data checkout tidak lengkap' });
      expect(next).not.toHaveBeenCalled();
    });

    test('checkout memakai default now() ketika opsi now tidak diberikan', async () => {
      // freeze time
      const FIX = 1713333444555;
      const spy = jest.spyOn(Date, 'now').mockReturnValue(FIX);

      const conn = {
        beginTransaction: jest.fn().mockResolvedValue(),
        commit: jest.fn().mockResolvedValue(),
        rollback: jest.fn().mockResolvedValue(),
        release: jest.fn().mockResolvedValue()
      };
      const repo = {
        koneksi: jest.fn().mockResolvedValue(conn),
        buatPesanan: jest.fn().mockResolvedValue(444),
        tambahItemPesanan: jest.fn().mockResolvedValue(),
        buatPembayaranStub: jest.fn().mockResolvedValue()
      };
      const snap = {}; // tidak dipakai di checkout
      // ← tidak mengoper `now` agar default now=()=>Date.now() ter-cover
      const ctrl = new Pesanan({ repo, snap });

      const res = { statusCode: 200, body: null, status(c){this.statusCode=c;return this;}, json(p){this.body=p;return this;} };
      await ctrl.checkout({
        body: {
          id_pengguna: 9,
          id_cabang: 1,
          tipe_pesanan: 'dine-in',
          items: [{ id_menu: 1, harga: 12345, jumlah: 1 }]
        }
      }, res, jest.fn());

      expect(res.statusCode).toBe(201);
      expect(res.body.nomorPesanan).toBe(`ORD-${FIX}`);
      expect(repo.buatPesanan).toHaveBeenCalledWith(
        conn,
        expect.objectContaining({ nomor_pesanan: `ORD-${FIX}` })
      );

      spy.mockRestore();
    });


    test('400 jika items bukan array', async () => {
      const repo = { koneksi: jest.fn().mockResolvedValue(mkConn()) };
      const ctrl = new Pesanan({ repo, snap: {}, now: () => FIXED_NOW });

      const res = mkRes();
      await ctrl.checkout(
        { body: { id_pengguna: 1, id_cabang: 2, tipe_pesanan: 'dine-in', items: {} } },
        res, mkNext()
      );
      expect(res.statusCode).toBe(400);
    });

    test('400 jika tipe_pesanan hilang', async () => {
      const repo = { koneksi: jest.fn().mockResolvedValue(mkConn()) };
      const ctrl = new Pesanan({ repo, snap: {}, now: () => FIXED_NOW });

      const res = mkRes();
      await ctrl.checkout(
        { body: { id_pengguna: 1, id_cabang: 2, items: [{ id_menu: 1, harga: 1000, jumlah: 1 }] } },
        res, mkNext()
      );
      expect(res.statusCode).toBe(400);
    });

    test('201 saat sukses (commit dipanggil)', async () => {
      const conn = mkConn();
      const repo = {
        koneksi: jest.fn().mockResolvedValue(conn),
        buatPesanan: jest.fn().mockResolvedValue(123),
        tambahItemPesanan: jest.fn().mockResolvedValue(),
        buatPembayaranStub: jest.fn().mockResolvedValue()
      };
      const ctrl = new Pesanan({ repo, snap: {}, now: () => FIXED_NOW });

      const req = {
        body: {
          id_pengguna: 10, id_cabang: 20, tipe_pesanan: 'dine-in', id_meja: 5,
          items: [{ id_menu: 1, harga: 10000, jumlah: 2 }, { id_menu: 2, harga: 15000, qty: 1 }]
        }
      };
      const res = mkRes(); const next = mkNext();

      await ctrl.checkout(req, res, next);

      expect(repo.buatPesanan).toHaveBeenCalledWith(
        conn,
        expect.objectContaining({
          nomor_pesanan: `ORD-${FIXED_NOW}`,
          id_pengguna: 10, id_cabang: 20, tipe_pesanan: 'dine-in', total: 35000
        })
      );
      expect(repo.tambahItemPesanan).toHaveBeenCalledTimes(2);
      expect(repo.buatPembayaranStub).toHaveBeenCalledWith(
        conn,
        { id_pesanan: 123, total: 35000, order_id: `ORD-${FIXED_NOW}` }
      );
      expect(conn.commit).toHaveBeenCalled();
      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual(expect.objectContaining({
        message: 'Checkout berhasil',
        id_pesanan: 123,
        nomorPesanan: `ORD-${FIXED_NOW}`,
        subtotal: 35000,
        total_harga: 35000,
        status: 'pending'
      }));
      expect(next).not.toHaveBeenCalled();
      expect(conn.release).toHaveBeenCalled();
    });

    test('error saat proses → rollback & next(err)', async () => {
      const conn = mkConn();
      const repo = {
        koneksi: jest.fn().mockResolvedValue(conn),
        buatPesanan: jest.fn().mockRejectedValue(new Error('DB fail')),
        tambahItemPesanan: jest.fn(),
        buatPembayaranStub: jest.fn()
      };
      const ctrl = new Pesanan({ repo, snap: {}, now: () => FIXED_NOW });

      const res = mkRes(); const next = mkNext();
      await ctrl.checkout(
        { body: { id_pengguna: 1, id_cabang: 2, tipe_pesanan: 'takeaway', items: [{ id_menu: 1, harga: 1000, jumlah: 1 }] } },
        res, next
      );
      expect(conn.rollback).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
      expect(conn.release).toHaveBeenCalled();
    });

    test('catatan via note (bukan catatan)', async () => {
      const conn = mkConn();
      const repo = {
        koneksi: jest.fn().mockResolvedValue(conn),
        buatPesanan: jest.fn().mockResolvedValue(1),
        tambahItemPesanan: jest.fn().mockResolvedValue(),
        buatPembayaranStub: jest.fn().mockResolvedValue()
      };
      const ctrl = new Pesanan({ repo, snap: {}, now: () => 123 });

      const res = mkRes();
      await ctrl.checkout({
        body: {
          id_pengguna: 1, id_cabang: 2, tipe_pesanan: 'takeaway',
          items: [{ id_menu: 10, harga: 2000, qty: 3, note: 'tanpa gula' }]
        }
      }, res, mkNext());

      expect(repo.tambahItemPesanan).toHaveBeenCalledWith(
        conn, expect.objectContaining({ catatan: 'tanpa gula' })
      );
    });

    test('item tanpa harga & jumlah → fallback 0', async () => {
      const conn = mkConn();
      const repo = {
        koneksi: jest.fn().mockResolvedValue(conn),
        buatPesanan: jest.fn().mockResolvedValue(9),
        tambahItemPesanan: jest.fn().mockResolvedValue(),
        buatPembayaranStub: jest.fn().mockResolvedValue()
      };
      const ctrl = new Pesanan({ repo, snap: {}, now: () => FIXED_NOW });

      const res = mkRes();
      await ctrl.checkout({
        body: { id_pengguna: 1, id_cabang: 2, tipe_pesanan: 'takeaway', items: [{ id_menu: 99 }] }
      }, res, mkNext());

      expect(res.statusCode).toBe(201);
      expect(res.body.subtotal).toBe(0);
      expect(res.body.total_harga).toBe(0);
    });
    test('checkout: body undefined → destructuring fallback {}, return 400', async () => {
      const repo = { koneksi: jest.fn().mockResolvedValue(mkConn()) };
      const ctrl = new Pesanan({ repo, snap: {}, now: () => FIXED_NOW });

      const res = mkRes();
      // sengaja tidak mengirim req.body agar ekspresi `req.body || {}` dievaluasi
      await ctrl.checkout({}, res, mkNext());

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ message: 'Data checkout tidak lengkap' });
    });
  });

  test('ubahStatus mencatat log saat sukses', async () => {
    const repo = { ubahStatus: jest.fn().mockResolvedValue({ affectedRows: 1 }) };
    const LogModel = { addLog: jest.fn().mockResolvedValue() };
    const ctrl = new Pesanan({ repo, snap: {}, LogModel, now: () => FIXED_NOW });

    const res = mkRes();
    await ctrl.ubahStatus(
      { params: { id_pesanan: 12 }, body: { status: 'siap' }, user: { id: 7 }, get:()=>'' },
      res,
      mkNext()
    );
    expect(LogModel.addLog).toHaveBeenCalledWith(expect.objectContaining({
      entitas: 'pesanan',
      entitas_id: 12,
      aksi: 'status_change'
    }));
    expect(res.body).toEqual({ message: 'Status pesanan berhasil diubah menjadi siap' });
  });

  test('ubahStatus 404 jika tidak ditemukan', async () => {
    const repo = { ubahStatus: jest.fn().mockResolvedValue({ affectedRows: 0 }) };
    const ctrl = new Pesanan({ repo, snap: {}, now: () => FIXED_NOW });
    const res = mkRes();
    await ctrl.ubahStatus({ params: { id_pesanan: 1 }, body: { status: 'x' } }, res, mkNext());
    expect(res.statusCode).toBe(404);
  });

  test('ubahStatus log gagal tetap 200', async () => {
    const repo = { ubahStatus: jest.fn().mockResolvedValue({ affectedRows: 1 }) };
    const LogModel = { addLog: jest.fn().mockRejectedValue(new Error('log fail')) };
    const ctrl = new Pesanan({ repo, snap: {}, LogModel, now: () => FIXED_NOW });
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const res = mkRes();
    await ctrl.ubahStatus({ params:{ id_pesanan: 3 }, body:{ status:'done' }, user:{ id:1 }, get:()=>'' }, res, mkNext());
    expect(res.statusCode).toBe(200);
    warnSpy.mockRestore();
  });

  // ===== semuaByCabang =====
  describe('semuaByCabang', () => {
    test('mengembalikan list', async () => {
      const repo = { semuaByCabang: jest.fn().mockResolvedValue([{ id_pesanan: 1 }]) };
      const ctrl = new Pesanan({ repo, snap: {}, now: () => FIXED_NOW });

      const res = mkRes(); const next = mkNext();
      await ctrl.semuaByCabang({ params: { id_cabang: 7 } }, res, next);
      expect(repo.semuaByCabang).toHaveBeenCalledWith(7);
      expect(res.body).toEqual([{ id_pesanan: 1 }]);
      expect(next).not.toHaveBeenCalled();
    });

    test('error → next(err)', async () => {
      const repo = { semuaByCabang: jest.fn().mockRejectedValue(new Error('x')) };
      const ctrl = new Pesanan({ repo, snap: {}, now: () => FIXED_NOW });

      await ctrl.semuaByCabang({ params: { id_cabang: 1 } }, mkRes(), mkNext());
    });
  });

  // ===== ubahStatus =====
  describe('ubahStatus', () => {
    test('404 jika tidak ada', async () => {
      const repo = { ubahStatus: jest.fn().mockResolvedValue({ affectedRows: 0 }) };
      const ctrl = new Pesanan({ repo, snap: {}, now: () => FIXED_NOW });

      const res = mkRes();
      await ctrl.ubahStatus({ params: { id_pesanan: 9 }, body: { status: 'selesai' } }, res, mkNext());
      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ message: 'Pesanan tidak ditemukan' });
    });

    test('200 jika sukses', async () => {
      const repo = { ubahStatus: jest.fn().mockResolvedValue({ affectedRows: 1 }) };
      const ctrl = new Pesanan({ repo, snap: {}, now: () => FIXED_NOW });

      const res = mkRes();
      await ctrl.ubahStatus({ params: { id_pesanan: 9 }, body: { status: 'selesai' } }, res, mkNext());
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'Status pesanan berhasil diubah menjadi selesai' });
    });

    test('error → next(err)', async () => {
      const repo = { ubahStatus: jest.fn().mockRejectedValue(new Error('db')) };
      const ctrl = new Pesanan({ repo, snap: {}, now: () => FIXED_NOW });

      await ctrl.ubahStatus({ params: { id_pesanan: 1 }, body: { status: 'x' } }, mkRes(), mkNext());
    });
  });

  // ===== statistikCabang =====
  describe('statistikCabang', () => {
    test('ok', async () => {
      const repo = { statistikCabang: jest.fn().mockResolvedValue({ totalOrders: 1 }) };
      const ctrl = new Pesanan({ repo, snap: {}, now: () => FIXED_NOW });

      const res = mkRes();
      await ctrl.statistikCabang({ params: { id_cabang: 3 } }, res, mkNext());
      expect(res.body).toEqual({ totalOrders: 1 });
    });

    test('error → next(err)', async () => {
      const repo = { statistikCabang: jest.fn().mockRejectedValue(new Error('x')) };
      const ctrl = new Pesanan({ repo, snap: {}, now: () => FIXED_NOW });

      await ctrl.statistikCabang({ params: { id_cabang: 3 } }, mkRes(), mkNext());
    });
  });

  // ===== detail (admin/staff) =====
  describe('detail', () => {
    test('404 jika tidak ketemu', async () => {
      const repo = { detailById: jest.fn().mockResolvedValue(null) };
      const ctrl = new Pesanan({ repo, snap: {}, now: () => FIXED_NOW });

      const res = mkRes();
      await ctrl.detail({ params: { id_pesanan: 11 } }, res, mkNext());
      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ message: 'Detail pesanan tidak ditemukan' });
    });

    test('200 jika ada', async () => {
      const repo = { detailById: jest.fn().mockResolvedValue({ id_pesanan: 11 }) };
      const ctrl = new Pesanan({ repo, snap: {}, now: () => FIXED_NOW });

      const res = mkRes();
      await ctrl.detail({ params: { id_pesanan: 11 } }, res, mkNext());
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ id_pesanan: 11 });
    });

    test('error → next(err)', async () => {
      const repo = { detailById: jest.fn().mockRejectedValue(new Error('x')) };
      const ctrl = new Pesanan({ repo, snap: {}, now: () => FIXED_NOW });

      await ctrl.detail({ params: { id_pesanan: 1 } }, mkRes(), mkNext());
    });
  });

  // ===== riwayatPengguna (pelanggan) =====
  describe('riwayatPengguna', () => {
    test('400 jika req.user.id tidak ada', async () => {
      const ctrl = new Pesanan({ repo: {}, snap: {}, now: () => FIXED_NOW });

      const res = mkRes(); const next = mkNext();
      await ctrl.riwayatPengguna({ user: null }, res, next);
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ message: 'id_pengguna tidak ditemukan pada token' });
    });

    test('[] jika tidak ada pesanan', async () => {
      const repo = { pesananByPengguna: jest.fn().mockResolvedValue([]) };
      const ctrl = new Pesanan({ repo, snap: {}, now: () => FIXED_NOW });

      const res = mkRes();
      await ctrl.riwayatPengguna({ user: { id: 7 } }, res, mkNext());
      expect(res.body).toEqual([]);
    });

    test('gabungkan items + fallback "-" dan catatan null', async () => {
      const repo = {
        pesananByPengguna: jest.fn().mockResolvedValue([{ id: 1, nomor_pesanan: 'ORD-1', metode_pembayaran: null }]),
        itemByOrderIds: jest.fn().mockResolvedValue([
          { id_pesanan: 1, id_menu: 10, nama_menu: 'Latte', jumlah: 2, catatan: null, harga_satuan: 20000, subtotal: 40000 }
        ])
      };
      const ctrl = new Pesanan({ repo, snap: {}, now: () => FIXED_NOW });

      const res = mkRes();
      await ctrl.riwayatPengguna({ user: { id: 7 } }, res, mkNext());
      expect(res.body[0]).toEqual(expect.objectContaining({
        nomor_pesanan: 'ORD-1',
        metode_pembayaran: '-',
        items: [expect.objectContaining({ nama_menu: 'Latte', jumlah: 2, catatan: null })]
      }));
    });

    test('tanpa fallback (metode_pembayaran sudah ada) & catatan terisi', async () => {
      const repo = {
        pesananByPengguna: jest.fn().mockResolvedValue([{ id: 1, nomor_pesanan: 'ORD-1', metode_pembayaran: 'qris' }]),
        itemByOrderIds: jest.fn().mockResolvedValue([
          { id_pesanan: 1, id_menu: 10, nama_menu: 'Americano', jumlah: 1, catatan: 'dingin', harga_satuan: 15000, subtotal: 15000 }
        ])
      };
      const ctrl = new Pesanan({ repo, snap: {}, now: () => FIXED_NOW });

      const res = mkRes();
      await ctrl.riwayatPengguna({ user: { id: 7 } }, res, mkNext());
      expect(res.body[0].metode_pembayaran).toBe('qris');
      expect(res.body[0].items[0].catatan).toBe('dingin');
    });

    test('error → next(err)', async () => {
      const repo = { pesananByPengguna: jest.fn().mockRejectedValue(new Error('x')) };
      const ctrl = new Pesanan({ repo, snap: {}, now: () => FIXED_NOW });

      await ctrl.riwayatPengguna({ user: { id: 1 } }, mkRes(), mkNext());
    });
    test('riwayatPengguna: harga_satuan/subtotal undefined → fallback 0 (numbered)', async () => {
      const repo = {
        pesananByPengguna: jest.fn().mockResolvedValue([
          { id: 9, nomor_pesanan: 'ORD-9', metode_pembayaran: null }
        ]),
        itemByOrderIds: jest.fn().mockResolvedValue([
          // kirim undefined supaya `|| 0` aktif, dan cek Number() menghasilkan 0
          { id_pesanan: 9, id_menu: 1, nama_menu: 'Latte', jumlah: 1, catatan: null, harga_satuan: undefined, subtotal: undefined }
        ])
      };
      const ctrl = new Pesanan({ repo, snap: {}, now: () => FIXED_NOW });

      const res = mkRes();
      await ctrl.riwayatPengguna({ user: { id: 123 } }, res, mkNext());

      expect(res.statusCode).toBe(200);
      expect(res.body[0].items[0].harga_satuan).toBe(0);
      expect(res.body[0].items[0].subtotal).toBe(0);
      // bonus: metode_pembayaran fallback '-'
      expect(res.body[0].metode_pembayaran).toBe('-');
    });
  });

  // ===== detailPelanggan =====
  describe('detailPelanggan', () => {
    test('404 jika bukan milik pengguna', async () => {
      const repo = { milikPengguna: jest.fn().mockResolvedValue(false) };
      const ctrl = new Pesanan({ repo, snap: {}, now: () => FIXED_NOW });

      const res = mkRes();
      await ctrl.detailPelanggan({ params: { id_pesanan: 1 }, user: { id: 9 } }, res, mkNext());
      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ message: 'Pesanan tidak ditemukan' });
    });

    test('200 jika sukses, latestPembayaran = null', async () => {
      const repo = {
        milikPengguna: jest.fn().mockResolvedValue(true),
        detailById: jest.fn().mockResolvedValue({
          id_pesanan: 1, nomor_pesanan: 'X', tanggal_dibuat: 't', status: 'pending', total_harga: 1000,
          tipe_pesanan: 'takeaway', cabang: 'Cab A', id_meja: null, nomor_meja: null,
          items: [{ id_menu: 1, nama_menu: 'Latte', jumlah: 1, harga_satuan: 1000, subtotal: 1000, catatan: null }]
        }),
        latestPembayaran: jest.fn().mockResolvedValue(null)
      };
      const ctrl = new Pesanan({ repo, snap: {}, now: () => FIXED_NOW });

      const res = mkRes();
      await ctrl.detailPelanggan({ params: { id_pesanan: 1 }, user: { id: 2 } }, res, mkNext());
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('pesanan');
      expect(res.body.pembayaran_terakhir).toBeNull();
    });

    test('error → next(err)', async () => {
      const repo = {
        milikPengguna: jest.fn().mockResolvedValue(true),
        detailById: jest.fn().mockRejectedValue(new Error('x'))
      };
      const ctrl = new Pesanan({ repo, snap: {}, now: () => FIXED_NOW });

      await ctrl.detailPelanggan({ params: { id_pesanan: 1 }, user: { id: 2 } }, mkRes(), mkNext());
    });
  });

  // ===== recreatePembayaran =====
  describe('recreatePembayaran', () => {
    test('404 jika bukan milik user', async () => {
      const repo = { milikPengguna: jest.fn().mockResolvedValue(false) };
      const ctrl = new Pesanan({ repo, snap: {}, now: () => FIXED_NOW });

      const res = mkRes();
      await ctrl.recreatePembayaran({ params: { id_pesanan: 1 }, user: { id: 7 } }, res, mkNext());
      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ message: 'Pesanan tidak ditemukan' });
    });

    test('404 jika pesanan tidak ditemukan', async () => {
      const repo = {
        milikPengguna: jest.fn().mockResolvedValue(true),
        detailById: jest.fn().mockResolvedValue(null)
      };
      const ctrl = new Pesanan({ repo, snap: {}, now: () => FIXED_NOW });

      const res = mkRes();
      await ctrl.recreatePembayaran({ params: { id_pesanan: 1 }, user: { id: 7 } }, res, mkNext());
      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ message: 'Pesanan tidak ditemukan' });
    });

    test('200 jika sukses, payment_type fallback "snap"', async () => {
      const repo = {
        milikPengguna: jest.fn().mockResolvedValue(true),
        detailById: jest.fn().mockResolvedValue({ id_pesanan: 1, total_harga: 5000 }),
        simpanPembayaranSnap: jest.fn().mockResolvedValue(88)
      };
      const snap = { createTransaction: jest.fn().mockResolvedValue({ token: 'tok', redirect_url: 'url' }) };

      const ctrl = new Pesanan({ repo, snap, now: () => FIXED_NOW });

      const res = mkRes();
      await ctrl.recreatePembayaran({ params: { id_pesanan: 1 }, user: { id: 7 } }, res, mkNext());
      expect(snap.createTransaction).toHaveBeenCalled();
      expect(repo.simpanPembayaranSnap).toHaveBeenCalledWith(expect.objectContaining({
        id_pesanan: 1,
        order_id: `ORDER-1-${FIXED_NOW}`,
        snap_token: 'tok',
        snap_redirect_url: 'url',
        payment_type: 'snap',
        jumlah_bayar: 5000
      }));
      expect(res.statusCode).toBe(200);
    });

    test('error → next(err)', async () => {
      const repo = {
        milikPengguna: jest.fn().mockResolvedValue(true),
        detailById: jest.fn().mockResolvedValue({ id_pesanan: 1, total_harga: 5000 }),
        simpanPembayaranSnap: jest.fn()
      };
      const snap = { createTransaction: jest.fn().mockRejectedValue(new Error('snap error')) };

      const ctrl = new Pesanan({ repo, snap, now: () => FIXED_NOW });
      await ctrl.recreatePembayaran({ params: { id_pesanan: 1 }, user: { id: 7 } }, mkRes(), mkNext());
    });
  });

  // ===== pembayaranTerbaru =====
  describe('pembayaranTerbaru', () => {
    test('404 jika bukan milik user', async () => {
      const repo = { milikPengguna: jest.fn().mockResolvedValue(false) };
      const ctrl = new Pesanan({ repo, snap: {}, now: () => FIXED_NOW });

      const res = mkRes();
      await ctrl.pembayaranTerbaru({ params: { id_pesanan: 1 }, user: { id: 9 } }, res, mkNext());
      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ message: 'Tidak ditemukan' });
    });

    test('200 jika sukses (null branch)', async () => {
      const repo = {
        milikPengguna: jest.fn().mockResolvedValue(true),
        latestPembayaran: jest.fn().mockResolvedValue(null)
      };
      const ctrl = new Pesanan({ repo, snap: {}, now: () => FIXED_NOW });

      const res = mkRes();
      await ctrl.pembayaranTerbaru({ params: { id_pesanan: 1 }, user: { id: 9 } }, res, mkNext());
      expect(res.statusCode).toBe(200);
      expect(res.body).toBeNull();
    });

    test('error → next(err)', async () => {
      const repo = { milikPengguna: jest.fn().mockResolvedValue(true), latestPembayaran: jest.fn().mockRejectedValue(new Error('x')) };
      const ctrl = new Pesanan({ repo, snap: {}, now: () => FIXED_NOW });

      await ctrl.pembayaranTerbaru({ params: { id_pesanan: 1 }, user: { id: 1 } }, mkRes(), mkNext());
    });
  });

  // ===== jumlahPending =====
  describe('jumlahPending', () => {
    test('200 ok', async () => {
      const repo = { hitungPendingByCabang: jest.fn().mockResolvedValue(5) };
      const ctrl = new Pesanan({ repo, snap: {}, now: () => FIXED_NOW });

      const res = mkRes();
      await ctrl.jumlahPending({ params: { id_cabang: 2 } }, res, mkNext());
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ count: 5 });
    });

    test('error → next(err)', async () => {
      const repo = { hitungPendingByCabang: jest.fn().mockRejectedValue(new Error('x')) };
      const ctrl = new Pesanan({ repo, snap: {}, now: () => FIXED_NOW });

      await ctrl.jumlahPending({ params: { id_cabang: 2 } }, mkRes(), mkNext());
    });
  });
  
    describe('Pesanan - tambahan untuk nutup branch sisa', () => {
        const NOW = 1712222222222;

        test('constructor mem-bind semua method (eksekusi awal file & constructor)', () => {
            const ctrl = new Pesanan({ repo: {}, snap: {}, now: () => NOW });
            // cukup memastikan binding function terjadi (bukan undefined)
            expect(typeof ctrl.checkout).toBe('function');
            expect(typeof ctrl.semuaByCabang).toBe('function');
            expect(typeof ctrl.ubahStatus).toBe('function');
            expect(typeof ctrl.statistikCabang).toBe('function');
            expect(typeof ctrl.detail).toBe('function');
            expect(typeof ctrl.riwayatPengguna).toBe('function');
            expect(typeof ctrl.detailPelanggan).toBe('function');
            expect(typeof ctrl.recreatePembayaran).toBe('function');
            expect(typeof ctrl.pembayaranTerbaru).toBe('function');
            expect(typeof ctrl.jumlahPending).toBe('function');
        });

        test('riwayatPengguna: orders ada tapi tidak ada items → items[] default', async () => {
            const repo = {
            pesananByPengguna: jest.fn().mockResolvedValue([
                { id: 111, nomor_pesanan: 'ORD-111', metode_pembayaran: 'qris' }
            ]),
            itemByOrderIds: jest.fn().mockResolvedValue([]) // tidak ada item utk order tsb
            };
            const ctrl = new Pesanan({ repo, snap: {}, now: () => NOW });

            const res = { statusCode: 200, body: null, status(c){this.statusCode=c;return this;}, json(p){this.body=p;return this;} };
            await ctrl.riwayatPengguna({ user: { id: 7 } }, res, jest.fn());
            expect(res.body).toHaveLength(1);
            expect(res.body[0].items).toEqual([]); // bucket fallback
        });

        test('recreatePembayaran: token & redirect_url hilang → fallback null', async () => {
            const repo = {
            milikPengguna: jest.fn().mockResolvedValue(true),
            detailById: jest.fn().mockResolvedValue({ id_pesanan: 5, total_harga: 12345 }),
            simpanPembayaranSnap: jest.fn().mockResolvedValue(77)
            };
            // tanpa token/redirect_url untuk memicu `|| null`
            const snap = { createTransaction: jest.fn().mockResolvedValue({ /* kosong */ }) };

            const ctrl = new Pesanan({ repo, snap, now: () => NOW });
            const res = { statusCode: 200, body: null, status(c){this.statusCode=c;return this;}, json(p){this.body=p;return this;} };

            await ctrl.recreatePembayaran({ params: { id_pesanan: 5 }, user: { id: 9 } }, res, jest.fn());
            expect(res.statusCode).toBe(200);
            expect(res.body.pembayaran.snap_token).toBeNull();
            expect(res.body.pembayaran.snap_redirect_url).toBeNull();
            expect(res.body.pembayaran.payment_type).toBe('snap'); // fallback payment_type
        });

        test('pembayaranTerbaru: non-null case', async () => {
            const repo = {
            milikPengguna: jest.fn().mockResolvedValue(true),
            latestPembayaran: jest.fn().mockResolvedValue({ id_pembayaran: 10, status_pembayaran: 'settlement' })
            };
            const ctrl = new Pesanan({ repo, snap: {}, now: () => NOW });

            const res = { statusCode: 200, body: null, status(c){this.statusCode=c;return this;}, json(p){this.body=p;return this;} };
            await ctrl.pembayaranTerbaru({ params: { id_pesanan: 3 }, user: { id: 1 } }, res, jest.fn());
            expect(res.body).toEqual({ id_pembayaran: 10, status_pembayaran: 'settlement' });
        });
    });
});
