const { Cabang } = require('../../controllers/Cabang');

function mkRes() {
  return {
    statusCode: 200,
    body: null,
    status(c){ this.statusCode = c; return this; },
    json(p){ this.body = p; return this; }
  };
}

test('getAllCabang mengembalikan data list cabang', async () => {
  const CabangRepo = { findAll: jest.fn().mockResolvedValue([
    { id: 1, nama: 'Cabang A' },
    { id: 2, nama: 'Cabang B' }
  ])};
  const ctrl = new Cabang({ CabangRepo });

  const req = {};
  const res = mkRes();
  const next = jest.fn();

  await ctrl.getAllCabang(req, res, next);

  expect(CabangRepo.findAll).toHaveBeenCalled();
  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual([
    { id: 1, nama: 'Cabang A' },
    { id: 2, nama: 'Cabang B' }
  ]);
  expect(next).not.toHaveBeenCalled();
});

test('getAllCabang meneruskan error ke next(err)', async () => {
  const CabangRepo = { findAll: jest.fn().mockRejectedValue(new Error('db down')) };
  const ctrl = new Cabang({ CabangRepo });

  const req = {};
  const res = mkRes();
  const next = jest.fn();

  await ctrl.getAllCabang(req, res, next);

  expect(next).toHaveBeenCalled(); // error path ter-cover
});
