// src/pages/pelanggan/OrderHistoryPage.js
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import Header from '../../components/pelanggan/Header';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ChefHat,
  Package,
  Eye,
  RefreshCw,
  Calendar,
  Filter,
  Search,
  MapPin,
  CreditCard,
  Receipt
} from 'lucide-react';

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    paddingTop: '70px'
  },
  main: {
    maxWidth: '1200px',
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
    marginBottom: '0.5rem'
  },
  subtitle: {
    color: '#64748b',
    fontSize: '1rem'
  },
  filterSection: {
    backgroundColor: 'white',
    borderRadius: '1rem',
    padding: '1.5rem',
    marginBottom: '2rem',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(226, 232, 240, 0.5)'
  },
  filterHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1e293b'
  },
  filterControls: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  searchContainer: {
    position: 'relative',
    flex: '1',
    minWidth: '250px'
  },
  searchInput: {
    width: '100%',
    padding: '0.75rem 1rem 0.75rem 2.5rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.75rem',
    fontSize: '0.95rem',
    backgroundColor: '#f8fafc',
    transition: 'all 0.2s ease',
    outline: 'none'
  },
  searchInputFocus: {
    borderColor: '#10b981',
    backgroundColor: '#ffffff',
    boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)'
  },
  searchIcon: {
    position: 'absolute',
    left: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94a3b8',
    width: '1.1rem',
    height: '1.1rem'
  },
  statusFilters: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap'
  },
  statusButton: {
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    border: '1px solid #e2e8f0',
    backgroundColor: 'white',
    color: '#64748b',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  statusButtonActive: {
    backgroundColor: '#10b981',
    color: 'white',
    borderColor: '#10b981'
  },
  orderList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(226, 232, 240, 0.5)',
    transition: 'all 0.3s ease'
  },
  orderCardHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem'
  },
  orderInfo: {
    flex: 1
  },
  orderNumber: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '0.25rem'
  },
  orderDate: {
    color: '#64748b',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  orderLocation: {
    color: '#64748b',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '0.25rem'
  },
  statusBadge: {
    padding: '0.5rem 1rem',
    borderRadius: '1rem',
    fontSize: '0.8rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  statusPending: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    color: '#d97706'
  },
  statusConfirmed: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    color: '#2563eb'
  },
  statusPreparing: {
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    color: '#7c3aed'
  },
  statusReady: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    color: '#059669'
  },
  statusCompleted: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    color: '#16a34a'
  },
  statusCancelled: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#dc2626'
  },
  orderDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1rem'
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#64748b',
    fontSize: '0.9rem'
  },
  detailIcon: {
    color: '#94a3b8',
    width: '1rem',
    height: '1rem'
  },
  itemsList: {
    backgroundColor: '#f8fafc',
    borderRadius: '0.75rem',
    padding: '1rem',
    marginBottom: '1rem'
  },
  itemsHeader: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#64748b',
    marginBottom: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  menuItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0',
    borderBottom: '1px solid #e2e8f0'
  },
  menuItemLast: {
    borderBottom: 'none'
  },
  menuItemInfo: {
    flex: 1
  },
  menuItemName: {
    fontWeight: '500',
    color: '#1e293b',
    fontSize: '0.9rem'
  },
  menuItemDetails: {
    color: '#64748b',
    fontSize: '0.8rem',
    marginTop: '0.25rem'
  },
  menuItemPrice: {
    fontWeight: '600',
    color: '#059669'
  },
  orderFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '1rem',
    borderTop: '1px solid #e2e8f0'
  },
  totalPrice: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#1e293b'
  },
  orderActions: {
    display: 'flex',
    gap: '0.75rem'
  },
  actionButton: {
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    border: '1px solid #e2e8f0',
    backgroundColor: 'white',
    color: '#64748b',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  actionButtonPrimary: {
    backgroundColor: '#10b981',
    color: 'white',
    borderColor: '#10b981'
  },
  actionButtonHover: {
    backgroundColor: '#f1f5f9',
    borderColor: '#94a3b8'
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    color: '#64748b'
  },
  loadingState: {
    textAlign: 'center',
    padding: '3rem',
    color: '#64748b'
  }
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @media (max-width: 768px) {
    .filter-controls { flex-direction: column; align-items: stretch; }
    .order-header { flex-direction: column; gap: 1rem; align-items: stretch; }
    .order-details { grid-template-columns: 1fr; }
    .order-footer { flex-direction: column; gap: 1rem; align-items: stretch; }
    .order-actions { justify-content: center; }
    .main-padding { padding: 1rem !important; }
  }
  
  @media (max-width: 480px) {
    .filter-section { padding: 1rem !important; }
    .order-card { padding: 1rem !important; }
    .status-filters { justify-content: center; }
  }
`;
if (!document.querySelector('#history-styles')) {
  styleSheet.id = 'history-styles';
  document.head.appendChild(styleSheet);
}

const OrderHistoryPage = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('semua');
  const [searchFocus, setSearchFocus] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  const statusOptions = [
    { id: 'semua', label: 'Semua', icon: <Filter size={16} /> },
    { id: 'pending', label: 'Menunggu', icon: <Clock size={16} /> },
    { id: 'terkonfirmasi', label: 'Dikonfirmasi', icon: <CheckCircle size={16} /> },
    { id: 'dalam_persiapan', label: 'Diproses', icon: <ChefHat size={16} /> },
    { id: 'siap', label: 'Siap', icon: <Package size={16} /> },
    { id: 'selesai', label: 'Selesai', icon: <CheckCircle size={16} /> },
    { id: 'dibatalkan', label: 'Dibatalkan', icon: <XCircle size={16} /> }
  ];

  useEffect(() => {
    fetchOrderHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, searchTerm, selectedStatus]);

  const fetchOrderHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get('http://localhost:5000/api/pesanan/history', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // backend sudah memberi: id, nomor_pesanan, tanggal_dibuat, status, total_harga, tipe_pesanan, cabang, metode_pembayaran, items[]
      setOrders(res.data || []);
    } catch (err) {
      console.error('Error fetching order history:', err);
      setError(err.response?.data?.message || 'Gagal memuat riwayat pesanan');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    if (selectedStatus !== 'semua') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        (order.nomor_pesanan || '').toLowerCase().includes(q) ||
        (order.cabang || '').toLowerCase().includes(q) ||
        (order.items || []).some(item => 
          (item.nama_menu || '').toLowerCase().includes(q)
        )
      );
    }

    setFilteredOrders(filtered);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { style: styles.statusPending, icon: <Clock size={14} />, label: 'Menunggu' },
      terkonfirmasi: { style: styles.statusConfirmed, icon: <AlertCircle size={14} />, label: 'Dikonfirmasi' },
      dalam_persiapan: { style: styles.statusPreparing, icon: <ChefHat size={14} />, label: 'Diproses' },
      siap: { style: styles.statusReady, icon: <Package size={14} />, label: 'Siap' },
      selesai: { style: styles.statusCompleted, icon: <CheckCircle size={14} />, label: 'Selesai' },
      dibatalkan: { style: styles.statusCancelled, icon: <XCircle size={14} />, label: 'Dibatalkan' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <div style={{ ...styles.statusBadge, ...config.style }}>
        {config.icon}
        {config.label}
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(Number(price || 0));
  };

  const handleViewDetail = (orderId) => {
    navigate(`/pelanggan/status-pesanan/${orderId}`);
  };

  const handleReorder = (order) => {
    // Sesuaikan dengan struktur CartContext (array of items, key: cart_pelanggan)
    const itemsForCart = (order.items || []).map(it => ({
      id_menu: it.id_menu,
      nama_menu: it.nama_menu,
      harga: Number(it.harga_satuan || 0),
      qty: Number(it.jumlah || 0),
    })).filter(x => x.qty > 0);

    try {
      localStorage.setItem('cart_pelanggan', JSON.stringify(itemsForCart));
    } catch {}
    navigate('/pelanggan/cart');
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <Header />
        <div style={styles.loadingState}>
          <Clock size={48} style={{ color: '#10b981', marginBottom: '1rem' }} />
          <p>Memuat riwayat pesanan...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Header />
      
      <main style={styles.main} className="main-padding">
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Riwayat Pesanan</h1>
          <p style={styles.subtitle}>
            Lihat semua pesanan Anda dan status terkininya
          </p>
        </div>

        {/* Filter Section */}
        <div style={styles.filterSection} className="filter-section">
          <div style={styles.filterHeader}>
            <Filter size={20} />
            Filter & Pencarian
          </div>

          <div style={styles.filterControls} className="filter-controls">
            {/* Search */}
            <div style={styles.searchContainer}>
              <Search style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Cari nomor pesanan, cabang, atau menu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  ...styles.searchInput,
                  ...(searchFocus ? styles.searchInputFocus : {})
                }}
                onFocus={() => setSearchFocus(true)}
                onBlur={() => setSearchFocus(false)}
              />
            </div>

            {/* Status Filters */}
            <div style={styles.statusFilters} className="status-filters">
              {statusOptions.map(status => (
                <button
                  key={status.id}
                  style={{
                    ...styles.statusButton,
                    ...(selectedStatus === status.id ? styles.statusButtonActive : {})
                  }}
                  onClick={() => setSelectedStatus(status.id)}
                >
                  {status.icon}
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Order List */}
        {error ? (
          <div style={styles.emptyState}>
            <XCircle size={48} style={{ color: '#ef4444', marginBottom: '1rem' }} />
            <p>{error}</p>
            <button onClick={fetchOrderHistory} style={styles.actionButton}>
              Coba Lagi
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={styles.emptyState}>
            <Receipt size={48} style={{ color: '#94a3b8', marginBottom: '1rem' }} />
            <p>Tidak ada pesanan ditemukan</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
              {selectedStatus !== 'semua' || searchTerm 
                ? 'Coba ubah filter atau kata kunci pencarian'
                : 'Mulai pesan menu favorit Anda'
              }
            </p>
          </div>
        ) : (
          <div style={styles.orderList}>
            {filteredOrders.map((order, index) => (
              <div
                key={order.id}
                style={{
                  ...styles.orderCard,
                  ...(hoveredCard === index ? styles.orderCardHover : {})
                }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Order Header */}
                <div style={styles.orderHeader} className="order-header">
                  <div style={styles.orderInfo}>
                    <div style={styles.orderNumber}>#{order.nomor_pesanan}</div>
                    <div style={styles.orderDate}>
                      <Calendar size={14} />
                      {formatDate(order.tanggal_dibuat)}
                    </div>
                    <div style={styles.orderLocation}>
                      <MapPin size={14} />
                      {(order.cabang || '-')} • {order.tipe_pesanan === 'makan_di_tempat' ? 'Makan di tempat' : 'Bawa pulang'}
                    </div>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                {/* Order Details */}
                <div style={styles.orderDetails} className="order-details">
                  <div style={styles.detailItem}>
                    <CreditCard style={styles.detailIcon} />
                    {(order.metode_pembayaran || '-').toString().toUpperCase()}
                  </div>
                  <div style={styles.detailItem}>
                    <Package style={styles.detailIcon} />
                    {(order.items || []).length} item
                  </div>
                </div>

                {/* Items List */}
                <div style={styles.itemsList}>
                  <div style={styles.itemsHeader}>
                    <ChefHat size={16} />
                    Menu yang dipesan
                  </div>
                  {(order.items || []).map((item, itemIndex) => (
                    <div 
                      key={itemIndex} 
                      style={{
                        ...styles.menuItem,
                        ...(itemIndex === (order.items || []).length - 1 ? styles.menuItemLast : {})
                      }}
                    >
                      <div style={styles.menuItemInfo}>
                        <div style={styles.menuItemName}>{item.nama_menu}</div>
                        <div style={styles.menuItemDetails}>
                          {item.jumlah}x • {formatPrice(item.harga_satuan)}
                        </div>
                      </div>
                      <div style={styles.menuItemPrice}>
                        {formatPrice(Number(item.harga_satuan || 0) * Number(item.jumlah || 0))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div style={styles.orderFooter} className="order-footer">
                  <div style={styles.totalPrice}>
                    Total: {formatPrice(order.total_harga)}
                  </div>
                  <div style={styles.orderActions} className="order-actions">
                    <button
                      style={styles.actionButton}
                      onClick={() => handleViewDetail(order.id)}
                    >
                      <Eye size={16} />
                      Detail
                    </button>
                    {order.status === 'selesai' && (
                      <button
                        style={{
                          ...styles.actionButton,
                          ...styles.actionButtonPrimary
                        }}
                        onClick={() => handleReorder(order)}
                      >
                        <RefreshCw size={16} />
                        Pesan Lagi
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default OrderHistoryPage;
