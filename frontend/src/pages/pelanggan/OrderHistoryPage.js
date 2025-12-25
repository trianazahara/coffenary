import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import Header from '../../components/pelanggan/Header';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  ChefHat,
  Package,
  Eye,
  RefreshCw,
  Calendar,
  Filter,
  MapPin,
  CreditCard,
  Receipt,
  ArrowRight,
  Download,
  ChevronDown,
  ChevronUp,
  Store,
  User
} from 'lucide-react';

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    paddingTop: '72px'
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem'
  },
  header: {
    marginBottom: '2rem',
    textAlign: 'center'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '0.75rem',
    letterSpacing: '-0.025em'
  },
  subtitle: {
    color: '#64748b',
    fontSize: '1.1rem',
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: '1.6'
  },
  filterSection: {
    backgroundColor: 'white',
    borderRadius: '1.5rem',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(226, 232, 240, 0.5)',
    backdropFilter: 'blur(10px)'
  },
  filterHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  filterTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  filterStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    color: '#64748b',
    fontSize: '0.9rem'
  },
  filterControls: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: '1.5rem',
    alignItems: 'center'
  },
  statusFilters: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap'
  },
  statusButton: {
    padding: '0.75rem 1.25rem',
    borderRadius: '1rem',
    border: '2px solid #f1f5f9',
    backgroundColor: 'white',
    color: '#64748b',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  statusButtonActive: {
    backgroundColor: '#10b981',
    color: 'white',
    borderColor: '#10b981',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
  },
  orderList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: '1.5rem',
    padding: '2rem',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(226, 232, 240, 0.5)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden'
  },
  orderCardHover: {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)'
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem',
    gap: '1rem'
  },
  orderMainInfo: {
    flex: 1
  },
  orderNumber: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  orderMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    flexWrap: 'wrap'
  },
  orderMetaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#64748b',
    fontSize: '0.9rem',
    fontWeight: '500'
  },
  statusSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.75rem'
  },
  statusBadge: {
    padding: '0.75rem 1.5rem',
    borderRadius: '2rem',
    fontSize: '0.85rem',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  statusPending: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    color: '#d97706',
    border: '1px solid rgba(251, 191, 36, 0.3)'
  },
  statusConfirmed: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    color: '#2563eb',
    border: '1px solid rgba(59, 130, 246, 0.3)'
  },
  statusPreparing: {
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    color: '#7c3aed',
    border: '1px solid rgba(168, 85, 247, 0.3)'
  },
  statusReady: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    color: '#059669',
    border: '1px solid rgba(16, 185, 129, 0.3)'
  },
  statusCompleted: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    color: '#16a34a',
    border: '1px solid rgba(34, 197, 94, 0.3)'
  },
  statusCancelled: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#dc2626',
    border: '1px solid rgba(239, 68, 68, 0.3)'
  },
  totalAmount: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#059669'
  },
  orderDetails: {
    backgroundColor: '#f8fafc',
    borderRadius: '1rem',
    padding: '1.5rem',
    marginBottom: '1.5rem'
  },
  detailsHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
    cursor: 'pointer'
  },
  detailsTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  itemsGrid: {
    display: 'grid',
    gap: '1rem'
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem',
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    border: '1px solid rgba(226, 232, 240, 0.5)',
    transition: 'all 0.3s ease'
  },
  menuItemHover: {
    borderColor: 'rgba(16, 185, 129, 0.3)',
    transform: 'translateX(4px)'
  },
  menuItemInfo: {
    flex: 1
  },
  menuItemName: {
    fontWeight: '600',
    color: '#1e293b',
    fontSize: '1rem',
    marginBottom: '0.25rem'
  },
  menuItemDetails: {
    color: '#64748b',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  menuItemPrice: {
    fontWeight: '700',
    color: '#059669',
    fontSize: '1.1rem'
  },
  orderFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '1.5rem',
    borderTop: '2px solid #f1f5f9'
  },
  orderActions: {
    display: 'flex',
    gap: '1rem'
  },
  actionButton: {
    padding: '0.875rem 1.5rem',
    borderRadius: '1rem',
    border: '2px solid #e2e8f0',
    backgroundColor: 'white',
    color: '#64748b',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
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
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    backgroundColor: 'white',
    borderRadius: '1.5rem',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1.5rem',
    opacity: 0.5
  },
  loadingState: {
    textAlign: 'center',
    padding: '4rem 2rem'
  },
  loadingSpinner: {
    width: '48px',
    height: '48px',
    border: '3px solid #f3f4f6',
    borderTop: '3px solid #10b981',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 1.5rem'
  }
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @media (max-width: 768px) {
    .filter-controls { grid-template-columns: 1fr !important; gap: 1rem; }
    .order-header { flex-direction: column; align-items: stretch; }
    .order-meta { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
    .status-section { align-items: stretch; }
    .order-footer { flex-direction: column; gap: 1.5rem; align-items: stretch; }
    .order-actions { justify-content: center; }
    .main-padding { padding: 1rem !important; }
    .filter-header { flex-direction: column; align-items: stretch; }
  }
  
  @media (max-width: 480px) {
    .filter-section { padding: 1.5rem !important; }
    .order-card { padding: 1.5rem !important; }
    .status-filters { justify-content: center; }
    .order-actions { flex-direction: column; }
    .title { font-size: 2rem !important; }
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
  const [selectedStatus, setSelectedStatus] = useState('semua');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [hoveredAction, setHoveredAction] = useState({});

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
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, selectedStatus]);

  const fetchOrderHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get('http://localhost:5000/api/pesanan/history', {
        headers: { Authorization: `Bearer ${token}` }
      });

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

    setFilteredOrders(filtered);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { style: styles.statusPending, icon: <Clock size={14} />, label: 'Menunggu Konfirmasi' },
      terkonfirmasi: { style: styles.statusConfirmed, icon: <CheckCircle size={14} />, label: 'Dikonfirmasi' },
      dalam_persiapan: { style: styles.statusPreparing, icon: <ChefHat size={14} />, label: 'Sedang Diproses' },
      siap: { style: styles.statusReady, icon: <Package size={14} />, label: 'Siap Diambil' },
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
      month: 'short',
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

  const toggleOrderDetails = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <Header />
        <div style={styles.loadingState}>
          <div style={styles.loadingSpinner} />
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Memuat riwayat pesanan...</p>
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
            Kelola dan pantau semua pesanan Anda di Coffenary
          </p>
        </div>

        {/* Filter Section */}
        <div style={styles.filterSection}>
          <div style={styles.filterHeader}>
            <div style={styles.filterTitle}>
              <Receipt size={24} />
              Filter Pesanan
            </div>
            <div style={styles.filterStats}>
              <span>{filteredOrders.length} pesanan ditemukan</span>
            </div>
          </div>

          <div style={styles.filterControls} className="filter-controls">
            <div style={styles.statusFilters}>
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
            <div style={styles.emptyIcon}>📝</div>
            <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>Terjadi Kesalahan</h3>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>{error}</p>
            <button 
              onClick={fetchOrderHistory}
              style={{
                ...styles.actionButton,
                ...styles.actionButtonPrimary
              }}
            >
              <RefreshCw size={16} />
              Muat Ulang
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📦</div>
            <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>Tidak Ada Pesanan</h3>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>
              {selectedStatus !== 'semua' 
                ? 'Coba ubah filter atau kata kunci pencarian'
                : 'Mulai pesan menu favorit Anda untuk melihat riwayat di sini'
              }
            </p>
            <button 
              onClick={() => navigate('/pelanggan/menu')}
              style={{
                ...styles.actionButton,
                ...styles.actionButtonPrimary
              }}
            >
              <ArrowRight size={16} />
              Pesan Sekarang
            </button>
          </div>
        ) : (
          <div style={styles.orderList}>
            {filteredOrders.map((order, index) => {
              const isExpanded = expandedOrders.has(order.id);
              
              return (
                <div
                  key={order.id}
                  style={{
                    ...styles.orderCard,
                    ...(hoveredCard === index && styles.orderCardHover)
                  }}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Order Header */}
                  <div style={styles.orderHeader} className="order-header">
                    <div style={styles.orderMainInfo}>
                      <div style={styles.orderNumber}>
                        <Receipt size={20} />
                        #{order.nomor_pesanan}
                      </div>
                      <div style={styles.orderMeta}>
                        <div style={styles.orderMetaItem}>
                          <Calendar size={16} />
                          {formatDate(order.tanggal_dibuat)}
                        </div>
                        <div style={styles.orderMetaItem}>
                          <Store size={16} />
                          {order.cabang || '-'}
                        </div>
                        <div style={styles.orderMetaItem}>
                          <User size={16} />
                          {order.tipe_pesanan === 'makan_di_tempat' ? 'Makan di Tempat' : 'Bawa Pulang'}
                        </div>
                        <div style={styles.orderMetaItem}>
                          <CreditCard size={16} />
                          {(order.metode_pembayaran || '-').toString().toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <div style={styles.statusSection}>
                      {getStatusBadge(order.status)}
                      <div style={styles.totalAmount}>
                        {formatPrice(order.total_harga)}
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div style={styles.orderDetails}>
                    <div 
                      style={styles.detailsHeader}
                      onClick={() => toggleOrderDetails(order.id)}
                    >
                      <div style={styles.detailsTitle}>
                        <Package size={18} />
                        Detail Pesanan ({(order.items || []).length} item)
                      </div>
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                    
                    {isExpanded && (
                      <div style={styles.itemsGrid}>
                        {(order.items || []).map((item, itemIndex) => (
                          <div 
                            key={itemIndex}
                            style={{
                              ...styles.menuItem,
                              ...(hoveredItem === `${order.id}-${itemIndex}` && styles.menuItemHover)
                            }}
                            onMouseEnter={() => setHoveredItem(`${order.id}-${itemIndex}`)}
                            onMouseLeave={() => setHoveredItem(null)}
                          >
                            <div style={styles.menuItemInfo}>
                              <div style={styles.menuItemName}>{item.nama_menu}</div>
                              <div style={styles.menuItemDetails}>
                                <span>{item.jumlah}x</span>
                                <span>•</span>
                                <span>{formatPrice(item.harga_satuan)}</span>
                              </div>
                            </div>
                            <div style={styles.menuItemPrice}>
                              {formatPrice(Number(item.harga_satuan || 0) * Number(item.jumlah || 0))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Order Footer */}
                  <div style={styles.orderFooter} className="order-footer">
                    <div style={styles.orderActions} className="order-actions">
                      <button
                        style={{
                          ...styles.actionButton,
                          ...(hoveredAction[`detail-${order.id}`] && styles.actionButtonHover)
                        }}
                        onClick={() => handleViewDetail(order.id)}
                        onMouseEnter={() => setHoveredAction(prev => ({ ...prev, [`detail-${order.id}`]: true }))}
                        onMouseLeave={() => setHoveredAction(prev => ({ ...prev, [`detail-${order.id}`]: false }))}
                      >
                        <Eye size={16} />
                        Lihat Detail
                      </button>
                      
                      {order.status === 'selesai' && (
                        <button
                          style={{
                            ...styles.actionButton,
                            ...styles.actionButtonPrimary,
                            ...(hoveredAction[`reorder-${order.id}`] && styles.actionButtonHover)
                          }}
                          onClick={() => handleReorder(order)}
                          onMouseEnter={() => setHoveredAction(prev => ({ ...prev, [`reorder-${order.id}`]: true }))}
                          onMouseLeave={() => setHoveredAction(prev => ({ ...prev, [`reorder-${order.id}`]: false }))}
                        >
                          <RefreshCw size={16} />
                          Pesan Lagi
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default OrderHistoryPage;