const pool = require('../config/db');

exports.checkout = async (req, res) => {
  const { id_pengguna, id_cabang, tipe_pesanan, id_meja, items, catatan } = req.body;

  if (!id_pengguna || !id_cabang || !tipe_pesanan || !items || items.length === 0) {
    return res.status(400).json({ message: "Data checkout tidak lengkap" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // hitung total
    let total = 0;
    for (const item of items) {
      total += Number(item.harga) * Number(item.jumlah);
    }

    // generate nomor pesanan (unik)
    const nomorPesanan = `ORD-${Date.now()}`;

    // insert pesanan
    const [pesananRes] = await conn.query(
      `INSERT INTO pesanan (nomor_pesanan, id_pengguna, id_cabang, tipe_pesanan, id_meja, status, total_harga, catatan, tanggal_dibuat) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [nomorPesanan, id_pengguna, id_cabang, tipe_pesanan, id_meja || null, 'pending', total, catatan || null]
    );

    const id_pesanan = pesananRes.insertId;

    // insert item
    for (const item of items) {
      await conn.query(
        `INSERT INTO pesanan_item (id_pesanan, id_menu, jumlah, harga_satuan, subtotal, tanggal_dibuat) 
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          id_pesanan,
          item.id_menu,
          item.jumlah,
          item.harga,
          Number(item.harga) * Number(item.jumlah),
        ]
      );
    }

    await conn.commit();

    res.status(201).json({
      message: "Checkout berhasil",
      id_pesanan,
      nomorPesanan,
      total_harga: total,
      status: "pending",
    });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: "Gagal checkout", error: err.message });
  } finally {
    conn.release();
  }
};
