// controllers/notificationController.js
const pool = require('../config/db');
const crypto = require('crypto');

const serverKey = process.env.MIDTRANS_SERVER_KEY;

async function notificationHandler(req, res) {
  try {
    const body = req.body;

    // ambil field yang biasa datang dari Midtrans
    const order_id = body.order_id || body.orderId || body.order_id;
    const status_code = body.status_code || body.statusCode || String(body.status_code || '');
    const gross_amount = String(body.gross_amount || body.grossAmount || '');
    const signature_key = body.signature_key || body.signatureKey;

    // validasi signature_key (sha512(order_id + status_code + gross_amount + serverKey))
    const expected = crypto.createHash('sha512').update(`${order_id}${status_code}${gross_amount}${serverKey}`).digest('hex');
    if (signature_key && signature_key !== expected) {
      console.warn('Invalid signature_key', signature_key, expected);
      return res.status(403).json({ message: 'Invalid signature' });
    }
    // jika ingin sementara melewati signature check selama development, tidak disarankan di production

    const transactionStatus = body.transaction_status || body.transactionStatus || body.transaction_status;
    const transactionTime = body.transaction_time || body.transactionTime || null;
    const transactionId = body.transaction_id || body.transactionId || null;
    const orderId = order_id;
    const gross = Number(body.gross_amount || body.grossAmount || 0);

    // cari pembayaran berdasarkan referensi_pembayaran (orderId)
    const [rows] = await pool.query('SELECT * FROM pembayaran WHERE referensi_pembayaran = ? LIMIT 1', [orderId]);
    const pembayaranRow = rows[0];

    const timestampNow = new Date();

    // simpan/ update entry pembayaran
    if (!pembayaranRow) {
      // jika belum ada, insert (tidak ideal tapi aman)
      await pool.query(
        `INSERT INTO pembayaran (id_pesanan, metode_pembayaran, status_pembayaran, jumlah_bayar, referensi_pembayaran, respon_gateway, tanggal_pembayaran, tanggal_dibuat)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [null, 'midtrans_snap', transactionStatus, gross, orderId, JSON.stringify(body), transactionTime || timestampNow]
      );
    } else {
      // update respon_gateway + status + tanggal_pembayaran bila perlu
      await pool.query(
        `UPDATE pembayaran
         SET status_pembayaran = ?, respon_gateway = ?, tanggal_pembayaran = ?
         WHERE id_pembayaran = ?`,
        [transactionStatus, JSON.stringify(body), transactionTime || timestampNow, pembayaranRow.id_pembayaran]
      );

      // update pesanan status sesuai transactionStatus (settlement/capture => terkonfirmasi)
      if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
        await pool.query('UPDATE pesanan SET status = ? WHERE id_pesanan = ?', ['terkonfirmasi', pembayaranRow.id_pesanan]);
      } else if (['cancel', 'deny', 'expire', 'failure'].includes(transactionStatus)) {
        await pool.query('UPDATE pesanan SET status = ? WHERE id_pesanan = ?', ['dibatalkan', pembayaranRow.id_pesanan]);
      } // pending/other statuses keep as is
    }

    return res.status(200).json({ message: 'OK' });
  } catch (err) {
    console.error('notificationHandler err', err);
    return res.status(500).json({ message: 'error', error: err.message });
  }
}

module.exports = { notificationHandler };
