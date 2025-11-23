const { PembayaranController: Pembayaran } = require('../../controllers/PembayaranController');

function mkRes() {
  return {
    statusCode: 200,
    body: null,
    status(c){ this.statusCode = c; return this; },
    json(p){ this.body = p; return this; }
  };
}
function mkNext(){ return jest.fn(); }

describe('Pembayaran Controller (unit, single file)', () => {
  const NOW = 1711111111111;

  test('400 jika id_pesanan kosong', async () => {
    const ctrl = new Pembayaran({ pool: {}, snap: {}, now: () => NOW });
    const res = mkRes();
    await ctrl.initiate({ body: {} }, res, mkNext());
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: 'id_pesanan wajib' });
  });

  test('404 jika pesanan tidak ditemukan', async () => {
    const pool = { query: jest.fn().mockResolvedValueOnce([[], []]) }; // SELECT pesanan -> kosong
    const ctrl = new Pembayaran({ pool, snap: {}, now: () => NOW });

    const res = mkRes();
    await ctrl.initiate({ body: { id_pesanan: 7 } }, res, mkNext());
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: 'Pesanan tidak ditemukan' });
  });

  test('sukses: FE kirim items (tanpa fetch items DB)', async () => {
    // 1) SELECT pesanan
    // 2) UPDATE pembayaran (utama)
    // 3) UPDATE pembayaran (kolom tambahan) -> sukses
    const pool = {
      query: jest
        .fn()
        .mockResolvedValueOnce([[{ id_pesanan: 5, nomor_pesanan: 'X', total_harga: 30000 }], []])
        .mockResolvedValueOnce([{}, {}])
        .mockResolvedValueOnce([{}, {}])
    };
    const snap = {
      createTransaction: jest.fn().mockResolvedValue({ token: 'tok', redirect_url: 'url' })
    };
    const ctrl = new Pembayaran({ pool, snap, now: () => NOW });

    const res = mkRes();
    await ctrl.initiate({
      body: {
        id_pesanan: 5,
        total_harga: 45000,
        customer: { first_name: 'A', email: 'a@a' },
        items: [
          { id_menu: 1, harga: 10000, jumlah: 2, nama_menu: 'Latte' },
          { id: 9, harga: 25000, qty: 1, nama: 'Cappuccino' }
        ]
      }
    }, res, mkNext());

    expect(snap.createTransaction).toHaveBeenCalled();
    expect(res.body).toHaveProperty('order_id', `ORDER-5-${NOW}`);
    expect(res.body.snap).toEqual({ token: 'tok', redirect_url: 'url' });
  });

  // cabang: FE mengirim items: []  → fallback ke DB
  test('fallback DB ketika FE mengirim items: [] (Array.isArray true, length 0)', async () => {
    // 1) SELECT pesanan
    // 2) SELECT pesanan_item (fallback)
    // 3) UPDATE pembayaran utama
    // 4) UPDATE kolom tambahan
    const pool = {
      query: jest
        .fn()
        .mockResolvedValueOnce([[{ id_pesanan: 99, total_harga: 22222 }], []]) // pesanan
        .mockResolvedValueOnce([[ // pesanan_item
          { id_menu: 7, nama_menu: 'Macchiato', jumlah: 2, harga_satuan: 11111 }
        ], []])
        .mockResolvedValueOnce([{}, {}]) // update pembayaran utama
        .mockResolvedValueOnce([{}, {}]) // update kolom tambahan
    };
    const snap = { createTransaction: jest.fn().mockResolvedValue({ token: 'snapTok', redirect_url: 'snapUrl' }) };
    const ctrl = new Pembayaran({ pool, snap, now: () => NOW });

    const res = mkRes();
    await ctrl.initiate({ body: { id_pesanan: 99, items: [] } }, res, mkNext());

    // Pastikan tetap fallback ke DB meski items dikirim tapi kosong
    expect(pool.query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('pesanan_item'),
      [99]
    );
    expect(snap.createTransaction).toHaveBeenCalledWith(expect.objectContaining({
      transaction_details: { order_id: `ORDER-99-${NOW}`, gross_amount: 22222 },
      item_details: [
        { id: '7', price: 11111, quantity: 2, name: 'Macchiato' }
      ],
    }));
    expect(res.statusCode).toBe(200);
    expect(res.body.snap).toEqual({ token: 'snapTok', redirect_url: 'snapUrl' });
  });

  // cabang: customer_details default saat tidak dikirim
  test('customer_details pakai default ketika field tidak dikirim', async () => {
    const pool = {
      query: jest
        .fn()
        .mockResolvedValueOnce([[{ id_pesanan: 77, total_harga: 5000 }], []])
        .mockResolvedValueOnce([[ // items dari DB
          { id_menu: 1, nama_menu: 'Latte', jumlah: 1, harga_satuan: 5000 }
        ], []])
        .mockResolvedValueOnce([{}, {}])
        .mockResolvedValueOnce([{}, {}])
    };
    const snap = { createTransaction: jest.fn().mockResolvedValue({ token: 't77', redirect_url: 'r77' }) };
    const ctrl = new Pembayaran({ pool, snap, now: () => NOW });

    const res = mkRes();
    await ctrl.initiate({ body: { id_pesanan: 77 /* tanpa customer */ } }, res, mkNext());

    expect(snap.createTransaction).toHaveBeenCalledWith(expect.objectContaining({
      customer_details: expect.objectContaining({
        first_name: 'Pelanggan',
        last_name: '',
        email: ''
      })
    }));
    expect(res.statusCode).toBe(200);
  });

  // cabang: FE tidak kirim items → fallback DB (versi lama tetap dipertahankan)
  test('sukses: items fallback dari DB (saat FE tidak kirim items)', async () => {
    // 1) SELECT pesanan
    // 2) SELECT items
    // 3) UPDATE pembayaran
    // 4) UPDATE kolom tambahan
    const pool = {
      query: jest
        .fn()
        .mockResolvedValueOnce([[{ id_pesanan: 10, total_harga: 12000 }], []])
        .mockResolvedValueOnce([[[ // bentuk alternatif → [[rows], fields]]
          { id_menu: 3, nama_menu: 'Americano', jumlah: 2, harga_satuan: 6000 }
        ]][0], []])
        .mockResolvedValueOnce([{}, {}])
        .mockResolvedValueOnce([{}, {}])
    };
    const snap = { createTransaction: jest.fn().mockResolvedValue({ token: 't', redirect_url: 'r' }) };
    const ctrl = new Pembayaran({ pool, snap, now: () => NOW });

    const res = mkRes();
    await ctrl.initiate({ body: { id_pesanan: 10, customer: {} } }, res, mkNext());
    expect(res.body.order_id).toBe(`ORDER-10-${NOW}`);
  });

  // cabang: FE kirim item tanpa harga/jumlah → fallback 0 (menutup percabangan mapping item)
  test('items dari FE tanpa harga/jumlah → price fallback 0, quantity default 1', async () => {
    const pool = {
      query: jest
        .fn()
        .mockResolvedValueOnce([[{ id_pesanan: 55, total_harga: 9000 }], []]) // SELECT pesanan
        .mockResolvedValueOnce([{}, {}]) // UPDATE pembayaran utama
        .mockResolvedValueOnce([{}, {}]) // UPDATE kolom tambahan
    };
    const snap = { createTransaction: jest.fn().mockResolvedValue({ token: 'tok55', redirect_url: 'url55' }) };
    const ctrl = new Pembayaran({ pool, snap, now: () => NOW });

    const res = mkRes();
    await ctrl.initiate({
      body: {
        id_pesanan: 55,
        // item kedua hilang harga/jumlah → price:0, quantity:1 (default)
        items: [
          { id_menu: 1, nama_menu: 'Espresso', harga: 9000, jumlah: 1 },
          { id_menu: 2, nama_menu: 'Mocha' }
        ]
      }
    }, res, mkNext());

    expect(snap.createTransaction).toHaveBeenCalledWith(expect.objectContaining({
      transaction_details: { order_id: `ORDER-55-${NOW}`, gross_amount: 9000 },
      item_details: expect.arrayContaining([
        { id: '1', price: 9000, quantity: 1, name: 'Espresso' },
        { id: '2', price: 0, quantity: 1, name: 'Mocha' } // ← quantity 1
      ])
    }));
    expect(res.statusCode).toBe(200);
    expect(res.body.snap).toEqual({ token: 'tok55', redirect_url: 'url55' });
  });

  test('default now() dipakai saat tidak dikirim (order_id pakai Date.now)', async () => {
    // freeze time
    const FIX = 1712223334444;
    const spy = jest.spyOn(Date, 'now').mockReturnValue(FIX);

    const pool = {
      query: jest
        .fn()
        // SELECT pesanan
        .mockResolvedValueOnce([[{ id_pesanan: 33, total_harga: 15000 }], []])
        // UPDATE pembayaran utama
        .mockResolvedValueOnce([{}, {}])
        // UPDATE kolom tambahan
        .mockResolvedValueOnce([{}, {}])
    };
    const snap = { createTransaction: jest.fn().mockResolvedValue({ token: 't33', redirect_url: 'r33' }) };

    // ← tidak kirim opsi `now` agar default now=()=>Date.now() terpakai
    const ctrl = new Pembayaran({ pool, snap });

    const res = mkRes();
    await ctrl.initiate({
      body: {
        id_pesanan: 33,
        // kirim items supaya tidak SELECT pesanan_item
        items: [{ id_menu: 1, nama_menu: 'Latte', harga: 15000, jumlah: 1 }]
      }
    }, res, mkNext());

    expect(snap.createTransaction).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body.order_id).toBe(`ORDER-33-${FIX}`);

    // cleanup
    spy.mockRestore();
  });



  test('sukses: update kolom tambahan melempar → diabaikan tetap 200', async () => {
    const pool = {
      query: jest
        .fn()
        // SELECT pesanan
        .mockResolvedValueOnce([[{ id_pesanan: 8, total_harga: 10000 }], []])
        // UPDATE pembayaran (utama)
        .mockResolvedValueOnce([{}, {}])
        // UPDATE kolom tambahan → gagal
        .mockRejectedValueOnce(new Error('no column'))
    };
    const snap = { createTransaction: jest.fn().mockResolvedValue({ token: 't', redirect_url: 'r' }) };
    const ctrl = new Pembayaran({ pool, snap, now: () => NOW });

    const res = mkRes();
    await ctrl.initiate({
      body: {
        id_pesanan: 8,
        // kirim items agar controller tidak SELECT pesanan_item
        items: [{ id_menu: 1, harga: 10000, jumlah: 1, nama_menu: 'Latte' }]
      }
    }, res, mkNext());

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('order_id', `ORDER-8-${NOW}`);
  });

  test('error dari snap → next(err)', async () => {
    const pool = {
      query: jest.fn().mockResolvedValueOnce([[{ id_pesanan: 6, total_harga: 5000 }], []])
    };
    const snap = { createTransaction: jest.fn().mockRejectedValue(new Error('snap down')) };
    const ctrl = new Pembayaran({ pool, snap, now: () => NOW });
    const next = mkNext();

    await ctrl.initiate({ body: { id_pesanan: 6 } }, mkRes(), next);
    expect(next).toHaveBeenCalled();
  });

  test('reinitiate hanya alias initiate', async () => {
    const pool = {
      query: jest
        .fn()
        // SELECT pesanan
        .mockResolvedValueOnce([[{ id_pesanan: 1, total_harga: 1000 }], []])
        // UPDATE pembayaran (utama)
        .mockResolvedValueOnce([{}, {}])
        // UPDATE kolom tambahan
        .mockResolvedValueOnce([{}, {}])
    };
    const snap = { createTransaction: jest.fn().mockResolvedValue({ token: 'x', redirect_url: 'y' }) };
    const ctrl = new Pembayaran({ pool, snap, now: () => NOW });

    const res = mkRes();
    await ctrl.reinitiate({
      body: {
        id_pesanan: 1,
        // kirim items agar tidak SELECT pesanan_item
        items: [{ id_menu: 99, harga: 1000, jumlah: 1, nama_menu: 'Test' }]
      }
    }, res, mkNext());

    expect(res.body).toHaveProperty('snap');
  });

  test('400 ketika req.body undefined → fallback {} (cover req.body || {})', async () => {
    const pool = {}; const snap = {};
    const ctrl = new Pembayaran({ pool, snap, now: () => NOW });

    const res = mkRes();
    // panggil dengan req tanpa body
    await ctrl.initiate({}, res, mkNext());

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: 'id_pesanan wajib' });
  });

  test('mapping item: id kosong, name fallback "Item", qty:0 → quantity 1, price default 0', async () => {
    const pool = {
      query: jest
        .fn()
        // SELECT pesanan
        .mockResolvedValueOnce([[{ id_pesanan: 66, total_harga: 0 }], []])
        // UPDATE pembayaran utama
        .mockResolvedValueOnce([{}, {}])
        // UPDATE kolom tambahan
        .mockResolvedValueOnce([{}, {}])
    };
    const snap = { createTransaction: jest.fn().mockResolvedValue({ token: 't66', redirect_url: 'r66' }) };
    const ctrl = new Pembayaran({ pool, snap, now: () => NOW });

    const res = mkRes();
    await ctrl.initiate({
      body: {
        id_pesanan: 66,
        // item tanpa id_menu & id, tanpa nama_xxx, qty:0 -> quantity jadi 1, price 0, name "Item", id ""
        items: [{ qty: 0 }]
      }
    }, res, mkNext());

    expect(snap.createTransaction).toHaveBeenCalledWith(expect.objectContaining({
      item_details: expect.arrayContaining([
        { id: '', price: 0, quantity: 1, name: 'Item' }
      ])
    }));
    expect(res.statusCode).toBe(200);
  });

  test('fallback DB: harga_satuan/jumlah null → price & quantity default 0', async () => {
    const NOW = 1711111111111;
    const pool = {
      query: jest
        .fn()
        // 1) SELECT pesanan
        .mockResolvedValueOnce([[{ id_pesanan: 12, total_harga: 12345 }], []])
        // 2) SELECT pesanan_item (dengan nilai null/undefined untuk memicu || 0)
        .mockResolvedValueOnce([[{ id_menu: 42, nama_menu: 'Tester', jumlah: null, harga_satuan: undefined }], []])
        // 3) UPDATE pembayaran utama
        .mockResolvedValueOnce([{}, {}])
        // 4) UPDATE kolom tambahan
        .mockResolvedValueOnce([{}, {}])
    };
    const snap = { createTransaction: jest.fn().mockResolvedValue({ token: 't12', redirect_url: 'r12' }) };
    const ctrl = new (require('../../controllers/PembayaranController').PembayaranController)({ pool, snap, now: () => NOW });

    const res = { statusCode: 200, body: null, status(c){ this.statusCode=c; return this; }, json(p){ this.body=p; return this; } };
    await ctrl.initiate({ body: { id_pesanan: 12 } }, res, jest.fn());

    expect(res.statusCode).toBe(200);
    expect(snap.createTransaction).toHaveBeenCalledWith(expect.objectContaining({
      transaction_details: { order_id: `ORDER-12-${NOW}`, gross_amount: 12345 },
      item_details: [
        { id: '42', price: 0, quantity: 0, name: 'Tester' }  // ← default dari || 0
      ]
    }));
  });

  test('update kolom tambahan: token/redirect_url falsy → disimpan sebagai null', async () => {
    const pool = {
      query: jest
        .fn()
        // SELECT pesanan
        .mockResolvedValueOnce([[{ id_pesanan: 77, total_harga: 12345 }], []])
        // UPDATE pembayaran utama
        .mockResolvedValueOnce([{}, {}])
        // UPDATE kolom tambahan (yang mau kita cek nilai null-nya)
        .mockResolvedValueOnce([{}, {}])
    };
    // snap balikin objek kosong supaya token & redirect_url undefined
    const snap = { createTransaction: jest.fn().mockResolvedValue({}) };
    const ctrl = new Pembayaran({ pool, snap, now: () => NOW });

    const res = mkRes();
    await ctrl.initiate({
      body: {
        id_pesanan: 77,
        // kirim items supaya tidak SELECT pesanan_item
        items: [{ id_menu: 1, harga: 12345, jumlah: 1, nama_menu: 'Latte' }]
      }
    }, res, mkNext());

    // panggilan ke-3 adalah UPDATE kolom tambahan
    const third = pool.query.mock.calls[2];
    expect(String(third[0])).toContain('SET snap_token = ?, snap_redirect_url = ?, payment_type = ?');
    const vals = third[1];
    expect(vals).toEqual([null, null, 'snap', 77]); // ← baris 92 ter-cover
    expect(res.statusCode).toBe(200);
  });


});
