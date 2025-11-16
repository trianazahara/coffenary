const fs = require("fs");
const path = require("path");


// Path ke file log.json
const LOG_FILE_PATH = path.join(__dirname, "..", "log.json");


class LogModel {
  // Ambil semua log dari file JSON
  static getLogs() {
    try {
      // Cek apakah file ada
      if (!fs.existsSync(LOG_FILE_PATH)) {
        console.log("File log.json tidak ditemukan, membuat file baru...");
        // Buat file kosong jika belum ada
        fs.writeFileSync(LOG_FILE_PATH, JSON.stringify([], null, 2));
        return [];
      }


      // Baca file
      const data = fs.readFileSync(LOG_FILE_PATH, "utf8");
     
      // Parse JSON
      const logs = JSON.parse(data);
     
      return logs;
    } catch (error) {
      console.error("Error membaca log.json:", error);
      throw new Error("Gagal membaca file log");
    }
  }


  // Tambah log baru (opsional, untuk fitur tambah log)
  static addLog(aktivitas, admin) {
    try {
      const logs = this.getLogs();
     
      // Buat ID baru
      const newId = logs.length > 0 ? Math.max(...logs.map(log => log.id)) + 1 : 1;
     
      // Buat waktu sekarang
      const now = new Date();
      const waktu = now.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).replace(",", " pukul");
     
      // Buat log baru
      const newLog = {
        id: newId,
        aktivitas,
        admin,
        waktu
      };
     
      // Tambahkan di awal array (log terbaru di atas)
      logs.unshift(newLog);
     
      // Simpan ke file
      fs.writeFileSync(LOG_FILE_PATH, JSON.stringify(logs, null, 2));
     
      return newLog;
    } catch (error) {
      console.error("Error menambah log:", error);
      throw new Error("Gagal menambah log");
    }
  }


  // Hapus semua log (opsional)
  static clearLogs() {
    try {
      fs.writeFileSync(LOG_FILE_PATH, JSON.stringify([], null, 2));
      return { message: "Semua log berhasil dihapus" };
    } catch (error) {
      console.error("Error menghapus log:", error);
      throw new Error("Gagal menghapus log");
    }
  }
}


module.exports = LogModel;

