const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { protect, checkRole } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/tempatDudukController');

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

router.get('/cabang/:id_cabang', protect, checkRole(['admin', 'staff']), ctrl.listByCabang);
router.post('/:id_cabang', protect, checkRole(['admin', 'staff']), ctrl.create);
router.put('/:id_meja', protect, checkRole(['admin', 'staff']), ctrl.update);
router.delete('/:id_meja', protect, checkRole(['admin', 'staff']), ctrl.remove);

module.exports = router;
