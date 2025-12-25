import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import Header from '../../components/pelanggan/Header';
import { 
  Coffee, 
  Clock, 
  TrendingUp, 
  ShoppingBag,
  ChefHat,
  ArrowRight,
  Package,
  CheckCircle,
  AlertCircle,
  Calendar,
  DollarSign,
  MapPin
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
  welcomeSection: {
    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    borderRadius: '1.5rem',
    padding: '3rem 2rem',
    color: 'white',
    marginBottom: '2rem',
    position: 'relative',
    overflow: 'hidden'
  },
  welcomeContent: {
    position: 'relative',
    zIndex: 2
  },
  welcomeTitle: {
    fontSize: '2.5rem',
    fontWeight: '800',
    marginBottom: '0.5rem',
    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  welcomeSubtitle: {
    fontSize: '1.2rem',
    opacity: 0.9,
    marginBottom: '1.5rem'
  },
  welcomeStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem'
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: '1.25rem',
    borderRadius: '1rem',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease'
  },
  statItemHover: {
    transform: 'translateY(-2px)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)'
  },
  statIcon: {
    width: '3rem',
    height: '3rem',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statContent: {
    flex: 1
  },
  statNumber: {
    fontSize: '1.75rem',
    fontWeight: '800',
    marginBottom: '0.25rem'
  },
  statLabel: {
    fontSize: '0.9rem',
    opacity: 0.9,
    fontWeight: '500'
  },
  welcomeDecoration: {
    position: 'absolute',
    right: '-2rem',
    top: '-2rem',
    width: '200px',
    height: '200px',
    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
    borderRadius: '50%'
  },
  quickActions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: '1.5rem',
    padding: '2rem',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(226, 232, 240, 0.5)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden'
  },
  actionCardHover: {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)'
  },
  actionIcon: {
    width: '4rem',
    height: '4rem',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    borderRadius: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
    color: 'white'
  },
  actionTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '0.75rem'
  },
  actionDescription: {
    color: '#64748b',
    fontSize: '1rem',
    lineHeight: '1.6',
    marginBottom: '1.5rem'
  },
  actionArrow: {
    position: 'absolute',
    bottom: '2rem',
    right: '2rem',
    color: '#059669',
    transition: 'all 0.3s ease'
  },
  actionArrowHover: {
    transform: 'translateX(4px)'
  },
  featuredSection: {
    marginBottom: '2rem'
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '2rem'
  },
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  viewAllButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: 'transparent',
    border: '2px solid #10b981',
    borderRadius: '1rem',
    color: '#10b981',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  viewAllButtonHover: {
    backgroundColor: '#10b981',
    color: 'white',
    transform: 'translateY(-1px)'
  },
  menuGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem'
  },
  menuCard: {
    backgroundColor: 'white',
    borderRadius: '1.5rem',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(226, 232, 240, 0.5)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer'
  },
  menuCardHover: {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
  },
  menuImage: {
    width: '100%',
    height: '200px',
    backgroundColor: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#94a3b8',
    position: 'relative',
    overflow: 'hidden'
  },
  menuCategory: {
    position: 'absolute',
    top: '1rem',
    left: '1rem',
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '2rem',
    fontSize: '0.8rem',
    fontWeight: '600'
  },
  menuContent: {
    padding: '1.5rem'
  },
  menuTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '0.75rem'
  },
  menuDescription: {
    color: '#64748b',
    fontSize: '0.95rem',
    marginBottom: '1rem',
    lineHeight: '1.5',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },
  menuFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  menuPrice: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#059669'
  },
  recentOrders: {
    backgroundColor: 'white',
    borderRadius: '1.5rem',
    padding: '2rem',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(226, 232, 240, 0.5)',
    marginBottom: '2rem'
  },
  orderList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  orderItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.25rem',
    backgroundColor: '#f8fafc',
    borderRadius: '1rem',
    border: '1px solid rgba(226, 232, 240, 0.5)',
    transition: 'all 0.3s ease'
  },
  orderItemHover: {
    backgroundColor: 'white',
    borderColor: 'rgba(16, 185, 129, 0.2)',
    transform: 'translateY(-2px)'
  },
  orderInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  orderIcon: {
    width: '3rem',
    height: '3rem',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#059669'
  },
  orderDetails: {
    flex: 1
  },
  orderNumber: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '0.25rem'
  },
  orderDate: {
    fontSize: '0.9rem',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  orderStatus: {
    padding: '0.5rem 1rem',
    borderRadius: '2rem',
    fontSize: '0.8rem',
    fontWeight: '600',
    textTransform: 'capitalize'
  },
  statusPending: {
    backgroundColor: '#fef3c7',
    color: '#d97706'
  },
  statusCompleted: {
    backgroundColor: '#d1fae5',
    color: '#059669'
  },
  statusProcessing: {
    backgroundColor: '#dbeafe',
    color: '#3b82f6'
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
    .welcome-title { font-size: 2rem !important; }
    .welcome-stats { grid-template-columns: 1fr !important; }
    .section-title { font-size: 1.5rem !important; }
    .main-padding { padding: 1rem !important; }
    .section-header { flex-direction: column; gap: 1rem; align-items: flex-start; }
    .menu-grid { grid-template-columns: 1fr !important; }
    .quick-actions { grid-template-columns: 1fr !important; }
  }
  
  @media (max-width: 480px) {
    .welcome-section { padding: 2rem 1.5rem !important; }
    .order-item { flex-direction: column; gap: 1rem; align-items: flex-start; }
  }
`;
if (!document.querySelector('#dashboard-styles')) {
  styleSheet.id = 'dashboard-styles';
  document.head.appendChild(styleSheet);
}

const DashboardPelanggan = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredAction, setHoveredAction] = useState(null);
  const [hoveredStat, setHoveredStat] = useState(null);
  const [hoveredViewAll, setHoveredViewAll] = useState(false);

  // State for data from API
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    activeOrders: 0
  });

  const [featuredMenu, setFeaturedMenu] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const quickActions = [
    {
      icon: <Coffee />,
      title: 'Pesan Sekarang',
      description: 'Jelajahi menu lengkap dan pesan favorit Anda dengan mudah',
      action: () => navigate('/pelanggan/menu')
    },
    {
      icon: <Clock />,
      title: 'Riwayat Pesanan',
      description: 'Lihat dan kelola semua pesanan yang pernah Anda buat',
      action: () => navigate('/pelanggan/history')
    },
    {
      icon: <ShoppingBag />,
      title: 'Keranjang Saya',
      description: 'Lanjutkan pesanan yang belum selesai di keranjang',
      action: () => navigate('/pelanggan/cart')
    }
  ];

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch data secara parallel
      const [menuResponse, ordersResponse] = await Promise.all([
        axios.get('/api/menu/featured'),
        axios.get('http://localhost:5000/api/pesanan/history', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      // Process menu data
      const transformedMenu = menuResponse.data.map(item => ({
        id: item.id_menu,
        name: item.nama_menu,
        description: item.deskripsi_menu,
        price: item.harga,
        category: item.kategori,
        image: item.gambar
      }));

      // Process orders data
      const orders = Array.isArray(ordersResponse.data) ? ordersResponse.data : [];
      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total_harga || 0), 0);
      const activeOrders = orders.filter(order => 
        ['pending', 'dalam_persiapan'].includes(order.status)
      ).length;

      // Get recent orders (last 3)
      const recentOrdersData = orders.slice(0, 3).map(order => ({
        id: order.id_pesanan,
        nomor: order.nomor_pesanan,
        total: order.total_harga,
        status: order.status,
        tanggal: order.tanggal_dibuat
      }));

      setFeaturedMenu(transformedMenu);
      setRecentOrders(recentOrdersData);
      setStats({
        totalOrders,
        totalSpent,
        activeOrders
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Gagal memuat data dashboard');
      setFeaturedMenu([]);
      setRecentOrders([]);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'selesai':
        return styles.statusCompleted;
      case 'pending':
        return styles.statusPending;
      default:
        return styles.statusProcessing;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'selesai':
        return <CheckCircle size={16} />;
      case 'pending':
        return <Clock size={16} />;
      default:
        return <Package size={16} />;
    }
  };

  return (
    <div style={styles.container}>
      <Header />
      
      <main style={styles.main} className="main-padding">
        {/* Welcome Section */}
        <section style={styles.welcomeSection} className="welcome-section">
          <div style={styles.welcomeDecoration} />
          <div style={styles.welcomeContent}>
            <h1 style={styles.welcomeTitle} className="welcome-title">
              Selamat Datang, {user?.nama_lengkap || 'Pelanggan'}!
            </h1>
            <p style={styles.welcomeSubtitle}>
              Nikmati pengalaman coffee shop terbaik bersama Coffenary
            </p>
            <div style={styles.welcomeStats} className="welcome-stats">
              {[
                {
                  icon: <ShoppingBag size={24} />,
                  number: stats.totalOrders,
                  label: 'Total Pesanan',
                  hover: 'totalOrders'
                },
                {
                  icon: <DollarSign size={24} />,
                  number: formatPrice(stats.totalSpent),
                  label: 'Total Pengeluaran',
                  hover: 'totalSpent'
                },
                {
                  icon: <Package size={24} />,
                  number: stats.activeOrders,
                  label: 'Pesanan Aktif',
                  hover: 'activeOrders'
                }
              ].map((stat, index) => (
                <div
                  key={index}
                  style={{
                    ...styles.statItem,
                    ...(hoveredStat === stat.hover && styles.statItemHover)
                  }}
                  onMouseEnter={() => setHoveredStat(stat.hover)}
                  onMouseLeave={() => setHoveredStat(null)}
                >
                  <div style={styles.statIcon}>
                    {stat.icon}
                  </div>
                  <div style={styles.statContent}>
                    <div style={styles.statNumber}>{stat.number}</div>
                    <div style={styles.statLabel}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section style={styles.quickActions} className="quick-actions">
          {quickActions.map((action, index) => (
            <div
              key={index}
              style={{
                ...styles.actionCard,
                ...(hoveredAction === index && styles.actionCardHover)
              }}
              onClick={action.action}
              onMouseEnter={() => setHoveredAction(index)}
              onMouseLeave={() => setHoveredAction(null)}
            >
              <div style={styles.actionIcon}>
                {action.icon}
              </div>
              <h3 style={styles.actionTitle}>{action.title}</h3>
              <p style={styles.actionDescription}>{action.description}</p>
              <ArrowRight 
                size={20} 
                style={{
                  ...styles.actionArrow,
                  ...(hoveredAction === index && styles.actionArrowHover)
                }} 
              />
            </div>
          ))}
        </section>

        {/* Recent Orders Section */}
        {recentOrders.length > 0 && (
          <section style={styles.recentOrders}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>
                <Clock size={28} />
                Pesanan Terbaru
              </h2>
            </div>
            <div style={styles.orderList}>
              {recentOrders.map((order, index) => (
                <div
                  key={order.id}
                  style={{
                    ...styles.orderItem,
                    ...(hoveredCard === `order-${index}` && styles.orderItemHover)
                  }}
                  onMouseEnter={() => setHoveredCard(`order-${index}`)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => navigate('/pelanggan/history')}
                >
                  <div style={styles.orderInfo}>
                    <div style={styles.orderIcon}>
                      {getStatusIcon(order.status)}
                    </div>
                    <div style={styles.orderDetails}>
                      <div style={styles.orderNumber}>{order.nomor}</div>
                      <div style={styles.orderDate}>
                        <Calendar size={14} />
                        {formatDate(order.tanggal)}
                        • {formatPrice(order.total)}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    ...styles.orderStatus,
                    ...getStatusStyle(order.status)
                  }}>
                    {order.status}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Featured Menu */}
        <section style={styles.featuredSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              <TrendingUp size={28} />
              Menu Populer
            </h2>
            <button
              style={{
                ...styles.viewAllButton,
                ...(hoveredViewAll && styles.viewAllButtonHover)
              }}
              onClick={() => navigate('/pelanggan/menu')}
              onMouseEnter={() => setHoveredViewAll(true)}
              onMouseLeave={() => setHoveredViewAll(false)}
            >
              Lihat Semua
              <ArrowRight size={16} />
            </button>
          </div>
          
          {loading ? (
            <div style={styles.loadingState}>
              <Package size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>Memuat menu...</p>
            </div>
          ) : error ? (
            <div style={styles.emptyState}>
              <AlertCircle size={48} style={{ marginBottom: '1rem', color: '#ef4444' }} />
              <p>{error}</p>
            </div>
          ) : featuredMenu.length === 0 ? (
            <div style={styles.emptyState}>
              <Coffee size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>Belum ada menu tersedia</p>
            </div>
          ) : (
            <div style={styles.menuGrid} className="menu-grid">
              {featuredMenu.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    ...styles.menuCard,
                    ...(hoveredCard === `menu-${index}` && styles.menuCardHover)
                  }}
                  onMouseEnter={() => setHoveredCard(`menu-${index}`)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => navigate('/pelanggan/menu')}
                >
                  <div style={styles.menuImage}>
                    {item.image ? (
                      <img 
                        src={`http://localhost:5000/${item.image}`} 
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div style={{ 
                      display: item.image ? 'none' : 'flex', 
                      width: '100%', 
                      height: '100%', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: '#f1f5f9'
                    }}>
                      <ChefHat size={48} color="#94a3b8" />
                    </div>
                    <div style={styles.menuCategory}>
                      {item.category}
                    </div>
                  </div>
                  <div style={styles.menuContent}>
                    <h3 style={styles.menuTitle}>{item.name}</h3>
                    <p style={styles.menuDescription}>{item.description}</p>
                    <div style={styles.menuFooter}>
                      <span style={styles.menuPrice}>
                        {formatPrice(item.price)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default DashboardPelanggan;