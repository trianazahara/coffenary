const { CheckoutController } = require('../../controllers/checkoutController');

function mkRes() {
  return {
    statusCode: 200,
    body: null,
    status(c) { this.statusCode = c; return this; },
    json(p) { this.body = p; return this; }
  };
}

describe('CheckoutController', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterAll(() => {
    console.error.mockRestore();
  });
  test('400 jika payload tidak lengkap', async () => {
    const pool = { getConnection: jest.fn() }; // tidak digunakan karena validasi gagal
    const ctrl = new CheckoutController({ pool });

    const res = mkRes();
    await ctrl.checkout({ body: { id_pengguna: null, items: [] } }, res);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: 'Data checkout tidak lengkap' });
  });

  test('400 jika items bukan array', async () => {
    const pool = { getConnection: jest.fn() };
    const ctrl = new CheckoutController({ pool });
    const res = mkRes();
    await ctrl.checkout({ body: { id_pengguna:1, id_cabang:2, tipe_pesanan:'bawa_pulang', items: {} } }, res);
    expect(res.statusCode).toBe(400);
  });

  test('400 jika items array tapi kosong', async () => {
    const pool = { getConnection: jest.fn() };
    const ctrl = new CheckoutController({ pool });
    const res = mkRes();
    await ctrl.checkout({ body: { id_pengguna:1, id_cabang:2, tipe_pesanan:'bawa_pulang', items: [] } }, res);
    expect(res.statusCode).toBe(400);
  });

  test('400 jika tipe pesanan tidak valid', async () => {
    const pool = { getConnection: jest.fn() };
    const ctrl = new CheckoutController({ pool });
    const res = mkRes();
    await ctrl.checkout({
      body: { id_pengguna: 1, id_cabang: 2, tipe_pesanan: 'invalid', items: [{ id_menu:1, harga:1000, jumlah:1 }] }
    }, res);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: 'Tipe pesanan tidak valid' });
  });

  test('sukses checkout memanggil query dan commit', async () => {
    const conn = {
      beginTransaction: jest.fn().mockResolvedValue(),
      query: jest.fn()
        .mockResolvedValueOnce([{ insertId: 10 }]) // insert pesanan
        .mockResolvedValue({}) // other inserts
        .mockResolvedValue({}),
      commit: jest.fn().mockResolvedValue(),
      rollback: jest.fn().mockResolvedValue(),
      release: jest.fn().mockResolvedValue(),
    };
    const pool = { getConnection: jest.fn().mockResolvedValue(conn) };
    const ctrl = new CheckoutController({ pool });

    const res = mkRes();
    await ctrl.checkout({
      user: { id: 1 },
      body: {
        id_cabang: 2,
        tipe_pesanan: 'bawa_pulang',
        items: [{ id_menu: 5, harga: 10000, jumlah: 2 }]
      }
    }, res);

    expect(conn.beginTransaction).toHaveBeenCalled();
    expect(conn.commit).toHaveBeenCalled();
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id_pesanan', 10);
  });

  test('loop items memakai catatan/note dan qty fallback', async () => {
    const conn = {
      beginTransaction: jest.fn().mockResolvedValue(),
      query: jest.fn()
        .mockResolvedValueOnce([{ insertId: 40 }])
        .mockResolvedValue({}).mockResolvedValue({}),
      commit: jest.fn().mockResolvedValue(),
      rollback: jest.fn().mockResolvedValue(),
      release: jest.fn().mockResolvedValue(),
    };
    const pool = { getConnection: jest.fn().mockResolvedValue(conn) };
    const ctrl = new CheckoutController({ pool });
    const res = mkRes();
    await ctrl.checkout({
      user: { id: 2 },
      body: {
        id_cabang: 3,
        tipe_pesanan: 'makan_di_tempat',
        items: [
          { id_menu: 1, harga: undefined, harga_satuan: 2000, qty: 2, note: 'tanpa gula' }
        ]
      }
    }, res);
    expect(res.statusCode).toBe(201);
    expect(conn.commit).toHaveBeenCalled();
  });

  test('sukses checkout memakai id_pengguna dari body ketika req.user kosong', async () => {
    const conn = {
      beginTransaction: jest.fn().mockResolvedValue(),
      query: jest.fn()
        .mockResolvedValueOnce([{ insertId: 22 }])
        .mockResolvedValue({}).mockResolvedValue({}),
      commit: jest.fn().mockResolvedValue(),
      rollback: jest.fn().mockResolvedValue(),
      release: jest.fn().mockResolvedValue(),
    };
    const pool = { getConnection: jest.fn().mockResolvedValue(conn) };
    const ctrl = new CheckoutController({ pool });
    const res = mkRes();
    await ctrl.checkout({
      body: {
        id_pengguna: 99,
        id_cabang: 1,
        tipe_pesanan: 'makan_di_tempat',
        items: [{ id_menu: 1, harga: 5000, jumlah: 2 }]
      }
    }, res);
    expect(res.statusCode).toBe(201);
    expect(conn.commit).toHaveBeenCalled();
  });

  test('sukses checkout dengan harga_satuan + qty fallback', async () => {
    const conn = {
      beginTransaction: jest.fn().mockResolvedValue(),
      query: jest.fn()
        .mockResolvedValueOnce([{ insertId: 30 }])
        .mockResolvedValue({}).mockResolvedValue({}),
      commit: jest.fn().mockResolvedValue(),
      rollback: jest.fn().mockResolvedValue(),
      release: jest.fn().mockResolvedValue(),
    };
    const pool = { getConnection: jest.fn().mockResolvedValue(conn) };
    const ctrl = new CheckoutController({ pool });
    const res = mkRes();
    await ctrl.checkout({
      body: {
        id_pengguna: 1,
        id_cabang: 2,
        tipe_pesanan: 'bawa_pulang',
        items: [{ id_menu: 1, harga_satuan: 2000, qty: 3 }]
      }
    }, res);
    expect(res.statusCode).toBe(201);
  });

  test('rollback + 500 ketika error', async () => {
    const conn = {
      beginTransaction: jest.fn().mockResolvedValue(),
      query: jest.fn().mockRejectedValue(new Error('db fail')),
      commit: jest.fn(),
      rollback: jest.fn().mockResolvedValue(),
      release: jest.fn().mockResolvedValue(),
    };
    const pool = { getConnection: jest.fn().mockResolvedValue(conn) };
    const ctrl = new CheckoutController({ pool });
    const res = mkRes();
    await ctrl.checkout({
      body: {
        id_pengguna: 1, id_cabang: 2, tipe_pesanan: 'bawa_pulang',
        items: [{ id_menu:1, harga:1000, jumlah:1 }]
      }
    }, res);
    expect(conn.rollback).toHaveBeenCalled();
    expect(res.statusCode).toBe(500);
  });
  test('400 ketika body undefined (cover req.body || {})', async () => {
    const { CheckoutController } = require('../../controllers/checkoutController');

    const pool = { getConnection: jest.fn() }; // tidak dipakai karena validasi stop
    const ctrl = new CheckoutController({ pool });

    const res = {
      statusCode: 200, body: null,
      status(c){ this.statusCode=c; return this; },
      json(p){ this.body=p; return this; }
    };

    // user ada, jadi ekspresi id_pengguna berhenti di req.user?.id dan aman walau body undefined
    await ctrl.checkout({ user: { id: 1 } }, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: 'Data checkout tidak lengkap' });
  });
  test('subtotal dihitung benar (mix harga/harga_satuan & jumlah/qty), nomorPesanan pakai Date.now, dan argumen INSERT tepat', async () => {
    const { CheckoutController } = require('../../controllers/checkoutController');

    // Freeze time biar deterministik
    const FIX = 1712345678901;
    const spyNow = jest.spyOn(Date, 'now').mockReturnValue(FIX);

    const conn = {
      beginTransaction: jest.fn().mockResolvedValue(),
      query: jest.fn()
        // INSERT pesanan (kita butuh insertId)
        .mockResolvedValueOnce([{ insertId: 99 }])
        // INSERT pesanan_item #1
        .mockResolvedValueOnce([{}, {}])
        // INSERT pesanan_item #2
        .mockResolvedValueOnce([{}, {}])
        // INSERT pembayaran stub
        .mockResolvedValueOnce([{}, {}]),
      commit: jest.fn().mockResolvedValue(),
      rollback: jest.fn().mockResolvedValue(),
      release: jest.fn().mockResolvedValue(),
    };
    const pool = { getConnection: jest.fn().mockResolvedValue(conn) };
    const ctrl = new CheckoutController({ pool });

    const res = {
      statusCode: 200, body: null,
      status(c){ this.statusCode=c; return this; },
      json(p){ this.body=p; return this; }
    };

    // Item 1 pakai harga + jumlah, item 2 pakai harga_satuan + qty + note
    await ctrl.checkout({
      user: { id: 7 },
      body: {
        id_cabang: 3,
        tipe_pesanan: 'makan_di_tempat',
        items: [
          { id_menu: 1, harga: 3000, jumlah: 2 },                  // 3000*2 = 6000
          { id_menu: 2, harga_satuan: 1500, qty: 3, note: 'es' }   // 1500*3 = 4500
        ]
      }
    }, res);

    // subtotal & total yang diharapkan
    const expectedSubtotal = 6000 + 4500; // 10500
    const expectedOrder = `ORD-${FIX}`;

    // Panggilan pertama: INSERT INTO pesanan
    const firstCall = conn.query.mock.calls[0];
    expect(String(firstCall[0])).toContain('INSERT INTO pesanan');
    expect(firstCall[1]).toEqual([
      expectedOrder, // nomor_pesanan
      7,             // id_pengguna
      3,             // id_cabang
      'makan_di_tempat',
      'pending',
      expectedSubtotal
    ]);

    // Panggilan kedua (item #1)
    const secondCall = conn.query.mock.calls[1];
    expect(String(secondCall[0])).toContain('INSERT INTO pesanan_item');
    expect(secondCall[1][1]).toBe(1);              // id_menu
    expect(secondCall[1][2]).toBe(2);              // jumlah
    expect(secondCall[1][3]).toBeNull();           // catatan null
    expect(secondCall[1][4]).toBe(3000);           // harga_satuan
    expect(secondCall[1][5]).toBe(6000);           // subtotal

    // Panggilan ketiga (item #2, cover note & qty/harga_satuan fallback)
    const thirdCall = conn.query.mock.calls[2];
    expect(thirdCall[1][1]).toBe(2);               // id_menu
    expect(thirdCall[1][2]).toBe(3);               // jumlah (qty)
    expect(thirdCall[1][3]).toBe('es');            // catatan dari note
    expect(thirdCall[1][4]).toBe(1500);            // harga_satuan
    expect(thirdCall[1][5]).toBe(4500);            // subtotal

    expect(conn.commit).toHaveBeenCalled();
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(expect.objectContaining({
      nomorPesanan: expectedOrder,
      subtotal: expectedSubtotal,
      total_harga: expectedSubtotal,
      status: 'pending',
      id_pesanan: 99
    }));

    spyNow.mockRestore();
  });
  test('subtotal loop memicu fallback 0 untuk harga & qty (cover ?? 0)', async () => {
    const { CheckoutController } = require('../../controllers/checkoutController');

    const FIX = 1719999999999;
    const spyNow = jest.spyOn(Date, 'now').mockReturnValue(FIX);

    const conn = {
      beginTransaction: jest.fn().mockResolvedValue(),
      query: jest.fn()
        // INSERT pesanan
        .mockResolvedValueOnce([{ insertId: 77 }])
        // INSERT item #1
        .mockResolvedValueOnce([{}, {}])
        // INSERT item #2 (yang kosong → 0)
        .mockResolvedValueOnce([{}, {}])
        // INSERT pembayaran stub
        .mockResolvedValueOnce([{}, {}]),
      commit: jest.fn().mockResolvedValue(),
      rollback: jest.fn().mockResolvedValue(),
      release: jest.fn().mockResolvedValue(),
    };
    const pool = { getConnection: jest.fn().mockResolvedValue(conn) };
    const ctrl = new CheckoutController({ pool });

    const res = {
      statusCode: 200, body: null,
      status(c){ this.statusCode=c; return this; },
      json(p){ this.body=p; return this; }
    };

    await ctrl.checkout({
      user: { id: 10 },
      body: {
        id_cabang: 5,
        tipe_pesanan: 'bawa_pulang',
        items: [
          { id_menu: 1, harga: 2000, jumlah: 2 }, // 4000
          { id_menu: 2 }                           // harga → 0, qty → 0, subtotal tambah 0
        ]
      }
    }, res);

    // Pastikan INSERT pesanan membawa total 4000 (item kosong tidak menambah)
    const insertPesananArgs = conn.query.mock.calls[0][1];
    expect(insertPesananArgs[0]).toBe(`ORD-${FIX}`); // nomor_pesanan
    expect(insertPesananArgs[5]).toBe(4000);         // total_harga = subtotal

    // Pastikan item kosong dimasukkan dengan qty 0 dan harga 0
    const insertItemKosongArgs = conn.query.mock.calls[2][1]; // panggilan ketiga: item #2
    expect(insertItemKosongArgs[2]).toBe(0); // jumlah
    expect(insertItemKosongArgs[4]).toBe(0); // harga_satuan
    expect(insertItemKosongArgs[5]).toBe(0); // subtotal

    expect(res.statusCode).toBe(201);
    expect(conn.commit).toHaveBeenCalled();

    spyNow.mockRestore();
  });
});
