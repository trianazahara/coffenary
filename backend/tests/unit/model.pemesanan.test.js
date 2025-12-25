jest.mock('../../config/db', () => ({
  query: jest.fn(),
}));

const pool = require('../../config/db');
const Pemesanan = require('../../models/pemesananModel');

describe('pemesananModel', () => {
  beforeEach(() => jest.clearAllMocks());

  test('findAllByCabang', async () => {
    pool.query.mockResolvedValueOnce([[{ id_pesanan: 1 }]]);
    const rows = await Pemesanan.findAllByCabang(2);
    expect(pool.query).toHaveBeenCalled();
    expect(rows).toEqual([{ id_pesanan: 1 }]);
  });

  test('updateStatus', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await Pemesanan.updateStatus(1, 'siap');
    expect(pool.query).toHaveBeenCalledWith(
      'UPDATE pesanan SET status = ? WHERE id_pesanan = ?',
      ['siap', 1]
    );
    expect(res).toEqual({ affectedRows: 1 });
  });

  test('getDashboardStats aggregates with defaults', async () => {
    pool.query
      .mockResolvedValueOnce([[{ totalOrders: 2 }], []])
      .mockResolvedValueOnce([[{ totalRevenue: 1000 }], []])
      .mockResolvedValueOnce([[{ nama_menu: 'Latte' }], []])
      .mockResolvedValueOnce([[{ totalLifetimeOrders: 5 }], []])
      .mockResolvedValueOnce([[{ totalLifetimeRevenue: 2000 }], []]);
    const stats = await Pemesanan.getDashboardStats(1);
    expect(stats).toEqual({
      totalOrders: 2,
      totalRevenue: 1000,
      topMenu: 'Latte',
      totalLifetimeOrders: 5,
      totalLifetimeRevenue: 2000
    });
  });

  test('findById returns null when empty', async () => {
    pool.query.mockResolvedValueOnce([[], []]);
    const res = await Pemesanan.findById(99);
    expect(res).toBeNull();
  });

  test('findById returns order with items', async () => {
    pool.query
      .mockResolvedValueOnce([[{ id_pesanan: 5 }], []])
      .mockResolvedValueOnce([[{ id_item:1, id_menu:2 }], []]);
    const res = await Pemesanan.findById(5);
    expect(res).toEqual({ id_pesanan:5, items:[{ id_item:1, id_menu:2 }] });
  });

  test('getDashboardStats fallback ke default saat nilai null dan topMenu kosong', async () => {
    pool.query
      // ordersTodayResult
      .mockResolvedValueOnce([[{ totalOrders: null }], []])
      // revenueTodayResult
      .mockResolvedValueOnce([[{ totalRevenue: null }], []])
      // topMenuResult (kosong)
      .mockResolvedValueOnce([[], []])
      // totalLifetimeOrdersResult
      .mockResolvedValueOnce([[{ totalLifetimeOrders: null }], []])
      // totalLifetimeRevenueResult
      .mockResolvedValueOnce([[{ totalLifetimeRevenue: null }], []]);

    const stats = await Pemesanan.getDashboardStats(1);

    expect(stats).toEqual({
      totalOrders: 0,                 // null || 0
      totalRevenue: 0,                // parseFloat(null) -> NaN || 0
      topMenu: 'Belum ada',           // array kosong -> fallback
      totalLifetimeOrders: 0,         // null || 0
      totalLifetimeRevenue: 0         // NaN || 0
    });
  });

  test('getDashboardStats mengonversi string numerik dengan parseFloat', async () => {
    pool.query
      // ordersTodayResult
      .mockResolvedValueOnce([[{ totalOrders: 3 }], []])
      // revenueTodayResult (string)
      .mockResolvedValueOnce([[{ totalRevenue: '1234.56' }], []])
      // topMenuResult
      .mockResolvedValueOnce([[{ nama_menu: 'Americano' }], []])
      // totalLifetimeOrdersResult
      .mockResolvedValueOnce([[{ totalLifetimeOrders: 9 }], []])
      // totalLifetimeRevenueResult (string)
      .mockResolvedValueOnce([[{ totalLifetimeRevenue: '9876.5' }], []]);

    const stats = await Pemesanan.getDashboardStats(2);

    expect(stats).toEqual({
      totalOrders: 3,
      totalRevenue: 1234.56,          // parseFloat jalan
      topMenu: 'Americano',
      totalLifetimeOrders: 9,
      totalLifetimeRevenue: 9876.5     // parseFloat jalan
    });
  });

});
