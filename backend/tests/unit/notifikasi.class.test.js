const { NotifikasiController: Notifikasi } = require('../../controllers/NotifikasiController');
const crypto = require('crypto');

function mkRes() {
  return {
    statusCode: 200,
    body: null,
    status(c){ this.statusCode = c; return this; },
    json(p){ this.body = p; return this; }
  };
}
const mkNext = () => jest.fn();

describe('Notifikasi Controller (Midtrans)', () => {
  const SERVER_KEY = 'sk_test';
  const NOW = new Date('2025-01-01T00:00:00Z');

  const makeSig = ({ order_id, status_code, gross_amount }) =>
    crypto.createHash('sha512').update(`${order_id}${status_code}${gross_amount}${SERVER_KEY}`).digest('hex');

  test('403 jika signature salah', async () => {
    const pool = { query: jest.fn() };
    const ctrl = new Notifikasi({ pool, serverKey: SERVER_KEY, crypto });

    const res = mkRes();
    await ctrl.handle({
      body: {
        order_id: 'ORDER-1', status_code: '200', gross_amount: '10000',
        signature_key: 'SALAH', transaction_status: 'settlement'
      }
    }, res, mkNext());

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ message: 'Invalid signature' });
  });

  test('insert baris baru kalau pembayaran belum ada', async () => {
    const pool = {
      query: jest
        .fn()
        // SELECT pembayaran by referensi -> kosong
        .mockResolvedValueOnce([[], []])
        // INSERT pembayaran
        .mockResolvedValueOnce([{}, {}])
    };
    const ctrl = new Notifikasi({ pool, serverKey: SERVER_KEY, crypto });

    const body = {
      order_id: 'ORDER-9', status_code: '201', gross_amount: '12000',
      signature_key: makeSig({ order_id: 'ORDER-9', status_code: '201', gross_amount: '12000' }),
      transaction_status: 'pending', payment_type: 'qris', transaction_time: NOW.toISOString()
    };

    const res = mkRes();
    await ctrl.handle({ body }, res, mkNext());
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'OK' });
    // pastikan INSERT terpanggil
    expect(pool.query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('INSERT INTO pembayaran'),
      expect.arrayContaining([null, 'qris', 'pending', 12000, 'ORDER-9'])
    );
  });

  test('update pembayaran + set pesanan terkonfirmasi untuk settlement', async () => {
    const pool = {
      query: jest
        .fn()
        // SELECT pembayaran -> ada
        .mockResolvedValueOnce([[{ id_pembayaran: 5, id_pesanan: 11, jumlah_bayar: 10000 }], []])
        // UPDATE pembayaran utama
        .mockResolvedValueOnce([{}, {}])
        // UPDATE kolom opsional
        .mockResolvedValueOnce([{}, {}])
        // UPDATE pesanan status -> terkonfirmasi
        .mockResolvedValueOnce([{}, {}])
    };
    const ctrl = new Notifikasi({ pool, serverKey: SERVER_KEY, crypto });

    const body = {
      order_id: 'ORDER-11', status_code: '200', gross_amount: '10000',
      signature_key: makeSig({ order_id: 'ORDER-11', status_code: '200', gross_amount: '10000' }),
      transaction_status: 'settlement',
      payment_type: 'bank_transfer', transaction_id: 'tx-1', transaction_time: NOW.toISOString()
    };

    const res = mkRes();
    await ctrl.handle({ body }, res, mkNext());
    expect(res.statusCode).toBe(200);
    expect(pool.query).toHaveBeenLastCalledWith(
      'UPDATE pesanan SET status = ? WHERE id_pesanan = ?',
      ['terkonfirmasi', 11]
    );
  });

  test('update pembayaran + set pesanan dibatalkan untuk deny/expire/cancel/failure', async () => {
    const pool = {
      query: jest
        .fn()
        .mockResolvedValueOnce([[{ id_pembayaran: 7, id_pesanan: 21, jumlah_bayar: 9000 }], []])
        .mockResolvedValueOnce([{}, {}]) // update pembayaran
        .mockResolvedValueOnce([{}, {}]) // update opsional
        .mockResolvedValueOnce([{}, {}]) // update pesanan -> dibatalkan
    };
    const ctrl = new Notifikasi({ pool, serverKey: SERVER_KEY, crypto });

    const body = {
      order_id: 'ORDER-21', status_code: '407', gross_amount: '9000',
      signature_key: makeSig({ order_id: 'ORDER-21', status_code: '407', gross_amount: '9000' }),
      transaction_status: 'deny',
      payment_type: 'qris', transaction_id: 'tx-9'
    };

    const res = mkRes();
    await ctrl.handle({ body }, res, mkNext());
    expect(pool.query).toHaveBeenLastCalledWith(
      'UPDATE pesanan SET status = ? WHERE id_pesanan = ?',
      ['dibatalkan', 21]
    );
  });

  test('status pending tidak mengubah pesanan', async () => {
    const pool = {
      query: jest
        .fn()
        .mockResolvedValueOnce([[{ id_pembayaran: 8, id_pesanan: 31, jumlah_bayar: 5000 }], []])
        .mockResolvedValueOnce([{}, {}]) // update pembayaran
        .mockResolvedValueOnce([{}, {}]) // update opsional
    };
    const ctrl = new Notifikasi({ pool, serverKey: SERVER_KEY, crypto });

    const body = {
      order_id: 'ORDER-31', status_code: '201', gross_amount: '5000',
      signature_key: makeSig({ order_id: 'ORDER-31', status_code: '201', gross_amount: '5000' }),
      transaction_status: 'pending', payment_type: 'qris'
    };

    const res = mkRes();
    await ctrl.handle({ body }, res, mkNext());
    expect(res.statusCode).toBe(200);
    // tidak ada call ke UPDATE pesanan
    const allCalls = pool.query.mock.calls.map(c => c[0]);
    expect(allCalls.some(sql => String(sql).includes('UPDATE pesanan'))).toBe(false);
  });

  test('menerima camelCase fields (orderId, grossAmount, signatureKey, transactionStatus)', async () => {
    const pool = {
      query: jest
        .fn()
        .mockResolvedValueOnce([[], []]) // select pembayaran -> kosong
        .mockResolvedValueOnce([{}, {}]) // insert pembayaran
    };
    const ctrl = new Notifikasi({ pool, serverKey: SERVER_KEY, crypto });

    const body = {
      orderId: 'ORDER-55', status_code: '200', grossAmount: '7777',
      signatureKey: makeSig({ order_id: 'ORDER-55', status_code: '200', gross_amount: '7777' }),
      transactionStatus: 'capture', paymentType: 'credit_card', transactionId: 'tx-55'
    };

    const res = mkRes();
    await ctrl.handle({ body }, res, mkNext());
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'OK' });
  });

  test('kolom opsional error → diabaikan, tetap 200', async () => {
    const pool = {
      query: jest
        .fn()
        // SELECT pembayaran -> ada
        .mockResolvedValueOnce([[{ id_pembayaran: 12, id_pesanan: 77, jumlah_bayar: 1000 }], []])
        // UPDATE pembayaran utama -> ok
        .mockResolvedValueOnce([{}, {}])
        // UPDATE kolom opsional -> lempar error (picu catch {})
        .mockRejectedValueOnce(new Error('no such column'))
        // tidak ada UPDATE pesanan, karena status dibuat pending
    };
    const ctrl = new Notifikasi({ pool, serverKey: SERVER_KEY, crypto });

    const body = {
      order_id: 'ORDER-77',
      status_code: '201',
      gross_amount: '1000',
      signature_key: makeSig({ order_id: 'ORDER-77', status_code: '201', gross_amount: '1000' }),
      transaction_status: 'pending',            // supaya tidak masuk blok sinkron status pesanan
      payment_type: 'qris',
      transaction_id: 'tx-err'
    };

    const res = mkRes();
    await ctrl.handle({ body }, res, mkNext());

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'OK' });

    // pastikan urutan call sesuai ekspektasi dan berhenti tanpa update status pesanan
    expect(pool.query).toHaveBeenNthCalledWith(
      1,
      'SELECT * FROM pembayaran WHERE referensi_pembayaran = ? ORDER BY id_pembayaran DESC LIMIT 1',
      ['ORDER-77']
    );
    expect(pool.query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('UPDATE pembayaran'),
      expect.any(Array)
    );
    // call ke-3 adalah update opsional yang gagal
    expect(pool.query.mock.calls[2][0]).toContain('SET payment_type = ?, transaction_id = ?');
    // tidak ada call berisi 'UPDATE pesanan'
    const texts = pool.query.mock.calls.map(c => String(c[0]));
    expect(texts.some(t => t.includes('UPDATE pesanan'))).toBe(false);
  });


  test('error internal -> next(err)', async () => {
    const pool = {
      query: jest.fn().mockRejectedValue(new Error('db down'))
    };
    const ctrl = new Notifikasi({ pool, serverKey: SERVER_KEY, crypto });
    const next = mkNext();

    await ctrl.handle({ body: { order_id: 'ORDER-1' } }, mkRes(), next);
    expect(next).toHaveBeenCalled();
  });

  test('OK tanpa signature_key (sandbox-allowed path)', async () => {
    const pool = {
      query: jest.fn()
        .mockResolvedValueOnce([[{ id_pembayaran: 1, id_pesanan: 2, jumlah_bayar: 0 }], []]) // SELECT
        .mockResolvedValueOnce([{}, {}]) // UPDATE utama
        .mockResolvedValueOnce([{}, {}]) // UPDATE opsional
    };
    const { NotifikasiController: Notifikasi } = require('../../controllers/NotifikasiController');
    const ctrl = new Notifikasi({ pool, serverKey: 'x', crypto: require('crypto') });
    const res = { statusCode: 200, body:null, status(c){this.statusCode=c;return this;}, json(p){this.body=p;return this;} };
    await ctrl.handle({ body:{ order_id:'ORDER-2', status_code:'200', gross_amount:'1000', transaction_status:'pending' } }, res, jest.fn());
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'OK' });
  });

  // 1) capture → set pesanan "terkonfirmasi" (cover cabang pertama selain settlement)
  test('update pembayaran + set pesanan terkonfirmasi untuk capture', async () => {
    const SERVER_KEY = 'sk_test';
    const crypto = require('crypto');
    const makeSig = ({ order_id, status_code, gross_amount }) =>
      crypto.createHash('sha512').update(`${order_id}${status_code}${gross_amount}${SERVER_KEY}`).digest('hex');

    const pool = {
      query: jest
        .fn()
        // SELECT pembayaran -> ada
        .mockResolvedValueOnce([[{ id_pembayaran: 3, id_pesanan: 44, jumlah_bayar: 15000 }], []])
        // UPDATE pembayaran utama
        .mockResolvedValueOnce([{}, {}])
        // UPDATE kolom opsional
        .mockResolvedValueOnce([{}, {}])
        // UPDATE pesanan status -> terkonfirmasi
        .mockResolvedValueOnce([{}, {}])
    };
    const { NotifikasiController: Notifikasi } = require('../../controllers/NotifikasiController');
    const ctrl = new Notifikasi({ pool, serverKey: SERVER_KEY, crypto });

    const body = {
      order_id: 'ORDER-44', status_code: '200', gross_amount: '15000',
      signature_key: makeSig({ order_id: 'ORDER-44', status_code: '200', gross_amount: '15000' }),
      transaction_status: 'capture',
      payment_type: 'credit_card', transaction_id: 'tx-44'
    };

    const res = { statusCode: 200, body:null, status(c){this.statusCode=c;return this;}, json(p){this.body=p;return this;} };
    await ctrl.handle({ body }, res, jest.fn());

    expect(res.statusCode).toBe(200);
    expect(pool.query).toHaveBeenLastCalledWith(
      'UPDATE pesanan SET status = ? WHERE id_pesanan = ?',
      ['terkonfirmasi', 44]
    );
  });

  // 2) defaulting: tanpa transaction_status/transactionStatus dan tanpa payment_type/paymentType
  //    → status diperlakukan pending (tidak menyentuh pesanan) & INSERT memakai 'qris'
  test('INSERT memakai default payment_type "qris" dan default status pending saat field tidak dikirim', async () => {
    const pool = {
      query: jest
        .fn()
        // SELECT pembayaran -> kosong
        .mockResolvedValueOnce([[], []])
        // INSERT pembayaran
        .mockResolvedValueOnce([{}, {}])
    };
    const { NotifikasiController: Notifikasi } = require('../../controllers/NotifikasiController');
    const ctrl = new Notifikasi({ pool, serverKey: 'x', crypto: require('crypto') });

    // sengaja TIDAK mengirim transaction_status / payment_type / signature_key
    const body = {
      order_id: 'ORDER-1001',
      status_code: '201',
      gross_amount: '4321'
    };

    const res = { statusCode: 200, body:null, status(c){this.statusCode=c;return this;}, json(p){this.body=p;return this;} };
    await ctrl.handle({ body }, res, jest.fn());

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'OK' });

    // panggilan ke-2 adalah INSERT dan harus memakai 'qris' (default) dan status 'pending' (default)
    const [, insertCall] = pool.query.mock.calls;
    expect(String(insertCall[0])).toContain('INSERT INTO pembayaran');
    const insertValues = insertCall[1];
    // values: [null, paymentType||'qris', transactionStatus, gross, order_id, JSON.stringify(body), transactionTime||new Date()]
    expect(insertValues[1]).toBe('qris');             // default payment_type
    expect(insertValues[2]).toBe('pending');          // default status
    expect(insertValues[3]).toBe(4321);               // Number('4321')
    expect(insertValues[4]).toBe('ORDER-1001');

    // pastikan tidak ada UPDATE pesanan karena status pending
    const anyUpdatePesanan = pool.query.mock.calls.some(c => String(c[0]).includes('UPDATE pesanan'));
    expect(anyUpdatePesanan).toBe(false);
  });

  test('req.body undefined → fallback {} dan INSERT default (order_id undefined, gross 0, status pending, payment_type qris)', async () => {
    const pool = {
      query: jest
        .fn()
        .mockResolvedValueOnce([[], []])   // SELECT by order_id (undefined) → kosong
        .mockResolvedValueOnce([{}, {}])   // INSERT pembayaran
    };
    const ctrl = new Notifikasi({ pool, serverKey: 'x', crypto: require('crypto') });

    const res = { statusCode: 200, body: null, status(c){this.statusCode=c;return this;}, json(p){this.body=p;return this;} };
    await ctrl.handle({}, res, jest.fn());   // ← tanpa body

    expect(res.statusCode).toBe(200);
    const [, insertCall] = pool.query.mock.calls;
    expect(String(insertCall[0])).toContain('INSERT INTO pembayaran');
    const vals = insertCall[1];
    // VALUES: [null, paymentType||'qris', transactionStatus, gross, order_id, JSON.stringify(body), transactionTime||new Date()]
    expect(vals[1]).toBe('qris');      // default payment_type
    expect(vals[2]).toBe('pending');   // default status
    expect(vals[3]).toBe(0);           // Number('') → 0
    expect(vals[4]).toBeUndefined();   // order_id tidak ada
  });

  test('gross 0 → memakai pembayaranRow.jumlah_bayar pada UPDATE pembayaran', async () => {
    const pool = {
      query: jest
        .fn()
        // SELECT pembayaran → ada, dengan jumlah_bayar 7777
        .mockResolvedValueOnce([[{ id_pembayaran: 2, id_pesanan: 9, jumlah_bayar: 7777 }], []])
        // UPDATE pembayaran utama
        .mockResolvedValueOnce([{}, {}])
        // UPDATE kolom opsional
        .mockResolvedValueOnce([{}, {}])
    };
    const SERVER_KEY = 'sk_test';
    const makeSig = ({ order_id, status_code, gross_amount }) =>
      require('crypto').createHash('sha512').update(`${order_id}${status_code}${gross_amount}${SERVER_KEY}`).digest('hex');

    const ctrl = new Notifikasi({ pool, serverKey: SERVER_KEY, crypto: require('crypto') });

    const body = {
      order_id: 'ORDER-X',
      status_code: '200',
      gross_amount: '0', // ← bikin gross = 0
      signature_key: makeSig({ order_id: 'ORDER-X', status_code: '200', gross_amount: '0' }),
      transaction_status: 'pending'
    };

    const res = { statusCode: 200, body: null, status(c){this.statusCode=c;return this;}, json(p){this.body=p;return this;} };
    await ctrl.handle({ body }, res, jest.fn());

    expect(res.statusCode).toBe(200);
    // Panggilan ke-2 adalah UPDATE pembayaran utama; param[1] harus 7777 (fallback dari row)
    const updateArgs = pool.query.mock.calls[1];
    expect(String(updateArgs[0])).toContain('UPDATE pembayaran');
    const params = updateArgs[1];
    expect(params[1]).toBe(7777);
  });

});
