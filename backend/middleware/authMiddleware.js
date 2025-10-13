const jwt = require('jsonwebtoken');
const pool = require('../config/db'); // ⬅️ tambahkan ini

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Ambil data lengkap pengguna dari DB berdasarkan ID
            const [rows] = await pool.query(
                'SELECT id_pengguna, nama_lengkap, peran FROM pengguna WHERE id_pengguna = ?',
                [decoded.id]
            );

            if (rows.length === 0) {
                return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
            }

            req.user = rows[0]; // Sekarang req.user ada nama_lengkap dan peran
            next();
        } catch (error) {
            console.error('Auth error:', error);
            res.status(401).json({ message: 'Tidak terotentikasi, token gagal' });
        }
    } else {
        res.status(401).json({ message: 'Tidak terotentikasi, tidak ada token' });
    }
};

const checkRole = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.peran)) {
        return res.status(403).json({ message: 'Akses ditolak: Anda tidak memiliki peran yang sesuai' });
    }
    next();
};

module.exports = { protect, checkRole };
