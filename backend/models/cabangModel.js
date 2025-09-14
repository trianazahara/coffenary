const pool = require('../config/db');

class Cabang {
    static async findAll() {
        const [rows] = await pool.query('SELECT * FROM cabang WHERE is_aktif = 1');
        return rows;
    }
}
module.exports = Cabang;