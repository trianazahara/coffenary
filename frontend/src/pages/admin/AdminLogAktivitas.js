import React, { useEffect, useState } from "react";
import { History } from "lucide-react";

const AdminLogAktivitas = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/logs")
      .then((res) => res.json())
      .then((data) => {
        // ✅ urutkan log dari lama ke baru (supaya yang baru muncul di bawah)
        const sortedLogs = [...data].sort((a, b) => new Date(a.waktu) - new Date(b.waktu));
        setLogs(sortedLogs);
      })
      .catch((err) => console.error("Error fetch logs:", err));
  }, []);

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
            {logs.map((log, index) => (
            <tr
  key={`${log.id}-${index}`}
  style={{
    backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9fafb",
  }}
>
                {/* ✅ nomor urut dari 1 meskipun log.id acak */}
                <td style={tdStyle}>{index + 1}</td>
                <td style={tdStyle}>{log.aktivitas}</td>
                <td style={tdStyle}>{log.admin}</td>
                <td style={tdStyle}>{log.waktu}</td>
              </tr>
            ))}
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
