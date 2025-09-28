// controllers/pembayaranController.js
const pool = require('../config/db');
const MidtransClient = require('midtrans-client');

const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
const snap = new MidtransClient.Snap({
  isProduction,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
});

async function initiatePayment(req, res) {
  try {
    const { id_pesanan, total_harga, customer, items } = req.body;
    if (!id_pesanan || !total_harga || !customer) {
      return res.status(400).json({ message: 'Payload pembayaran tidak lengkap' });
    }

    // buat unique order id untuk midtrans
    const orderId = `ORDER-${id_pesanan}-${Date.now()}`;

    const transaction_details = {
      order_id: orderId,
      gross_amount: Number(total_harga)
    };

    const item_details = (items || []).map(i => ({
      id: i.id_menu?.toString() || `${Math.random()}`,
      price: Number(i.harga),
      quantity: Number(i.jumlah || i.qty || 1),
      name: i.nama || i.nama_menu || 'Item'
    }));

    const customer_details = {
      first_name: customer.first_name || customer.nama || 'Pelanggan',
      last_name: customer.last_name || '',
      email: customer.email || '',
      phone: customer.phone || ''
    };

    const payload = {
      transaction_details,
      item_details,
      customer_details,
      credit_card: { secure: true }
    };

    // panggil Midtrans Snap
    const snapResponse = await snap.createTransaction(payload);
    // snapResponse biasanya berisi { token, redirect_url }

    // simpan record pembayaran awal (pending) ke tabel pembayaran
    await pool.query(
      `INSERT INTO pembayaran (id_pesanan, metode_pembayaran, status_pembayaran, jumlah_bayar, referensi_pembayaran, respon_gateway, tanggal_dibuat)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [id_pesanan, 'midtrans_snap', 'pending', Number(total_harga), orderId, JSON.stringify(snapResponse)]
    );

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

module.exports = { initiatePayment };
