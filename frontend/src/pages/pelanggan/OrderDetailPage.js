import React, { useEffect, useState, useContext, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import Header from '../../components/pelanggan/Header';
import {
  ArrowLeft, Calendar, MapPin, CreditCard, Package, ChefHat,
  Clock, CheckCircle, XCircle, RefreshCw, Receipt, Loader2,
  Store, Users, FileText, QrCode, ExternalLink,
  ChevronRight, Shield, Truck, Coffee
} from 'lucide-react';

const styles = {
  container: { 
    minHeight: '100vh', 
    backgroundColor: '#f8fafc', 
    paddingTop: '72px'
  },
  main: { 
    maxWidth: '1000px', 
    margin: '0 auto', 
    padding: '2rem 1rem' 
  },
  backButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.25rem',
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '0.75rem',
    color: '#64748b',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginBottom: '1.5rem',
    textDecoration: 'none'
  },
  backButtonHover: {
    backgroundColor: '#f8fafc',
    borderColor: '#10b981',
    color: '#059669'
  },
  card: {
    background: '#fff', 
    borderRadius: '1.5rem', 
    padding: '2.5rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
    border: '1px solid rgba(226,232,240,0.5)',
    marginBottom: '1.5rem'
  },
  headerSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
    paddingBottom: '1.5rem',
    borderBottom: '2px solid #f1f5f9'
  },
  orderTitle: { 
    fontSize: '2rem', 
    fontWeight: 800, 
    color: '#1f2937',
    marginBottom: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  orderSubtitle: { 
    color: '#6b7280',
    fontSize: '1rem'
  },
  statusSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.75rem'
  },
  badge: {
    display: 'inline-flex', 
    alignItems: 'center', 
    gap: '0.5rem', 
    padding: '0.75rem 1.5rem',
    borderRadius: '2rem', 
    fontWeight: 700, 
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  grid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  metaCard: {
    backgroundColor: '#f8fafc',
    borderRadius: '1rem',
    padding: '1.5rem',
    border: '1px solid rgba(226,232,240,0.5)',
    transition: 'all 0.3s ease'
  },
  metaCardHover: {
    backgroundColor: 'white',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    transform: 'translateY(-2px)'
  },
  metaIcon: {
    width: '3rem',
    height: '3rem',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#059669',
    marginBottom: '1rem'
  },
  metaLabel: {
    color: '#6b7280',
    fontSize: '0.9rem',
    fontWeight: '600',
    marginBottom: '0.25rem'
  },
  metaValue: {
    color: '#1f2937',
    fontSize: '1.1rem',
    fontWeight: '700'
  },
  sectionTitle: { 
    fontSize: '1.5rem',
    fontWeight: 700, 
    margin: '0 0 1.5rem 0', 
    color: '#1f2937',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  itemsSection: {
    backgroundColor: '#f8fafc',
    borderRadius: '1rem',
    padding: '2rem',
    marginBottom: '2rem',
    border: '1px solid rgba(226,232,240,0.5)'
  },
  itemRow: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    padding: '1.25rem',
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    marginBottom: '0.75rem',
    border: '1px solid rgba(226,232,240,0.5)',
    transition: 'all 0.3s ease'
  },
  itemRowHover: {
    borderColor: 'rgba(16, 185, 129, 0.3)',
    transform: 'translateX(4px)'
  },
  itemRowLast: { 
    marginBottom: 0 
  },
  itemInfo: {
    flex: 1
  },
  itemName: {
    fontWeight: 600, 
    color: '#1f2937',
    fontSize: '1.1rem',
    marginBottom: '0.5rem'
  },
  itemDetails: {
    color: '#6b7280',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  itemNote: {
    color: '#8b5cf6',
    fontSize: '0.85rem',
    fontStyle: 'italic',
    marginTop: '0.5rem',
    padding: '0.5rem 0.75rem',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: '0.5rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  itemPrice: {
    fontWeight: 700,
    color: '#059669',
    fontSize: '1.2rem',
    textAlign: 'right'
  },
  totalSection: {
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: '1.5rem',
    backgroundColor: 'white',
    borderRadius: '1rem',
    border: '2px solid #10b981',
    marginTop: '1.5rem'
  },
  totalLabel: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#1f2937'
  },
  totalAmount: {
    fontSize: '1.75rem',
    fontWeight: 800,
    color: '#059669'
  },
  paymentSection: {
    backgroundColor: 'white',
    borderRadius: '1rem',
    padding: '2rem',
    border: '2px solid #f1f5f9',
    marginBottom: '1.5rem'
  },
  paymentHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.5rem'
  },
  paymentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  paymentField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  paymentLabel: {
    color: '#6b7280',
    fontSize: '0.9rem',
    fontWeight: '600'
  },
  paymentValue: {
    color: '#1f2937',
    fontSize: '1.1rem',
    fontWeight: '700'
  },
  actions: { 
    display: 'flex', 
    gap: '1rem', 
    flexWrap: 'wrap'
  },
  btn: {
    display: 'inline-flex', 
    alignItems: 'center', 
    gap: '0.5rem',
    padding: '1rem 1.5rem', 
    borderRadius: '1rem', 
    border: '2px solid #e2e8f0',
    background: '#fff', 
    color: '#64748b', 
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.95rem',
    transition: 'all 0.3s ease'
  },
  btnHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
  },
  btnPrimary: { 
    background: '#10b981', 
    color: '#fff', 
    borderColor: '#10b981' 
  },
  btnSecondary: {
    background: 'transparent',
    color: '#10b981',
    borderColor: '#10b981'
  },
  center: { 
    textAlign: 'center', 
    color: '#64748b', 
    padding: '4rem 1rem' 
  },
  loadingSpinner: {
    width: '48px',
    height: '48px',
    border: '3px solid #f3f4f6',
    borderTop: '3px solid #10b981',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 1.5rem'
  },
  noteBox: {
    backgroundColor: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '1rem',
    padding: '1.5rem',
    marginTop: '1.5rem',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem'
  },
  noteIcon: {
    color: '#0369a1',
    flexShrink: 0
  },
  noteText: {
    color: '#64748b',
    fontSize: '0.9rem',
    lineHeight: '1.5'
  }
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @media (max-width: 768px) {
    .header-section { flex-direction: column; gap: 1.5rem; }
    .status-section { align-items: stretch; }
    .grid { grid-template-columns: 1fr; }
    .payment-grid { grid-template-columns: 1fr; }
    .actions { flex-direction: column; }
    .main-padding { padding: 1rem !important; }
    .card { padding: 1.5rem !important; }
  }
  
  @media (max-width: 480px) {
    .order-title { font-size: 1.5rem !important; }
    .item-row { flex-direction: column; gap: 1rem; align-items: stretch; }
    .item-price { text-align: left; }
    .total-section { flex-direction: column; gap: 1rem; align-items: stretch; }
  }
