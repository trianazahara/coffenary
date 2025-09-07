const pool = require('../config/db');

// Admin: Mendapatkan semua pesanan
exports.getAllOrders = async (req, res) => {
    try {
        // Kita JOIN dengan tabel pelanggan untuk mendapatkan nama pelanggan
        const [orders] = await pool.query(`
            SELECT p.*, pl.nama as nama_pelanggan 
            FROM pemesanan p
            JOIN pelanggan pl ON p.id_pelanggan = pl.id_pelanggan
            ORDER BY p.created_at DESC
        `);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error server', error: error.message });
    }
};

// Admin: Mengupdate status pesanan
exports.updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validasi status
    const allowedStatus = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: 'Status tidak valid' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE pemesanan SET status = ? WHERE id_pemesanan = ?',
            [status, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
        }
        res.json({ message: `Status pesanan berhasil diubah menjadi ${status}` });
    } catch (error) {
        res.status(500).json({ message: 'Error server', error: error.message });
    }
};

// Admin: Mendapatkan statistik untuk dashboard
exports.getDashboardStats = async (req, res) => {
    try {
        // Query 1: Total pesanan hari ini (menggunakan CURDATE() dari MySQL)
        const [ordersTodayResult] = await pool.query(
            "SELECT COUNT(*) as totalOrders FROM pemesanan WHERE DATE(created_at) = CURDATE()"
        );

        // Query 2: Total pendapatan hari ini (hanya dari pesanan yang 'completed')
        const [revenueTodayResult] = await pool.query(
            "SELECT SUM(total_harga) as totalRevenue FROM pemesanan WHERE DATE(created_at) = CURDATE() AND status = 'completed'"
        );
        
        // Query 3: Menu terlaris
        const [topMenuResult] = await pool.query(`
            SELECT m.nama_menu, SUM(dp.quantity) as totalQuantity
            FROM detail_pemesanan dp
            JOIN menu m ON dp.id_menu = m.id_menu
            GROUP BY m.nama_menu
            ORDER BY totalQuantity DESC
            LIMIT 1
        `);

        res.json({
            totalOrders: ordersTodayResult[0].totalOrders || 0,
            totalRevenue: parseFloat(revenueTodayResult[0].totalRevenue) || 0,
            topMenu: topMenuResult.length > 0 ? topMenuResult[0].nama_menu : 'Belum ada'
        });

    } catch (error) {
        res.status(500).json({ message: 'Error server', error: error.message });
    }
};