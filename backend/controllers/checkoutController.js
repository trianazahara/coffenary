// controllers/checkoutController.js
const pool = require('../config/db');

const toInt = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : 0;
};

exports.checkout = async (req, res) => {
  const { id_pengguna, id_cabang, tipe_pesanan, id_meja, items, catatan } = req.body;

  if (!id_pengguna || !id_cabang || !tipe_pesanan || !items || items.length === 0) {
    return res.status(400).json({ message: 'Data checkout tidak lengkap' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    let total = 0;
    for (const item of items) {
      total += toInt(item.harga) * toInt(item.jumlah);
    }

    const nomorPesanan = `ORD-${Date.now()}`;

    const [pesananRes] = await conn.query(
      `INSERT INTO pesanan (nomor_pesanan, id_pengguna, id_cabang, tipe_pesanan, id_meja, status, total_harga, catatan, tanggal_dibuat)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [nomorPesanan, id_pengguna, id_cabang, tipe_pesanan, id_meja || null, 'pending', total, catatan || null]
    );

    const id_pesanan = pesananRes.insertId;

    for (const item of items) {
      const qty = toInt(item.jumlah);
      const price = toInt(item.harga);
      await conn.query(
        `INSERT INTO pesanan_item (id_pesanan, id_menu, jumlah, harga_satuan, subtotal, tanggal_dibuat)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [id_pesanan, item.id_menu, qty, price, price * qty]
      );
    }

    await conn.commit();

    res.status(201).json({
      message: 'Checkout berhasil',
      id_pesanan,
      nomorPesanan,
      total_harga: total,
      status: 'pending',
    });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: 'Gagal checkout', error: err.message });
  } finally {
    conn.release();
  }
};
