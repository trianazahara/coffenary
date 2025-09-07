const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Registrasi Pelanggan
exports.registerPelanggan = async (req, res) => {
  const { username, password, nama, email, no_telp } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO pelanggan (username, password, nama, email, no_telp) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, nama, email, no_telp]
    );
    res.status(201).json({ message: 'Registrasi berhasil!', userId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Error server', error: error.message });
  }
};

// Login Pelanggan
exports.loginPelanggan = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM pelanggan WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const token = jwt.sign(
      { id: user.id_pelanggan, role: 'pelanggan' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, user: { id: user.id_pelanggan, nama: user.nama, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Error server', error: error.message });
  }
};

// Login Admin
exports.loginAdmin = async (req, res) => {
    // Logikanya SAMA PERSIS dengan loginPelanggan, tapi query ke tabel `admin`
    const { email, password } = req.body;
    try {
        const [rows] = await pool.query('SELECT * FROM admin WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(401).json({ message: 'Email atau password salah' });
        
        const admin = rows[0];
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(401).json({ message: 'Email atau password salah' });

        const token = jwt.sign(
            { id: admin.id_admin, role: admin.role }, // role bisa 'admin', 'super_admin'
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({ token, admin: { id: admin.id_admin, nama: admin.nama, role: admin.role } });
    } catch (error) {
        res.status(500).json({ message: 'Error server', error: error.message });
    }
};