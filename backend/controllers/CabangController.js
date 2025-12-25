class CabangController {
  constructor({ CabangRepo, LogModel }) {
    this.CabangRepo = CabangRepo;
    this.LogModel = LogModel;

    this.getAllCabang = this.getAllCabang.bind(this);
    this.getAllCabangAdmin = this.getAllCabangAdmin.bind(this);
    this.createCabang = this.createCabang.bind(this);
    this.updateCabang = this.updateCabang.bind(this);
    this.deleteCabang = this.deleteCabang.bind(this);
  }

  async getAllCabang(req, res, next) {
    try {
      const data = await this.CabangRepo.findAll();
      return res.json(data);
    } catch (err) {
      return next(err); 
    }
  }

  async getAllCabangAdmin(req, res, next) {
    try {
      const data = await this.CabangRepo.findAll({ includeInactive: true });
      return res.json(data);
    } catch (err) {
      return next(err);
    }
  }

  async createCabang(req, res, next) {
    try {
      const { nama_cabang, alamat, telepon, is_aktif = 1 } = req.body || {};
      if (!nama_cabang) return res.status(400).json({ message: 'Nama cabang wajib diisi' });
      const id = await this.CabangRepo.create({ nama_cabang, alamat: alamat || null, telepon: telepon || null, is_aktif });

      try {
        if (this.LogModel && req.user?.id) {
          await this.LogModel.addLog({
            id_admin: req.user.id,
            aksi: 'create',
            entitas: 'cabang',
            entitas_id: id,
            keterangan: `Tambah cabang ${nama_cabang}`,
            user_agent: req.get('user-agent') || null
          });
        }
      } catch (logErr) {
        console.warn('Gagal menulis log cabang.create:', logErr.message);
      }

      return res.status(201).json({ message: 'Cabang berhasil ditambahkan', id_cabang: id });
    } catch (err) {
      return next(err);
    }
  }

  async updateCabang(req, res, next) {
    try {
      const { id_cabang } = req.params;
      const payload = req.body || {};
      const r = await this.CabangRepo.update(id_cabang, payload);
      if (!r || r.affectedRows === 0) return res.status(404).json({ message: 'Cabang tidak ditemukan' });

      try {
        if (this.LogModel && req.user?.id) {
          await this.LogModel.addLog({
            id_admin: req.user.id,
            aksi: 'update',
            entitas: 'cabang',
            entitas_id: id_cabang,
            keterangan: `Ubah cabang ${id_cabang}`,
            user_agent: req.get('user-agent') || null
          });
        }
      } catch (logErr) {
        console.warn('Gagal menulis log cabang.update:', logErr.message);
      }

      return res.json({ message: 'Cabang berhasil diperbarui' });
    } catch (err) {
      return next(err);
    }
  }

  async deleteCabang(req, res, next) {
    // Soft delete dinonaktifkan sesuai permintaan; cabang cukup di-nonaktifkan via update.
    return res.status(405).json({ message: 'Hapus cabang dinonaktifkan. Set is_aktif=0 via update.' });
  }
}

module.exports = { CabangController };
