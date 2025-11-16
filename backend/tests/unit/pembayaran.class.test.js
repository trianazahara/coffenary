const { Pembayaran } = require('../../controllers/Pembayaran');

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
});
