import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
  },
  title: { fontSize: "2rem", fontWeight: "bold", color: "#111827" },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "white",
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    borderRadius: "0.5rem",
    overflow: "hidden",
  },
  th: {
    padding: "1rem",
    textAlign: "left",
    borderBottom: "1px solid #e5e7eb",
    backgroundColor: "#f9fafb",
    color: "#4b5563",
    textTransform: "uppercase",
    fontSize: "0.75rem",
  },
  td: {
    padding: "1rem",
    borderBottom: "1px solid #e5e7eb",
    color: "#374151",
  },
};

const AdminDaftarPelanggan = () => {
  const [pelanggan, setPelanggan] = useState([
    // Data dummy sementara
    {
      id: 1,
      nama_lengkap: "Rina Putri",
      email: "rina@gmail.com",
      waktu_registrasi: "2025-10-12T20:15:00",
    },
    {
      id: 2,
      nama_lengkap: "Budi Santoso",
      email: "budi@example.com",
      waktu_registrasi: "2025-10-12T21:00:00",
    },
  ]);

  // Fungsi format waktu biar rapi
  const formatTanggal = (tanggalString) => {
    const date = new Date(tanggalString);
    return date.toLocaleString("id-ID", {
      dateStyle: "long",
      timeStyle: "short",
    });
  };

  useEffect(() => {
    // nanti di sini fetch data dari backend
    // axios.get("http://localhost:5000/api/pelanggan")
    // .then(res => setPelanggan(res.data))
  }, []);

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Daftar Pelanggan</h1>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>No</th>
            <th style={styles.th}>Nama Lengkap</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>
              <Clock size={14} style={{ display: "inline", marginRight: "6px" }} />
              Waktu Registrasi
            </th>
          </tr>
        </thead>
        <tbody>
          {pelanggan.map((p, index) => (
            <tr key={p.id}>
              <td style={styles.td}>{index + 1}</td>
              <td style={styles.td}>{p.nama_lengkap}</td>
              <td style={styles.td}>{p.email}</td>
              <td style={styles.td}>{formatTanggal(p.waktu_registrasi)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDaftarPelanggan;
