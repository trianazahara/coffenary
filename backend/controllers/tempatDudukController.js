// backend/controllers/tempatDudukController.js
const TempatDuduk = require('../models/tempatDudukModel');



exports.listByCabang = async (req, res) => {
  try {
    const { id_cabang } = req.params;
    const rows = await TempatDuduk.findAllByCabang(id_cabang);
    res.json(rows);
  } catch (err) {
    console.error('listByCabang error:', err);
    res.status(500).json({ message: 'Gagal mengambil data tempat duduk' });
  }
};

exports.create = async (req, res) => {
  try {
    const { id_cabang } = req.params;
    const { nomor_meja, kapasitas, catatan } = req.body;

    if (!nomor_meja || String(nomor_meja).trim() === '') {
      return res.status(400).json({ message: 'nomor_meja wajib diisi' });
    }

    const exist = await TempatDuduk.isNomorExist(id_cabang, nomor_meja);
    if (exist) {
      return res.status(409).json({ message: 'Nomor meja sudah ada pada cabang ini' });
    }

    const data = await TempatDuduk.create({ id_cabang, nomor_meja, kapasitas, catatan });
    res.status(201).json({ message: 'Tempat duduk berhasil ditambahkan', data });
  } catch (err) {
    console.error('create tempat_duduk error:', err);
    res.status(500).json({ message: 'Gagal menambahkan tempat duduk' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id_meja } = req.params;
    const target = await TempatDuduk.findById(id_meja);
    if (!target) return res.status(404).json({ message: 'Tempat duduk tidak ditemukan' });

    const payload = {};
    if (typeof req.body.nomor_meja !== 'undefined') payload.nomor_meja = req.body.nomor_meja;
    if (typeof req.body.kapasitas !== 'undefined') payload.kapasitas = req.body.kapasitas;
    if (typeof req.body.catatan !== 'undefined') payload.catatan = req.body.catatan;

    // cek unik nomor per cabang bila berubah
    if (
      Object.prototype.hasOwnProperty.call(payload, 'nomor_meja') &&
      String(payload.nomor_meja) !== String(target.nomor_meja)
    ) {
      const bentrok = await TempatDuduk.isNomorExist(target.id_cabang, payload.nomor_meja, id_meja);
      if (bentrok) {
        return res.status(409).json({ message: 'Nomor meja sudah ada pada cabang ini' });
      }
    }

    const result = await TempatDuduk.update(id_meja, payload);
    if (result.affectedRows === 0) {
      return res.status(400).json({ message: 'Tidak ada data yang diubah' });
    }

    res.json({ message: 'Tempat duduk berhasil diperbarui' });
  } catch (err) {
    console.error('update tempat_duduk error:', err);
    res.status(500).json({ message: 'Gagal memperbarui tempat duduk' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id_meja } = req.params;

    const target = await TempatDuduk.findById(id_meja);
    if (!target) return res.status(404).json({ message: 'Tempat duduk tidak ditemukan' });

    // ✅ Cek dulu apakah ada pesanan aktif (bukan selesai/batal)
    const hasActive = await TempatDuduk.hasActiveOrders(id_meja);
    if (hasActive) {
      return res.status(409).json({
        message: 'Tidak bisa menghapus: ada pesanan aktif pada meja ini (status belum selesai/dibatalkan)'
      });
    }

    // lanjut hapus
    const result = await TempatDuduk.remove(id_meja);
    if (result.affectedRows === 0) {
      return res.status(400).json({ message: 'Tidak ada data yang dihapus' });
    }
    res.json({ message: 'Tempat duduk berhasil dihapus' });

  } catch (err) {
    // fallback jika ada FK constraint lain
    if (err && (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451)) {
      return res.status(409).json({ message: 'Tidak bisa menghapus: data sedang direferensikan' });
    }
    console.error('remove tempat_duduk error:', err);
    res.status(500).json({ message: 'Gagal menghapus tempat duduk' });
  }
};