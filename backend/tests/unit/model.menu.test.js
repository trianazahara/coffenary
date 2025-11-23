jest.mock('../../config/db', () => ({
  query: jest.fn(),
}));

const pool = require('../../config/db');
const Menu = require('../../models/menuModel');

describe('menuModel', () => {
  beforeEach(() => jest.clearAllMocks());

  test('findAllByCabang', async () => {
    pool.query.mockResolvedValueOnce([[{ id_menu: 1 }]]);
    const rows = await Menu.findAllByCabang(2);
    expect(pool.query).toHaveBeenCalledWith('SELECT * FROM menu WHERE id_cabang = ? ORDER BY id_menu DESC', [2]);
    expect(rows).toEqual([{ id_menu: 1 }]);
  });

  test('create returns id + data', async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 5 }]);
    const res = await Menu.create({ id_cabang: 1, nama_menu: 'Latte', deskripsi_menu: '', kategori: 'makanan', harga: 10000, gambar: null, is_tersedia: 1 });
    expect(res).toEqual(expect.objectContaining({ id: 5, nama_menu: 'Latte' }));
  });

  test('update', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await Menu.update(3, 1, { nama_menu: 'Edit', deskripsi_menu: '', kategori: 'makanan', harga: 5000, gambar: null, is_tersedia: 1 });
    expect(pool.query).toHaveBeenCalled();
    expect(res).toEqual({ affectedRows: 1 });
  });

  test('delete', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await Menu.delete(3, 1);
    expect(pool.query).toHaveBeenCalledWith('DELETE FROM menu WHERE id_menu = ? AND id_cabang = ?', [3, 1]);
    expect(res).toEqual({ affectedRows: 1 });
  });
});
