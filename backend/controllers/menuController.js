const Menu = require('../models/menuModel');

const getAllMenuByCabang = async (req, res) => {
    try {
        const { id_cabang } = req.params;
        const menuItems = await Menu.findAllByCabang(id_cabang);
        res.json(menuItems);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const createMenu = async (req, res) => {
    try {
        const { id_cabang } = req.params;
        const menuData = {
            ...req.body,
            id_cabang: parseInt(id_cabang),
            gambar: req.file ? req.file.path.replace(/\\/g, "/") : null
        };
        const newMenu = await Menu.create(menuData);
        res.status(201).json({ message: 'Menu berhasil ditambahkan', data: newMenu });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateMenu = async (req, res) => {
    try {
        const { id_cabang, id_menu } = req.params;
        const menuData = { ...req.body };
        if (req.file) {
            menuData.gambar = req.file.path.replace(/\\/g, "/");
        }
        const result = await Menu.update(id_menu, id_cabang, menuData);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Menu tidak ditemukan' });
        res.json({ message: 'Menu berhasil diperbarui' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const deleteMenu = async (req, res) => {
    try {
        const { id_cabang, id_menu } = req.params;
        const result = await Menu.delete(id_menu, id_cabang);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Menu tidak ditemukan' });
        res.json({ message: 'Menu berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getMenuByCabang = async (req, res) => {
  try {
    const { id_cabang } = req.params;
    const [rows] = await db.query(
      "SELECT * FROM menu WHERE id_cabang = ? AND is_tersedia = 1",
      [id_cabang]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil menu", error });
  }
};

const getMenuById = async (req, res) => {
  try {
    const { id_menu } = req.params;
    const [rows] = await pool.query('SELECT * FROM menu WHERE id_menu = ?', [id_menu]);
    if (!rows[0]) return res.status(404).json({ message: 'Menu tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data menu' });
  }
};

module.exports = { getAllMenuByCabang, createMenu, updateMenu, deleteMenu, getMenuByCabang, getMenuById };