const Cabang = require('../models/cabangModel');

const getAllCabang = async (req, res) => {
    try {
        const cabang = await Cabang.findAll();
        res.json(cabang);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getAllCabang };