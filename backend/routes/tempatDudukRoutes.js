const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/:id_cabang", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id_meja, nomor_meja, kapasitas FROM tempat_duduk WHERE id_cabang = ? ORDER BY nomor_meja ASC",
      [req.params.id_cabang]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil data meja" });
  }
});

module.exports = router;
