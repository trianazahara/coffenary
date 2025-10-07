// controllers/pembayaranController.js
const pool = require('../config/db');
const MidtransClient = require('midtrans-client');

const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
const snap = new MidtransClient.Snap({
  isProduction,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
});

/**
 * Inisiasi pembayaran untuk id_pesanan.
 * Body minimal: { id_pesanan, customer: {first_name, last_name, email, phone} }
 * Jika FE sudah hitung total, boleh kirim total_harga & items, kalau tidak kita tarik dari DB.
 */
async function initiatePayment(req, res) {
  try {
    const { id_pesanan, total_harga, customer, items } = req.body;
    if (!id_pesanan) {
      return res.status(400).json({ message: 'id_pesanan wajib' });
    }

    // Ambil pesanan dari DB jika total/items tidak dikirim
    const [[pesanan]] = await pool.query(
      'SELECT id_pesanan, nomor_pesanan, total_harga FROM pesanan WHERE id_pesanan=? LIMIT 1',
      [id_pesanan]
    );
    if (!pesanan) return res.status(404).json({ message: 'Pesanan tidak ditemukan' });

    const grossAmount = Number(total_harga || pesanan.total_harga);

    let item_details = [];
    if (Array.isArray(items) && items.length) {
      item_details = items.map(i => ({
        id: (i.id_menu ?? i.id)?.toString(),
        price: Number(i.harga),
        quantity: Number(i.jumlah || i.qty || 1),
        name: i.nama_menu || i.nama || 'Item'
      }));
    } else {
      // Ambil dari pesanan_item
      const [rows] = await pool.query(
        `SELECT pi.id_menu, m.nama_menu, pi.jumlah, pi.harga_satuan 
         FROM pesanan_item pi JOIN menu m ON m.id_menu=pi.id_menu
         WHERE pi.id_pesanan=?`, [id_pesanan]
      );
      item_details = rows.map(r => ({
        id: r.id_menu.toString(),
        price: Number(r.harga_satuan),
        quantity: Number(r.jumlah),
        name: r.nama_menu
      }));
    }

    const orderId = `ORDER-${id_pesanan}-${Date.now()}`;
    const payload = {
      transaction_details: { order_id: orderId, gross_amount: grossAmount },
      item_details,
      customer_details: {
        first_name: customer?.first_name || 'Pelanggan',
        last_name: customer?.last_name || '',
        email: customer?.email || ''
      },
      credit_card: { secure: true }
    };

    const snapResponse = await snap.createTransaction(payload);
    // snapResponse: { token, redirect_url }

    // Update baris pembayaran (isi sebanyak mungkin kolom biar ngga NULL)
    await pool.query(
      `UPDATE pembayaran
         SET status_pembayaran = ?,
             jumlah_bayar = ?,
             referensi_pembayaran = ?,
             respon_gateway = ?,
             tanggal_pembayaran = NULL
       WHERE id_pesanan = ?
       ORDER BY id_pembayaran DESC
       LIMIT 1`,
      ['pending', grossAmount, orderId, JSON.stringify({ initiate: snapResponse }), id_pesanan]
    );

    // Kolom tambahan (jika ada di skema)
    try {
      await pool.query(
        `UPDATE pembayaran
           SET snap_token = ?, snap_redirect_url = ?, payment_type = ?
         WHERE id_pesanan = ?
         ORDER BY id_pembayaran DESC
         LIMIT 1`,
        [snapResponse.token, snapResponse.redirect_url, 'snap', id_pesanan]
      );
    } catch (e) {
      // abaikan jika kolom tidak ada
    }

    return res.json({
      message: 'Inisiasi pembayaran sukses',
      order_id: orderId,
      snap: snapResponse
    });
  } catch (err) {
    console.error('initiatePayment err', err);
    return res.status(500).json({ message: 'Gagal inisiasi pembayaran', error: err.message });
  }
}

/**
 * Optional: re-initiate (buat link baru jika expire/deny/cancel)
 * API sama dengan initiate, hanya menimpa baris pembayaran terakhir.
 */
async function reinitiatePayment(req, res) {
  return initiatePayment(req, res);
}

module.exports = { initiatePayment, reinitiatePayment };
