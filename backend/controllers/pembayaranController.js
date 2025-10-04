// controllers/pembayaranController.js
const pool = require('../config/db');
const snap = require('../config/midtrans');

async function initiatePayment(req, res) {
  try {
    const { id_pesanan, total_harga, customer, items } = req.body;
    if (!id_pesanan || !total_harga || !customer) {
      return res.status(400).json({ message: 'Payload pembayaran tidak lengkap' });
    }

    const order_id = `ORDER-${id_pesanan}-${Date.now()}`;

    const payload = {
      transaction_details: {
        order_id,
        gross_amount: Math.round(Number(total_harga) || 0), // integer rupiah
      },
      item_details: (items || []).map(i => ({
        id: String(i.id_menu ?? i.id ?? 'item'),
        price: Math.round(Number(i.harga) || 0),            // integer
        quantity: Number(i.jumlah ?? i.qty ?? 1),
        name: i.nama ?? i.nama_menu ?? 'Item',
      })),
      customer_details: {
        first_name: customer?.first_name || customer?.nama || 'Pelanggan',
        last_name: customer?.last_name || '',
        email: customer?.email || '',
      },
      credit_card: { secure: true },
    };

    const snapRes = await snap.createTransaction(payload); // { token, redirect_url }

    await pool.query(
      `INSERT INTO pembayaran (id_pesanan, metode_pembayaran, status_pembayaran, jumlah_bayar, referensi_pembayaran, respon_gateway, tanggal_dibuat)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [id_pesanan, 'midtrans_snap', 'pending', Number(total_harga), order_id, JSON.stringify(snapRes)]
    );

    res.json({ message: 'Inisiasi pembayaran sukses', order_id, snap: snapRes });
  } catch (err) {
    console.error('initiatePayment err', err);
    res.status(500).json({ message: 'Gagal inisiasi pembayaran', error: err.message });
  }
}

module.exports = { initiatePayment };