`;
if (!document.querySelector('#order-detail-styles')) {
  styleSheet.id = 'order-detail-styles';
  document.head.appendChild(styleSheet);
}

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
    pending: { bg: 'rgba(251,191,36,.15)', color: '#d97706', icon: <Clock size={16}/> , label: 'Menunggu Pembayaran' },
    terkonfirmasi: { bg: 'rgba(59,130,246,.15)', color: '#2563eb', icon: <CheckCircle size={16}/>, label: 'Dikonfirmasi' },
    dalam_persiapan: { bg: 'rgba(168,85,247,.15)', color: '#7c3aed', icon: <ChefHat size={16}/>, label: 'Sedang Diproses' },
    siap: { bg: 'rgba(16,185,129,.15)', color: '#059669', icon: <Package size={16}/>, label: 'Siap Diambil' },
    selesai: { bg: 'rgba(34,197,94,.15)', color: '#16a34a', icon: <CheckCircle size={16}/>, label: 'Selesai' },
    dibatalkan: { bg: 'rgba(239,68,68,.15)', color: '#dc2626', icon: <XCircle size={16}/>, label: 'Dibatalkan' }
  };
  const cfg = map[status] || map.pending;
  return (
    <span style={{...styles.badge, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}20`}}>
      {cfg.icon}{cfg.label}
    </span>
  );
};

