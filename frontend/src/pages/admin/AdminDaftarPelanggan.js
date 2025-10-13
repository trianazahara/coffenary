import React, { useEffect, useState } from "react";
import axios from "axios";
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
  const [pelanggan, setPelanggan] = useState([]);

  const formatTanggal = (tanggalString) => {
    const date = new Date(tanggalString);
    return date.toLocaleString("id-ID", {
      dateStyle: "long",
      timeStyle: "short",
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/pelanggan");
        setPelanggan(res.data);
      } catch (err) {
        console.error("Gagal ambil data pelanggan:", err);
      }
    };
    fetchData();
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
            <tr key={p.id_pengguna}>
              <td style={styles.td}>{index + 1}</td>
              <td style={styles.td}>{p.nama_lengkap}</td>
              <td style={styles.td}>{p.email}</td>
              <td style={styles.td}>{formatTanggal(p.tanggal_dibuat)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDaftarPelanggan;
