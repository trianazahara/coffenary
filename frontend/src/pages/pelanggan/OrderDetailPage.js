import React, { useEffect, useState, useContext, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import Header from '../../components/pelanggan/Header';
import {
  ArrowLeft, Calendar, MapPin, CreditCard, Package, ChefHat,
  Clock, CheckCircle, XCircle, RefreshCw, Receipt, Loader2
} from 'lucide-react';

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f8fafc', paddingTop: 70 },
  main: { maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' },
  card: {
    background: '#fff', borderRadius: '1rem', padding: '1.5rem',
    boxShadow: '0 4px 15px rgba(0,0,0,.08)', border: '1px solid rgba(226,232,240,.5)'
  },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  title: { fontSize: '1.6rem', fontWeight: 700, color: '#0f172a' },
  muted: { color: '#64748b' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1rem' },
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '.4rem .8rem',
    borderRadius: 999, fontWeight: 600, fontSize: '.8rem'
  },
  sectionTitle: { fontWeight: 700, margin: '1rem 0 .5rem', color: '#0f172a' },
  list: { background: '#f8fafc', borderRadius: '.75rem', padding: '1rem' },
  row: { display: 'flex', justifyContent: 'space-between', padding: '.5rem 0', borderBottom: '1px solid #e2e8f0' },
  rowLast: { borderBottom: 'none' },
  total: { display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', marginTop: '.5rem' },
  actions: { display: 'flex', gap: '.75rem', flexWrap: 'wrap', marginTop: '1rem' },
  btn: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '.6rem 1rem', borderRadius: '.6rem', border: '1px solid #e2e8f0',
    background: '#fff', color: '#334155', cursor: 'pointer'
  },
  btnPrimary: { background: '#10b981', color: '#fff', borderColor: '#10b981' },
  center: { textAlign: 'center', color: '#64748b', padding: '3rem .5rem' }
};

// inject Snap JS (sandbox). Ganti ke production bila sudah live.
const ensureSnapScript = (clientKey) =>
  new Promise((resolve) => {
    if (window.snap) return resolve();
    const s = document.createElement('script');
    s.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    s.setAttribute('data-client-key', clientKey || '');
    s.onload = resolve;
    document.body.appendChild(s);
  });

const fmtIDR = (v) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })
    .format(Number(v || 0));

const fmtDate = (d) => d ? new Date(d).toLocaleString('id-ID', {
  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
}) : '-';

const StatusBadge = ({ status }) => {
  const map = {
    pending: { bg: 'rgba(251,191,36,.12)', color: '#b45309', icon: <Clock size={14}/> , label: 'Menunggu' },
    terkonfirmasi: { bg: 'rgba(59,130,246,.12)', color: '#1d4ed8', icon: <Clock size={14}/>, label: 'Dikonfirmasi' },
    dalam_persiapan: { bg: 'rgba(168,85,247,.12)', color: '#7c3aed', icon: <ChefHat size={14}/>, label: 'Diproses' },
    siap: { bg: 'rgba(16,185,129,.12)', color: '#059669', icon: <Package size={14}/>, label: 'Siap' },
    selesai: { bg: 'rgba(34,197,94,.12)', color: '#16a34a', icon: <CheckCircle size={14}/>, label: 'Selesai' },
    dibatalkan: { bg: 'rgba(239,68,68,.12)', color: '#dc2626', icon: <XCircle size={14}/>, label: 'Dibatalkan' }
  };
  const cfg = map[status] || map.pending;
  return (
    <span style={{...styles.badge, background: cfg.bg, color: cfg.color}}>
      {cfg.icon}{cfg.label}
    </span>
  );
};

