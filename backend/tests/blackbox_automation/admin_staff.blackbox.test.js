const request = require('supertest');
const { loadEnv } = require('./helpers/env');
const { resetDatabase } = require('./helpers/db');
const { seedUser, login } = require('./helpers/auth');
const app = require('../../app');

loadEnv();

describe('Blackbox - Admin kelola akun staff', () => {
  const adminEmail = `admin-staff-${Date.now()}@example.com`;
  const adminPassword = 'AdminStaff#123';
  const staffEmail = `staff-${Date.now()}@example.com`;
  let adminToken;

  beforeAll(async () => {
    await resetDatabase();
    await seedUser({ email: adminEmail, password: adminPassword, peran: 'admin', nama_lengkap: 'Admin Staff' });
    const adminLogin = await login({ email: adminEmail, password: adminPassword });
    adminToken = adminLogin.token;
  });

  afterAll(async () => {});

  test('admin dapat menambah akun staff', async () => {
    const res = await request(app)
      .post('/api/pengguna')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nama_lengkap: 'Staff Baru',
        email: staffEmail,
        password: 'Staff#12345',
        telepon: '0812345678',
        peran: 'staff'
      })
      .expect(201);
    expect(res.body.message).toMatch(/berhasil/i);
  });

  test('tanpa token tidak boleh menambah staff (401)', async () => {
    await request(app)
      .post('/api/pengguna')
      .send({
        nama_lengkap: 'No Token Staff',
        email: `no-token-${Date.now()}@example.com`,
        password: 'Staff#12345',
        telepon: '0812345678',
        peran: 'staff'
      })
      .expect(401);
  });
});
