class LogController {
  constructor({ LogModel }) {
    this.LogModel = LogModel;
    this.semua = this.semua.bind(this);
    this.clear = this.clear.bind(this);
  }
  async semua(req, res, next) {
    try {
      const out = await this.LogModel.getLogs({
        page: req.query.page, limit: req.query.limit,
        admin_id: req.query.admin_id, entitas: req.query.entitas,
        aksi: req.query.aksi, q: req.query.q,
        date_from: req.query.date_from, date_to: req.query.date_to
      });
      res.status(200).json(out);
    } catch (e) { next(e); }
  }
  async clear(req, res, next) {
    try { await this.LogModel.clearLogs(); res.json({ message:'Semua log dihapus' }); }
    catch (e) { next(e); }
  }
}
module.exports = { LogController };
