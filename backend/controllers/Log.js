// controllers/Log.js
class Log {
  constructor({ LogModel }) {
    this.LogModel = LogModel;
    // Bind tanpa syarat agar tidak ada cabang yang tak terjangkau
    this.semua = this.semua.bind(this);
  }

  // support model sync atau async (Promise or plain array)
  async semua(req, res, next) {
    try {
      const out = await Promise.resolve(this.LogModel.getLogs());
      return res.status(200).json(out);
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = { Log };
