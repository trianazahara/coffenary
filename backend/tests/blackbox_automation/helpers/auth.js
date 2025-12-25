const bcrypt = require('bcryptjs');
const request = require('supertest');
const Pengguna = require('../../../models/penggunaModel');
const app = require('../../../app');

async function seedUser({ email, password, peran = 'pelanggan', username, nama_lengkap }) {
  const kata_sandi_hash = await bcrypt.hash(password, 10);
  const user = await Pengguna.create({
    username: username || `user_${Math.floor(Math.random() * 100000)}`,
    email,
    kata_sandi_hash,
    nama_lengkap: nama_lengkap || 'Test User',
    telepon: '08123456789',
    peran
  });
  return user;
}

async function login({ email, password }) {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return {
    token: res.body.token,
    user: res.body.pengguna
  };
}

module.exports = { seedUser, login };
