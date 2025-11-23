jest.mock('../../config/db', () => ({
  query: jest.fn(),
}));

const pool = require('../../config/db');
const Pengguna = require('../../models/penggunaModel');

describe('penggunaModel', () => {
  beforeEach(() => jest.clearAllMocks());

  test('create', async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 9 }]);
    const res = await Pengguna.create({
      username: 'u', email: 'e', kata_sandi_hash: 'hash',
      nama_lengkap: 'Nama', telepon: '08', peran: 'pelanggan', is_aktif: 1
    });
    expect(res.id).toBe(9);
  });

  test('findById', async () => {
    pool.query.mockResolvedValueOnce([[{ id_pengguna: 1 }]]);
    const row = await Pengguna.findById(1);
    expect(pool.query).toHaveBeenCalledWith('SELECT * FROM pengguna WHERE id_pengguna = ? LIMIT 1', [1]);
    expect(row).toEqual({ id_pengguna: 1 });
  });

  test('findByEmail', async () => {
    pool.query.mockResolvedValueOnce([[{ id_pengguna: 2 }]]);
    const row = await Pengguna.findByEmail('e@mail');
    expect(pool.query).toHaveBeenCalledWith('SELECT * FROM pengguna WHERE email = ? LIMIT 1', ['e@mail']);
    expect(row).toEqual({ id_pengguna: 2 });
  });

  test('findAll filter pelanggan', async () => {
    pool.query.mockResolvedValueOnce([[{ id_pengguna: 2 }]]);
    const rows = await Pengguna.findAll({ tipe: 'pelanggan' });
    expect(pool.query.mock.calls[0][0]).toMatch(/peran = 'pelanggan'/);
    expect(rows).toEqual([{ id_pengguna: 2 }]);
  });

  test('findAll filter staff', async () => {
    pool.query.mockResolvedValueOnce([[{ id_pengguna: 3 }]]);
    const rows = await Pengguna.findAll({ tipe: 'staff' });
    expect(pool.query.mock.calls[0][0]).toMatch(/peran IN/);
    expect(rows).toEqual([{ id_pengguna: 3 }]);
  });

  test('updateAdmin dynamic sets', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await Pengguna.updateAdmin(1, { nama_lengkap: 'Edit', is_aktif: true });
    expect(pool.query.mock.calls[0][0]).toMatch(/nama_lengkap/);
    expect(res).toEqual({ affectedRows: 1 });
  });

  test('updateAdmin converts is_aktif false and handles empty set', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const resFalse = await Pengguna.updateAdmin(1, { is_aktif: false });
    expect(pool.query.mock.calls[0][1]).toContain(0);
    expect(resFalse).toEqual({ affectedRows: 1 });

    const resEmpty = await Pengguna.updateAdmin(1, {});
    expect(resEmpty).toEqual({ affectedRows: 0, changedRows: 0 });
  });

  test('updateProfile dynamic sets', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await Pengguna.updateProfile(1, { nama_lengkap: 'Edit' });
    expect(pool.query.mock.calls[0][0]).toMatch(/UPDATE pengguna/);
    expect(res).toEqual({ affectedRows: 1 });
  });

  test('updateProfile empty payload returns 0', async () => {
    const res = await Pengguna.updateProfile(1, {});
    expect(res).toEqual({ affectedRows: 0, changedRows: 0 });
  });

  test('setOtp', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await Pengguna.setOtp('e', 'h', new Date());
    expect(pool.query).toHaveBeenCalled();
    expect(res).toEqual({ affectedRows: 1 });
  });

  test('resetPassword', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await Pengguna.resetPassword('e', 'new');
    expect(pool.query).toHaveBeenCalledWith(
      'UPDATE pengguna SET kata_sandi_hash = ?, otp_hash = NULL, otp_expiry = NULL WHERE email = ?',
      ['new', 'e']
    );
    expect(res).toEqual({ affectedRows: 1 });
  });

  test('create memakai default peran=pelanggan dan is_aktif=1 saat tidak dikirim', async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 42 }]);

    const payload = {
      username: 'u2',
      email: 'e2@mail',
      kata_sandi_hash: 'HASH2',
      nama_lengkap: 'Nama Dua',
      telepon: '0812'
      // peran & is_aktif sengaja tidak dikirim
    };

    const res = await Pengguna.create(payload);
    expect(res.id).toBe(42);

    // pastikan parameter ke query berisi default 'pelanggan' dan 1 di posisi akhir
    const args = pool.query.mock.calls[0][1];
    // urutan: [username, email, kata_sandi_hash, nama_lengkap, telepon, peran, is_aktif]
    expect(args[5]).toBe('pelanggan');
    expect(args[6]).toBe(1);
  });

  test('findAll tanpa filter tidak menambahkan WHERE', async () => {
    pool.query.mockResolvedValueOnce([[{ id_pengguna: 99 }]]);
    const rows = await Pengguna.findAll();
    const sql = pool.query.mock.calls[0][0];

    expect(sql.trim().startsWith('SELECT id_pengguna')).toBe(true);
    expect(sql).not.toMatch(/\bWHERE\b/);
    expect(rows).toEqual([{ id_pengguna: 99 }]);
  });

});
