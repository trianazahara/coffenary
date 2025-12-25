const { loadEnv } = require('./helpers/env');
loadEnv();

const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../app');
const Pengguna = require('../../models/penggunaModel');
const pool = require('../../config/db');
const { resetDatabase } = require('./helpers/db');
const { seedUser, login } = require('./helpers/auth');

const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];
const missingEnv = requiredEnv.filter((key) => typeof process.env[key] === 'undefined');
const suite = missingEnv.length ? describe.skip : describe;

const cleanupEmails = [];
const randomEmail = (prefix) =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`;

async function createUser({ email, password, peran = 'pelanggan', nama = 'Blackbox User' }) {
  const kata_sandi_hash = await bcrypt.hash(password, 10);
  const username = `user_${Math.floor(Math.random() * 100000)}`;

  const user = await Pengguna.create({
    username,
    email,
    kata_sandi_hash,
    nama_lengkap: nama,
    telepon: '081234567890',
    peran,
  });
  cleanupEmails.push(email);
  return user;
}

async function cleanupUsers() {
  for (const email of cleanupEmails) {
    try {
      await pool.query('DELETE FROM pengguna WHERE email = ?', [email]);
    } catch (err) {
      // log and continue so teardown never blocks
      // eslint-disable-next-line no-console
      console.warn(`Cleanup pengguna gagal untuk ${email}: ${err.message}`);
    }
  }
}

suite('Blackbox API - Auth & Pengguna', () => {
  const adminEmail = randomEmail('admin.blackbox');
  const adminPassword = 'Admin#12345';
  const pelangganPassword = 'User#12345';
  const staffEmail = randomEmail('staff.blackbox');
  const staffPassword = 'Staff#12345';

  let pelangganEmail;
  let pelangganToken;
  let staffToken;

  beforeAll(async () => {
    await resetDatabase();

    await createUser({
      email: adminEmail,
      password: adminPassword,
      peran: 'admin',
      nama: 'Admin Blackbox',
    });

    await seedUser({
      email: staffEmail,
      password: staffPassword,
      peran: 'staff',
      nama_lengkap: 'Staff Blackbox',
    });

    const staffLogin = await login({ email: staffEmail, password: staffPassword });
    staffToken = staffLogin.token;
  });

  afterAll(async () => {
    await cleanupUsers();
  });

  test('menolak akses tanpa token ke daftar pengguna', async () => {
    await request(app).get('/api/pengguna').expect(401);
  });

  test('registrasi pelanggan berhasil', async () => {
    pelangganEmail = randomEmail('pelanggan.blackbox');

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: `pelanggan_${Math.floor(Math.random() * 100000)}`,
        email: pelangganEmail,
        password: pelangganPassword,
        nama_lengkap: 'Pelanggan Blackbox',
        telepon: '081234567800',
      })
      .expect(201);

    expect(res.body.message).toMatch(/Registrasi berhasil/i);
    expect(res.body.userId).toBeDefined();

    cleanupEmails.push(pelangganEmail);
  });

  test('login pelanggan mengembalikan token JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: pelangganEmail, password: pelangganPassword })
      .expect(200);

    expect(res.body.token).toBeDefined();
    expect(res.body.pengguna).toBeDefined();
    pelangganToken = res.body.token;
  });

  test('pelanggan tidak boleh akses daftar pengguna (403)', async () => {
    const res = await request(app)
      .get('/api/pengguna')
      .set('Authorization', `Bearer ${pelangganToken}`)
      .expect(403);

    expect(res.body.message).toMatch(/Akses ditolak/i);
  });

  test('admin bisa mengambil daftar pengguna', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: adminEmail, password: adminPassword })
      .expect(200);

    const { token } = loginRes.body;
    expect(token).toBeDefined();

    const res = await request(app)
      .get('/api/pengguna')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  test('staff tidak boleh mengambil daftar pengguna (403)', async () => {
    await request(app)
      .get('/api/pengguna')
      .set('Authorization', `Bearer ${staffToken}`)
      .expect(403);
  });
});

if (missingEnv.length) {
  // eslint-disable-next-line no-console
  console.warn(
    `Blackbox auth/pengguna tests diskip karena env belum lengkap: ${missingEnv.join(', ')}`
  );
}
