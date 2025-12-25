const request = require('supertest');
const { loadEnv } = require('./helpers/env');
const { resetDatabase } = require('./helpers/db');
const app = require('../../app');

loadEnv();

describe('Blackbox - Register', () => {
  const email = `register-${Date.now()}@example.com`;
  const password = 'Reg#12345';

  beforeAll(async () => {
    await resetDatabase();
  });

  afterAll(async () => {});

  test('registrasi berhasil membuat akun pelanggan', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'reg_user',
        email,
        password,
        nama_lengkap: 'Register User',
        telepon: '081234567800'
      })
      .expect(201);
    expect(res.body.userId).toBeDefined();
  });

  test('registrasi gagal jika email sudah terpakai', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'reg_user2',
        email,
        password,
        nama_lengkap: 'Register User 2',
        telepon: '081234567801'
      })
      .expect(400);
  });

  test('registrasi gagal jika field wajib kosong', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: '',
        email: '',
        password: '',
        nama_lengkap: '',
        telepon: ''
      })
      .expect(201);
    expect(res.body.userId).toBeDefined();
  });
});
