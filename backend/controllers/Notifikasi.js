// controllers/Notifikasi.js
class Notifikasi {
  constructor({ pool, serverKey, crypto }) {
    this.pool = pool;
    this.serverKey = serverKey;
    this.crypto = crypto;

    this.handle = this.handle.bind(this);
  }

  #computeSig({ order_id, status_code, gross_amount }) {
    return this.crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${this.serverKey}`)
      .digest('hex');
  }

  async handle(req, res, next) {
    try {
      const body = req.body || {};

      // normalisasi field
      const order_id = body.order_id || body.orderId;
      const status_code = String(body.status_code ?? '');
      const gross_amount = String(body.gross_amount ?? body.grossAmount ?? '');
      const signature_key = body.signature_key || body.signatureKey;

      // verifikasi signature (jika dikirim)
      if (signature_key) {
        const expected = this.#computeSig({ order_id, status_code, gross_amount });
        if (signature_key !== expected) {
          return res.status(403).json({ message: 'Invalid signature' });
        }
      }

      const transactionStatus = body.transaction_status || body.transactionStatus || 'pending';
      const paymentType = body.payment_type || body.paymentType || null;
      const transactionId = body.transaction_id || body.transactionId || null;
      const transactionTime = body.transaction_time || body.transactionTime || null;
      const gross = Number(body.gross_amount || body.grossAmount || 0);

      // cari pembayaran terakhir by referensi (order_id)
      const [rows] = await this.pool.query(
        'SELECT * FROM pembayaran WHERE referensi_pembayaran = ? ORDER BY id_pembayaran DESC LIMIT 1',
        [order_id]
      );
      const pembayaranRow = rows?.[0];

      if (!pembayaranRow) {
        // edge: belum ada baris, sisipkan minimal
        await this.pool.query(
          `INSERT INTO pembayaran 
            (id_pesanan, metode_pembayaran, status_pembayaran, jumlah_bayar, referensi_pembayaran, respon_gateway, tanggal_pembayaran, tanggal_dibuat)
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
          [null, paymentType || 'qris', transactionStatus, gross, order_id, JSON.stringify(body), transactionTime || new Date()]
        );
      } else {
        // update pembayaran
        await this.pool.query(
          `UPDATE pembayaran
             SET status_pembayaran = ?,
                 jumlah_bayar = ?,
                 respon_gateway = ?,
                 tanggal_pembayaran = ?
           WHERE id_pembayaran = ?`,
          [transactionStatus, gross || pembayaranRow.jumlah_bayar, JSON.stringify(body), transactionTime || new Date(), pembayaranRow.id_pembayaran]
        );

        // kolom tambahan opsional
        try {
          await this.pool.query(
            `UPDATE pembayaran
               SET payment_type = ?, transaction_id = ?
             WHERE id_pembayaran = ?`,
            [paymentType, transactionId, pembayaranRow.id_pembayaran]
          );
        } catch (_) {}

        // sinkron status pesanan
        if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
          await this.pool.query('UPDATE pesanan SET status = ? WHERE id_pesanan = ?', ['terkonfirmasi', pembayaranRow.id_pesanan]);
        } else if (['cancel', 'deny', 'expire', 'failure'].includes(transactionStatus)) {
          await this.pool.query('UPDATE pesanan SET status = ? WHERE id_pesanan = ?', ['dibatalkan', pembayaranRow.id_pesanan]);
        }
      }

      return res.status(200).json({ message: 'OK' });
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = { Notifikasi };
