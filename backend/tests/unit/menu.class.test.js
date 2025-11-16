const { Menu } = require('../../controllers/Menu');

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
    const ctrl = new Menu({ repo, pool: {} });

    const res = mkRes();
    await ctrl.buat({ params: { id_cabang: '5' }, body: { nama_menu: 'Latte' } }, res, mkNext());
    expect(repo.create).toHaveBeenCalledWith({ id_cabang: 5, nama_menu: 'Latte', gambar: null });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ message: 'Menu berhasil ditambahkan', data: { id_menu: 10 } });
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
    const ctrl = new Menu({ repo, pool: {} });

    const res = mkRes();
    await ctrl.ubah({
      params: { id_cabang: 1, id_menu: 2 },
      body: { nama_menu: 'Cappuccino' },
      file: { path: 'img\\cap.jpg' }
    }, res, mkNext());

    expect(repo.update).toHaveBeenCalledWith(2, 1, expect.objectContaining({ nama_menu: 'Cappuccino', gambar: 'img/cap.jpg' }));
    expect(res.body).toEqual({ message: 'Menu berhasil diperbarui' });
  });

  test('ubah: error → next(err)', async () => {
    const repo = { update: jest.fn().mockRejectedValue(new Error('x')) };
    const ctrl = new Menu({ repo, pool: {} });

    await ctrl.ubah({ params: { id_cabang: 1, id_menu: 2 }, body: {} }, mkRes(), mkNext());
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
    const ctrl = new Menu({ repo, pool: {} });

    const res = mkRes();
    await ctrl.hapus({ params: { id_cabang: 1, id_menu: 99 } }, res, mkNext());
    expect(res.body).toEqual({ message: 'Menu berhasil dihapus' });
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
});
