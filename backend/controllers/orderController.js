// backend/controllers/orderController.js

const Pemesanan = require('../models/pemesananModel');


const getAllOrders = async (req, res) => {
    try {
        const allOrders = await Pemesanan.findAllForAdmin();
        res.json(allOrders);
    } catch (error) {
        console.error("Error saat mengambil semua pesanan:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatus = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!status || !allowedStatus.includes(status)) {
        return res.status(400).json({ message: 'Status yang diberikan tidak valid.' });
    }

    try {
        const result = await Pemesanan.updateStatus(id, status);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
        }
        res.json({ message: `Status pesanan berhasil diubah menjadi ${status}` });
    } catch (error) {
        console.error("Error saat mengupdate status pesanan:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        const stats = await Pemesanan.getDashboardStats();
        res.json(stats);
    } catch (error) {
        console.error("Error saat mengambil statistik dashboard:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

module.exports = {
    getAllOrders,
    updateOrderStatus,
    getDashboardStats

};