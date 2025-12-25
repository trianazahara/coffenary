// controllers/Pengguna.js
class PenggunaController {
  constructor({ repo, bcrypt }) {
    this.repo = repo;
    this.bcrypt = bcrypt;

    this.semua = this.semua.bind(this);
    this.updateByAdmin = this.updateByAdmin.bind(this);
    this.updateMe = this.updateMe.bind(this);
    this.createByAdmin = this.createByAdmin.bind(this);
  }

  // GET /api/pengguna?key=value
  async semua(req, res, next) {
    try {
      const filter = req.query || {};
      const rows = await this.repo.findAll(filter);
      return res.json(rows);
    } catch (e) { return next(e); }
  }

  // PUT /api/pengguna/:id  (admin/staff)
  async updateByAdmin(req, res, next) {
    try {
      const { id } = req.params;
      const payload = { ...req.body };

      // hash password jika diisi
      if (payload.password && String(payload.password).trim() !== '') {
        payload.kata_sandi_hash = await this.bcrypt.hash(payload.password, 10);
        delete payload.password;
      }

      // cek unik email jika diubah
      if (payload.email) {
        const existing = await this.repo.findByEmail(payload.email);
        if (existing && String(existing.id_pengguna) !== String(id)) {
          return res.status(400).json({ message: 'Email sudah digunakan pengguna lain.' });
        }
      }

      const r = await this.repo.updateAdmin(id, payload);
      if (!r || r.affectedRows === 0) {
        return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
      }
      return res.json({ message: 'Data pengguna berhasil diperbarui (admin).' });
    } catch (e) { return next(e); }
  }

  // PUT /api/pengguna/me  (pelanggan)
  async updateMe(req, res, next) {
    try {
      const id = req.user?.id;
      if (!id) return res.status(401).json({ message: 'Unauthenticated' });

      // buang field terlarang
      const { peran, is_aktif, password, ...others } = req.body || {};
      const payload = { ...others };

      if (password && String(password).trim() !== '') {
        payload.kata_sandi_hash = await this.bcrypt.hash(password, 10);
      }

      const r = await this.repo.updateProfile(id, payload);
      if (!r || r.affectedRows === 0) {
        return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
      }
      return res.json({ message: 'Profil berhasil diperbarui.' });
    } catch (e) { return next(e); }
  }

  // POST /api/pengguna (admin)
  async createByAdmin(req, res, next) {
    try {
      const { nama_lengkap, email, password, telepon, peran } = req.body || {};

      if (!['admin', 'staff'].includes(peran)) {
        return res.status(400).json({ message: 'Peran yang diizinkan hanya admin atau staff.' });
      }

      const existing = await this.repo.findByEmail(email);
      if (existing) {
        return res.status(400).json({ message: 'Email sudah terdaftar.' });
      }

      const kata_sandi_hash = await this.bcrypt.hash(password, 10);
      const newUser = await this.repo.create({
        nama_lengkap, email, kata_sandi_hash, telepon, peran
      });

      return res.status(201).json({ message: 'Pengguna baru berhasil ditambahkan.', data: newUser });
    } catch (e) { return next(e); }
  }
}

module.exports = { PenggunaController };
