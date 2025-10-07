// controllers/notificationController.js
const pool = require('../config/db');
const crypto = require('crypto');

const serverKey = process.env.MIDTRANS_SERVER_KEY;

async function notificationHandler(req, res) {
  try {
    const body = req.body;

    // Ambil nilai kunci
    const order_id = body.order_id || body.orderId;
    const status_code = String(body.status_code ?? '');
    const gross_amount = String(body.gross_amount ?? body.grossAmount ?? '');
    const signature_key = body.signature_key || body.signatureKey;

    // Verifikasi signature (wajib untuk production & sandbox)
    const expected = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest('hex');

    if (signature_key && signature_key !== expected) {
      console.warn('Invalid signature_key');
      return res.status(403).json({ message: 'Invalid signature' });
    }

    // Mapping field penting
    const transactionStatus = body.transaction_status || body.transactionStatus || 'pending';
    const paymentType = body.payment_type || body.paymentType || null;
    const transactionId = body.transaction_id || body.transactionId || null;
    const transactionTime = body.transaction_time || body.transactionTime || null;
    const gross = Number(body.gross_amount || body.grossAmount || 0);

    // Cari pembayaran berdasarkan referensi (order_id)
    const [rows] = await pool.query(
      'SELECT * FROM pembayaran WHERE referensi_pembayaran = ? ORDER BY id_pembayaran DESC LIMIT 1',
      [order_id]
    );
    const pembayaranRow = rows[0];

    // Jika belum ada baris (kasus edge), buat baru agar tidak NULL
    if (!pembayaranRow) {
      await pool.query(
        `INSERT INTO pembayaran 
          (id_pesanan, metode_pembayaran, status_pembayaran, jumlah_bayar, referensi_pembayaran, respon_gateway, tanggal_pembayaran, tanggal_dibuat)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [null, paymentType || 'qris', transactionStatus, gross, order_id, JSON.stringify(body), transactionTime || new Date()]
      );
    } else {
      // Update pembayaran: isi sebanyak mungkin kolom
      await pool.query(
        `UPDATE pembayaran
           SET status_pembayaran = ?,
               jumlah_bayar = ?,
               respon_gateway = ?,
               tanggal_pembayaran = ?
         WHERE id_pembayaran = ?`,
        [transactionStatus, gross || pembayaranRow.jumlah_bayar, JSON.stringify(body), transactionTime || new Date(), pembayaranRow.id_pembayaran]
      );

      // Kolom tambahan (jika ada di skema)
      try {
        await pool.query(
          `UPDATE pembayaran
             SET payment_type = ?, transaction_id = ?
           WHERE id_pembayaran = ?`,
          [paymentType, transactionId, pembayaranRow.id_pembayaran]
        );
      } catch (e) {
        // abaikan jika kolom tidak ada
      }

      // Sinkron status pesanan
      if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
        await pool.query('UPDATE pesanan SET status = ? WHERE id_pesanan = ?', ['terkonfirmasi', pembayaranRow.id_pesanan]);
      } else if (['cancel', 'deny', 'expire', 'failure'].includes(transactionStatus)) {
        await pool.query('UPDATE pesanan SET status = ? WHERE id_pesanan = ?', ['dibatalkan', pembayaranRow.id_pesanan]);
      } else {
        // pending/others: biarkan apa adanya
      }
    }

    return res.status(200).json({ message: 'OK' });
  } catch (err) {
    console.error('notificationHandler err', err);
    return res.status(500).json({ message: 'error', error: err.message });
  }
}

module.exports = { notificationHandler };
