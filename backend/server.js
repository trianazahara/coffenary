const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
// const orderRoutes = require('./routes/orderRoutes'); // Nanti dibuat

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Untuk parsing body JSON

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
// app.use('/api/orders', orderRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));