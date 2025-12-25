const { PenggunaController: Pengguna } = require('../../controllers/PenggunaController');

function mkRes() {
  return {
    statusCode: 200,
    body: null,
    status(c){ this.statusCode = c; return this; },
    json(p){ this.body = p; return this; }
  };
}
function mkNext() { return jest.fn(); }

describe('Pengguna Controller (unit)', () => {
  // ===== semua =====
  test('semua: kirim filter query ke repo', async () => {
    const repo = { findAll: jest.fn().mockResolvedValue([{ id_pengguna: 1 }]) };
    const ctrl = new Pengguna({ repo, bcrypt: {} });

    const res = mkRes();
    await ctrl.semua({ query: { peran: 'staff' } }, res, mkNext());
    expect(repo.findAll).toHaveBeenCalledWith({ peran: 'staff' });
    expect(res.body).toEqual([{ id_pengguna: 1 }]);
  });

  test('semua: error -> next(err)', async () => {
    const repo = { findAll: jest.fn().mockRejectedValue(new Error('db')) };
    const ctrl = new Pengguna({ repo, bcrypt: {} });
    const next = mkNext();

    await ctrl.semua({ query: {} }, mkRes(), next);
    expect(next).toHaveBeenCalled();
  });

  // ===== updateByAdmin =====
  test('updateByAdmin: 400 jika email sudah dipakai user lain', async () => {
    const repo = {
      findByEmail: jest.fn().mockResolvedValue({ id_pengguna: 99 }),
      updateAdmin: jest.fn()
    };
    const ctrl = new Pengguna({ repo, bcrypt: { hash: jest.fn() } });

    const res = mkRes();
    await ctrl.updateByAdmin({ params: { id: 1 }, body: { email: 'a@a.com' } }, res, mkNext());
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: 'Email sudah digunakan pengguna lain.' });
  });

  test('updateByAdmin: hash password bila ada', async () => {
    const repo = {
      findByEmail: jest.fn().mockResolvedValue(null),
      updateAdmin: jest.fn().mockResolvedValue({ affectedRows: 1 })
    };
    const bcrypt = { hash: jest.fn().mockResolvedValue('HASHED') };
    const ctrl = new Pengguna({ repo, bcrypt });

    const res = mkRes();
    await ctrl.updateByAdmin(
      { params: { id: 7 }, body: { password: 'rahasia', nama_lengkap: 'Budi' } },
      res, mkNext()
    );

    // pastikan password diubah jadi kata_sandi_hash
    const payload = repo.updateAdmin.mock.calls[0][1];
    expect(payload.kata_sandi_hash).toBe('HASHED');
    expect(payload.password).toBeUndefined();
    expect(res.body).toEqual({ message: 'Data pengguna berhasil diperbarui (admin).' });
  });

  test('updateByAdmin: 404 jika tidak ditemukan', async () => {
    const repo = {
      findByEmail: jest.fn().mockResolvedValue(null),
      updateAdmin: jest.fn().mockResolvedValue({ affectedRows: 0 })
    };
    const ctrl = new Pengguna({ repo, bcrypt: { hash: jest.fn() } });

    const res = mkRes();
    await ctrl.updateByAdmin({ params: { id: 1 }, body: {} }, res, mkNext());
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: 'Pengguna tidak ditemukan' });
  });

  test('updateByAdmin: error -> next(err)', async () => {
    const repo = {
      findByEmail: jest.fn().mockResolvedValue(null),
      updateAdmin: jest.fn().mockRejectedValue(new Error('x'))
    };
    const ctrl = new Pengguna({ repo, bcrypt: { hash: jest.fn() } });

    await ctrl.updateByAdmin({ params: { id: 1 }, body: {} }, mkRes(), mkNext());
  });

  // ===== updateMe =====
  test('updateMe: 401 jika tidak ada user', async () => {
    const ctrl = new Pengguna({ repo: {}, bcrypt: {} });
    const res = mkRes();

    await ctrl.updateMe({ user: null, body: {} }, res, mkNext());
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ message: 'Unauthenticated' });
  });

  test('updateMe: hash password bila diisi, ignore peran & is_aktif', async () => {
    const repo = { updateProfile: jest.fn().mockResolvedValue({ affectedRows: 1 }) };
    const bcrypt = { hash: jest.fn().mockResolvedValue('HPASS') };
    const ctrl = new Pengguna({ repo, bcrypt });

    const res = mkRes();
    await ctrl.updateMe(
      { user: { id: 5 }, body: { peran: 'admin', is_aktif: 0, password: 'x', nama_lengkap: 'Sari' } },
      res, mkNext()
    );

    const payload = repo.updateProfile.mock.calls[0][1];
    expect(payload.peran).toBeUndefined();
    expect(payload.is_aktif).toBeUndefined();
    expect(payload.kata_sandi_hash).toBe('HPASS');
    expect(res.body).toEqual({ message: 'Profil berhasil diperbarui.' });
  });

  test('updateMe: 404 jika user tidak ditemukan', async () => {
    const repo = { updateProfile: jest.fn().mockResolvedValue({ affectedRows: 0 }) };
    const ctrl = new Pengguna({ repo, bcrypt: { hash: jest.fn() } });

    const res = mkRes();
    await ctrl.updateMe({ user: { id: 1 }, body: {} }, res, mkNext());
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: 'Pengguna tidak ditemukan' });
  });

  test('updateMe: error -> next(err)', async () => {
    const repo = { updateProfile: jest.fn().mockRejectedValue(new Error('db')) };
    const ctrl = new Pengguna({ repo, bcrypt: { hash: jest.fn() } });

    await ctrl.updateMe({ user: { id: 1 }, body: {} }, mkRes(), mkNext());
  });

  // ===== createByAdmin =====
  test('createByAdmin: 400 jika peran tidak diizinkan', async () => {
    const ctrl = new Pengguna({ repo: {}, bcrypt: {} });
    const res = mkRes();

    await ctrl.createByAdmin(
      { body: { nama_lengkap: 'Ana', email: 'a@a', password: 'x', telepon: '08', peran: 'pelanggan' } },
      res, mkNext()
    );
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: 'Peran yang diizinkan hanya admin atau staff.' });
  });

  test('createByAdmin: 400 jika email sudah ada', async () => {
    const repo = { findByEmail: jest.fn().mockResolvedValue({ id_pengguna: 1 }) };
    const ctrl = new Pengguna({ repo, bcrypt: { hash: jest.fn() } });
    const res = mkRes();

    await ctrl.createByAdmin(
      { body: { nama_lengkap: 'Ana', email: 'a@a', password: 'x', telepon: '08', peran: 'admin' } },
      res, mkNext()
    );
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: 'Email sudah terdaftar.' });
  });

  test('createByAdmin: 201 sukses', async () => {
    const repo = {
      findByEmail: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id_pengguna: 77 })
    };
    const bcrypt = { hash: jest.fn().mockResolvedValue('HASH') };
    const ctrl = new Pengguna({ repo, bcrypt });

    const res = mkRes();
    await ctrl.createByAdmin(
      { body: { nama_lengkap: 'Ana', email: 'a@a', password: 'x', telepon: '08', peran: 'staff' } },
      res, mkNext()
    );
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ kata_sandi_hash: 'HASH', peran: 'staff' }));
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ message: 'Pengguna baru berhasil ditambahkan.', data: { id_pengguna: 77 } });
  });

  test('createByAdmin: error -> next(err)', async () => {
    const repo = { findByEmail: jest.fn().mockResolvedValue(null), create: jest.fn().mockRejectedValue(new Error('x')) };
    const ctrl = new Pengguna({ repo, bcrypt: { hash: jest.fn() } });

    await ctrl.createByAdmin(
      { body: { nama_lengkap: 'Ana', email: 'a@a', password: 'x', telepon: '08', peran: 'admin' } },
      mkRes(), mkNext()
    );
  });

  test('semua: tanpa query → filter default {}', async () => {
    const repo = { findAll: jest.fn().mockResolvedValue([]) };
    const ctrl = new Pengguna({ repo, bcrypt: {} });

    const res = mkRes();
    await ctrl.semua({}, res, mkNext());   // ← query undefined
    expect(repo.findAll).toHaveBeenCalledWith({});
    expect(res.body).toEqual([]);
  });

  test('updateByAdmin: email ditemukan tapi milik id yang sama → lanjut update (bukan 400)', async () => {
    const repo = {
      findByEmail: jest.fn().mockResolvedValue({ id_pengguna: 7 }),  // sama dengan params.id
      updateAdmin: jest.fn().mockResolvedValue({ affectedRows: 1 })
    };
    const ctrl = new Pengguna({ repo, bcrypt: { hash: jest.fn() } });

    const res = mkRes();
    await ctrl.updateByAdmin(
      { params: { id: 7 }, body: { email: 'same@a.com', nama_lengkap: 'Same User' } },
      res,
      mkNext()
    );

    expect(repo.updateAdmin).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Data pengguna berhasil diperbarui (admin).' });
  });

  test('updateMe: tanpa password → tidak hashing, updateProfile tetap jalan', async () => {
    const repo = { updateProfile: jest.fn().mockResolvedValue({ affectedRows: 1 }) };
    const bcrypt = { hash: jest.fn() };
    const ctrl = new Pengguna({ repo, bcrypt });

    const res = mkRes();
    await ctrl.updateMe(
      { user: { id: 9 }, body: { nama_lengkap: 'Tanpa Password' } }, // password undefined
      res,
      mkNext()
    );

    expect(bcrypt.hash).not.toHaveBeenCalled();
    const payload = repo.updateProfile.mock.calls[0][1];
    expect(payload.kata_sandi_hash).toBeUndefined();
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Profil berhasil diperbarui.' });
  });

  test('createByAdmin: body undefined → peran undefined, validasi 400', async () => {
    const ctrl = new Pengguna({ repo: {}, bcrypt: {} });
    const res = mkRes();

    await ctrl.createByAdmin({ body: undefined }, res, mkNext());
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: 'Peran yang diizinkan hanya admin atau staff.' });
  });

  test('updateMe: body undefined → destructuring fallback {}, tanpa hashing', async () => {
    const repo = { updateProfile: jest.fn().mockResolvedValue({ affectedRows: 1 }) };
    const bcrypt = { hash: jest.fn() };
    const ctrl = new Pengguna({ repo, bcrypt });

    const res = mkRes();
    await ctrl.updateMe(
      { user: { id: 42 }, body: undefined },  // ← trigger req.body || {}
      res,
      mkNext()
    );

    // tidak ada hashing karena password tidak ada
    expect(bcrypt.hash).not.toHaveBeenCalled();

    // payload ke repo adalah objek kosong (others = {})
    expect(repo.updateProfile).toHaveBeenCalledWith(42, {});
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Profil berhasil diperbarui.' });
  });
});
