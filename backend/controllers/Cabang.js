class Cabang {
  constructor({ CabangRepo }) {
    this.CabangRepo = CabangRepo;

    this.getAllCabang = this.getAllCabang.bind(this);
  }

  async getAllCabang(req, res, next) {
    try {
      const data = await this.CabangRepo.findAll();
      return res.json(data);
    } catch (err) {
      return next(err); 
    }
  }
}

module.exports = { Cabang };
