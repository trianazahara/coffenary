const PesananModel = require('../../models/pesananModel');

describe('pesananModel (class with injected pool)', () => {
  const mockPool = {
    query: jest.fn(),
    getConnection: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('buatPesanan', async () => {
    mockPool.query.mockResolvedValueOnce([{ insertId: 9 }]);
    const model = new PesananModel(mockPool);
    const conn = mockPool; // methods compatible
    const id = await model.buatPesanan(conn, { nomor_pesanan:'ORD', id_pengguna:1, id_cabang:2, tipe_pesanan:'bawa_pulang', total:1000 });
    expect(id).toBe(9);
  });

  test('tambahItemPesanan', async () => {
    mockPool.query.mockResolvedValueOnce([{}]);
    const model = new PesananModel(mockPool);
    const conn = mockPool;
    await model.tambahItemPesanan(conn, { id_pesanan:1, id_menu:2, qty:1, catatan:null, harga:5000 });
    expect(mockPool.query).toHaveBeenCalled();
  });

  test('buatPembayaranStub', async () => {
    mockPool.query.mockResolvedValueOnce([{}]);
    const model = new PesananModel(mockPool);
    const conn = mockPool;
    await model.buatPembayaranStub(conn, { id_pesanan:1, total:1000, order_id:'ORD-1' });
    expect(mockPool.query).toHaveBeenCalled();
  });

  test('koneksi memanggil pool.getConnection', async () => {
    mockPool.getConnection.mockResolvedValueOnce('conn');
    const model = new PesananModel(mockPool);
    const conn = await model.koneksi();
    expect(conn).toBe('conn');
  });

  test('detailById returns items attached', async () => {
    mockPool.query
      .mockResolvedValueOnce([[{ id_pesanan: 1 }], []])
      .mockResolvedValueOnce([[{ id_item:1, id_menu:1, nama_menu:'A' }], []]);
    const model = new PesananModel(mockPool);
    const res = await model.detailById(1);
    expect(res.items).toEqual([{ id_item:1, id_menu:1, nama_menu:'A' }]);
  });

  test('detailById null when empty', async () => {
    mockPool.query.mockResolvedValueOnce([[], []]);
    const model = new PesananModel(mockPool);
    const res = await model.detailById(2);
    expect(res).toBeNull();
  });

  test('statistikCabang returns defaults when nulls', async () => {
    mockPool.query
      .mockResolvedValueOnce([[{ totalOrders: null }]]) // harian
      .mockResolvedValueOnce([[{ totalRevenue: null }]]) // revHarian
      .mockResolvedValueOnce([[], []]) // topMenuRows empty
      .mockResolvedValueOnce([[{ totalLifetimeOrders: null }]]) // lifeOrders
      .mockResolvedValueOnce([[{ totalLifetimeRevenue: null }]]); // lifeRevenue
    const model = new PesananModel(mockPool);
    const res = await model.statistikCabang(1);
    expect(res).toEqual({
      totalOrders: 0,
      totalRevenue: 0,
      topMenu: 'Belum ada',
      totalLifetimeOrders: 0,
      totalLifetimeRevenue: 0
    });
  });

  test('pesananByPengguna', async () => {
    mockPool.query.mockResolvedValueOnce([[{ id: 1 }], []]);
    const model = new PesananModel(mockPool);
    const res = await model.pesananByPengguna(5);
    expect(res).toEqual([{ id:1 }]);
  });

  test('itemByOrderIds empty returns []', async () => {
    const model = new PesananModel(mockPool);
    const res = await model.itemByOrderIds([]);
    expect(res).toEqual([]);
  });

  test('itemByOrderIds with ids', async () => {
    mockPool.query.mockResolvedValueOnce([[{ id_item:1 }], []]);
    const model = new PesananModel(mockPool);
    const res = await model.itemByOrderIds([1,2]);
    expect(mockPool.query.mock.calls[0][0]).toContain('IN (?,?)');
    expect(res).toEqual([{ id_item:1 }]);
  });

  test('latestPembayaran returns row or null', async () => {
    mockPool.query.mockResolvedValueOnce([[{ id:1 }], []]);
    const model = new PesananModel(mockPool);
    const row = await model.latestPembayaran(1);
    expect(row).toEqual({ id:1 });
    mockPool.query.mockResolvedValueOnce([[], []]);
    const rowNull = await model.latestPembayaran(1);
    expect(rowNull).toBeNull();
  });

  test('simpanPembayaranSnap returns insertId', async () => {
    mockPool.query.mockResolvedValueOnce([{ insertId: 11 }]);
    const model = new PesananModel(mockPool);
    const id = await model.simpanPembayaranSnap({ id_pesanan:1, order_id:'O', snap_token:null, snap_redirect_url:null, jumlah_bayar:1000 });
    expect(id).toBe(11);
  });

  test('hitungPendingByCabang', async () => {
    mockPool.query.mockResolvedValueOnce([[{ count: 3 }], []]);
    const model = new PesananModel(mockPool);
    const count = await model.hitungPendingByCabang(1);
    expect(count).toBe(3);
  });

  test('hitungPendingByCabang returns 0 when null', async () => {
    mockPool.query.mockResolvedValueOnce([[{ count: null }], []]);
    const model = new PesananModel(mockPool);
    const count = await model.hitungPendingByCabang(99);
    expect(count).toBe(0);
  });

  test('milikPengguna returns boolean', async () => {
    mockPool.query.mockResolvedValueOnce([[{ dummy:1 }], []]);
    const model = new PesananModel(mockPool);
    const yes = await model.milikPengguna(1,2);
    expect(yes).toBe(true);
    mockPool.query.mockResolvedValueOnce([[], []]);
    const no = await model.milikPengguna(1,2);
    expect(no).toBe(false);
  });

  test('semuaByCabang mengembalikan rows dengan JOIN dan ORDER BY', async () => {
    mockPool.query.mockResolvedValueOnce([[{ id_pesanan: 1, nama_pelanggan: 'Budi' }]]);

    const model = new PesananModel(mockPool);
    const rows = await model.semuaByCabang(77);

    // Pastikan SQL-nya benar2 pakai JOIN pengguna + ORDER BY tanggal_dibuat DESC
    const sql = mockPool.query.mock.calls[0][0];
    const params = mockPool.query.mock.calls[0][1];

    expect(sql).toMatch(/FROM\s+pesanan\s+p\s+JOIN\s+pengguna\s+pg/i);
    expect(sql).toMatch(/ORDER BY\s+p\.tanggal_dibuat\s+DESC/i);
    expect(params).toEqual([77]);

    // Kembalian rows
    expect(rows).toEqual([{ id_pesanan: 1, nama_pelanggan: 'Budi' }]);
  });

  test('updateStatus mengeksekusi UPDATE dan mengembalikan result', async () => {
    const fake = { affectedRows: 1, changedRows: 1 };
    mockPool.query.mockResolvedValueOnce([fake]);

    const model = new PesananModel(mockPool);
    const res = await model.ubahStatus(123, 'selesai');

    // Verifikasi SQL dan param
    expect(mockPool.query).toHaveBeenCalledWith(
      'UPDATE pesanan SET status=? WHERE id_pesanan=?',
      ['selesai', 123]
    );
    // Return persis dari driver
    expect(res).toBe(fake);
  });

  test('hitungPendingByCabang fallback 0 ketika count null', async () => {
    mockPool.query.mockResolvedValueOnce([[{ count: null }], []]);
    const model = new PesananModel(mockPool);
    const count = await model.hitungPendingByCabang(99);
    expect(count).toBe(0);
  });
});
