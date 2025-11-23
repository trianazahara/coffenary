const { CabangController: Cabang } = require('../../controllers/CabangController');

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

test('getAllCabangAdmin memanggil findAll dengan includeInactive:true', async () => {
  const CabangRepo = { findAll: jest.fn().mockResolvedValue([{ id: 1 }]) };
  const ctrl = new Cabang({ CabangRepo });
  const res = mkRes();

  await ctrl.getAllCabangAdmin({}, res, jest.fn());
  expect(CabangRepo.findAll).toHaveBeenCalledWith({ includeInactive: true });
  expect(res.body).toEqual([{ id: 1 }]);
});

test('getAllCabangAdmin error → next(err)', async () => {
  const CabangRepo = { findAll: jest.fn().mockRejectedValue(new Error('x')) };
  const ctrl = new Cabang({ CabangRepo });
  const next = jest.fn();
  await ctrl.getAllCabangAdmin({}, mkRes(), next);
  expect(next).toHaveBeenCalled();
});

test('createCabang valid + tulis log', async () => {
  const CabangRepo = { create: jest.fn().mockResolvedValue(9) };
  const LogModel = { addLog: jest.fn().mockResolvedValue() };
  const ctrl = new Cabang({ CabangRepo, LogModel });
  const res = mkRes();

  await ctrl.createCabang(
    { body: { nama_cabang: 'Baru', alamat: 'Jalan', telepon: '0812', is_aktif: 1 }, user: { id: 77 }, get: ()=>'UA' },
    res,
    jest.fn()
  );

  expect(CabangRepo.create).toHaveBeenCalledWith({ nama_cabang: 'Baru', alamat: 'Jalan', telepon: '0812', is_aktif: 1 });
  expect(LogModel.addLog).toHaveBeenCalledWith(expect.objectContaining({ entitas: 'cabang', entitas_id: 9 }));
  expect(res.statusCode).toBe(201);
});

test('createCabang log gagal tetap 201', async () => {
  const CabangRepo = { create: jest.fn().mockResolvedValue(11) };
  const LogModel = { addLog: jest.fn().mockRejectedValue(new Error('log fail')) };
  const ctrl = new Cabang({ CabangRepo, LogModel });
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  const res = mkRes();
  await ctrl.createCabang({ body:{ nama_cabang:'FailLog' }, user:{ id:1 }, get:()=>'' }, res, jest.fn());
  expect(res.statusCode).toBe(201);
  warn.mockRestore();
});

test('createCabang tanpa user/log tetap 201', async () => {
  const CabangRepo = { create: jest.fn().mockResolvedValue(10) };
  const ctrl = new Cabang({ CabangRepo });
  const res = mkRes();
  await ctrl.createCabang({ body: { nama_cabang: 'TanpaLog' }, get:()=>'' }, res, jest.fn());
  expect(res.statusCode).toBe(201);
  expect(CabangRepo.create).toHaveBeenCalled();
});

test('createCabang 400 jika nama kosong', async () => {
  const ctrl = new Cabang({ CabangRepo: {}, LogModel: {} });
  const res = mkRes();
  await ctrl.createCabang({ body: {} }, res, jest.fn());
  expect(res.statusCode).toBe(400);
});

test('createCabang error → next(err)', async () => {
  const CabangRepo = { create: jest.fn().mockRejectedValue(new Error('db')) };
  const ctrl = new Cabang({ CabangRepo });
  const next = jest.fn();
  await ctrl.createCabang({ body: { nama_cabang: 'X' } }, mkRes(), next);
  expect(next).toHaveBeenCalled();
});

test('updateCabang sukses + log', async () => {
  const CabangRepo = { update: jest.fn().mockResolvedValue({ affectedRows: 1 }) };
  const LogModel = { addLog: jest.fn().mockResolvedValue() };
  const ctrl = new Cabang({ CabangRepo, LogModel });
  const res = mkRes();

  await ctrl.updateCabang(
    { params: { id_cabang: 3 }, body: { nama_cabang: 'Edit' }, user: { id: 5 }, get:()=>'' },
    res,
    jest.fn()
  );

  expect(CabangRepo.update).toHaveBeenCalledWith(3, { nama_cabang: 'Edit' });
  expect(LogModel.addLog).toHaveBeenCalled();
  expect(res.body).toEqual({ message: 'Cabang berhasil diperbarui' });
});

