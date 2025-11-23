const { LogController: Log } = require('../../controllers/LogController');

function mkRes() {
  return {
    statusCode: 200,
    body: null,
    status(c) { this.statusCode = c; return this; },
    json(p) { this.body = p; return this; }
  };
}
function mkNext() { return jest.fn(); }

describe('Log Controller (unit, single file)', () => {
  const baseReq = { query: {} };

  test('semua: sukses (model sync)', async () => {
    const LogModel = { getLogs: jest.fn(() => [{ id: 1, msg: 'ok' }]) };
    const ctrl = new Log({ LogModel });

    const res = mkRes(); const next = mkNext();
    await ctrl.semua(baseReq, res, next);

    expect(LogModel.getLogs).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([{ id: 1, msg: 'ok' }]);
    expect(next).not.toHaveBeenCalled();
  });

  test('semua: sukses (model async/promise)', async () => {
    const LogModel = { getLogs: jest.fn().mockResolvedValue([{ id: 2, msg: 'async' }]) };
    const ctrl = new Log({ LogModel });

    const res = mkRes(); const next = mkNext();
    await ctrl.semua(baseReq, res, next);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([{ id: 2, msg: 'async' }]);
    expect(next).not.toHaveBeenCalled();
  });

  test('semua: error → next(err)', async () => {
    const LogModel = { getLogs: jest.fn(() => { throw new Error('boom'); }) };
    const ctrl = new Log({ LogModel });

    const res = mkRes(); const next = mkNext();
    await ctrl.semua(baseReq, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('clear: sukses', async () => {
    const LogModel = { clearLogs: jest.fn().mockResolvedValue({}) };
    const ctrl = new Log({ LogModel });
    const res = mkRes();
    await ctrl.clear({}, res, mkNext());
    expect(LogModel.clearLogs).toHaveBeenCalled();
    expect(res.body).toEqual({ message: 'Semua log dihapus' });
  });

  test('clear: error → next(err)', async () => {
    const LogModel = { clearLogs: jest.fn(() => { throw new Error('fail'); }) };
    const ctrl = new Log({ LogModel });
    const next = mkNext();
    await ctrl.clear({}, mkRes(), next);
    expect(next).toHaveBeenCalled();
  });
});
