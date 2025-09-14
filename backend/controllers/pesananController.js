const Pemesanan = require('../models/pemesananModel');

const getAllPesananByCabang = async (req, res) => {
    try {
        const { id_cabang } = req.params;
        const pesanan = await Pemesanan.findAllByCabang(id_cabang);
        res.json(pesanan);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateStatusPesanan = async (req, res) => {
    try {
        const { id_pesanan } = req.params;
        const { status } = req.body;
        const result = await Pemesanan.updateStatus(id_pesanan, status);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
        res.json({ message: `Status pesanan berhasil diubah menjadi ${status}` });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getStatsByCabang = async (req, res) => {
    try {
        const { id_cabang } = req.params;
        const stats = await Pemesanan.getDashboardStats(id_cabang);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getPesananById = async (req, res) => {
    try {
        const { id_pesanan } = req.params;
        const pesanan = await Pemesanan.findById(id_pesanan);
        if (!pesanan) {
            return res.status(404).json({ message: 'Detail pesanan tidak ditemukan' });
        }
        res.json(pesanan);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
    
};

module.exports = {
    getAllPesananByCabang,
    updateStatusPesanan,
    getStatsByCabang,
    getPesananById
};