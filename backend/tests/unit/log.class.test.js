const { Log } = require('../../controllers/Log');

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
  test('semua: sukses (model sync)', async () => {
    const LogModel = { getLogs: jest.fn(() => [{ id: 1, msg: 'ok' }]) };
    const ctrl = new Log({ LogModel });

    const res = mkRes(); const next = mkNext();
    await ctrl.semua({}, res, next);

    expect(LogModel.getLogs).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([{ id: 1, msg: 'ok' }]);
    expect(next).not.toHaveBeenCalled();
  });

  test('semua: sukses (model async/promise)', async () => {
    const LogModel = { getLogs: jest.fn().mockResolvedValue([{ id: 2, msg: 'async' }]) };
    const ctrl = new Log({ LogModel });

    const res = mkRes(); const next = mkNext();
    await ctrl.semua({}, res, next);

    expect(res.body).toEqual([{ id: 2, msg: 'async' }]);
    expect(next).not.toHaveBeenCalled();
  });

  test('semua: error → next(err)', async () => {
    const LogModel = { getLogs: jest.fn(() => { throw new Error('boom'); }) };
    const ctrl = new Log({ LogModel });

    const res = mkRes(); const next = mkNext();
    await ctrl.semua({}, res, next);

    expect(next).toHaveBeenCalled();
  });
});
