jest.mock('../../config/db', () => ({
  query: jest.fn(),
}));

const pool = require('../../config/db');
const LogModel = require('../../models/logModel');

describe('logModel', () => {
  beforeEach(() => jest.clearAllMocks());

  test('addLog valid enums', async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 5 }]);
    const res = await LogModel.addLog({ id_admin:1, aksi:'create', entitas:'menu', entitas_id: 9, keterangan:'x', user_agent:'ua' });
    expect(pool.query).toHaveBeenCalled();
    expect(res).toEqual({ id_log: 5 });
  });

  test('add throws jika aksi/entitas tidak valid', async () => {
    await expect(LogModel.addLog({ id_admin:1, aksi:'x', entitas:'menu' })).rejects.toThrow('aksi tidak valid');
    await expect(LogModel.addLog({ id_admin:1, aksi:'create', entitas:'x' })).rejects.toThrow('entitas tidak valid');
  });

  test('alias add()', async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 6 }]);
    const res = await LogModel.add({ id_admin:1, aksi:'create', entitas:'pesanan' });
    expect(res.id_log).toBe(6);
  });

  test('getLogs builds pagination query', async () => {
    pool.query
      .mockResolvedValueOnce([[], []]) // data
      .mockResolvedValueOnce([[{ total: 0 }], []]); // count
    const res = await LogModel.getLogs({ page:2, limit:5, admin_id:1, entitas:'menu', aksi:'create', q:'abc', date_from:'2024-01-01', date_to:'2024-01-02' });
    expect(pool.query).toHaveBeenCalledTimes(2);
    expect(res.meta).toEqual({ page: 2, limit: 5, total: 0 });
  });

  test('getLogs default page/limit fallback', async () => {
    pool.query
      .mockResolvedValueOnce([[{ id_log:1 }], []])
      .mockResolvedValueOnce([[{ total: 1 }], []]);
    const res = await LogModel.getLogs({ page: 0, limit: 0 });
    expect(res.meta).toEqual({ page:1, limit:20, total:1 });
  });

  test('alias list() memanggil getLogs dan mengembalikan hasil yang sama', async () => {
    pool.query
      .mockResolvedValueOnce([[{ id_log: 42 }], []])     // rows
      .mockResolvedValueOnce([[{ total: 1 }], []]);      // count

    const res = await LogModel.list({ page: 3, limit: 2, entitas: 'menu' });

    expect(res).toEqual({
      data: [{ id_log: 42 }],
      meta: { page: 3, limit: 2, total: 1 },
    });

    const lastCallArgs = pool.query.mock.calls[0]; // panggilan SELECT utama
    const values = lastCallArgs[1];                // [...ps, lim, offset]
    expect(values.slice(-2)).toEqual([2, (3 - 1) * 2]); // [limit, offset] = [2, 4]
  });


  test('clearLogs', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await LogModel.clearLogs();
    expect(pool.query).toHaveBeenCalledWith('TRUNCATE TABLE log_aktivitas');
    expect(res).toEqual({ affectedRows: 1 });
  });

  test('alias clear()', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await LogModel.clear();
    expect(res).toEqual({ affectedRows: 1 });
  });

  test('getLogs: page/limit dibatasi minimal 1 saat 0/negatif/non-numeric', async () => {
    pool.query
      .mockResolvedValueOnce([[{ id_log: 1 }], []])
      .mockResolvedValueOnce([[{ total: 1 }], []]);

    // page=0, limit=0 -> fallback page=1, limit=20
    const res = await LogModel.getLogs({ page: 0, limit: 0 });

    expect(res.meta).toEqual({ page: 1, limit: 20, total: 1 });

    // cek argumen LIMIT & OFFSET pada panggilan SELECT utama
    const firstCall = pool.query.mock.calls[0];   // SELECT data
    const values = firstCall[1];                  // [...ps, lim, offset]
    expect(values.slice(-2)).toEqual([20, 0]);     // limit=20, offset=(1-1)*20=0
  });

  test('getLogs: page/limit string numeric dikonversi benar', async () => {
    pool.query
      .mockResolvedValueOnce([[{ id_log: 2 }], []])
      .mockResolvedValueOnce([[{ total: 10 }], []]);

    // page='3', limit='4' -> page=3, limit=4
    const res = await LogModel.getLogs({ page: '3', limit: '4' });

    expect(res.meta).toEqual({ page: 3, limit: 4, total: 10 });

    const firstCall = pool.query.mock.calls[0];
    const values = firstCall[1];
    expect(values.slice(-2)).toEqual([4, 8]);     // limit=4, offset=(3-1)*4=8
  });

  test('getLogs: pakai default page=1 & limit=20 ketika argumen diabaikan', async () => {
    pool.query
      .mockResolvedValueOnce([[{ id_log: 7 }], []])   // data
      .mockResolvedValueOnce([[{ total: 1 }], []]);   // count

    // PANGGIL TANPA ARGUMEN -> trigger default di signature
    const res = await LogModel.getLogs();

    expect(res.meta).toEqual({ page: 1, limit: 20, total: 1 });

    // pastikan LIMIT dan OFFSET sesuai default
    const firstCall = pool.query.mock.calls[0]; // SELECT data
    const values = firstCall[1];                // [...ps, lim, offset]
    expect(values.slice(-2)).toEqual([20, 0]);  // limit=20, offset=0
  });
});
