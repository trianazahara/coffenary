// backend/models/pembayaranModel.js

const pool = require('../config/db');

class Pembayaran {
    /**
     * Mencatat pembayaran baru.
     * @param {Object} paymentData - Data pembayaran.
     * @returns {Promise<Object>}
     */
    static async create(paymentData) {
        const { id_pemesanan, metode_pembayaran, total_bayar, payment_reference, payment_gateway_response } = paymentData;
        const [result] = await pool.query(
            'INSERT INTO pembayaran (id_pemesanan, metode_pembayaran, total_bayar, payment_reference, payment_gateway_response) VALUES (?, ?, ?, ?, ?)',
            [id_pemesanan, metode_pembayaran, total_bayar, payment_reference, JSON.stringify(payment_gateway_response)]
        );
        return { id: result.insertId };
    }

    /**
     * Mengupdate status pembayaran berdasarkan ID Pemesanan,
     * misalnya setelah menerima notifikasi dari payment gateway.
     * @param {number} orderId - ID Pemesanan.
     * @param {string} status - Status baru ('success', 'failed').
     * @param {Object} gatewayResponse - Respons dari payment gateway.
     * @returns {Promise<Object>}
     */
    static async updateStatusByOrderId(orderId, status, gatewayResponse) {
        const [result] = await pool.query(
            'UPDATE pembayaran SET status_pembayaran = ?, payment_gateway_response = ?, tanggal_pembayaran = NOW() WHERE id_pemesanan = ?',
            [status, JSON.stringify(gatewayResponse), orderId]
        );
        return result;
    }
}

module.exports = Pembayaran;