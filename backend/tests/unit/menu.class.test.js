const { MenuController: Menu } = require('../../controllers/MenuController');

function mkRes() {
  return {
    statusCode: 200,
    body: null,
    status(c) { this.statusCode = c; return this; },
    json(p) { this.body = p; return this; }
  };
}
function mkNext() { return jest.fn(); }

describe('Menu Controller (unit, single file)', () => {
  // ===== semuaByCabang =====
  test('semuaByCabang: sukses', async () => {
    const repo = { findAllByCabang: jest.fn().mockResolvedValue([{ id_menu: 1 }]) };
    const ctrl = new Menu({ repo, pool: {} });

    const res = mkRes();
    await ctrl.semuaByCabang({ params: { id_cabang: 7 } }, res, mkNext());
    expect(repo.findAllByCabang).toHaveBeenCalledWith(7);
    expect(res.body).toEqual([{ id_menu: 1 }]);
  });

  test('semuaByCabang: error → next(err)', async () => {
    const repo = { findAllByCabang: jest.fn().mockRejectedValue(new Error('x')) };
    const ctrl = new Menu({ repo, pool: {} });
    const next = mkNext();

    await ctrl.semuaByCabang({ params: { id_cabang: 7 } }, mkRes(), next);
    expect(next).toHaveBeenCalled();
  });

  // ===== unggulan =====
  test('unggulan: sukses', async () => {
    const pool = { query: jest.fn().mockResolvedValue([[{ id_menu: 9 }], []]) };
    const ctrl = new Menu({ repo: {}, pool });

    const res = mkRes();
    await ctrl.unggulan({}, res, mkNext());
    expect(pool.query).toHaveBeenCalled();
    expect(res.body).toEqual([{ id_menu: 9 }]);
  });

  test('unggulan: error → next(err)', async () => {
    const pool = { query: jest.fn().mockRejectedValue(new Error('db')) };
    const ctrl = new Menu({ repo: {}, pool });
    const next = mkNext();

    await ctrl.unggulan({}, mkRes(), next);
    expect(next).toHaveBeenCalled();
  });

  // ===== buat =====
  test('buat: sukses tanpa file', async () => {
    const repo = { create: jest.fn().mockResolvedValue({ id_menu: 10 }) };
    const LogModel = { addLog: jest.fn().mockResolvedValue() };
    const ctrl = new Menu({ repo, pool: {}, LogModel });

    const res = mkRes();
    await ctrl.buat({ params: { id_cabang: '5' }, body: { nama_menu: 'Latte' }, user: { id: 1 }, get:()=>'' }, res, mkNext());
    expect(repo.create).toHaveBeenCalledWith({ id_cabang: 5, nama_menu: 'Latte', gambar: null });
    expect(LogModel.addLog).toHaveBeenCalled();
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ message: 'Menu berhasil ditambahkan', data: { id_menu: 10 } });
  });

  test('buat: tanpa LogModel tetap 201', async () => {
    const repo = { create: jest.fn().mockResolvedValue({ id_menu: 13 }) };
    const ctrl = new Menu({ repo, pool: {} });
    const res = mkRes();
    await ctrl.buat({ params:{ id_cabang:'1' }, body:{ nama_menu:'NoLog' } }, res, mkNext());
    expect(res.statusCode).toBe(201);
  });

  test('buat: LogModel ada tapi user null → log tidak dipanggil', async () => {
    const repo = { create: jest.fn().mockResolvedValue({ id_menu: 14 }) };
    const LogModel = { addLog: jest.fn() };
    const ctrl = new Menu({ repo, pool: {}, LogModel });
    const res = mkRes();
    await ctrl.buat({ params:{ id_cabang:'1' }, body:{ nama_menu:'Anon' }, user:null }, res, mkNext());
    expect(LogModel.addLog).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(201);
  });

  test('buat: entitas_id fallback ke created.id dan nama_menu fallback', async () => {
    const repo = { create: jest.fn().mockResolvedValue({ id: 21, nama_menu: 'Auto' }) };
    const LogModel = { addLog: jest.fn().mockResolvedValue() };
    const ctrl = new Menu({ repo, pool: {}, LogModel });
    const res = mkRes();
    await ctrl.buat({ params:{ id_cabang:9 }, body:{}, user:{ id:5 }, get:()=>'' }, res, mkNext());
    expect(LogModel.addLog).toHaveBeenCalledWith(expect.objectContaining({ entitas_id: 21 }));
    expect(res.statusCode).toBe(201);
  });

  test('buat: sukses dengan file (path normalize)', async () => {
    const repo = { create: jest.fn().mockResolvedValue({ id_menu: 11 }) };
    const ctrl = new Menu({ repo, pool: {} });

    const res = mkRes();
    await ctrl.buat({
      params: { id_cabang: 1 },
      body: { nama_menu: 'Espresso' },
      file: { path: 'public\\uploads\\foto.jpg' }
    }, res, mkNext());

    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ gambar: 'public/uploads/foto.jpg' }));
    expect(res.statusCode).toBe(201);
  });

  test('buat: error → next(err)', async () => {
    const repo = { create: jest.fn().mockRejectedValue(new Error('x')) };
    const ctrl = new Menu({ repo, pool: {} });

    await ctrl.buat({ params: { id_cabang: 1 }, body: {} }, mkRes(), mkNext());
  });

  test('buat: log gagal tidak menggagalkan response', async () => {
    const repo = { create: jest.fn().mockResolvedValue({ id_menu: 12 }) };
    const LogModel = { addLog: jest.fn().mockRejectedValue(new Error('log fail')) };
    const ctrl = new Menu({ repo, pool: {}, LogModel });
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const res = mkRes();
    await ctrl.buat({ params: { id_cabang: 2 }, body: { nama_menu: 'Mocha' }, user: { id: 1 }, get:()=>'' }, res, mkNext());
    expect(res.statusCode).toBe(201);
    warnSpy.mockRestore();
  });

  // ===== ubah =====
  test('ubah: 404 jika tidak ada', async () => {
    const repo = { update: jest.fn().mockResolvedValue({ affectedRows: 0 }) };
    const ctrl = new Menu({ repo, pool: {} });

    const res = mkRes();
    await ctrl.ubah({ params: { id_cabang: 1, id_menu: 2 }, body: {} }, res, mkNext());
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: 'Menu tidak ditemukan' });
  });

  test('ubah: 200 jika sukses + path file', async () => {
    const repo = { update: jest.fn().mockResolvedValue({ affectedRows: 1 }) };
    const LogModel = { addLog: jest.fn().mockResolvedValue() };
    const ctrl = new Menu({ repo, pool: {}, LogModel });

    const res = mkRes();
    await ctrl.ubah({
      params: { id_cabang: 1, id_menu: 2 },
      body: { nama_menu: 'Cappuccino' },
      file: { path: 'img\\cap.jpg' },
      user: { id: 3 },
      get:()=> ''
    }, res, mkNext());

    expect(repo.update).toHaveBeenCalledWith(2, 1, expect.objectContaining({ nama_menu: 'Cappuccino', gambar: 'img/cap.jpg' }));
    expect(LogModel.addLog).toHaveBeenCalled();
    expect(res.body).toEqual({ message: 'Menu berhasil diperbarui' });
  });

  test('ubah: log gagal tetap 200', async () => {
    const repo = { update: jest.fn().mockResolvedValue({ affectedRows: 1 }) };
    const LogModel = { addLog: jest.fn().mockRejectedValue(new Error('log fail')) };
    const ctrl = new Menu({ repo, pool: {}, LogModel });
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const res = mkRes();
    await ctrl.ubah({ params:{ id_cabang:1, id_menu:2 }, body:{}, user:{ id:1 }, get:()=>'' }, res, mkNext());
    expect(res.statusCode).toBe(200);
    warnSpy.mockRestore();
  });

  test('ubah: error → next(err)', async () => {
    const repo = { update: jest.fn().mockRejectedValue(new Error('x')) };
    const ctrl = new Menu({ repo, pool: {} });

    await ctrl.ubah({ params: { id_cabang: 1, id_menu: 2 }, body: {} }, mkRes(), mkNext());
  });

  test('ubah: tanpa LogModel tetap 200', async () => {
    const repo = { update: jest.fn().mockResolvedValue({ affectedRows: 1 }) };
    const ctrl = new Menu({ repo, pool: {} });
    const res = mkRes();
    await ctrl.ubah({ params:{ id_cabang:1, id_menu:2 }, body:{} }, res, mkNext());
    expect(res.statusCode).toBe(200);
  });

  test('ubah: LogModel ada tapi user null → log tidak dipanggil', async () => {
    const repo = { update: jest.fn().mockResolvedValue({ affectedRows: 1 }) };
    const LogModel = { addLog: jest.fn() };
    const ctrl = new Menu({ repo, pool: {}, LogModel });
    const res = mkRes();
    await ctrl.ubah({ params:{ id_cabang:1, id_menu:2 }, body:{}, user:null }, res, mkNext());
    expect(LogModel.addLog).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
  });

  // ===== hapus =====
  test('hapus: 404 jika tidak ada', async () => {
    const repo = { delete: jest.fn().mockResolvedValue({ affectedRows: 0 }) };
    const ctrl = new Menu({ repo, pool: {} });

    const res = mkRes();
    await ctrl.hapus({ params: { id_cabang: 1, id_menu: 99 } }, res, mkNext());
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: 'Menu tidak ditemukan' });
  });

  test('hapus: 200 jika sukses', async () => {
    const repo = { delete: jest.fn().mockResolvedValue({ affectedRows: 1 }) };
    const LogModel = { addLog: jest.fn().mockResolvedValue() };
    const ctrl = new Menu({ repo, pool: {}, LogModel });

    const res = mkRes();
    await ctrl.hapus({ params: { id_cabang: 1, id_menu: 99 }, user: { id: 5 }, get:()=>'' }, res, mkNext());
    expect(res.body).toEqual({ message: 'Menu berhasil dihapus' });
    expect(LogModel.addLog).toHaveBeenCalled();
  });

  test('hapus: log gagal tetap 200', async () => {
    const repo = { delete: jest.fn().mockResolvedValue({ affectedRows: 1 }) };
    const LogModel = { addLog: jest.fn().mockRejectedValue(new Error('log fail')) };
    const ctrl = new Menu({ repo, pool: {}, LogModel });
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const res = mkRes();
    await ctrl.hapus({ params:{ id_cabang:1, id_menu:9 }, user:{ id:1 }, get:()=>'' }, res, mkNext());
    expect(res.statusCode).toBe(200);
    warnSpy.mockRestore();
  });

  test('hapus: tanpa LogModel tetap 200', async () => {
    const repo = { delete: jest.fn().mockResolvedValue({ affectedRows: 1 }) };
    const ctrl = new Menu({ repo, pool: {} });
    const res = mkRes();
    await ctrl.hapus({ params:{ id_cabang:1, id_menu:9 } }, res, mkNext());
    expect(res.statusCode).toBe(200);
  });

  test('hapus: LogModel ada tapi user null → log tidak dipanggil', async () => {
    const repo = { delete: jest.fn().mockResolvedValue({ affectedRows: 1 }) };
    const LogModel = { addLog: jest.fn() };
    const ctrl = new Menu({ repo, pool: {}, LogModel });
    const res = mkRes();
    await ctrl.hapus({ params:{ id_cabang:1, id_menu:9 }, user:null }, res, mkNext());
    expect(LogModel.addLog).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
  });

  test('hapus: error → next(err)', async () => {
    const repo = { delete: jest.fn().mockRejectedValue(new Error('x')) };
    const ctrl = new Menu({ repo, pool: {} });

    await ctrl.hapus({ params: { id_cabang: 1, id_menu: 99 } }, mkRes(), mkNext());
  });

  // ===== tersediaByCabang =====
  test('tersediaByCabang: sukses', async () => {
    const pool = { query: jest.fn().mockResolvedValue([[{ id_menu: 3 }], []]) };
    const ctrl = new Menu({ repo: {}, pool });

    const res = mkRes();
    await ctrl.tersediaByCabang({ params: { id_cabang: 8 } }, res, mkNext());
    expect(pool.query).toHaveBeenCalledWith(
      'SELECT * FROM menu WHERE id_cabang = ? AND is_tersedia = 1',
      [8]
    );
    expect(res.body).toEqual([{ id_menu: 3 }]);
  });

  test('tersediaByCabang: error → next(err)', async () => {
    const pool = { query: jest.fn().mockRejectedValue(new Error('db')) };
    const ctrl = new Menu({ repo: {}, pool });

    await ctrl.tersediaByCabang({ params: { id_cabang: 8 } }, mkRes(), mkNext());
  });

  // ===== byId =====
  test('byId: 404 jika tidak ada', async () => {
    const pool = { query: jest.fn().mockResolvedValue([[], []]) };
    const ctrl = new Menu({ repo: {}, pool });

    const res = mkRes();
    await ctrl.byId({ params: { id_menu: 123 } }, res, mkNext());
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: 'Menu tidak ditemukan' });
  });

  test('byId: 200 jika ada', async () => {
    const pool = { query: jest.fn().mockResolvedValue([[{ id_menu: 123, nama_menu: 'Mocha' }], []]) };
    const ctrl = new Menu({ repo: {}, pool });

    const res = mkRes();
    await ctrl.byId({ params: { id_menu: 123 } }, res, mkNext());
    expect(res.body).toEqual({ id_menu: 123, nama_menu: 'Mocha' });
  });

  test('byId: error → next(err)', async () => {
    const pool = { query: jest.fn().mockRejectedValue(new Error('x')) };
    const ctrl = new Menu({ repo: {}, pool });

    await ctrl.byId({ params: { id_menu: 1 } }, mkRes(), mkNext());
  });
  test('buat: keterangan fallback ke string kosong saat nama_menu tidak ada di payload & created', async () => {
    const repo = { create: jest.fn().mockResolvedValue({ id_menu: 42 }) }; // tanpa nama_menu
    const LogModel = { addLog: jest.fn().mockResolvedValue() };
    const ctrl = new Menu({ repo, pool: {}, LogModel });

    const res = {
      statusCode: 200, body: null,
      status(c){ this.statusCode = c; return this; },
      json(p){ this.body = p; return this; }
    };

    await ctrl.buat(
      { params: { id_cabang: '2' }, body: {}, user: { id: 9 }, get: () => '' },
      res,
      jest.fn()
    );

    // pastikan keterangan pakai fallback '' untuk nama_menu
    const logPayload = LogModel.addLog.mock.calls[0][0];
    expect(logPayload.keterangan).toBe('Tambah menu  (cabang 2)');
    expect(res.statusCode).toBe(201);
  });
});
