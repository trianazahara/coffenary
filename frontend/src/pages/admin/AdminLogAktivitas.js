import React, { useEffect, useState } from "react";
import { History, Search } from "lucide-react";

const AdminLogAktivitas = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]); // 🔍 hasil pencarian
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/logs")
      .then((res) => res.json())
      .then((data) => {
        const sortedLogs = [...data].sort((a, b) => new Date(a.waktu) - new Date(b.waktu));
        setLogs(sortedLogs);
        setFilteredLogs(sortedLogs);
      })
      .catch((err) => console.error("Error fetch logs:", err));
  }, []);

  // 🔍 Logika search — jalan setiap kali user mengetik
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      // jika input kurang dari 2 karakter → tampilkan semua log
      setFilteredLogs(logs);
      return;
    }

    const term = searchTerm.toLowerCase();

    const filtered = logs.filter((log) => {
      // cocokkan berdasarkan aktivitas, admin, waktu, atau nomor
      return (
        String(log.aktivitas).toLowerCase().includes(term) ||
        String(log.admin).toLowerCase().includes(term) ||
        String(log.waktu).toLowerCase().includes(term) ||
        String(log.id).toLowerCase().includes(term)
      );
    });

    setFilteredLogs(filtered);
  }, [searchTerm, logs]);

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "1.5rem" }}>
        <History size={32} color="#059669" style={{ marginRight: "0.75rem" }} />
        <h1 style={{ fontSize: "1.75rem", fontWeight: "bold", color: "#059669" }}>
          Log Aktivitas
        </h1>
      </div>
      <p style={{ marginBottom: "1.5rem", color: "#4b5563" }}>
        Riwayat aktivitas yang dilakukan admin
      </p>

      {/* 🔍 Search bar */}
      <div
        style={{
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
          backgroundColor: "white",
          borderRadius: "8px",
          border: "1px solid #d1d5db",
          padding: "0.5rem 1rem",
          maxWidth: "400px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}
      >
        <Search size={20} color="#6b7280" />
        <input
          type="text"
          placeholder="Cari aktivitas, admin, waktu, atau nomor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            border: "none",
            outline: "none",
            marginLeft: "0.5rem",
            flex: 1,
            fontSize: "0.9rem",
            color: "#374151",
          }}
        />
      </div>

      <div
        style={{
          overflowX: "auto",
          backgroundColor: "white",
          borderRadius: "0.75rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ backgroundColor: "#f0fdf4" }}>
            <tr>
              <th style={thStyle}>Nomor</th>
              <th style={thStyle}>Aktivitas</th>
              <th style={thStyle}>Admin</th>
              <th style={thStyle}>Waktu</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log, index) => (
                <tr
                  key={`${log.id}-${index}`}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9fafb",
                  }}
                >
                  <td style={tdStyle}>{index + 1}</td>
                  <td style={tdStyle}>{log.aktivitas}</td>
                  <td style={tdStyle}>{log.admin}</td>
                  <td style={tdStyle}>{log.waktu}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ ...tdStyle, textAlign: "center", color: "#6b7280" }}>
                  Tidak ada hasil ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const thStyle = {
  textAlign: "left",
  padding: "0.75rem 1rem",
  fontWeight: "bold",
  fontSize: "0.9rem",
  color: "#065f46",
  borderBottom: "2px solid #d1fae5",
};

const tdStyle = {
  padding: "0.75rem 1rem",
  fontSize: "0.9rem",
  color: "#374151",
  borderBottom: "1px solid #e5e7eb",
};

export default AdminLogAktivitas;
