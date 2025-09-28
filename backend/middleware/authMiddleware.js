const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Sekarang decoded bawa { id, peran, nama_lengkap }
            req.user = {
                id: decoded.id,
                peran: decoded.peran,
                nama_lengkap: decoded.nama_lengkap || "Pengguna"
            };

            return next();
        } catch (error) {
            return res.status(401).json({ message: 'Tidak terotentikasi, token gagal' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Tidak terotentikasi, tidak ada token' });
    }
};

const checkRole = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.peran)) {
        return res.status(403).json({ message: 'Akses ditolak: Anda tidak memiliki peran yang sesuai' });
    }
    next();
};

// 🔥 Tambahan helper biar gampang ambil info user di controller
const getUserInfo = (req) => {
    if (!req.user) return { id: null, peran: null, nama_lengkap: "Tidak dikenal" };
    return req.user;
};

module.exports = { protect, checkRole, getUserInfo };
