const { closePool } = require('./helpers/db');
const { loadEnv } = require('./helpers/env');

loadEnv();

describe('Blackbox - pool cleanup', () => {
  afterAll(async () => {
    await closePool();
  });

  test('cleanup', () => {
    expect(true).toBe(true);
  });
});
