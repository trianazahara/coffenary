const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded; // Menambahkan info user (id, role) ke request
            next();
        } catch (error) {
            res.status(401).json({ message: 'Tidak terotentikasi, token gagal' });
        }
    }
    if (!token) {
        res.status(401).json({ message: 'Tidak terotentikasi, tidak ada token' });
    }
};

exports.isAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Akses ditolak, bukan admin' });
    }
};