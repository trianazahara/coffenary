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

const crypto = require('crypto');
const request = require('supertest');
const { loadEnv } = require('./helpers/env');
const { resetDatabase } = require('./helpers/db');
const { seedUser, login } = require('./helpers/auth');
const app = require('../../app');

loadEnv();

describe('Blackbox - Webhook Midtrans Notification', () => {
  const adminEmail = `admin-notif-${Date.now()}@example.com`;
  const adminPassword = 'AdminNotif#123';
  const userEmail = `user-notif-${Date.now()}@example.com`;
  const userPassword = 'UserNotif#123';

  let adminToken;
  let userToken;
  let userId;
  let cabangId;
  let menuId;
  let pesananId;
  let orderId;
  let totalHarga;

  beforeAll(async () => {
    await resetDatabase();
    await seedUser({ email: adminEmail, password: adminPassword, peran: 'admin', nama_lengkap: 'Admin Notif' });
    await seedUser({ email: userEmail, password: userPassword, peran: 'pelanggan', nama_lengkap: 'User Notif' });

    const adminLogin = await login({ email: adminEmail, password: adminPassword });
    adminToken = adminLogin.token;
    const userLogin = await login({ email: userEmail, password: userPassword });
    userToken = userLogin.token;
    userId = userLogin.user.id_pengguna;

    const cabangRes = await request(app)
      .post('/api/cabang')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nama_cabang: 'Cabang Notif', alamat: 'Jl. Notif', telepon: '08123' })
      .expect(201);
    cabangId = cabangRes.body.id_cabang;

    const menuRes = await request(app)
      .post(`/api/menu/${cabangId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .field('nama_menu', 'Latte Notif')
      .field('deskripsi_menu', 'Kopi susu')
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
    // Inisiasi pembayaran untuk mengisi referensi_pembayaran (order_id) di tabel
    const initiate = await request(app)
      .post('/api/pembayaran/initiate')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        id_pesanan: pesananId,
        total_harga: checkout.body.total_harga
      })
      .expect(200);

    orderId = initiate.body.order_id;
    totalHarga = checkout.body.total_harga;
  });

  const sig = ({ order_id, status_code, gross_amount }) =>
    crypto.createHash('sha512').update(`${order_id}${status_code}${gross_amount}${process.env.MIDTRANS_SERVER_KEY}`).digest('hex');

  test('callback dengan signature salah ditolak (403) dan status tetap pending', async () => {
    await request(app)
      .post('/api/pembayaran/notification')
      .send({
        order_id: orderId,
        status_code: '200',
        gross_amount: String(totalHarga),
        signature_key: 'invalid',
        transaction_status: 'settlement',
        payment_type: 'gopay'
      })
      .expect(403);

    const latest = await request(app)
      .get(`/api/pesanan/pembayaran/${pesananId}/latest`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(latest.body.status_pembayaran).toBe('pending');
  });

  test('callback valid mengubah status pembayaran dan pesanan', async () => {
    const payload = {
      order_id: orderId,
      status_code: '200',
      gross_amount: String(totalHarga),
      signature_key: sig({ order_id: orderId, status_code: '200', gross_amount: String(totalHarga) }),
      transaction_status: 'settlement',
      payment_type: 'gopay',
      transaction_id: 'tx-123',
      transaction_time: new Date().toISOString()
    };

    await request(app)
      .post('/api/pembayaran/notification')
      .send(payload)
      .expect(200);

    const latest = await request(app)
      .get(`/api/pesanan/pembayaran/${pesananId}/latest`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(latest.body.status_pembayaran).toBe('settlement');
    expect(latest.body.payment_type).toBe('gopay');

    const detailAdmin = await request(app)
      .get(`/api/pesanan/detail/${pesananId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(detailAdmin.body.status).toBe('terkonfirmasi');
  });

  test('callback sama dikirim dua kali tetap OK dan tidak turun status', async () => {
    const payload = {
      order_id: orderId,
      status_code: '200',
      gross_amount: String(totalHarga),
      signature_key: sig({ order_id: orderId, status_code: '200', gross_amount: String(totalHarga) }),
      transaction_status: 'settlement',
      payment_type: 'gopay',
      transaction_id: 'tx-123',
      transaction_time: new Date().toISOString()
    };

    await request(app).post('/api/pembayaran/notification').send(payload).expect(200);

    const latest = await request(app)
      .get(`/api/pesanan/pembayaran/${pesananId}/latest`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(latest.body.status_pembayaran).toBe('settlement');
  });
});
