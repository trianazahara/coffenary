import React, { useEffect, useState } from "react";
import axios from "axios";
import { Building2, Plus, Edit3, MapPin, Phone, XCircle, CheckCircle } from "lucide-react";

const emptyForm = { nama_cabang: "", alamat: "", telepon: "", is_aktif: true };

const AdminCabang = () => {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const token =
    localStorage.getItem("adminToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");

  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const loadData = async () => {
    if (!token) {
      setError("Token tidak ditemukan, silakan login ulang.");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/cabang/admin/all", {
        headers: authHeader,
      });
      setRows(res.data || []);
      setError("");
    } catch (e) {
      console.error(e);
      setError("Gagal memuat data cabang.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nama_cabang.trim()) {
      setError("Nama cabang wajib diisi.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const payload = {
        nama_cabang: form.nama_cabang,
        alamat: form.alamat,
        telepon: form.telepon,
        is_aktif: form.is_aktif,
      };
      if (editingId) {
        await axios.put(`http://localhost:5000/api/cabang/${editingId}`, payload, {
          headers: authHeader,
        });
        setSuccess("Cabang berhasil diperbarui.");
      } else {
        await axios.post("http://localhost:5000/api/cabang", payload, {
          headers: authHeader,
        });
        setSuccess("Cabang berhasil ditambahkan.");
      }
      setForm(emptyForm);
      setEditingId(null);
      setModalOpen(false);
      loadData();
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "Gagal menyimpan cabang.");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(""), 2000);
    }
  };

  const handleEdit = (row) => {
    setEditingId(row.id_cabang);
    setForm({
      nama_cabang: row.nama_cabang || "",
      alamat: row.alamat || "",
      telepon: row.telepon || "",
      is_aktif: row.is_aktif === 1 || row.is_aktif === true,
    });
    setModalOpen(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(false);
  };

  return (
    <div>
      <header style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <Building2 size={28} color="#047857" />
        <div>
          <h1 style={{ margin: 0, fontSize: "1.75rem", color: "#0f172a" }}>Kelola Cabang</h1>
          <p style={{ margin: 0, color: "#475569" }}>Tambah atau ubah data cabang aktif.</p>
        </div>
      </header>

      <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between" }}>
        <button
          onClick={() => {
            setEditingId(null);
            setForm(emptyForm);
            setModalOpen(true);
          }}
          style={{
            backgroundColor: "#059669",
            color: "white",
            border: "none",
            padding: "0.75rem 1.25rem",
            borderRadius: "0.75rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            cursor: "pointer",
          }}
        >
          <Plus size={16} />
          Tambah Cabang
        </button>
        {error && <div style={{ color: "#b91c1c", fontWeight: 600 }}>{error}</div>}
      </div>

      <section
        style={{
          background: "white",
          borderRadius: "1rem",
          padding: "1.5rem",
          boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0, color: "#0f172a" }}>Daftar Cabang</h3>
          {loading && <span style={{ color: "#475569" }}>Memuat...</span>}
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f1f5f9" }}>
                <th style={thStyle}>Nama</th>
                <th style={thStyle}>Alamat</th>
                <th style={thStyle}>Telepon</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id_cabang} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Building2 size={16} color="#059669" />
                      <div>
                        <div style={{ fontWeight: 600 }}>{r.nama_cabang}</div>
                        <div style={{ fontSize: "0.85rem", color: "#64748b" }}>ID: {r.id_cabang}</div>
                      </div>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#475569" }}>
                      <MapPin size={14} />
                      <span>{r.alamat || "-"}</span>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#475569" }}>
                      <Phone size={14} />
                      <span>{r.telepon || "-"}</span>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    {r.is_aktif ? (
                      <span style={badgeSuccess}>Aktif</span>
                    ) : (
                      <span style={badgeMuted}>Nonaktif</span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={() => handleEdit(r)}
                        style={iconBtn}
                        title="Edit"
                      >
                        <Edit3 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={5} style={{ ...tdStyle, textAlign: "center", color: "#64748b" }}>
                    Belum ada cabang.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {modalOpen && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0 }}>{editingId ? "Edit Cabang" : "Tambah Cabang"}</h3>
              <button onClick={cancelEdit} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <XCircle size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.75rem" }}>
              <input
                type="text"
                value={form.nama_cabang}
                onChange={(e) => setForm({ ...form, nama_cabang: e.target.value })}
                placeholder="Nama cabang"
                style={inputStyle}
              />
              <input
                type="text"
                value={form.alamat}
                onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                placeholder="Alamat"
                style={inputStyle}
              />
              <input
                type="text"
                value={form.telepon}
                onChange={(e) => setForm({ ...form, telepon: e.target.value })}
                placeholder="Telepon"
                style={inputStyle}
              />
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#0f172a" }}>
                <input
                  type="checkbox"
                  checked={form.is_aktif}
                  onChange={(e) => setForm({ ...form, is_aktif: e.target.checked })}
                />
                Cabang aktif
              </label>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    backgroundColor: "#059669",
                    color: "white",
                    border: "none",
                    padding: "0.75rem 1.1rem",
                    borderRadius: "0.75rem",
                    cursor: "pointer",
                  }}
                >
                  {editingId ? "Simpan Perubahan" : "Tambah"}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  style={{
                    background: "transparent",
                    border: "1px solid #cbd5e1",
                    padding: "0.75rem 1.1rem",
                    borderRadius: "0.75rem",
                    cursor: "pointer",
                  }}
                >
                  Batal
                </button>
              </div>
              {error && <div style={{ color: "#b91c1c" }}>{error}</div>}
            </form>
          </div>
        </div>
      )}

      {(success || error) && (
        <div style={toastStyle}>
          {success && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#047857" }}>
              <CheckCircle size={18} />
              {success}
            </div>
          )}
          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#b91c1c" }}>
              <XCircle size={18} />
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const inputStyle = {
  border: "1px solid #cbd5e1",
  borderRadius: "0.75rem",
  padding: "0.8rem 1rem",
  fontSize: "0.95rem",
  outline: "none",
};

const thStyle = {
  textAlign: "left",
  padding: "0.75rem",
  fontWeight: 700,
  color: "#0f172a",
  fontSize: "0.9rem",
  borderBottom: "1px solid #e2e8f0",
};

const tdStyle = {
  padding: "0.75rem",
  verticalAlign: "top",
};

const iconBtn = {
  border: "1px solid #cbd5e1",
  background: "white",
  borderRadius: "0.6rem",
  padding: "0.45rem 0.6rem",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#0f172a",
};

const badgeSuccess = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.3rem",
  background: "rgba(16, 185, 129, 0.15)",
  color: "#047857",
  padding: "0.35rem 0.65rem",
  borderRadius: "9999px",
  fontWeight: 700,
  fontSize: "0.8rem",
};

const badgeMuted = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.3rem",
  background: "rgba(100, 116, 139, 0.15)",
  color: "#475569",
  padding: "0.35rem 0.65rem",
  borderRadius: "9999px",
  fontWeight: 700,
  fontSize: "0.8rem",
};

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: "1rem",
};

const modalCard = {
  background: "white",
  borderRadius: "1rem",
  padding: "1.25rem",
  maxWidth: "420px",
  width: "100%",
  boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
};

const toastStyle = {
  position: "fixed",
  bottom: "1.5rem",
  right: "1.5rem",
  background: "white",
  padding: "0.9rem 1.1rem",
  borderRadius: "0.75rem",
  boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
  border: "1px solid #e2e8f0",
  zIndex: 1500,
  minWidth: "240px",
};

export default AdminCabang;