test('updateCabang log gagal tetap 200', async () => {
  const CabangRepo = { update: jest.fn().mockResolvedValue({ affectedRows: 1 }) };
  const LogModel = { addLog: jest.fn().mockRejectedValue(new Error('log fail')) };
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  const ctrl = new Cabang({ CabangRepo, LogModel });
  const res = mkRes();
  await ctrl.updateCabang({ params:{ id_cabang:5 }, body:{ nama_cabang:'Test' }, user:{ id:1 }, get:()=>'' }, res, jest.fn());
  expect(res.statusCode).toBe(200);
  warn.mockRestore();
});

test('updateCabang tanpa log (tanpa user/LogModel) tetap 200', async () => {
  const CabangRepo = { update: jest.fn().mockResolvedValue({ affectedRows: 1 }) };
  const ctrl = new Cabang({ CabangRepo });
  const res = mkRes();
  await ctrl.updateCabang({ params:{ id_cabang: 4 }, body:{ nama_cabang:'NoLog' }, get:()=>'' }, res, jest.fn());
  expect(res.statusCode).toBe(200);
});

test('updateCabang dengan body undefined (payload fallback {})', async () => {
  const CabangRepo = { update: jest.fn().mockResolvedValue({ affectedRows: 1 }) };
  const ctrl = new Cabang({ CabangRepo });
  const res = mkRes();
  await ctrl.updateCabang({ params:{ id_cabang: 6 }, get:()=>'' }, res, jest.fn());
  expect(res.statusCode).toBe(200);
  expect(CabangRepo.update).toHaveBeenCalledWith(6, {});
});

test('updateCabang 404 jika tidak ada', async () => {
  const CabangRepo = { update: jest.fn().mockResolvedValue({ affectedRows: 0 }) };
  const ctrl = new Cabang({ CabangRepo });
  const res = mkRes();
  await ctrl.updateCabang({ params: { id_cabang: 9 }, body: {} }, res, jest.fn());
  expect(res.statusCode).toBe(404);
});

test('updateCabang error → next(err)', async () => {
  const CabangRepo = { update: jest.fn().mockRejectedValue(new Error('db')) };
  const ctrl = new Cabang({ CabangRepo });
  const next = jest.fn();
  await ctrl.updateCabang({ params: { id_cabang: 1 }, body: {} }, mkRes(), next);
  expect(next).toHaveBeenCalled();
});

test('deleteCabang selalu 405 (dinonaktifkan)', async () => {
  const ctrl = new Cabang({ CabangRepo: {} });
  const res = mkRes();
  await ctrl.deleteCabang({ params: { id_cabang: 1 } }, res, jest.fn());
  expect(res.statusCode).toBe(405);
});

// cover 'req.body || {}' dengan body undefined → jatuh ke {}
test('createCabang: body undefined → 400 dan pakai fallback {}', async () => {
  const { CabangController: Cabang } = require('../../controllers/CabangController');
  const ctrl = new Cabang({ CabangRepo: {} });

  const res = {
    statusCode: 200, body: null,
    status(c){ this.statusCode=c; return this; },
    json(p){ this.body=p; return this; }
  };

  // tidak memberi properti body sama sekali
  await ctrl.createCabang({}, res, jest.fn());

  expect(res.statusCode).toBe(400);
  expect(res.body).toEqual({ message: 'Nama cabang wajib diisi' });
});


// cover default is_aktif = 1 saat field tidak dikirim
test('createCabang: is_aktif default 1 saat tidak dikirim', async () => {
  const { CabangController: Cabang } = require('../../controllers/CabangController');
  const CabangRepo = { create: jest.fn().mockResolvedValue(42) };
  const ctrl = new Cabang({ CabangRepo });

  const res = {
    statusCode: 200, body: null,
    status(c){ this.statusCode=c; return this; },
    json(p){ this.body=p; return this; }
  };

  await ctrl.createCabang({ body: { nama_cabang: 'DefaultAktif' } , get: () => '' }, res, jest.fn());

  // pastikan default is_aktif dipakai
  expect(CabangRepo.create).toHaveBeenCalledWith(
    expect.objectContaining({ nama_cabang: 'DefaultAktif', is_aktif: 1, alamat: null, telepon: null })
  );
  expect(res.statusCode).toBe(201);
  expect(res.body).toEqual({ message: 'Cabang berhasil ditambahkan', id_cabang: 42 });
});

