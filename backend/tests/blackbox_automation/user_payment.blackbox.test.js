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

describe('Blackbox - User pembayaran', () => {
  const adminEmail = `admin-pay-${Date.now()}@example.com`;
  const adminPassword = 'AdminPay#123';
  const userEmail = `user-pay-${Date.now()}@example.com`;
  const userPassword = 'UserPay#123';

  let userToken;
let cabangId;
let menuId;
let pesananId;
let userId;

  beforeAll(async () => {
    await resetDatabase();
    await seedUser({ email: adminEmail, password: adminPassword, peran: 'admin', nama_lengkap: 'Admin Pay' });
    await seedUser({ email: userEmail, password: userPassword, peran: 'pelanggan', nama_lengkap: 'User Pay' });

    const adminLogin = await login({ email: adminEmail, password: adminPassword });
    const userLogin = await login({ email: userEmail, password: userPassword });
    const adminToken = adminLogin.token;
    userToken = userLogin.token;
    userId = userLogin.user.id_pengguna;

    const cabangRes = await request(app)
      .post('/api/cabang')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nama_cabang: 'Cabang Pay', alamat: 'Jl. Pay', telepon: '08123' })
      .expect(201);
    cabangId = cabangRes.body.id_cabang;

    const menuRes = await request(app)
      .post(`/api/menu/${cabangId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .field('nama_menu', 'Mocha')
      .field('deskripsi_menu', 'Kopi coklat')
      .field('kategori', 'minuman')
      .field('harga', '22000')
      .field('is_tersedia', '1')
      .expect(201);
    menuId = menuRes.body.data.id_menu || menuRes.body.data.id;

    const checkout = await request(app)
      .post('/api/pesanan/checkout')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        id_cabang: cabangId,
        tipe_pesanan: 'dine_in',
        items: [{ id_menu: menuId, jumlah: 1, harga: 22000 }],
        id_pengguna: userId
      })
      .expect(201);
    pesananId = checkout.body.id_pesanan;
  });

  afterAll(async () => {});

  test('pelanggan dapat recreate pembayaran', async () => {
    const res = await request(app)
      .post(`/api/pesanan/${pesananId}/pay/recreate`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.pembayaran.snap_token).toBe('snap-mock-token');
    expect(res.body.pembayaran.status_pembayaran).toBe('pending');
  });

  test('recreate pembayaran kedua kali tetap berhasil (idempotensi)', async () => {
    const res = await request(app)
      .post(`/api/pesanan/${pesananId}/pay/recreate`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.pembayaran.snap_token).toBe('snap-mock-token');
  });

  test('recreate pembayaran tanpa token ditolak (401)', async () => {
    await request(app)
      .post(`/api/pesanan/${pesananId}/pay/recreate`)
      .expect(401);
  });
});
