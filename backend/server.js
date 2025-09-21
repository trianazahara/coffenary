require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Impor Routes
const authRoutes = require('./routes/authRoutes');
const cabangRoutes = require('./routes/cabangRoutes');
const menuRoutes = require('./routes/menuRoutes');
const pesananRoutes = require('./routes/pesananRoutes');
const penggunaRoutes = require('./routes/penggunaRoutes');
const logRoutes = require("./routes/logRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware untuk menyajikan file statis (gambar yang di-upload)
app.use('/public', express.static(path.join(__dirname, 'public')));


// Gunakan Routes
app.use('/api/auth', authRoutes);
app.use('/api/cabang', cabangRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/pesanan', pesananRoutes);
app.use('/api/pengguna', penggunaRoutes);
app.use('/api/logs', logRoutes); 


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));