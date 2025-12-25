const request = require('supertest');
const { loadEnv } = require('./helpers/env');
const { resetDatabase } = require('./helpers/db');
const { seedUser, login } = require('./helpers/auth');
const app = require('../../app');

loadEnv();

describe('Blackbox - User checkout/pemesanan', () => {
  const adminEmail = `admin-checkout-${Date.now()}@example.com`;
  const adminPassword = 'AdminCheckout#123';
  const userEmail = `user-checkout-${Date.now()}@example.com`;
  const userPassword = 'UserCheckout#123';

let userToken;
let cabangId;
let menuId;
let userId;

  beforeAll(async () => {
    await resetDatabase();
    await seedUser({ email: adminEmail, password: adminPassword, peran: 'admin', nama_lengkap: 'Admin Checkout' });
    await seedUser({ email: userEmail, password: userPassword, peran: 'pelanggan', nama_lengkap: 'User Checkout' });

    const adminLogin = await login({ email: adminEmail, password: adminPassword });
    const userLogin = await login({ email: userEmail, password: userPassword });
    userToken = userLogin.token;
    userId = userLogin.user.id_pengguna;
    const adminToken = adminLogin.token;

    const cabangRes = await request(app)
      .post('/api/cabang')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nama_cabang: 'Cabang Checkout', alamat: 'Jl. Checkout', telepon: '08123' })
      .expect(201);
    cabangId = cabangRes.body.id_cabang;

    const menuRes = await request(app)
      .post(`/api/menu/${cabangId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .field('nama_menu', 'Espresso')
      .field('deskripsi_menu', 'Single shot')
      .field('kategori', 'minuman')
      .field('harga', '18000')
      .field('is_tersedia', '1')
      .expect(201);
    menuId = menuRes.body.data.id_menu || menuRes.body.data.id;
  });

  afterAll(async () => {});

  test('pelanggan dapat checkout', async () => {
    const res = await request(app)
      .post('/api/pesanan/checkout')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        id_pengguna: userId,
        id_cabang: cabangId,
        tipe_pesanan: 'take_away',
        items: [{ id_menu: menuId, jumlah: 2, harga: 18000 }]
      })
      .expect(201);
    expect(res.body.id_pesanan).toBeDefined();
    expect(res.body.status).toBe('pending');
  });

  test('checkout gagal tanpa token (401)', async () => {
    await request(app)
      .post('/api/pesanan/checkout')
      .send({
        id_cabang: cabangId,
        tipe_pesanan: 'take_away',
        items: [{ id_menu: menuId, jumlah: 1, harga: 18000 }]
      })
      .expect(401);
  });

  test('checkout gagal jika payload tidak lengkap (400)', async () => {
    await request(app)
      .post('/api/pesanan/checkout')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        id_cabang: cabangId,
        items: []
      })
      .expect(400);
  });
});
