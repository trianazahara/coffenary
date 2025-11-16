// controllers/Menu.js
class Menu {
  constructor({ repo, pool }) {
    // repo = model untuk operasi CRUD (findAllByCabang, create, update, delete)
    // pool = koneksi untuk raw query (featured, byId) kalau kamu belum punya method di repo
    this.repo = repo;
    this.pool = pool;

    this.semuaByCabang = this.semuaByCabang.bind(this);
    this.unggulan = this.unggulan.bind(this);
    this.buat = this.buat.bind(this);
    this.ubah = this.ubah.bind(this);
    this.hapus = this.hapus.bind(this);
    this.tersediaByCabang = this.tersediaByCabang.bind(this);
    this.byId = this.byId.bind(this);
  }

  async semuaByCabang(req, res, next) {
    try {
      const { id_cabang } = req.params;
      const rows = await this.repo.findAllByCabang(id_cabang);
      return res.json(rows);
    } catch (e) { return next(e); }
  }

  async unggulan(req, res, next) {
    try {
      const [rows] = await this.pool.query(`
        SELECT * FROM menu
        WHERE is_tersedia = 1
        ORDER BY id_menu DESC
        LIMIT 6
      `);
      return res.json(rows);
    } catch (e) { return next(e); }
  }

  async buat(req, res, next) {
    try {
      const { id_cabang } = req.params;
      const payload = {
        ...req.body,
        id_cabang: Number(id_cabang),
        gambar: req.file ? String(req.file.path).replace(/\\/g, '/') : null
      };
      const created = await this.repo.create(payload);
      return res.status(201).json({ message: 'Menu berhasil ditambahkan', data: created });
    } catch (e) { return next(e); }
  }

  async ubah(req, res, next) {
    try {
      const { id_cabang, id_menu } = req.params;
      const data = { ...req.body };
      if (req.file) data.gambar = String(req.file.path).replace(/\\/g, '/');

      const r = await this.repo.update(id_menu, id_cabang, data);
      if (!r || r.affectedRows === 0) {
        return res.status(404).json({ message: 'Menu tidak ditemukan' });
      }
      return res.json({ message: 'Menu berhasil diperbarui' });
    } catch (e) { return next(e); }
  }

  async hapus(req, res, next) {
    try {
      const { id_cabang, id_menu } = req.params;
      const r = await this.repo.delete(id_menu, id_cabang);
      if (!r || r.affectedRows === 0) {
        return res.status(404).json({ message: 'Menu tidak ditemukan' });
      }
      return res.json({ message: 'Menu berhasil dihapus' });
    } catch (e) { return next(e); }
  }

  // catatan: di kode lama ada fungsi ini tapi pakai variabel 'db' yang tidak didefinisikan
  async tersediaByCabang(req, res, next) {
    try {
      const { id_cabang } = req.params;
      const [rows] = await this.pool.query(
        'SELECT * FROM menu WHERE id_cabang = ? AND is_tersedia = 1',
        [id_cabang]
      );
      return res.json(rows);
    } catch (e) { return next(e); }
  }

  async byId(req, res, next) {
    try {
      const { id_menu } = req.params;
      const [rows] = await this.pool.query('SELECT * FROM menu WHERE id_menu = ?', [id_menu]);
      if (!rows[0]) return res.status(404).json({ message: 'Menu tidak ditemukan' });
      return res.json(rows[0]);
    } catch (e) { return next(e); }
  }
}

module.exports = { Menu };
