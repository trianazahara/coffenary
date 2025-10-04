// controllers/notificationController.js
const pool = require('../config/db');
const crypto = require('crypto');

const serverKey = process.env.MIDTRANS_SERVER_KEY;

// Midtrans status → status pesanan kita
function mapOrderStatus(txStatus) {
  if (txStatus === 'settlement' || txStatus === 'capture') return 'terkonfirmasi';
  if (['cancel', 'deny', 'expire', 'failure'].includes(txStatus)) return 'dibatalkan';
  if (txStatus === 'pending') return 'pending';
  return 'pending';
}

exports.notificationHandler = async (req, res) => {
  try {
    const body = req.body || {};

    // Wajib pakai field tepat dari Midtrans (string!)
    const order_id = String(body.order_id || '');
    const status_code = String(body.status_code || '');
    const gross_amount = String(body.gross_amount || '');
    const signature_key = String(body.signature_key || '');

    // Verifikasi signature (jika ada—di Sandbox/Production Midtrans selalu kirim)
    const expectedSig = crypto
      .createHash('sha512')
      .update(order_id + status_code + gross_amount + serverKey)
      .digest('hex');

    if (signature_key && signature_key !== expectedSig) {
      console.warn('Invalid signature_key');
      return res.status(403).json({ message: 'Invalid signature' });
    }

    const transaction_status = String(body.transaction_status || 'pending');
    const transaction_time = body.transaction_time ? new Date(body.transaction_time) : new Date();

    // Cari pembayaran berdasarkan referensi (order_id)
    const [rows] = await pool.query(
      'SELECT * FROM pembayaran WHERE referensi_pembayaran = ? LIMIT 1',
      [order_id]
    );
    const pembayaranRow = rows[0];

    // Idempotent: kalau belum ada, insert; kalau sudah ada, update saja
    if (!pembayaranRow) {
      await pool.query(
        `INSERT INTO pembayaran
         (id_pesanan, metode_pembayaran, status_pembayaran, jumlah_bayar, referensi_pembayaran, respon_gateway, tanggal_pembayaran, tanggal_dibuat)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          null,
          'midtrans_snap',
          transaction_status,
          Number(gross_amount) || 0,
          order_id,
          JSON.stringify(body),
          transaction_time,
        ]
      );
    } else {
      await pool.query(
        `UPDATE pembayaran
           SET status_pembayaran = ?, respon_gateway = ?, tanggal_pembayaran = ?
         WHERE id_pembayaran = ?`,
        [transaction_status, JSON.stringify(body), transaction_time, pembayaranRow.id_pembayaran]
      );

      // Update status pesanan kalau kita tahu id_pesanan-nya
      const newOrderStatus = mapOrderStatus(transaction_status);
      if (pembayaranRow.id_pesanan) {
        await pool.query(
          'UPDATE pesanan SET status = ? WHERE id_pesanan = ?',
          [newOrderStatus, pembayaranRow.id_pesanan]
        );
      }
    }

    // Wajib balas 200 agar Midtrans berhenti retry
    return res.status(200).json({ message: 'OK' });
  } catch (err) {
    console.error('notificationHandler err', err);
    return res.status(500).json({ message: 'error', error: err.message });
  }
};