export default function OrderDetailPage() {
  const { id_pesanan } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [err, setErr] = useState('');
  const [order, setOrder] = useState(null);       // detail pesanan
  const [payment, setPayment] = useState(null);   // pembayaran terakhir

  const canPay = useMemo(() => {
    if (!order) return false;
    // boleh bayar jika pesanan belum selesai/dibatalkan dan pembayaran belum settlement/sukses
    const st = (payment?.status_pembayaran || '').toLowerCase();
    const unpaid = !st || ['pending','expire','gagal','cstore','snap'].includes(st);
    return ['selesai','dibatalkan'].includes(order.status) ? false : unpaid;
  }, [order, payment]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr('');

        // Ambil detail pesanan untuk PELANGGAN (backend: pastikan hanya boleh melihat pesanan miliknya)
        const { data } = await axios.get(
          `http://localhost:5000/api/pesanan/detail-pelanggan/${id_pesanan}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setOrder(data?.pesanan || data || null);
        setPayment(data?.pembayaran_terakhir || data?.pembayaran || null);
      } catch (e) {
        console.error(e);
        setErr(e.response?.data?.message || 'Gagal memuat detail pesanan');
      } finally {
        setLoading(false);
      }
    })();
  }, [id_pesanan, token]);

  const openPaymentUI = async (payInfo) => {
    // QRIS redirect lebih simpel → buka link
    if (payInfo?.snap_redirect_url) {
      window.open(payInfo.snap_redirect_url, '_blank');
      return;
    }
    // Snap popup (non QR) → butuh snap.js
    if (payInfo?.snap_token) {
      await ensureSnapScript(process.env.REACT_APP_MIDTRANS_CLIENT_KEY || '');
      if (window.snap) {
        window.snap.pay(payInfo.snap_token, {
          onSuccess: () => checkLatestStatus(true),
          onPending: () => checkLatestStatus(true),
          onClose: () => checkLatestStatus(false),
          onError: () => checkLatestStatus(false),
        });
      }
    }
  };

  const handlePayNow = async () => {
    try {
      setPayLoading(true);
      setErr('');

      // kalau pembayaran terakhir masih "pending" dan ada token/url → reuse
      if (payment && ['pending'].includes((payment.status_pembayaran || '').toLowerCase())) {
        await openPaymentUI(payment);
        return;
      }

      // (Re)create payment
      const { data } = await axios.post(
        `http://localhost:5000/api/pesanan/${order.id}/pay/recreate`,
        {}, { headers: { Authorization: `Bearer ${token}` } }
      );

      // backend return { pembayaran: {...} }
      setPayment(data?.pembayaran || data);

      await openPaymentUI(data?.pembayaran || data);
    } catch (e) {
      console.error(e);
      setErr(e.response?.data?.message || 'Gagal memulai pembayaran');
    } finally {
      setPayLoading(false);
    }
  };

  const checkLatestStatus = async (silent = false) => {
    try {
      if (!silent) setChecking(true);
      const { data } = await axios.get(
        `http://localhost:5000/api/pesanan/pembayaran/${order.id}/latest`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPayment(data || null);
    } catch (e) {
      if (!silent) {
        console.error(e);
        setErr(e.response?.data?.message || 'Gagal mengambil status pembayaran');
      }
    } finally {
      if (!silent) setChecking(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <Header />
        <div style={styles.center}><Loader2 className="spin" size={28}/> Memuat detail pesanan…</div>
      </div>
    );
  }

  if (err) {
    return (
      <div style={styles.container}>
        <Header />
        <main style={styles.main}>
          <div style={styles.card}>
            <div style={{...styles.headerRow, marginBottom: 16}}>
              <button style={styles.btn} onClick={() => navigate(-1)}><ArrowLeft size={16}/> Kembali</button>
            </div>
            <div style={styles.center}>
              <XCircle size={46} color="#ef4444" style={{marginBottom: 12}} />
              {err}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={styles.container}>
        <Header />
        <main style={styles.main}>
          <div style={styles.card}>
            <div style={styles.center}>
              <Receipt size={46} style={{marginBottom: 12}} />
              Pesanan tidak ditemukan.
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Header />
      <main style={styles.main}>
        <div style={styles.card}>
          {/* Header */}
          <div style={styles.headerRow}>
            <div>
              <div style={styles.title}>Detail Pesanan #{order.nomor_pesanan}</div>
              <div style={styles.muted}>ID Pesanan: {order.id}</div>
            </div>
            <StatusBadge status={order.status} />
          </div>

          {/* meta */}
          <div style={styles.grid}>
            <div className="meta">
              <div style={styles.muted}><Calendar size={14}/> Tanggal</div>
              <div><strong>{fmtDate(order.tanggal_dibuat)}</strong></div>
            </div>
            <div className="meta">
              <div style={styles.muted}><MapPin size={14}/> Cabang</div>
              <div><strong>{order.cabang || '-'}</strong></div>
            </div>
            <div className="meta">
              <div style={styles.muted}><CreditCard size={14}/> Metode</div>
              <div><strong>{(payment?.metode_pembayaran || order.metode_pembayaran || '-').toString().toUpperCase()}</strong></div>
            </div>
            <div className="meta">
              <div style={styles.muted}><Package size={14}/> Item</div>
              <div><strong>{(order.items || []).length} item</strong></div>
            </div>
          </div>

          {/* Items */}
          <div style={styles.sectionTitle}>Menu Dipesan</div>
          <div style={styles.list}>
            {(order.items || []).map((it, idx) => (
              <div key={idx} style={{...styles.row, ...(idx === (order.items.length - 1) ? styles.rowLast : {})}}>
                <div>
                  <div style={{fontWeight: 600, color: '#0f172a'}}>{it.nama_menu}</div>
                  <div style={styles.muted}>{it.jumlah}x • {fmtIDR(it.harga_satuan)}</div>
                </div>
                <div style={{fontWeight: 700}}>{fmtIDR(Number(it.harga_satuan) * Number(it.jumlah))}</div>
              </div>
            ))}
            <div style={styles.total}>
              <div>Total</div>
              <div>{fmtIDR(order.total_harga)}</div>
            </div>
          </div>

          {/* Payment box */}
          <div style={styles.sectionTitle}>Pembayaran Terakhir</div>
          <div style={{...styles.list, background:'#fff', border:'1px dashed #e2e8f0'}}>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:12}}>
              <div><span style={styles.muted}>Status</span><br/><strong>{(payment?.status_pembayaran || '-').toUpperCase()}</strong></div>
              <div><span style={styles.muted}>Tipe</span><br/><strong>{(payment?.payment_type || payment?.metode_pembayaran || '-').toUpperCase()}</strong></div>
              <div><span style={styles.muted}>Jumlah</span><br/><strong>{fmtIDR(payment?.jumlah_bayar || order.total_harga)}</strong></div>
              <div><span style={styles.muted}>Waktu</span><br/><strong>{fmtDate(payment?.tanggal_pembayaran)}</strong></div>
              <div><span style={styles.muted}>Ref</span><br/><strong>{payment?.referensi_pembayaran || '-'}</strong></div>
            </div>

            <div style={styles.actions}>
              <button className="btn" style={styles.btn} onClick={() => navigate('/pelanggan/history')}>
                <ArrowLeft size={16}/> Riwayat
              </button>
              <button className="btn" style={styles.btn} onClick={() => checkLatestStatus()}>
                {checking ? <Loader2 size={16} className="spin"/> : <RefreshCw size={16}/>} Cek Status
              </button>
              {canPay && (
                <button className="btn" style={{...styles.btn, ...styles.btnPrimary}} onClick={handlePayNow} disabled={payLoading}>
                  {payLoading ? <Loader2 size={16} className="spin"/> : <CreditCard size={16}/>} Bayar Sekarang
                </button>
              )}
            </div>
          </div>

          <div style={{marginTop:12, fontSize:12, color:'#94a3b8'}}>
            * Jika Anda memilih QRIS, klik “Bayar Sekarang” akan membuka halaman QR di tab baru.
          </div>
        </div>

        <div style={{textAlign:'center', marginTop:16}}>
          <Link to="/pelanggan/order-history" style={{textDecoration:'none', color:'#10b981'}}>← Kembali ke Riwayat Pesanan</Link>
        </div>
      </main>
    </div>
  );
}
