const express = require("express");
const pool = require("../config/db");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id_pengguna, nama_lengkap, email, tanggal_dibuat FROM pengguna WHERE peran = 'pelanggan' ORDER BY tanggal_dibuat DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error("❌ Error mengambil data pelanggan:", error);
    res.status(500).json({ message: "Gagal mengambil data pelanggan" });
  }
});

module.exports = router;
