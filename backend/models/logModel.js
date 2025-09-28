// models/logModel.js
const fs = require("fs");
const path = require("path");

// Path file JSON untuk menyimpan log
const dataDir = path.join(__dirname, "../data");
const logFilePath = path.join(dataDir, "logs.json");

// Pastikan folder data exists
const ensureDataDir = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Baca logs dari file
const loadLogs = () => {
  try {
    ensureDataDir();
    if (!fs.existsSync(logFilePath)) {
      // Jika file belum ada, buat file kosong
      fs.writeFileSync(logFilePath, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(logFilePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error loading logs:", err);
    return []; // kalau file belum ada, return array kosong
  }
};

// Simpan logs ke file
const saveLogs = (logs) => {
  try {
    ensureDataDir();
    fs.writeFileSync(logFilePath, JSON.stringify(logs, null, 2));
    console.log("Log berhasil disimpan:", logs[0]); // Debug log
  } catch (err) {
    console.error("Error saving logs:", err);
  }
};

module.exports = {
  getLogs: () => {
    return loadLogs();
  },
  
  addLog: (aktivitas, admin) => {
    try {
      const logs = loadLogs();
      const newLog = {
        id: logs.length + 1,
        aktivitas,
        admin: admin && admin.trim() !== "" ? admin : "Admin Tidak Dikenal", // 🔥 Tambahan
        waktu: new Date().toLocaleString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
      };
      logs.unshift(newLog); // tambahkan di paling atas
      saveLogs(logs);
      console.log("Log ditambahkan:", newLog); // Debug log
    } catch (err) {
      console.error("Error adding log:", err);
    }
  }
};
