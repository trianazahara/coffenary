const request = require('supertest');
const { loadEnv } = require('./helpers/env');
const { resetDatabase } = require('./helpers/db');
const { seedUser, login } = require('./helpers/auth');
const app = require('../../app');

loadEnv();

describe('Blackbox - User riwayat pesanan', () => {
  const adminEmail = `admin-history-${Date.now()}@example.com`;
  const adminPassword = 'AdminHistory#123';
  const userEmail = `user-history-${Date.now()}@example.com`;
const userPassword = 'UserHistory#123';
const noOrderEmail = `no-order-${Date.now()}@example.com`;
const noOrderPassword = 'NoOrder#123';

let userToken;
let cabangId;
let menuId;
let userId;
let noOrderToken;

  beforeAll(async () => {
    await resetDatabase();
    await seedUser({ email: adminEmail, password: adminPassword, peran: 'admin', nama_lengkap: 'Admin History' });
    await seedUser({ email: userEmail, password: userPassword, peran: 'pelanggan', nama_lengkap: 'User History' });
    await seedUser({ email: noOrderEmail, password: noOrderPassword, peran: 'pelanggan', nama_lengkap: 'No Order' });

    const adminLogin = await login({ email: adminEmail, password: adminPassword });
    const userLogin = await login({ email: userEmail, password: userPassword });
    const noOrderLogin = await login({ email: noOrderEmail, password: noOrderPassword });
    const adminToken = adminLogin.token;
    userToken = userLogin.token;
    userId = userLogin.user.id_pengguna;
    noOrderToken = noOrderLogin.token;

    const cabangRes = await request(app)
      .post('/api/cabang')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nama_cabang: 'Cabang History', alamat: 'Jl. History', telepon: '08123' })
      .expect(201);
    cabangId = cabangRes.body.id_cabang;

    const menuRes = await request(app)
      .post(`/api/menu/${cabangId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .field('nama_menu', 'Flat White')
      .field('deskripsi_menu', 'Kopi susu halus')
      .field('kategori', 'minuman')
      .field('harga', '24000')
      .field('is_tersedia', '1')
      .expect(201);
    menuId = menuRes.body.data.id_menu || menuRes.body.data.id;

    await request(app)
      .post('/api/pesanan/checkout')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        id_cabang: cabangId,
        tipe_pesanan: 'take_away',
        items: [{ id_menu: menuId, jumlah: 1, harga: 24000 }],
        id_pengguna: userId
      })
      .expect(201);
  });

  afterAll(async () => {});

  test('pelanggan dapat melihat riwayat pesanan dengan item', async () => {
    const res = await request(app)
      .get('/api/pesanan/history')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].items.length).toBeGreaterThan(0);
  });

  test('riwayat tanpa token ditolak (401)', async () => {
    await request(app)
      .get('/api/pesanan/history')
      .expect(401);
  });

  test('riwayat kosong mengembalikan array kosong', async () => {
    const res = await request(app)
      .get('/api/pesanan/history')
      .set('Authorization', `Bearer ${noOrderToken}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });
});
