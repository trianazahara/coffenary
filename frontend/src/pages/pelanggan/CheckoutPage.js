import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import { 
  CreditCard, 
  ShoppingBag, 
  Utensils, 
  Home, 
  MapPin, 
  Clock,
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  User,
  Building,
  Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/pelanggan/Header";

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    paddingTop: '70px'
  },
  main: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '2rem 1rem'
  },
  header: {
    marginBottom: '2rem'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  subtitle: {
    color: '#64748b',
    fontSize: '1rem'
  },
  checkoutContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '2rem',
    alignItems: 'start'
  },
  formSection: {
    backgroundColor: 'white',
    borderRadius: '1rem',
    padding: '2rem',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(226, 232, 240, 0.5)'
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  formGroup: {
    marginBottom: '1.5rem'
  },
  label: {
    display: 'block',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.5rem'
  },
  select: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.75rem',
    fontSize: '1rem',
    backgroundColor: 'white',
    transition: 'all 0.2s ease',
    outline: 'none'
  },
  selectFocus: {
    borderColor: '#10b981',
    boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)'
  },
  textarea: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.75rem',
    fontSize: '1rem',
    backgroundColor: 'white',
    transition: 'all 0.2s ease',
    outline: 'none',
    resize: 'vertical',
    minHeight: '80px',
    fontFamily: 'inherit'
  },
  textareaFocus: {
    borderColor: '#10b981',
    boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)'
  },
  tableGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: '0.75rem',
    marginTop: '0.5rem'
  },
  tableButton: {
    padding: '1rem 0.5rem',
    border: '2px solid #e5e7eb',
    borderRadius: '0.75rem',
    backgroundColor: 'white',
    color: '#374151',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.25rem'
  },
  tableButtonSelected: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
    color: '#059669',
    transform: 'scale(1.05)'
  },
  tableCapacity: {
    fontSize: '0.7rem',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem'
  },
  userInfo: {
    backgroundColor: '#f8fafc',
    borderRadius: '0.75rem',
    padding: '1rem',
    marginBottom: '1.5rem'
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem',
    color: '#64748b',
    fontSize: '0.9rem'
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: '1rem',
    padding: '2rem',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(226, 232, 240, 0.5)',
    position: 'sticky',
    top: '2rem'
  },
  orderItems: {
    marginBottom: '1.5rem'
  },
  orderItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 0',
    borderBottom: '1px solid #f1f5f9'
  },
  itemName: {
    color: '#374151',
    fontWeight: '500'
  },
  itemQty: {
    color: '#64748b',
    fontSize: '0.9rem'
  },
  itemPrice: {
    color: '#059669',
    fontWeight: '600'
  },
  priceBreakdown: {
    borderTop: '2px solid #e5e7eb',
    paddingTop: '1rem',
    marginBottom: '1.5rem'
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem'
  },
  priceLabel: {
    color: '#64748b'
  },
  priceValue: {
    color: '#374151',
    fontWeight: '500'
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '1rem',
    borderTop: '1px solid #e5e7eb',
    marginTop: '0.5rem'
  },
  totalLabel: {
    color: '#1e293b',
    fontWeight: '600',
    fontSize: '1.1rem'
  },
  totalValue: {
    color: '#059669',
    fontWeight: '700',
    fontSize: '1.3rem'
  },
  checkoutButton: {
    width: '100%',
    backgroundColor: '#10b981',
    color: 'white',
    padding: '1rem 1.5rem',
    borderRadius: '0.75rem',
    border: 'none',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem'
  },
  checkoutButtonHover: {
    backgroundColor: '#059669',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
  },
  checkoutButtonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
    transform: 'none'
  },
  backButton: {
    backgroundColor: 'transparent',
    color: '#64748b',
    padding: '0.75rem 1rem',
    borderRadius: '0.75rem',
    border: '1px solid #d1d5db',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem'
  },
  backButtonHover: {
    backgroundColor: '#f8fafc',
    color: '#374151'
  },
  loadingOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50
  },
  loadingContent: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '1rem',
    textAlign: 'center',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  },
  errorMessage: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    padding: '1rem',
    borderRadius: '0.75rem',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  successMessage: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#16a34a',
    padding: '1rem',
    borderRadius: '0.75rem',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  selectedTableInfo: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#059669',
    padding: '0.75rem 1rem',
    borderRadius: '0.75rem',
    marginTop: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem'
  }
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @media (max-width: 768px) {
    .checkout-container { grid-template-columns: 1fr !important; }
    .summary-card { position: static !important; }
    .main-padding { padding: 1rem !important; }
    .table-grid { grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)) !important; }
  }
  
  @media (max-width: 480px) {
    .form-section { padding: 1.5rem !important; }
    .summary-card { padding: 1.5rem !important; }
  }
