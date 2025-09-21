const LogModel = require('../models/logModel');

// Controller untuk ambil semua log aktivitas
exports.getAllLogs = (req, res) => {
  const data = LogModel.getLogs();
  res.json(data);
};
