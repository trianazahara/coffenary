// src/pages/pelanggan/DashboardPelanggan.js
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import Header from '../../components/pelanggan/Header';
import { 
  Coffee, 
  Clock, 
  Star, 
  TrendingUp, 
  ShoppingBag,
  ChefHat,
  Zap,
  Heart,
  ArrowRight,
  Gift
} from 'lucide-react';

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    paddingTop: '70px' // Offset for fixed header
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
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap'
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: '0.75rem 1.25rem',
    borderRadius: '0.75rem',
    backdropFilter: 'blur(10px)'
  },
  statNumber: {
    fontSize: '1.5rem',
    fontWeight: '700'
  },
  statLabel: {
    fontSize: '0.9rem',
    opacity: 0.9
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(226, 232, 240, 0.5)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden'
  },
  actionCardHover: {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
  },
  actionIcon: {
    width: '3rem',
    height: '3rem',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
    color: '#059669'
  },
  actionTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '0.5rem'
  },
  actionDescription: {
    color: '#64748b',
    fontSize: '0.9rem',
    lineHeight: '1.5'
  },
  actionArrow: {
    position: 'absolute',
    bottom: '1rem',
    right: '1rem',
    color: '#059669',
    opacity: 0,
    transition: 'opacity 0.3s ease'
  },
  actionArrowVisible: {
    opacity: 1
  },
  featuredSection: {
    marginBottom: '2rem'
  },
  sectionTitle: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  menuGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem'
  },
  menuCard: {
    backgroundColor: 'white',
    borderRadius: '1rem',
    overflow: 'hidden',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(226, 232, 240, 0.5)',
    transition: 'all 0.3s ease'
  },
  menuCardHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
  },
  menuImage: {
    width: '100%',
    height: '180px',
    backgroundColor: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#94a3b8',
    fontSize: '3rem'
  },
  menuContent: {
    padding: '1.25rem'
  },
  menuTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '0.5rem'
  },
  menuDescription: {
    color: '#64748b',
    fontSize: '0.9rem',
    marginBottom: '1rem',
    lineHeight: '1.5'
  },
  menuFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  menuPrice: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#059669'
  },
  menuRating: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    color: '#fbbf24'
  },
  promoSection: {
    backgroundColor: 'white',
    borderRadius: '1rem',
    padding: '2rem',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(226, 232, 240, 0.5)',
    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    position: 'relative',
    overflow: 'hidden'
  },
  promoContent: {
    position: 'relative',
    zIndex: 2
  },
  promoTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#92400e',
    marginBottom: '0.5rem'
  },
  promoDescription: {
    color: '#a16207',
    marginBottom: '1.5rem'
  },
  promoButton: {
    backgroundColor: '#d97706',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.75rem',
    border: 'none',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  promoButtonHover: {
    backgroundColor: '#b45309',
    transform: 'translateY(-1px)'
  },
  promoDecoration: {
    position: 'absolute',
    right: '-1rem',
    top: '-1rem',
    fontSize: '6rem',
    opacity: 0.2,
    color: '#d97706'
  }
};

// Add CSS for responsive design
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @media (max-width: 768px) {
    .welcome-title { font-size: 2rem !important; }
    .welcome-stats { justify-content: center; }
    .section-title { font-size: 1.5rem !important; }
    .main-padding { padding: 1rem !important; }
  }
  
  @media (max-width: 480px) {
    .welcome-section { padding: 2rem 1.5rem !important; }
    .quick-actions { grid-template-columns: 1fr !important; }
    .menu-grid { grid-template-columns: 1fr !important; }
  }
