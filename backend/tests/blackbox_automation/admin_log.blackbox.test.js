const request = require('supertest');
const { loadEnv } = require('./helpers/env');
const { resetDatabase } = require('./helpers/db');
const { seedUser, login } = require('./helpers/auth');
const app = require('../../app');

loadEnv();

describe('Blackbox - Admin log aktivitas', () => {
  const adminEmail = `admin-log-${Date.now()}@example.com`;
  const adminPassword = 'AdminLog#123';
  const staffEmail = `staff-log-${Date.now()}@example.com`;
  const staffPassword = 'StaffLog#123';
  let adminToken;
  let staffToken;

  beforeAll(async () => {
    await resetDatabase();
    await seedUser({ email: adminEmail, password: adminPassword, peran: 'admin', nama_lengkap: 'Admin Log' });
    await seedUser({ email: staffEmail, password: staffPassword, peran: 'staff', nama_lengkap: 'Staff Log' });
    const adminLogin = await login({ email: adminEmail, password: adminPassword });
    adminToken = adminLogin.token;
    const staffLogin = await login({ email: staffEmail, password: staffPassword });
    staffToken = staffLogin.token;

    // Lakukan aksi yang memicu log: tambah cabang
    await request(app)
      .post('/api/cabang')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nama_cabang: 'Cabang Log', alamat: 'Jl. Log', telepon: '08123' })
      .expect(201);
  });

  afterAll(async () => {});

  test('admin dapat melihat log aktivitas', async () => {
    const res = await request(app)
      .get('/api/logs')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('akses log tanpa token ditolak (401)', async () => {
    await request(app)
      .get('/api/logs')
      .expect(401);
  });

  test('staff tidak boleh akses log (403)', async () => {
    await request(app)
      .get('/api/logs')
      .set('Authorization', `Bearer ${staffToken}`)
      .expect(403);
  });
});
