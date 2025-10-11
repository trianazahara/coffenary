const Pemesanan = require('../models/pemesananModel');
const pool = require('../config/db');

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

const getOrderHistory = async (req, res) => {
  try {
    const id_pengguna = req.user?.id;
    if (!id_pengguna) {
      return res.status(400).json({ message: 'id_pengguna tidak ditemukan pada token' });
    }

    const [orders] = await pool.query(
      `
      SELECT 
        p.id_pesanan        AS id,
        p.nomor_pesanan,
        p.tanggal_dibuat,
        p.status,
        p.total_harga,
        p.tipe_pesanan,
        c.nama_cabang       AS cabang,
        pb.payment_type     AS metode_pembayaran
      FROM pesanan p
      LEFT JOIN cabang c ON c.id_cabang = p.id_cabang
      LEFT JOIN (
        SELECT x.*
        FROM pembayaran x
        JOIN (
          SELECT id_pesanan, MAX(id_pembayaran) AS last_id
          FROM pembayaran
          GROUP BY id_pesanan
        ) y ON x.id_pesanan = y.id_pesanan AND x.id_pembayaran = y.last_id
      ) pb ON pb.id_pesanan = p.id_pesanan
      WHERE p.id_pengguna = ?
      ORDER BY p.tanggal_dibuat DESC
      `,
      [id_pengguna]
    );

    if (!orders || orders.length === 0) {
      return res.json([]); // tidak ada pesanan
    }

    // Ambil semua item untuk semua pesanan di atas
    const ids = orders.map(o => o.id);
    const placeholders = ids.map(() => '?').join(',');
    const [items] = await pool.query(
      `
      SELECT 
        pi.id_pesanan,
        pi.id_item,
        pi.id_menu,
        m.nama_menu,
        pi.jumlah,
        pi.catatan,          -- <- perbaikan di sini
        pi.harga_satuan,
        pi.subtotal
      FROM pesanan_item pi
      LEFT JOIN menu m ON m.id_menu = pi.id_menu
      WHERE pi.id_pesanan IN (${placeholders})
      ORDER BY pi.id_item ASC
      `,
      ids
    );

    // Kelompokkan items per pesanan
    const bucket = {};
    for (const it of items) {
      if (!bucket[it.id_pesanan]) bucket[it.id_pesanan] = [];
      bucket[it.id_pesanan].push({
        id_menu: it.id_menu,
        nama_menu: it.nama_menu,
        jumlah: it.jumlah,
        catatan: it.catatan || null,
        harga_satuan: Number(it.harga_satuan || 0),
        subtotal: Number(it.subtotal || 0),
      });
    }

    const result = orders.map(o => ({
      ...o,
      metode_pembayaran: o.metode_pembayaran || '-', // fallback
      items: bucket[o.id] || []
    }));

    res.json(result);
  } catch (err) {
    console.error('getOrderHistory err:', err);
    res.status(500).json({ message: 'Gagal memuat riwayat pesanan' });
  }
};


module.exports = {
    getAllPesananByCabang,
    updateStatusPesanan,
    getStatsByCabang,
    getPesananById,
    getOrderHistory
};