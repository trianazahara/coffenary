const Pemesanan = require('../models/pemesananModel');
const pool = require('../config/db');
const midtransClient = require('midtrans-client'); // kalau pakai Snap server
const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY
});


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

const getPesananDetailForCustomer = async (req, res) => {
  try {
    const { id_pesanan } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Token tidak valid (id kosong)' });
    }
    if (!id_pesanan) {
      return res.status(400).json({ message: 'Parameter id_pesanan wajib' });
    }


    // Cek pesanan by id dulu
    const [rowsById] = await pool.query(
      `SELECT p.*, c.nama_cabang AS cabang
       FROM pesanan p
       LEFT JOIN cabang c ON c.id_cabang = p.id_cabang
       WHERE p.id_pesanan = ?
       LIMIT 1`,
      [id_pesanan]
    );

    if (!rowsById.length) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
    }

    const pesanan = rowsById[0];

    // Validasi kepemilikan
    if (Number(pesanan.id_pengguna) !== userId) {
      return res.status(403).json({ message: 'Tidak berhak melihat pesanan ini' });
    }

    // Ambil items
    const [items] = await pool.query(
      `SELECT pi.id_menu, m.nama_menu, pi.jumlah, pi.harga_satuan, pi.subtotal
       FROM pesanan_item pi
       LEFT JOIN menu m ON m.id_menu = pi.id_menu
       WHERE pi.id_pesanan = ?
       ORDER BY pi.id_item ASC`,
      [id_pesanan]
    );

    // Ambil pembayaran terakhir
    const [pemb] = await pool.query(
      `SELECT *
       FROM pembayaran
       WHERE id_pesanan = ?
       ORDER BY id_pembayaran DESC
       LIMIT 1`,
      [id_pesanan]
    );

    return res.json({
      pesanan: {
        id: pesanan.id_pesanan,
        nomor_pesanan: pesanan.nomor_pesanan,
        tanggal_dibuat: pesanan.tanggal_dibuat,
        status: pesanan.status,
        total_harga: pesanan.total_harga,
        tipe_pesanan: pesanan.tipe_pesanan,
        cabang: pesanan.cabang,
        items
      },
      pembayaran_terakhir: pemb[0] || null
    });
  } catch (e) {
    console.error('getPesananDetailForCustomer error:', e);
    return res.status(500).json({ message: 'Server Error' });
  }
};

const recreatePaymentForCustomer = async (req,res)=>{
  const { id_pesanan } = req.params;
  const id_pengguna = req.user?.id;

  // cek kepemilikan & ambil total
  const [rows] = await pool.query(`SELECT * FROM pesanan WHERE id_pesanan=? AND id_pengguna=? LIMIT 1`, [id_pesanan, id_pengguna]);
  if (!rows.length) return res.status(404).json({message:'Pesanan tidak ditemukan'});
  const p = rows[0];

  // buat order_id unik (misal: ORDER-<id>-<timestamp>)
  const order_id = `ORDER-${p.id_pesanan}-${Date.now()}`;

  const parameter = {
    transaction_details: { order_id, gross_amount: Number(p.total_harga) },
    credit_card: { secure: true },
    enabled_payments: ['qris','gopay','bank_transfer','credit_card']
  };

  const snapRes = await snap.createTransaction(parameter);

  // simpan ke tabel pembayaran (status awal 'pending')
  const [ins] = await pool.query(`
    INSERT INTO pembayaran (id_pesanan, order_id, snap_token, snap_redirect_url, metode_pembayaran, payment_type, status_pembayaran, jumlah_bayar, tanggal_dibuat)
    VALUES (?,?,?,?,?,?, 'pending', ?, NOW())
  `, [
    id_pesanan,
    order_id,
    snapRes.token || null,
    snapRes.redirect_url || null,
    'qris',          // bisa disesuaikan dari pilihan user
    snapRes.payment_type || 'snap',
    p.total_harga
  ]);

  res.json({
    pembayaran: {
      id_pembayaran: ins.insertId,
      id_pesanan,
      order_id,
      snap_token: snapRes.token || null,
      snap_redirect_url: snapRes.redirect_url || null,
      metode_pembayaran: 'qris',
      payment_type: snapRes.payment_type || 'snap',
      status_pembayaran: 'pending',
      jumlah_bayar: p.total_harga
    }
  });
};

module.exports = {
    getAllPesananByCabang,
    updateStatusPesanan,
    getPesananDetailForCustomer,
    recreatePaymentForCustomer,
    getStatsByCabang,
    getPesananById,
    getOrderHistory
};