const PaymentStatusBadge = ({ status }) => {
  const map = {
    pending: { bg: 'rgba(251,191,36,.15)', color: '#d97706', icon: <Clock size={14}/>, label: 'Menunggu' },
    capture: { bg: 'rgba(34,197,94,.15)', color: '#16a34a', icon: <CheckCircle size={14}/>, label: 'Berhasil' },
    settlement: { bg: 'rgba(34,197,94,.15)', color: '#16a34a', icon: <CheckCircle size={14}/>, label: 'Settlement' },
    deny: { bg: 'rgba(239,68,68,.15)', color: '#dc2626', icon: <XCircle size={14}/>, label: 'Ditolak' },
    cancel: { bg: 'rgba(239,68,68,.15)', color: '#dc2626', icon: <XCircle size={14}/>, label: 'Dibatalkan' },
    expire: { bg: 'rgba(107,114,128,.15)', color: '#6b7280', icon: <Clock size={14}/>, label: 'Kadaluarsa' },
    failure: { bg: 'rgba(239,68,68,.15)', color: '#dc2626', icon: <XCircle size={14}/>, label: 'Gagal' }
  };
  const cfg = map[status] || map.pending;
  return (
    <span style={{...styles.badge, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}20`}}>
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
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [hoverStates, setHoverStates] = useState({});

  const canPay = useMemo(() => {
    if (!order) return false;
    const st = (payment?.status_pembayaran || '').toLowerCase();
    const unpaid = !st || ['pending','expire','deny','cancel','failure'].includes(st);
    return ['selesai','dibatalkan'].includes(order.status) ? false : unpaid;
  }, [order, payment]);

  useEffect(() => {
    fetchOrderDetail();
  }, [id_pesanan, token]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      setErr('');

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
  };

  const openPaymentUI = async (payInfo) => {
    if (payInfo?.snap_redirect_url) {
      window.open(payInfo.snap_redirect_url, '_blank');
      return;
    }
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

      if (payment && ['pending'].includes((payment.status_pembayaran || '').toLowerCase())) {
        await openPaymentUI(payment);
        return;
      }

      const { data } = await axios.post(
        `http://localhost:5000/api/pesanan/${order.id}/pay/recreate`,
        {}, { headers: { Authorization: `Bearer ${token}` } }
      );

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

  const updateHoverState = (key, value) => {
    setHoverStates(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <Header />
        <div style={styles.center}>
          <div style={styles.loadingSpinner} />
          <p style={{ fontSize: '1.1rem' }}>Memuat detail pesanan...</p>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div style={styles.container}>
        <Header />
        <main style={styles.main}>
          <div style={styles.card}>
            <button 
              style={{
                ...styles.backButton,
                ...(hoverStates.back && styles.backButtonHover)
              }}
              onClick={() => navigate(-1)}
              onMouseEnter={() => updateHoverState('back', true)}
              onMouseLeave={() => updateHoverState('back', false)}
            >
              <ArrowLeft size={16} />
              Kembali
            </button>
            <div style={styles.center}>
              <XCircle size={64} color="#ef4444" style={{ marginBottom: '1rem' }} />
              <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>Terjadi Kesalahan</h3>
              <p style={{ color: '#64748b', marginBottom: '2rem' }}>{err}</p>
              <button 
                onClick={() => navigate('/pelanggan/history')}
                style={{
                  ...styles.btn,
                  ...styles.btnPrimary
                }}
              >
                <Receipt size={16} />
                Lihat Riwayat Pesanan
              </button>
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
              <Receipt size={64} color="#94a3b8" style={{ marginBottom: '1rem' }} />
              <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>Pesanan Tidak Ditemukan</h3>
              <p style={{ color: '#64748b', marginBottom: '2rem' }}>Pesanan yang Anda cari tidak ditemukan dalam sistem.</p>
              <button 
                onClick={() => navigate('/pelanggan/history')}
                style={{
                  ...styles.btn,
                  ...styles.btnPrimary
                }}
              >
                <ArrowLeft size={16} />
                Kembali ke Riwayat
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Header />
      <main style={styles.main} className="main-padding">
        {/* Back Button */}
        <button 
          style={{
            ...styles.backButton,
            ...(hoverStates.back && styles.backButtonHover)
          }}
          onClick={() => navigate('/pelanggan/history')}
          onMouseEnter={() => updateHoverState('back', true)}
          onMouseLeave={() => updateHoverState('back', false)}
        >
          <ArrowLeft size={16} />
          Kembali ke Riwayat
        </button>

        {/* Main Order Card */}
        <div style={styles.card}>
          {/* Header Section */}
          <div style={styles.headerSection} className="header-section">
            <div>
              <h1 style={styles.orderTitle}>
                <Receipt size={32} />
                Pesanan #{order.nomor_pesanan}
              </h1>
              <p style={styles.orderSubtitle}>
                Detail lengkap pesanan Anda di Coffenary
              </p>
            </div>
            <div style={styles.statusSection}>
              <StatusBadge status={order.status} />
              <div style={styles.totalAmount}>
                {fmtIDR(order.total_harga)}
              </div>
            </div>
          </div>

          {/* Order Metadata */}
          <div style={styles.grid}>
            {[
              { icon: <Calendar size={20} />, label: 'Tanggal Pesanan', value: fmtDate(order.tanggal_dibuat) },
              { icon: <Store size={20} />, label: 'Cabang', value: order.cabang || '-' },
              { icon: <CreditCard size={20} />, label: 'Metode Pembayaran', value: (payment?.metode_pembayaran || order.metode_pembayaran || '-').toString().toUpperCase() },
              { icon: <Package size={20} />, label: 'Jumlah Item', value: `${(order.items || []).length} item` },
              ...(order.tipe_pesanan === 'makan_di_tempat' && order.nomor_meja ? [
                { icon: <Users size={20} />, label: 'Nomor Meja', value: order.nomor_meja }
              ] : []),
              { icon: <Truck size={20} />, label: 'Tipe Pesanan', value: order.tipe_pesanan === 'makan_di_tempat' ? 'Makan di Tempat' : 'Bawa Pulang' }
            ].map((meta, index) => (
              <div 
                key={index}
                style={{
                  ...styles.metaCard,
                  ...(hoverStates[`meta-${index}`] && styles.metaCardHover)
                }}
                onMouseEnter={() => updateHoverState(`meta-${index}`, true)}
                onMouseLeave={() => updateHoverState(`meta-${index}`, false)}
              >
                <div style={styles.metaIcon}>
                  {meta.icon}
                </div>
                <div style={styles.metaLabel}>{meta.label}</div>
                <div style={styles.metaValue}>{meta.value}</div>
              </div>
            ))}
          </div>

          {/* Items Section */}
          <h2 style={styles.sectionTitle}>
            <Coffee size={24} />
            Menu yang Dipesan
          </h2>
          <div style={styles.itemsSection}>
            {(order.items || []).map((item, index) => (
              <div 
                key={index}
                style={{
                  ...styles.itemRow,
                  ...(hoverStates[`item-${index}`] && styles.itemRowHover),
                  ...(index === (order.items.length - 1) && styles.itemRowLast)
                }}
                onMouseEnter={() => updateHoverState(`item-${index}`, true)}
                onMouseLeave={() => updateHoverState(`item-${index}`, false)}
              >
                <div style={styles.itemInfo}>
                  <div style={styles.itemName}>{item.nama_menu}</div>
                  <div style={styles.itemDetails}>
                    <span>{item.jumlah}x</span>
                    <span>•</span>
                    <span>{fmtIDR(item.harga_satuan)}</span>
                  </div>
                  {item.catatan && (
                    <div style={styles.itemNote}>
                      <FileText size={12} />
                      {item.catatan}
                    </div>
                  )}
                </div>
                <div style={styles.itemPrice}>
                  {fmtIDR(Number(item.harga_satuan) * Number(item.jumlah))}
                </div>
              </div>
            ))}
            <div style={styles.totalSection}>
              <div style={styles.totalLabel}>Total Pembayaran</div>
              <div style={styles.totalAmount}>{fmtIDR(order.total_harga)}</div>
            </div>
          </div>

          {/* Payment Section */}
          <h2 style={styles.sectionTitle}>
            <CreditCard size={24} />
            Informasi Pembayaran
          </h2>
          <div style={styles.paymentSection}>
            <div style={styles.paymentHeader}>
              <div>
                <div style={{...styles.metaLabel, marginBottom: '0.25rem'}}>Status Pembayaran</div>
                <PaymentStatusBadge status={payment?.status_pembayaran} />
              </div>
            </div>

            <div style={styles.paymentGrid} className="payment-grid">
              <div style={styles.paymentField}>
                <div style={styles.paymentLabel}>Metode Pembayaran</div>
                <div style={styles.paymentValue}>
                  {(payment?.metode_pembayaran || '-').toString().toUpperCase()}
                </div>
              </div>
              <div style={styles.paymentField}>
                <div style={styles.paymentLabel}>Jumlah Bayar</div>
                <div style={styles.paymentValue}>
                  {fmtIDR(payment?.jumlah_bayar || order.total_harga)}
                </div>
              </div>
              <div style={styles.paymentField}>
                <div style={styles.paymentLabel}>Waktu Pembayaran</div>
                <div style={styles.paymentValue}>
                  {fmtDate(payment?.tanggal_pembayaran)}
                </div>
              </div>
              <div style={styles.paymentField}>
                <div style={styles.paymentLabel}>Referensi</div>
                <div style={styles.paymentValue}>
                  {payment?.referensi_pembayaran || '-'}
                </div>
              </div>
            </div>

            <div style={styles.actions}>
              <button 
                style={{
                  ...styles.btn,
                  ...(hoverStates.checkStatus && styles.btnHover)
                }}
                onClick={() => checkLatestStatus()}
                onMouseEnter={() => updateHoverState('checkStatus', true)}
                onMouseLeave={() => updateHoverState('checkStatus', false)}
                disabled={checking}
              >
                {checking ? <Loader2 size={16} className="spin"/> : <RefreshCw size={16}/>}
                Perbarui Status
              </button>
              
              {canPay && (
                <button 
                  style={{
                    ...styles.btn,
                    ...styles.btnPrimary,
                    ...(hoverStates.payNow && styles.btnHover)
                  }}
                  onClick={handlePayNow}
                  onMouseEnter={() => updateHoverState('payNow', true)}
                  onMouseLeave={() => updateHoverState('payNow', false)}
                  disabled={payLoading}
                >
                  {payLoading ? <Loader2 size={16} className="spin"/> : <CreditCard size={16}/>}
                  Bayar Sekarang
                </button>
              )}
            </div>

            {/* Payment Note */}
            <div style={styles.noteBox}>
              <Shield size={20} style={styles.noteIcon} />
              <div style={styles.noteText}>
                <strong>Informasi Pembayaran:</strong> Untuk pembayaran QRIS, klik "Bayar Sekarang" akan membuka halaman pembayaran di tab baru. Pastikan pembayaran Anda selesai sebelum menutup halaman.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}