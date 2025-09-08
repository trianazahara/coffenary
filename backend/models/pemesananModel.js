// backend/models/pemesananModel.js

const pool = require('../config/db');

class Pemesanan {
    /**
     * Membuat pesanan baru beserta detailnya menggunakan transaksi.
     * Ini memastikan bahwa jika salah satu query gagal, semua perubahan akan dibatalkan.
     * @param {Object} orderData - Data utama pesanan (id_pelanggan, total_harga, dll.).
     * @param {Array<Object>} items - Array item yang dipesan.
     * @returns {Promise<Object>}
     */
    static async create(orderData, items) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Masukkan data ke tabel 'pemesanan'
            const { nomor_pesanan, id_pelanggan, tipe_pesanan, total_harga, catatan, nomor_meja } = orderData;
            const [orderResult] = await connection.query(
                'INSERT INTO pemesanan (nomor_pesanan, id_pelanggan, tipe_pesanan, total_harga, catatan, nomor_meja) VALUES (?, ?, ?, ?, ?, ?)',
                [nomor_pesanan, id_pelanggan, tipe_pesanan, total_harga, catatan, nomor_meja]
            );
            const orderId = orderResult.insertId;

            // 2. Masukkan setiap item ke tabel 'detail_pemesanan'
            const itemPromises = items.map(item => {
                const { id_menu, quantity, harga_satuan, subtotal } = item;
                return connection.query(
                    'INSERT INTO detail_pemesanan (id_pemesanan, id_menu, quantity, harga_satuan, subtotal) VALUES (?, ?, ?, ?, ?)',
                    [orderId, id_menu, quantity, harga_satuan, subtotal]
                );
            });
            await Promise.all(itemPromises);

            // 3. Jika semua berhasil, commit transaksi
            await connection.commit();
            return { id: orderId, ...orderData };

        } catch (error) {
            // 4. Jika ada error, rollback semua perubahan
            await connection.rollback();
            throw error; // Lemparkan error agar bisa ditangani di controller
        } finally {
            // 5. Selalu lepaskan koneksi
            connection.release();
        }
    }

    /**
     * Mengambil data statistik untuk dashboard.
     * @returns {Promise<Object>}
     */
    static async getDashboardStats() {
        const [ordersTodayResult] = await pool.query(
            "SELECT COUNT(*) as totalOrders FROM pemesanan WHERE DATE(created_at) = CURDATE()"
        );

        const [revenueTodayResult] = await pool.query(
            "SELECT SUM(total_harga) as totalRevenue FROM pemesanan WHERE DATE(created_at) = CURDATE() AND status = 'completed'"
        );
        
        const [topMenuResult] = await pool.query(`
            SELECT m.nama_menu, SUM(dp.quantity) as totalQuantity
            FROM detail_pemesanan dp
            JOIN menu m ON dp.id_menu = m.id_menu
            GROUP BY m.nama_menu
            ORDER BY totalQuantity DESC
            LIMIT 1
        `);

        return {
            totalOrders: ordersTodayResult[0].totalOrders || 0,
            totalRevenue: parseFloat(revenueTodayResult[0].totalRevenue) || 0,
            topMenu: topMenuResult.length > 0 ? topMenuResult[0].nama_menu : 'Belum ada'
        };
    }


    /**
     * Mengambil semua pesanan untuk ditampilkan di dashboard admin.
     * @returns {Promise<Array>}
     */
    static async findAllForAdmin() {
        const [rows] = await pool.query(`
            SELECT p.*, pl.nama as nama_pelanggan 
            FROM pemesanan p
            JOIN pelanggan pl ON p.id_pelanggan = pl.id_pelanggan
            ORDER BY p.created_at DESC
        `);
        return rows;
    }

    /**
     * Mengupdate status sebuah pesanan.
     * @param {number} id - ID pemesanan.
     * @param {string} status - Status baru.
     * @returns {Promise<Object>}
     */
    static async updateStatus(id, status) {
        const [result] = await pool.query(
            'UPDATE pemesanan SET status = ? WHERE id_pemesanan = ?',
            [status, id]
        );
        return result;
    }
}



module.exports = Pemesanan;