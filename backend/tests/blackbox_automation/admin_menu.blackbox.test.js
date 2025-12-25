const request = require('supertest');
const { loadEnv } = require('./helpers/env');
const { resetDatabase } = require('./helpers/db');
const { seedUser, login } = require('./helpers/auth');
const app = require('../../app');

loadEnv();

describe('Blackbox - Admin kelola menu', () => {
  const adminEmail = `admin-menu-${Date.now()}@example.com`;
  const adminPassword = 'AdminMenu#123';
  const userEmail = `user-menu-${Date.now()}@example.com`;
  const userPassword = 'UserMenu#123';
  const staffEmail = `staff-menu-${Date.now()}@example.com`;
  const staffPassword = 'StaffMenu#123';
  let adminToken;
  let userToken;
  let staffToken;
  let cabangId;
  let menuId;

  beforeAll(async () => {
    await resetDatabase();
    await seedUser({ email: adminEmail, password: adminPassword, peran: 'admin', nama_lengkap: 'Admin Menu' });
    await seedUser({ email: userEmail, password: userPassword, peran: 'pelanggan', nama_lengkap: 'User Menu' });
    await seedUser({ email: staffEmail, password: staffPassword, peran: 'staff', nama_lengkap: 'Staff Menu' });
    const adminLogin = await login({ email: adminEmail, password: adminPassword });
    adminToken = adminLogin.token;
    const userLogin = await login({ email: userEmail, password: userPassword });
    userToken = userLogin.token;
    const staffLogin = await login({ email: staffEmail, password: staffPassword });
    staffToken = staffLogin.token;

    const cabangRes = await request(app)
      .post('/api/cabang')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nama_cabang: 'Cabang Menu', alamat: 'Jl. Menu', telepon: '08123' })
      .expect(201);
    cabangId = cabangRes.body.id_cabang;
  });

  afterAll(async () => {});

  test('admin dapat menambah menu', async () => {
    const res = await request(app)
      .post(`/api/menu/${cabangId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .field('nama_menu', 'Latte')
      .field('deskripsi_menu', 'Kopi susu')
      .field('kategori', 'minuman')
      .field('harga', '25000')
      .field('is_tersedia', '1')
      .expect(201);

    menuId = res.body.data.id_menu || res.body.data.id;
    expect(menuId).toBeDefined();
  });

  test('gagal menambah menu tanpa token (401)', async () => {
    await request(app)
      .post(`/api/menu/${cabangId}`)
      .field('nama_menu', 'Tanpa Token')
      .field('harga', '10000')
      .expect(401);
  });

  test('token rusak harus ditolak (401)', async () => {
    await request(app)
      .post(`/api/menu/${cabangId}`)
      .set('Authorization', 'Bearer token-rusak')
      .field('nama_menu', 'Rusak')
      .field('harga', '10000')
      .expect(401);
  });

  test('pelanggan tidak boleh menambah menu (403)', async () => {
    await request(app)
      .post(`/api/menu/${cabangId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .field('nama_menu', 'Harus Ditolak')
      .field('harga', '10000')
      .expect(403);
  });

  test('staff boleh menambah menu (200)', async () => {
    await request(app)
      .post(`/api/menu/${cabangId}`)
      .set('Authorization', `Bearer ${staffToken}`)
      .field('nama_menu', 'Menu Staff')
      .field('harga', '12000')
      .field('kategori', 'minuman')
      .field('is_tersedia', '1')
      .expect(201);
  });

  test('ubah menu yang tidak ada mengembalikan 404', async () => {
    await request(app)
      .put(`/api/menu/${cabangId}/99999`)
      .set('Authorization', `Bearer ${adminToken}`)
      .field('nama_menu', 'Tidak Ada')
      .field('harga', '10000')
      .expect(404);
  });

  test('hapus menu yang tidak ada mengembalikan 404', async () => {
    await request(app)
      .delete(`/api/menu/${cabangId}/99999`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });

  test('admin dapat melihat daftar menu cabang', async () => {
    const res = await request(app)
      .get(`/api/menu/${cabangId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(res.body.some((m) => Number(m.id_menu) === Number(menuId))).toBe(true);
  });

  test('admin dapat mengubah menu', async () => {
    await request(app)
      .put(`/api/menu/${cabangId}/${menuId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .field('nama_menu', 'Latte Manis')
      .field('deskripsi_menu', 'Kopi susu manis')
      .field('kategori', 'minuman')
      .field('harga', '26000')
      .field('is_tersedia', '1')
      .expect(200);
  });

  test('admin dapat menghapus menu', async () => {
    await request(app)
      .delete(`/api/menu/${cabangId}/${menuId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });
});
