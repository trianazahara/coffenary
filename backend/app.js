// backend/app.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware umum
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', true);

// Static files (upload)
app.use('/public', express.static(path.join(__dirname, 'public')));

// Import routes
const authRoutes = require('./routes/authRoutes');
const cabangRoutes = require('./routes/cabangRoutes');
const menuRoutes = require('./routes/menuRoutes');
const pesananRoutes = require('./routes/pesananRoutes');
const penggunaRoutes = require('./routes/penggunaRoutes');
const logRoutes = require('./routes/logRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const pembayaranRoutes = require('./routes/pembayaranRoutes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/cabang', cabangRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/pesanan', pesananRoutes);
app.use('/api/pengguna', penggunaRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/pembayaran', pembayaranRoutes);


app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'internal error' });
});

module.exports = app;
