const request = require('supertest');
const { loadEnv } = require('./helpers/env');
const { resetDatabase } = require('./helpers/db');
const { seedUser, login } = require('./helpers/auth');
const app = require('../../app');

loadEnv();

describe('Blackbox - Akses Cabang', () => {
  const adminEmail = `admin-cabang-${Date.now()}@example.com`;
  const adminPassword = 'AdminCabang#123';
  const staffEmail = `staff-cabang-${Date.now()}@example.com`;
  const staffPassword = 'StaffCabang#123';
  const userEmail = `user-cabang-${Date.now()}@example.com`;
  const userPassword = 'UserCabang#123';

  let adminToken;
  let staffToken;
  let userToken;

  beforeAll(async () => {
    await resetDatabase();
    await seedUser({ email: adminEmail, password: adminPassword, peran: 'admin', nama_lengkap: 'Admin Cabang' });
    await seedUser({ email: staffEmail, password: staffPassword, peran: 'staff', nama_lengkap: 'Staff Cabang' });
    await seedUser({ email: userEmail, password: userPassword, peran: 'pelanggan', nama_lengkap: 'User Cabang' });

    adminToken = (await login({ email: adminEmail, password: adminPassword })).token;
    staffToken = (await login({ email: staffEmail, password: staffPassword })).token;
    userToken = (await login({ email: userEmail, password: userPassword })).token;
  });

  test('admin dapat membuat cabang', async () => {
    await request(app)
      .post('/api/cabang')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nama_cabang: 'Cabang Admin', alamat: 'Jl. Admin', telepon: '08123' })
      .expect(201);
  });

  test('staff tidak dapat membuat cabang', async () => {
    await request(app)
      .post('/api/cabang')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ nama_cabang: 'Cabang Staff', alamat: 'Jl. Staff', telepon: '08123' })
      .expect(403);
  });

  test('pelanggan tidak boleh membuat cabang (403)', async () => {
    await request(app)
      .post('/api/cabang')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ nama_cabang: 'Cabang User', alamat: 'Jl. User', telepon: '08123' })
      .expect(403);
  });

  test('semua role bisa melihat cabang aktif', async () => {
    await request(app).get('/api/cabang').set('Authorization', `Bearer ${adminToken}`).expect(200);
    await request(app).get('/api/cabang').set('Authorization', `Bearer ${staffToken}`).expect(200);
    await request(app).get('/api/cabang').set('Authorization', `Bearer ${userToken}`).expect(200);
  });

  test('list admin/all hanya admin/staff', async () => {
    await request(app).get('/api/cabang/admin/all').set('Authorization', `Bearer ${adminToken}`).expect(200);
    await request(app).get('/api/cabang/admin/all').set('Authorization', `Bearer ${staffToken}`).expect(200);
    await request(app).get('/api/cabang/admin/all').set('Authorization', `Bearer ${userToken}`).expect(403);
  });
});
