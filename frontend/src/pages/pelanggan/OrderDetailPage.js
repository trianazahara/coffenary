// src/pages/pelanggan/OrderDetailPage.js
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/pelanggan/Header";
import { AuthContext } from "../../context/AuthContext";
import {
  ArrowLeft, ShoppingBag, CreditCard, CheckCircle, AlertCircle,
  Clock, Wallet, RefreshCw, ExternalLink, Shield, Receipt
} from "lucide-react";

const styles = {
  container: { minHeight: "100vh", backgroundColor: "#f8fafc", paddingTop: "70px" },
  main: { maxWidth: "1000px", margin: "0 auto", padding: "2rem 1rem" },
  header: { marginBottom: "1.5rem" },
  title: {
    fontSize: "1.75rem", fontWeight: 700, color: "#1e293b",
    display: "flex", alignItems: "center", gap: "0.6rem"
  },
  subtitle: { color: "#64748b" },

  card: {
    background: "#fff", borderRadius: "1rem", padding: "1.5rem",
    border: "1px solid rgba(226,232,240,.6)", boxShadow: "0 4px 15px rgba(0,0,0,.06)"
  },
  grid: { display: "grid", gridTemplateColumns: "1fr 360px", gap: "1.25rem", alignItems: "start" },

  sectionTitle: { fontSize: "1.1rem", fontWeight: 700, color: "#1f2937", marginBottom: ".75rem", display: "flex", gap: ".5rem", alignItems: "center" },

  row: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: ".6rem 0", borderBottom: "1px solid #f1f5f9" },
  label: { color: "#64748b" },
  value: { color: "#111827", fontWeight: 600 },

  tag: { display: "inline-flex", alignItems: "center", gap: ".4rem", padding: ".35rem .65rem", borderRadius: "999px", fontSize: ".8rem", fontWeight: 700 },

  list: { marginTop: ".5rem", borderTop: "1px dashed #e5e7eb" },
  item: { display: "flex", justifyContent: "space-between", gap: "1rem", padding: ".75rem 0", borderBottom: "1px dashed #e5e7eb" },
  itemName: { color: "#374151", fontWeight: 600 },
  itemMeta: { color: "#6b7280", fontSize: ".9rem" },
  itemPrice: { color: "#059669", fontWeight: 700 },

  sideCard: { position: "sticky", top: "2rem" },

  btn: {
    width: "100%", border: "none", borderRadius: ".75rem", padding: ".9rem 1rem",
    display: "flex", alignItems: "center", justifyContent: "center", gap: ".5rem",
    fontWeight: 700, cursor: "pointer", transition: "all .2s ease"
  },
  btnPrimary: { background: "#10b981", color: "#fff" },
  btnPrimaryHover: { background: "#059669", transform: "translateY(-1px)", boxShadow: "0 8px 30px rgba(16,185,129,.3)" },
  btnOutline: { background: "#fff", color: "#10b981", border: "2px solid #10b981" },
  btnOutlineHover: { background: "#ecfdf5" },

  backBtn: {
    background: "transparent", color: "#64748b", border: "1px solid #d1d5db",
    padding: ".6rem .9rem", borderRadius: ".75rem", display: "inline-flex", gap: ".5rem", alignItems: "center", marginBottom: "1rem"
  },

  alert: {
    display: "flex", gap: ".6rem", alignItems: "center", padding: ".75rem 1rem",
    borderRadius: ".75rem", marginBottom: ".75rem", fontSize: ".95rem"
  },
  alertSuccess: { background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534" },
  alertError: { background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c" },

  muted: { color: "#6b7280", fontSize: ".85rem" }
};

const statusStyle = (s) => {
  const base = { ...styles.tag };
  if (s === "terkonfirmasi" || s === "settlement" || s === "capture")
    return { ...base, background: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0" };
  if (s === "pending")
    return { ...base, background: "#fefce8", color: "#854d0e", border: "1px solid #fde68a" };
  if (["cancel", "deny", "expire", "failure", "dibatalkan"].includes(s))
    return { ...base, background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" };
  return { ...base, background: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe" };
};

const formatIDR = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(n || 0));

export default function OrderDetailPage() {
  const { id } = useParams(); // id_pesanan
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [hover, setHover] = useState({});
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const [pesanan, setPesanan] = useState(null);      // { id_pesanan, nomor_pesanan, status, total_harga, ... }
  const [items, setItems] = useState([]);            // [{ id_menu, nama_menu, jumlah, harga }]
  const [payment, setPayment] = useState(null);      // row dari tabel pembayaran

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");

        // Ambil detail pesanan + item
        // NOTE: pastikan endpoint ini tersedia di backend-mu (lihat catatan di bawah)
        const detailRes = await axios.get(`http://localhost:5000/api/pesanan/${id}`);
        setPesanan(detailRes.data.pesanan);
        setItems(detailRes.data.items || []);

        // Ambil pembayaran terakhir
        try {
          const payRes = await axios.get(`http://localhost:5000/api/pembayaran/by-pesanan/${id}`, { withCredentials: true });
          setPayment(payRes.data);
        } catch (e) {
          // 404 -> belum ada pembayaran
          setPayment(null);
        }
      } catch (e) {
        console.error(e);
        setError(e.response?.data?.message || "Gagal memuat detail pesanan");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const openUrl = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleContinuePayment = () => {
    if (payment?.snap_redirect_url) {
      openUrl(payment.snap_redirect_url);
    } else {
      setError("Link pembayaran tidak tersedia.");
    }
  };

  const handleReinitiate = async () => {
    try {
      setError("");
      setInfo("");
      setHover((h) => ({ ...h, paying: true }));

      const payload = {
        id_pesanan: pesanan.id_pesanan,
        total_harga: pesanan.total_harga,
        customer: {
          first_name: user?.nama_lengkap || "Pelanggan",
          email: user?.email || ""
        },
        items: items.map((it) => ({
          id_menu: it.id_menu,
          jumlah: it.jumlah,
          harga: it.harga,
          nama: it.nama_menu
        }))
      };

      const resp = await axios.post("http://localhost:5000/api/pembayaran/reinitiate", payload, { withCredentials: true });
      setPayment({
        ...payment,
        referensi_pembayaran: resp.data.order_id,
        snap_token: resp.data.snap?.token,
        snap_redirect_url: resp.data.snap?.redirect_url,
        status_pembayaran: "pending"
      });
      setInfo("Tautan pembayaran berhasil dibuat ulang.");
      if (resp.data.snap?.redirect_url) openUrl(resp.data.snap.redirect_url);
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || "Gagal membuat tautan pembayaran.");
    } finally {
      setHover((h) => ({ ...h, paying: false }));
    }
  };

  const showContinue =
    payment && payment.status_pembayaran === "pending" && payment.snap_redirect_url;

  const showReinit =
    !payment || ["expire", "cancel", "deny", "failure", "dibatalkan"].includes(payment.status_pembayaran);

  if (loading) {
    return (
      <div style={styles.container}>
        <Header />
        <main style={styles.main}>
          <div style={{ ...styles.card, textAlign: "center", color: "#64748b" }}>
            <Clock size={36} style={{ marginBottom: ".6rem", color: "#10b981" }} />
            Memuat detail pesanan...
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <Header />
        <main style={styles.main}>
          <button style={styles.backBtn} onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Kembali
          </button>
          <div style={{ ...styles.alert, ...styles.alertError }}>
            <AlertCircle size={18} /> {error}
          </div>
        </main>
      </div>
    );
  }

  if (!pesanan) return null;

  const tax = Math.round(Number(pesanan.total_harga || 0) * 0.1);
  const total = Number(pesanan.total_harga || 0) + tax;

  return (
    <div style={styles.container}>
      <Header />
      <main style={styles.main}>
        <button style={styles.backBtn} onClick={() => navigate("/pelanggan/dashboard")}>
          <ArrowLeft size={16} /> Kembali ke Dashboard
        </button>

        <div style={styles.header}>
          <h1 style={styles.title}>
            <Receipt size={26} /> Detail Pesanan
          </h1>
          <div style={{ display: "flex", gap: ".5rem", marginTop: ".35rem", alignItems: "center" }}>
            <span style={{ ...statusStyle(pesanan.status) }}>
              <ShoppingBag size={14} /> {pesanan.status}
            </span>
            {payment?.status_pembayaran && (
              <span style={{ ...statusStyle(payment.status_pembayaran) }}>
                <CreditCard size={14} /> {payment.status_pembayaran}
              </span>
            )}
          </div>
          <div style={{ ...styles.muted, marginTop: ".35rem" }}>
            Nomor Pesanan: <b>{pesanan.nomor_pesanan}</b>
          </div>
        </div>

        <div style={styles.grid}>
          {/* Left */}
          <div style={styles.card}>
            <div style={styles.sectionTitle}><ShoppingBag size={20} /> Item Pesanan</div>
            <div style={styles.list}>
              {items.map((it) => (
                <div key={it.id_menu} style={styles.item}>
                  <div>
                    <div style={styles.itemName}>{it.nama_menu}</div>
                    <div style={styles.itemMeta}>
                      {it.jumlah} × {formatIDR(it.harga)}
                    </div>
                  </div>
                  <div style={styles.itemPrice}>
                    {formatIDR(Number(it.harga) * Number(it.jumlah))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "1rem" }}>
              <div style={styles.row}>
                <span style={styles.label}>Subtotal</span>
                <span style={styles.value}>{formatIDR(pesanan.total_harga)}</span>
              </div>
              <div style={styles.row}>
                <span style={styles.label}>PPN (10%)</span>
                <span style={styles.value}>{formatIDR(tax)}</span>
              </div>
              <div style={{ ...styles.row, borderBottom: "none", paddingTop: ".9rem" }}>
                <span style={{ ...styles.value, color: "#1f2937" }}>Total</span>
                <span style={{ ...styles.value, color: "#059669", fontSize: "1.15rem" }}>
                  {formatIDR(total)}
                </span>
              </div>
            </div>
          </div>

          {/* Right */}
          <div style={{ ...styles.card, ...styles.sideCard }}>
            <div style={styles.sectionTitle}><Wallet size={20} /> Pembayaran</div>

            {info && (
              <div style={{ ...styles.alert, ...styles.alertSuccess }}>
                <CheckCircle size={18} /> {info}
              </div>
            )}

            {!payment && (
              <div style={{ ...styles.muted, marginBottom: ".75rem" }}>
                Belum ada transaksi pembayaran untuk pesanan ini.
              </div>
            )}

            {payment && (
              <div style={{ marginBottom: ".75rem" }}>
                <div style={styles.row}>
                  <span style={styles.label}>Ref. Pembayaran</span>
                  <span style={styles.value} title={payment.referensi_pembayaran}>
                    {payment.referensi_pembayaran?.slice(0, 16)}…
                  </span>
                </div>
                {payment.payment_type && (
                  <div style={styles.row}>
                    <span style={styles.label}>Metode</span>
                    <span style={styles.value}>{payment.payment_type}</span>
                  </div>
                )}
                {payment.transaction_id && (
                  <div style={styles.row}>
                    <span style={styles.label}>Transaksi</span>
                    <span style={styles.value}>{payment.transaction_id}</span>
                  </div>
                )}
              </div>
            )}

            {/* Buttons */}
            {showContinue && (
              <button
                style={{
                  ...styles.btn,
                  ...styles.btnPrimary,
                  ...(hover.cont ? styles.btnPrimaryHover : {})
                }}
                onMouseEnter={() => setHover(h => ({ ...h, cont: true }))}
                onMouseLeave={() => setHover(h => ({ ...h, cont: false }))}
                onClick={handleContinuePayment}
              >
                <ExternalLink size={18} /> Lanjutkan Pembayaran
              </button>
            )}

            {showReinit && (
              <button
                style={{
                  ...styles.btn,
                  ...styles.btnOutline,
                  marginTop: showContinue ? ".6rem" : 0,
                  ...(hover.pay ? styles.btnOutlineHover : {})
                }}
                onMouseEnter={() => setHover(h => ({ ...h, pay: true }))}
                onMouseLeave={() => setHover(h => ({ ...h, pay: false }))}
                onClick={handleReinitiate}
                disabled={hover.paying}
              >
                <RefreshCw size={18} /> {hover.paying ? "Memproses..." : "Bayar Sekarang"}
              </button>
            )}

            {!showContinue && !showReinit && (
              <div style={{ ...styles.alert, ...styles.alertSuccess, marginTop: ".5rem" }}>
                <Shield size={18} /> Pembayaran telah dikonfirmasi.
              </div>
            )}

            <div style={{ ...styles.muted, marginTop: ".6rem", display: "flex", gap: ".35rem", alignItems: "center" }}>
              <Shield size={14} /> Transaksi aman lewat Midtrans.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
