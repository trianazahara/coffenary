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
const bcrypt = require('bcryptjs');
const { loadEnv } = require('./helpers/env');
loadEnv();

const app = require('../../app');
const Pengguna = require('../../models/penggunaModel');
const { resetDatabase } = require('./helpers/db');

describe('Blackbox API - Admin & User Flows', () => {
  const adminEmail = `admin-flow-${Date.now()}@example.com`;
  const adminPassword = 'Admin#12345';
  const staffEmail = `staff-flow-${Date.now()}@example.com`;
  const staffPassword = 'Staff#12345';
  const userEmail = `user-flow-${Date.now()}@example.com`;
  const userPassword = 'User#12345';

  let adminToken;
  let userToken;
  let userId;
  let cabangId;
  let menuId;
  let pesananId;

  beforeAll(async () => {
    await resetDatabase();

    // Seed admin langsung ke DB
    await Pengguna.create({
      username: 'admin_flow',
      email: adminEmail,
      kata_sandi_hash: await bcrypt.hash(adminPassword, 10),
      nama_lengkap: 'Admin Flow',
      telepon: '0811111111',
      peran: 'admin'
    });

    const loginAdmin = await request(app)
      .post('/api/auth/login')
      .send({ email: adminEmail, password: adminPassword })
      .expect(200);
    adminToken = loginAdmin.body.token;

    // Buat cabang agar menu/pesanan punya referensi
    const cabangRes = await request(app)
      .post('/api/cabang')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nama_cabang: 'Cabang Utama', alamat: 'Jl. Test', telepon: '08123' })
      .expect(201);
    cabangId = cabangRes.body.id_cabang;

    // Admin membuat akun staff
    await request(app)
      .post('/api/pengguna')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nama_lengkap: 'Staff Flow',
        email: staffEmail,
        password: staffPassword,
        telepon: '0812222222',
        peran: 'staff'
      })
      .expect(201);

    // Register + login pelanggan
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'user_flow',
        email: userEmail,
        password: userPassword,
        nama_lengkap: 'User Flow',
        telepon: '0813333333'
      })
      .expect(201);

    const loginUser = await request(app)
      .post('/api/auth/login')
      .send({ email: userEmail, password: userPassword })
      .expect(200);
    userToken = loginUser.body.token;
    userId = loginUser.body.pengguna.id_pengguna;
  });

  afterAll(async () => {});

  test('admin bisa tambah menu di cabang dan menu muncul di daftar', async () => {
    const res = await request(app)
      .post(`/api/menu/${cabangId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .field('nama_menu', 'Kopi Hitam')
      .field('deskripsi_menu', 'Kopi hitam panas')
      .field('kategori', 'minuman')
      .field('harga', '15000')
      .field('is_tersedia', '1')
      .expect(201);

    menuId = res.body.data.id_menu || res.body.data.id;
    expect(menuId).toBeDefined();

    const list = await request(app).get(`/api/menu/${cabangId}`).expect(200);
    expect(list.body.some((m) => Number(m.id_menu) === Number(menuId))).toBe(true);
  });

  test('pelanggan bisa melihat daftar menu', async () => {
    const res = await request(app).get(`/api/menu/${cabangId}`).expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('pelanggan checkout pesanan', async () => {
    const checkout = await request(app)
      .post('/api/pesanan/checkout')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        id_pengguna: userId,
        id_cabang: cabangId,
        tipe_pesanan: 'dine_in',
        items: [
          { id_menu: menuId, jumlah: 2, harga: 15000, catatan: 'Less sugar' }
        ]
      })
      .expect(201);

    pesananId = checkout.body.id_pesanan;
    expect(pesananId).toBeDefined();
    expect(checkout.body.status).toBe('pending');
  });

  test('admin dapat melihat daftar pesanan cabang', async () => {
    const res = await request(app)
      .get(`/api/pesanan/${cabangId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((p) => Number(p.id_pesanan) === Number(pesananId))).toBe(true);
  });

  test('admin dapat mengubah status pesanan', async () => {
    const res = await request(app)
      .put(`/api/pesanan/${pesananId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'selesai' })
      .expect(200);

    expect(res.body.message).toMatch(/Status pesanan berhasil diubah/i);
  });

  test('pelanggan dapat recreate pembayaran dan mendapatkan token snap', async () => {
    const res = await request(app)
      .post(`/api/pesanan/${pesananId}/pay/recreate`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.pembayaran).toBeDefined();
    expect(res.body.pembayaran.snap_token).toBe('snap-mock-token');
  });

  test('pelanggan dapat melihat riwayat pesanan', async () => {
    const res = await request(app)
      .get('/api/pesanan/history')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].items.length).toBeGreaterThan(0);
  });

  test('admin dapat melihat log aktivitas', async () => {
    const res = await request(app)
      .get('/api/logs')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});