`;
if (!document.querySelector('#checkout-styles')) {
  styleSheet.id = 'checkout-styles';
  document.head.appendChild(styleSheet);
}

const CheckoutPage = ({ onSuccess }) => {
  const { cartItems, subtotal, clearCart } = useContext(CartContext);
  const { user, selectedBranch } = useContext(AuthContext);
  const navigate = useNavigate();

  const [type, setType] = useState("bawa_pulang");
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [focusState, setFocusState] = useState({});
  const [hoverState, setHoverState] = useState({});

  const tax = subtotal * 0.1;
  const total = subtotal;

  useEffect(() => {
    if (type === "makan_di_tempat" && selectedBranch?.id_cabang) {
      axios
        .get(`http://localhost:5000/api/tempat-duduk/${selectedBranch.id_cabang}`)
        .then(res => {
          console.log('Data meja:', res.data);
          setTables(res.data);
        })
        .catch(err => {
          console.error('Error fetching tables:', err);
          setError("Gagal memuat data meja");
        });
    }
  }, [type, selectedBranch]);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // Validasi
      if (!user?.id_pengguna) {
        setError("Anda harus login untuk melanjutkan.");
        setLoading(false);
        return;
      }
      if (!selectedBranch?.id_cabang) {
        setError("Cabang belum dipilih.");
        setLoading(false);
        return;
      }
      if (type === "makan_di_tempat" && !selectedTable) {
        setError("Harap pilih meja untuk dine in");
        setLoading(false);
        return;
      }
      if (!cartItems?.length) {
        setError("Keranjang kosong");
        setLoading(false);
        return;
      }

      // Bentuk payload items sesuai backend
      const itemsPayload = cartItems.map(it => ({
        id_menu: it.id_menu,
        jumlah: Number(it.qty),
        harga: Number(it.harga),
        nama: it.nama_menu || it.nama || it.name || "Item"
      }));

      // 1) Buat pesanan
      const coRes = await axios.post("http://localhost:5000/api/checkout", {
        id_pengguna: user.id_pengguna,
        id_cabang: selectedBranch.id_cabang,
        tipe_pesanan: type,
        ...(type === "makan_di_tempat" && { id_meja: selectedTable }),
        items: cartItems.map(it => ({
          id_menu: it.id_menu,
          jumlah: it.qty,
          harga: it.harga,
          catatan: it.notes || it.note || null
        })),
        catatan: note
      });

      const { id_pesanan, nomorPesanan, total_harga } = coRes.data;

      // 2) Inisiasi pembayaran (perlu token Bearer – ambil dari AuthContext atau localStorage)
      const bearer =
        AuthContext.token ||
        localStorage.getItem("token") ||
        localStorage.getItem("authToken");

      const initRes = await axios.post(
        "http://localhost:5000/api/pembayaran/initiate",
        {
          id_pesanan,
          total_harga: Math.round(Number(total_harga)), // pastikan integer
          customer: {
            first_name: user?.nama_lengkap?.split(" ")?.[0] || "Pelanggan",
            last_name: (user?.nama_lengkap?.split(" ")?.slice(1) || []).join(" "),
            email: user?.email || "user@example.com",
            phone: user?.telepon || ""
          },
          items: itemsPayload
        },
        bearer ? { headers: { Authorization: `Bearer ${bearer}` } } : undefined
      );

      const snapToken = initRes.data?.snap?.token;
      if (!snapToken) {
        setError("Gagal mendapatkan token pembayaran.");
        setLoading(false);
        return;
      }

      // 3) Panggil Snap popup
      if (!window.snap || typeof window.snap.pay !== "function") {
        setError("Snap.js belum termuat. Muat ulang halaman lalu coba lagi.");
        setLoading(false);
        return;
      }

      window.snap.pay(snapToken, {
        onSuccess: function () {
          clearCart();
          setSuccess(`Checkout berhasil! Nomor Pesanan: ${nomorPesanan}`);
          navigate(`/pelanggan/status-pesanan/${id_pesanan}`);
        },
        onPending: function () {
          // pembayaran menunggu — tetap arahkan ke halaman status
          clearCart();
          navigate(`/pelanggan/status-pesanan/${id_pesanan}`);
        },
        onError: function (err) {
          console.error(err);
          setError("Pembayaran gagal. Silakan coba lagi.");
        },
        onClose: function () {
          // user menutup popup tanpa bayar — tidak mengubah cart
        }
      });
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Checkout/pembayaran gagal.");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.qty, 0);
  };

  const isFormValid = () => {
    if (cartItems.length === 0) return false;
    if (type === "makan_di_tempat" && !selectedTable) return false;
    return true;
  };

  if (cartItems.length === 0) {
    return (
      <div style={styles.container}>
        <Header />
        <main style={styles.main} className="main-padding">
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#64748b' }}>
            <ShoppingBag size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3 style={{ marginBottom: '0.5rem', color: '#374151' }}>Keranjang Kosong</h3>
            <p style={{ marginBottom: '2rem' }}>Tambahkan item ke keranjang sebelum checkout</p>
            <button
              style={styles.backButton}
              onClick={() => navigate('/pelanggan/menu')}
            >
              <ArrowLeft size={16} />
              Kembali ke Menu
            </button>
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
            ...(hoverState.back ? styles.backButtonHover : {})
          }}
          onClick={() => navigate('/pelanggan/cart')}
          onMouseEnter={() => setHoverState(prev => ({ ...prev, back: true }))}
          onMouseLeave={() => setHoverState(prev => ({ ...prev, back: false }))}
        >
          <ArrowLeft size={16} />
          Kembali ke Keranjang
        </button>

        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>
            <CreditCard size={32} />
            Checkout
          </h1>
          <p style={styles.subtitle}>
            Lengkapi informasi pesanan Anda
          </p>
        </div>

        <div style={styles.checkoutContainer} className="checkout-container">
          {/* Form Section */}
          <div style={styles.formSection}>
            {/* User Info */}
            <div style={styles.userInfo}>
              <div style={styles.infoRow}>
                <User size={16} />
                <span><strong>Pelanggan:</strong> {user?.nama_lengkap || 'Guest'}</span>
              </div>
              <div style={styles.infoRow}>
                <Building size={16} />
                <span><strong>Cabang:</strong> {selectedBranch?.nama_cabang || 'Tidak dipilih'}</span>
              </div>
              <div style={styles.infoRow}>
                <MapPin size={16} />
                <span><strong>Lokasi:</strong> {selectedBranch?.alamat || 'Tidak tersedia'}</span>
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div style={styles.errorMessage}>
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            {success && (
              <div style={styles.successMessage}>
                <CheckCircle size={20} />
                {success}
              </div>
            )}

            <h2 style={styles.sectionTitle}>
              <Utensils size={24} />
              Informasi Pesanan
            </h2>

            {/* Order Type */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Tipe Pesanan</label>
              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setSelectedTable(""); // Reset meja saat ganti tipe
                }}
                style={{
                  ...styles.select,
                  ...(focusState.type ? styles.selectFocus : {})
                }}
                onFocus={() => setFocusState(prev => ({ ...prev, type: true }))}
                onBlur={() => setFocusState(prev => ({ ...prev, type: false }))}
              >
                <option value="bawa_pulang">🛍️ Bawa Pulang (Takeaway)</option>
                <option value="makan_di_tempat">🍽️ Makan di Tempat (Dine In)</option>
              </select>
            </div>

            {/* Table Selection */}
            {type === "makan_di_tempat" && (
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Pilih Meja 
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'normal', marginLeft: '0.5rem' }}>
                    (Semua meja tersedia)
                  </span>
                </label>
                
                {tables.length === 0 ? (
                  <div style={{ 
                    color: '#64748b', 
                    textAlign: 'center', 
                    padding: '2rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '0.75rem'
                  }}>
                    <Clock size={24} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                    <div>Memuat data meja...</div>
                  </div>
                ) : (
                  <>
                    <div style={styles.tableGrid}>
                      {tables.map(table => {
                        const isSelected = selectedTable === table.id_meja;
                        
                        return (
                          <button
                            key={table.id_meja}
                            type="button"
                            style={{
                              ...styles.tableButton,
                              ...(isSelected ? styles.tableButtonSelected : {})
                            }}
                            onClick={() => setSelectedTable(table.id_meja)}
                          >
                            <div style={{ fontWeight: '700', fontSize: '1rem' }}>
                              {table.nomor_meja}
                            </div>
                            <div style={styles.tableCapacity}>
                              <Users size={10} />
                              {table.kapasitas}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    
                    {selectedTable && (
                      <div style={styles.selectedTableInfo}>
                        <CheckCircle size={16} />
                        Meja {tables.find(t => t.id_meja === selectedTable)?.nomor_meja} dipilih
                        (Kapasitas: {tables.find(t => t.id_meja === selectedTable)?.kapasitas} orang)
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

          

            {/* Security Notice */}
            <div style={{
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '0.75rem',
              padding: '1rem',
              marginTop: '2rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Shield size={18} color="#0369a1" />
                <span style={{ color: '#0369a1', fontWeight: '600' }}>Pembayaran Aman</span>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
                Pembayaran akan dilakukan di kasir. Data Anda dilindungi dan aman.
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div style={styles.summaryCard} className="summary-card">
            <h2 style={styles.sectionTitle}>
              <ShoppingBag size={24} />
              Ringkasan Pesanan
            </h2>

            {/* Order Items */}
            <div style={styles.orderItems}>
              {cartItems.map(item => (
                <div key={item.id_menu} style={styles.orderItem}>
                  <div>
                    <div style={styles.itemName}>{item.nama_menu}</div>
                    <div style={styles.itemQty}>{item.qty} x {formatPrice(item.harga)}</div>
                    {/* Tambahkan ini untuk tampilkan notes */}
                    {item.notes && (
                      <div style={{ 
                        fontSize: '0.8rem', 
                        color: '#64748b', 
                        fontStyle: 'italic',
                        marginTop: '0.25rem'
                      }}>
                        💬 {item.notes}
                      </div>
                    )}
                  </div>
                  <div style={styles.itemPrice}>
                    {formatPrice(item.harga * item.qty)}
                  </div>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div style={styles.priceBreakdown}>
              <div style={styles.priceRow}>
                <span style={styles.priceLabel}>Subtotal ({getTotalItems()} item)</span>
                <span style={styles.priceValue}>{formatPrice(subtotal)}</span>
              </div>
              <div style={styles.totalRow}>
                <span style={styles.totalLabel}>Total Pembayaran</span>
                <span style={styles.totalValue}>{formatPrice(total)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              style={{
                ...styles.checkoutButton,
                ...(hoverState.checkout ? styles.checkoutButtonHover : {}),
                ...(!isFormValid() ? styles.checkoutButtonDisabled : {})
              }}
              onClick={handleCheckout}
              disabled={loading || !isFormValid()}
              onMouseEnter={() => setHoverState(prev => ({ ...prev, checkout: true }))}
              onMouseLeave={() => setHoverState(prev => ({ ...prev, checkout: false }))}
            >
              {loading ? (
                <>
                  <Clock size={18} />
                  Memproses...
                </>
              ) : (
                <>
                  <CreditCard size={18} />
                  Lakukan Pembayaran
                </>
              )}
            </button>

            {/* Security Badge */}
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.8rem' }}>
                <Shield size={14} />
                Transaksi 100% Aman
              </div>
            </div>
          </div>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div style={styles.loadingOverlay}>
            <div style={styles.loadingContent}>
              <Clock size={48} style={{ color: '#10b981', marginBottom: '1rem' }} />
              <h3 style={{ marginBottom: '0.5rem', color: '#1e293b' }}>Memproses Pesanan</h3>
              <p style={{ color: '#64748b' }}>Harap tunggu sebentar...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CheckoutPage;