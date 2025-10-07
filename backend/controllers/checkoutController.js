// controllers/checkoutController.js
const pool = require('../config/db');

exports.checkout = async (req, res) => {
  const { id_pengguna, id_cabang, tipe_pesanan, id_meja, items, catatan } = req.body;

  if (!id_pengguna || !id_cabang || !tipe_pesanan || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Data checkout tidak lengkap" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Hitung subtotal (bulatkan ke integer Rupiah)
    let subtotal = 0;
    for (const it of items) {
      const harga = Number(it.harga) || 0;
      const qty = Number(it.jumlah || it.qty) || 0;
      subtotal += harga * qty;
    }
    
    const total = subtotal;

    const nomorPesanan = `ORD-${Date.now()}`;

    // Insert pesanan
    const [pesananRes] = await conn.query(
      `INSERT INTO pesanan 
        (nomor_pesanan, id_pengguna, id_cabang, tipe_pesanan, id_meja, status, total_harga, catatan, tanggal_dibuat) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [nomorPesanan, id_pengguna, id_cabang, tipe_pesanan, id_meja || null, 'pending', total, catatan || null]
    );
    const id_pesanan = pesananRes.insertId;

    // Insert item
    for (const it of items) {
      const harga = Number(it.harga) || 0;
      const qty = Number(it.jumlah || it.qty) || 0;
      await conn.query(
        `INSERT INTO pesanan_item 
          (id_pesanan, id_menu, jumlah, harga_satuan, subtotal, tanggal_dibuat) 
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [id_pesanan, it.id_menu, qty, harga, harga * qty]
      );
    }

    // Buat stub pembayaran (agar tabel pembayaran tidak kosong)
    // - metode_pembayaran: default 'qris' (atau ganti ke 'midtrans_snap' jika enum kamu sudah ada)
    // - referensi_pembayaran: sementara pakai nomorPesanan (akan di-replace dengan order_id Midtrans saat initiate)
    await conn.query(
      `INSERT INTO pembayaran
        (id_pesanan, metode_pembayaran, status_pembayaran, jumlah_bayar, order_id, respon_gateway, tanggal_pembayaran, tanggal_dibuat)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [id_pesanan, 'qris', 'pending', total, nomorPesanan, JSON.stringify({ stage: 'stub' }), null]
    );

    await conn.commit();

    return res.status(201).json({
      message: "Checkout berhasil",
      id_pesanan,
      nomorPesanan,
      subtotal,
      total_harga: total,
      status: "pending",
    });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return res.status(500).json({ message: "Gagal checkout", error: err.message });
  } finally {
    conn.release();
  }
};
