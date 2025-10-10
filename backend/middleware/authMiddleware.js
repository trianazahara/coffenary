const jwt = require('jsonwebtoken');
const Pengguna = require("../models/Pengguna"); // pastikan path sesuai

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Ambil user berdasarkan ID dari token
      const pengguna = await Pengguna.findByPk(decoded.id);
      if (!pengguna) {
        return res.status(404).json({ message: "Pengguna tidak ditemukan" });
      }

      // Simpan data user lengkap ke request
      req.user = pengguna;
      next();
    } catch (error) {
      console.error("❌ Token tidak valid:", error);
      res.status(401).json({ message: "Tidak terotentikasi, token gagal" });
    }
  } else {
    res.status(401).json({ message: "Tidak terotentikasi, tidak ada token" });
  }
};


module.exports = { protect, checkRole };