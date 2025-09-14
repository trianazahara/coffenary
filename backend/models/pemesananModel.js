const pool = require('../config/db');

class Pemesanan {
    static async findAllByCabang(id_cabang) {
        const [rows] = await pool.query(`
            SELECT p.*, pg.nama_lengkap as nama_pelanggan 
            FROM pesanan p
            JOIN pengguna pg ON p.id_pengguna = pg.id_pengguna
            WHERE p.id_cabang = ? 
            ORDER BY p.tanggal_dibuat DESC
        `, [id_cabang]);
        return rows;
    }

    static async updateStatus(id_pesanan, status) {
        const [result] = await pool.query(
            'UPDATE pesanan SET status = ? WHERE id_pesanan = ?',
            [status, id_pesanan]
        );
        return result;
    }

     static async getDashboardStats(id_cabang) {
        // --- Statistik Harian (Sudah Ada) ---
        const [ordersTodayResult] = await pool.query(
            "SELECT COUNT(*) as totalOrders FROM pesanan WHERE DATE(tanggal_dibuat) = CURDATE() AND id_cabang = ?",
            [id_cabang]
        );

        const [revenueTodayResult] = await pool.query(
            "SELECT SUM(total_harga) as totalRevenue FROM pesanan WHERE DATE(tanggal_dibuat) = CURDATE() AND status = 'selesai' AND id_cabang = ?",
            [id_cabang]
        );
        
        const [topMenuResult] = await pool.query(`
            SELECT m.nama_menu, SUM(pi.jumlah) as totalQuantity
            FROM pesanan_item pi
            JOIN menu m ON pi.id_menu = m.id_menu
            JOIN pesanan p ON pi.id_pesanan = p.id_pesanan
            WHERE p.id_cabang = ? AND DATE(p.tanggal_dibuat) = CURDATE()
            GROUP BY m.nama_menu
            ORDER BY totalQuantity DESC
            LIMIT 1
        `, [id_cabang]);

        // --- Statistik Keseluruhan (BARU) ---
        const [totalLifetimeOrdersResult] = await pool.query(
            "SELECT COUNT(*) as totalLifetimeOrders FROM pesanan WHERE id_cabang = ?",
            [id_cabang]
        );
        
        const [totalLifetimeRevenueResult] = await pool.query(
            "SELECT SUM(total_harga) as totalLifetimeRevenue FROM pesanan WHERE status = 'selesai' AND id_cabang = ?",
            [id_cabang]
        );

        // Gabungkan semua hasil
        return {
            totalOrders: ordersTodayResult[0].totalOrders || 0,
            totalRevenue: parseFloat(revenueTodayResult[0].totalRevenue) || 0,
            topMenu: topMenuResult.length > 0 ? topMenuResult[0].nama_menu : 'Belum ada',
            totalLifetimeOrders: totalLifetimeOrdersResult[0].totalLifetimeOrders || 0,
            totalLifetimeRevenue: parseFloat(totalLifetimeRevenueResult[0].totalLifetimeRevenue) || 0,
        };
    }
    /**
     * Menemukan satu pesanan berdasarkan ID, lengkap dengan detail itemnya.
     * @param {number} id_pesanan - ID pesanan yang dicari.
     * @returns {Promise<Object|null>}
     */
    static async findById(id_pesanan) {
        // Query 1: Ambil data utama pesanan dan nama pelanggan
        const [orderRows] = await pool.query(`
            SELECT p.*, pg.nama_lengkap as nama_pelanggan, td.nomor_meja 
            FROM pesanan p
            JOIN pengguna pg ON p.id_pengguna = pg.id_pengguna
            LEFT JOIN tempat_duduk td ON p.id_meja = td.id_meja
            WHERE p.id_pesanan = ?
        `, [id_pesanan]);

        if (orderRows.length === 0) {
            return null; // Pesanan tidak ditemukan
        }

        const orderDetails = orderRows[0];

        // Query 2: Ambil semua item yang terkait dengan pesanan ini
        const [itemRows] = await pool.query(`
            SELECT pi.*, m.nama_menu
            FROM pesanan_item pi
            JOIN menu m ON pi.id_menu = m.id_menu
            WHERE pi.id_pesanan = ?
        `, [id_pesanan]);

        // Gabungkan hasilnya
        orderDetails.items = itemRows;
        return orderDetails;
    }
}
module.exports = Pemesanan;