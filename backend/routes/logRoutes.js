const express = require("express");
const router = express.Router();
const LogModel = require("../models/logModel");

// GET semua log
router.get("/", (req, res) => {
  try {
    const logs = LogModel.getLogs();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil log" });
  }
});

module.exports = router;