`;
if (!document.querySelector('#dashboard-styles')) {
  styleSheet.id = 'dashboard-styles';
  document.head.appendChild(styleSheet);
}

const DashboardPelanggan = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [promoHover, setPromoHover] = useState(false);

  // State for data from API
  const [stats, setStats] = useState({
    totalOrders: 0,
    favoriteItems: 0,
    loyaltyPoints: 0
  });

  const [featuredMenu, setFeaturedMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const quickActions = [
    {
      icon: <Coffee />,
      title: 'Pesan Sekarang',
      description: 'Lihat menu lengkap dan pesan favorit Anda',
      action: () => navigate('/pelanggan/menu')
    },
    {
      icon: <Clock />,
      title: 'Riwayat Pesanan',
      description: 'Lihat pesanan sebelumnya dan pesan ulang',
      action: () => navigate('/pelanggan/history')
    },
    {
      icon: <ShoppingBag />,
      title: 'Keranjang Saya',
      description: 'Lanjutkan pesanan yang belum selesai',
      action: () => navigate('/pelanggan/cart')
    }
    // {
    //   icon: <Gift />,
    //   title: 'Promo & Reward',
    //   description: 'Dapatkan diskon dan penawaran menarik',
    //   action: () => navigate('/pelanggan/rewards')
    // }
  ];

  useEffect(() => {
    // Fetch data saat component mount
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch featured menu dari API
      await fetchFeaturedMenu();
      // Fetch user stats (untuk sekarang pakai mock data)
      setStats({
        totalOrders: 12, // Nanti bisa diganti dengan API call
        favoriteItems: 5,
        loyaltyPoints: 250
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedMenu = async () => {
    try {
      const response = await axios.get('/api/menu/featured');
      // Transform data dari backend ke format yang dibutuhkan frontend
      const transformedMenu = response.data.map(item => ({
        id: item.id_menu,
        name: item.nama_menu,
        description: item.deskripsi_menu,
        price: item.harga,
        rating: 4.5, // Default rating, nanti bisa diganti dengan rating real
        category: item.kategori,
        image: item.gambar
      }));
      setFeaturedMenu(transformedMenu);
    } catch (error) {
      console.error('Error fetching featured menu:', error);
      // Fallback ke data kosong jika error
      setFeaturedMenu([]);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
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
              <div style={styles.statItem}>
                <ShoppingBag size={20} />
                <div>
                  <div style={styles.statNumber}>{stats.totalOrders}</div>
                  <div style={styles.statLabel}>Total Pesanan</div>
                </div>
              </div>
              <div style={styles.statItem}>
                <Heart size={20} />
                <div>
                  <div style={styles.statNumber}>{stats.favoriteItems}</div>
                  <div style={styles.statLabel}>Menu Favorit</div>
                </div>
              </div>
              <div style={styles.statItem}>
                <Star size={20} />
                <div>
                  <div style={styles.statNumber}>{stats.loyaltyPoints}</div>
                  <div style={styles.statLabel}>Poin Loyalitas</div>
                </div>
              </div>
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
                ...(hoveredCard === index ? styles.actionCardHover : {})
              }}
              onClick={action.action}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
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
                  ...(hoveredCard === index ? styles.actionArrowVisible : {})
                }} 
              />
            </div>
          ))}
        </section>

        {/* Featured Menu */}
        <section style={styles.featuredSection}>
          <h2 style={styles.sectionTitle} className="section-title">
            <TrendingUp size={24} />
            Menu Populer
          </h2>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
              Memuat menu...
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#ef4444' }}>
              {error}
            </div>
          ) : featuredMenu.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
              Belum ada menu tersedia
            </div>
          ) : (
            <div style={styles.menuGrid} className="menu-grid">
              {featuredMenu.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    ...styles.menuCard,
                    ...(hoveredCard === `menu-${index}` ? styles.menuCardHover : {})
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
                    <div style={{ display: item.image ? 'none' : 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                      <ChefHat size={48} />
                    </div>
                  </div>
                  <div style={styles.menuContent}>
                    <h3 style={styles.menuTitle}>{item.name}</h3>
                    <p style={styles.menuDescription}>{item.description}</p>
                    <div style={styles.menuFooter}>
                      <span style={styles.menuPrice}>
                        {formatPrice(item.price)}
                      </span>
                      <div style={styles.menuRating}>
                        <Star size={16} fill="currentColor" />
                        <span>{item.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        Promo Section
        <section style={styles.promoSection}>
          <div style={styles.promoDecoration}>
            <Gift />
          </div>
          <div style={styles.promoContent}>
            <h2 style={styles.promoTitle}>Promo Spesial Hari Ini!</h2>
            <p style={styles.promoDescription}>
              Dapatkan diskon 20% untuk semua minuman kopi premium. 
              Berlaku hingga akhir bulan ini.
            </p>
            <button
              style={{
                ...styles.promoButton,
                ...(promoHover ? styles.promoButtonHover : {})
              }}
              onMouseEnter={() => setPromoHover(true)}
              onMouseLeave={() => setPromoHover(false)}
              onClick={() => navigate('/pelanggan/menu')}
            >
              <Zap size={18} />
              Klaim Sekarang
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardPelanggan;