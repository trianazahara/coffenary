const request = require('supertest');
const { loadEnv } = require('./helpers/env');
const { resetDatabase } = require('./helpers/db');
const { seedUser, login } = require('./helpers/auth');
const app = require('../../app');

loadEnv();

describe('Blackbox - User melihat menu', () => {
  const adminEmail = `admin-menu-user-${Date.now()}@example.com`;
  const adminPassword = 'AdminMenuUser#123';
  const userEmail = `user-menu-${Date.now()}@example.com`;
  const userPassword = 'UserMenu#123';

  let userToken;
  let cabangId;

  beforeAll(async () => {
    await resetDatabase();
    await seedUser({ email: adminEmail, password: adminPassword, peran: 'admin', nama_lengkap: 'Admin Menu User' });
    await seedUser({ email: userEmail, password: userPassword, peran: 'pelanggan', nama_lengkap: 'User Menu' });

    const adminLogin = await login({ email: adminEmail, password: adminPassword });
    const adminToken = adminLogin.token;
    const userLogin = await login({ email: userEmail, password: userPassword });
    userToken = userLogin.token;

    const cabangRes = await request(app)
      .post('/api/cabang')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nama_cabang: 'Cabang Menu User', alamat: 'Jl. Menu', telepon: '08123' })
      .expect(201);
    cabangId = cabangRes.body.id_cabang;

    await request(app)
      .post(`/api/menu/${cabangId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .field('nama_menu', 'Cappuccino')
      .field('deskripsi_menu', 'Kopi susu')
      .field('kategori', 'minuman')
      .field('harga', '30000')
      .field('is_tersedia', '1')
      .expect(201);
  });

  afterAll(async () => {});

  test('pelanggan dapat melihat daftar menu cabang', async () => {
    const res = await request(app)
      .get(`/api/menu/${cabangId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('tanpa token tetap bisa mengakses (route publik)', async () => {
    const res = await request(app)
      .get(`/api/menu/${cabangId}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
