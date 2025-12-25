jest.mock('midtrans-client', () => ({
  Snap: class {
    createTransaction() {
      return Promise.resolve({
        token: 'snap-mock-token',
        redirect_url: 'https://snap.test/redirect',
        payment_type: 'qris'
      });
    }
  }
}));

const request = require('supertest');
const { loadEnv } = require('./helpers/env');
const { resetDatabase } = require('./helpers/db');
const { seedUser, login } = require('./helpers/auth');
const app = require('../../app');

loadEnv();

describe('Blackbox - Admin pesanan', () => {
  const adminEmail = `admin-pesanan-${Date.now()}@example.com`;
  const adminPassword = 'AdminPesanan#123';
  const userEmail = `user-pesanan-${Date.now()}@example.com`;
  const userPassword = 'UserPesanan#123';
  const pelangganEmail = `pelanggan-pesanan-${Date.now()}@example.com`;
  const pelangganPassword = 'PelPesanan#123';

  let adminToken;
  let userToken;
  let pelangganToken;
  let userId;
  let cabangId;
  let menuId;
  let pesananId;

  beforeAll(async () => {
    await resetDatabase();
    await seedUser({ email: adminEmail, password: adminPassword, peran: 'admin', nama_lengkap: 'Admin Pesanan' });
    await seedUser({ email: userEmail, password: userPassword, peran: 'staff', nama_lengkap: 'User Pesanan' });
    await seedUser({ email: pelangganEmail, password: pelangganPassword, peran: 'pelanggan', nama_lengkap: 'Pelanggan Pesanan' });

    const adminLogin = await login({ email: adminEmail, password: adminPassword });
    adminToken = adminLogin.token;

    const userLogin = await login({ email: userEmail, password: userPassword });
    userToken = userLogin.token;
    userId = userLogin.user.id_pengguna;
    const pelangganLogin = await login({ email: pelangganEmail, password: pelangganPassword });
    pelangganToken = pelangganLogin.token;

    const cabangRes = await request(app)
      .post('/api/cabang')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nama_cabang: 'Cabang Pesanan', alamat: 'Jl. Pesanan', telepon: '08123' })
      .expect(201);
    cabangId = cabangRes.body.id_cabang;

    const menuRes = await request(app)
      .post(`/api/menu/${cabangId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .field('nama_menu', 'Americano')
      .field('deskripsi_menu', 'Kopi hitam')
      .field('kategori', 'minuman')
      .field('harga', '20000')
      .field('is_tersedia', '1')
      .expect(201);
    menuId = menuRes.body.data.id_menu || menuRes.body.data.id;

    const checkout = await request(app)
      .post('/api/pesanan/checkout')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        id_pengguna: userId,
        id_cabang: cabangId,
        tipe_pesanan: 'dine_in',
        items: [{ id_menu: menuId, jumlah: 1, harga: 20000 }]
      })
      .expect(201);
    pesananId = checkout.body.id_pesanan;
  });

  afterAll(async () => {});

  test('admin melihat daftar pesanan cabang', async () => {
    const res = await request(app)
      .get(`/api/pesanan/${cabangId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(res.body.some((p) => Number(p.id_pesanan) === Number(pesananId))).toBe(true);
  });

  test('pelanggan tidak boleh melihat daftar pesanan cabang (403)', async () => {
    await request(app)
      .get(`/api/pesanan/${cabangId}`)
      .set('Authorization', `Bearer ${pelangganToken}`)
      .expect(403);
  });

  test('token rusak saat akses pesanan ditolak (401)', async () => {
    await request(app)
      .get(`/api/pesanan/${cabangId}`)
      .set('Authorization', 'Bearer rusak')
      .expect(401);
  });

  test('admin mengubah status pesanan', async () => {
    const res = await request(app)
      .put(`/api/pesanan/${pesananId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'selesai' })
      .expect(200);
    expect(res.body.message).toMatch(/berhasil diubah/i);
  });

  test('staff juga boleh mengubah status pesanan', async () => {
    const res = await request(app)
      .put(`/api/pesanan/${pesananId}/status`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ status: 'pending' })
      .expect(200);
    expect(res.body.message).toMatch(/berhasil diubah/i);
  });

  test('mengubah status tanpa token ditolak (401)', async () => {
    await request(app)
      .put(`/api/pesanan/${pesananId}/status`)
      .send({ status: 'pending' })
      .expect(401);
  });

  test('mengubah status pesanan yang tidak ada mengembalikan 404', async () => {
    await request(app)
      .put('/api/pesanan/999999/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'selesai' })
      .expect(404);
  });
});
