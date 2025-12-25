const request = require('supertest');
const { loadEnv } = require('./helpers/env');
const { resetDatabase } = require('./helpers/db');
const { seedUser } = require('./helpers/auth');
const app = require('../../app');

loadEnv();

describe('Blackbox - Login', () => {
  const email = `login-${Date.now()}@example.com`;
  const password = 'Login#12345';

  beforeAll(async () => {
    await resetDatabase();
    await seedUser({ email, password, peran: 'pelanggan', nama_lengkap: 'Login User' });
  });

  afterAll(async () => {});

  test('login berhasil mengembalikan token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password })
      .expect(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.pengguna).toBeDefined();
  });

  test('login gagal jika password salah', async () => {
    await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'WrongPass' })
      .expect(401);
  });

  test('login gagal jika payload kosong', async () => {
    await request(app)
      .post('/api/auth/login')
      .send({})
      .expect(401);
  });
});
