const { Pengguna } = require('../models');

exports.getAllPelanggan = async (req, res) => {
  try {
    const pelanggan = await Pengguna.findAll({
      where: { peran: 'pelanggan' },
      attributes: [
        'id_pengguna',
        'nama_lengkap',
        'email',
        'telepon',
        'tanggal_dibuat',
      ],
      order: [['tanggal_dibuat', 'DESC']], // urut dari yang terbaru
    });

    res.status(200).json(pelanggan);
  } catch (error) {
    console.error('Error mengambil daftar pelanggan:', error);
    res.status(500).json({ message: 'Gagal memuat data pelanggan' });
  }
};
