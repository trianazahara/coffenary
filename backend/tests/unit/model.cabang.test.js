jest.mock('../../config/db', () => ({
  query: jest.fn(),
}));

const pool = require('../../config/db');
const Cabang = require('../../models/cabangModel');

describe('cabangModel', () => {
  beforeEach(() => jest.clearAllMocks());

  test('findAll (aktif saja)', async () => {
    pool.query.mockResolvedValueOnce([[{ id_cabang: 1 }]]);
    const rows = await Cabang.findAll();
    expect(pool.query.mock.calls[0][0]).toContain('is_aktif = 1');
    expect(rows).toEqual([{ id_cabang: 1 }]);
  });

  test('findAll includeInactive:true', async () => {
    pool.query.mockResolvedValueOnce([[{ id_cabang: 1 }]]);
    await Cabang.findAll({ includeInactive: true });
    expect(pool.query.mock.calls[0][0]).toMatch(/SELECT \* FROM cabang ORDER BY/);
  });

  test('findById', async () => {
    pool.query.mockResolvedValueOnce([[{ id_cabang: 9 }]]);
    const row = await Cabang.findById(9);
    expect(pool.query).toHaveBeenCalledWith('SELECT * FROM cabang WHERE id_cabang = ? LIMIT 1', [9]);
    expect(row).toEqual({ id_cabang: 9 });
  });

  test('create', async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 7 }]);
    const id = await Cabang.create({ nama_cabang: 'X', alamat: null, telepon: null, is_aktif: 1 });
    expect(pool.query).toHaveBeenCalled();
    expect(id).toBe(7);
  });

  test('create converts is_aktif falsy to 0', async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 8 }]);
    await Cabang.create({ nama_cabang: 'Y', alamat: '', telepon: '', is_aktif: false });
    expect(pool.query.mock.calls[0][1][3]).toBe(0);
  });

  test('update', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await Cabang.update(3, { nama_cabang: 'Edit', is_aktif: 0 });
    expect(pool.query).toHaveBeenCalled();
    expect(res).toEqual({ affectedRows: 1 });
  });

  test('update returns affectedRows 0 when no fields provided', async () => {
    const res = await Cabang.update(5, {});
    expect(res).toEqual({ affectedRows: 0 });
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('softDelete', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await Cabang.softDelete(4);
    expect(pool.query).toHaveBeenCalledWith('UPDATE cabang SET is_aktif = 0 WHERE id_cabang = ?', [4]);
    expect(res).toEqual({ affectedRows: 1 });
  });
  test('create: default is_aktif=1 ketika tidak dikirim', async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 12 }]);

    const id = await Cabang.create({ nama_cabang: 'Default Aktif', alamat: 'Jalan', telepon: '0812' });
    expect(id).toBe(12);

    // pastikan argumen ke-2 (values) posisi ke-4 adalah 1 (aktif)
    const args = pool.query.mock.calls[0][1];
    expect(args[3]).toBe(1);
  });

  test('update: alamat & telepon & is_aktif:true ikut ter-set', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await Cabang.update(2, { alamat: 'Jl. Mawar', telepon: '08123', is_aktif: true });
    expect(res).toEqual({ affectedRows: 1 });

    // cek SQL dan values yang dipush
    const [sql, values] = pool.query.mock.calls[0];
    expect(sql).toMatch(/UPDATE\s+cabang\s+SET/i);
    // urutan values mengikuti urutan push di model: alamat, telepon, is_aktif(1), id
    expect(values).toEqual(['Jl. Mawar', '08123', 1, 2]);
  });
});
