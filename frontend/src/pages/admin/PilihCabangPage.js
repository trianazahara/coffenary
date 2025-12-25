import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { 
  MapPin, 
  ArrowRight, 
  Clock, 
  Coffee,
  ChevronRight,
  Shield
} from "lucide-react";

const PilihCabangPage = () => {
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [hoveredBranch, setHoveredBranch] = useState(null);
  const { token, selectBranch, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBranches = async () => {
      if (!token) return;
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(
          "http://localhost:5000/api/cabang",
          config
        );
        setBranches(response.data);
      } catch (error) {
        console.error("Gagal mengambil data cabang:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBranches();
  }, [token]);

  const handleSelectBranch = async (branch) => {
    setSelectedBranchId(branch.id_cabang);
    
    // Tambahkan delay kecil untuk efek smooth
    await new Promise(resolve => setTimeout(resolve, 300));
    
    selectBranch(branch);

    // Redirect berdasarkan role
    if (user?.peran === "admin" || user?.peran === "staff") {
      navigate("/admin/dashboard");
    } else if (user?.peran === "pelanggan") {
      navigate("/pelanggan/dashboard");
    } else {
      navigate("/");
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
      padding: '2rem 1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    },
    card: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '2rem',
      padding: '3rem',
      boxShadow: '0 20px 40px -10px rgba(16, 185, 129, 0.15)',
      maxWidth: '800px',
      width: '100%',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      position: 'relative',
      overflow: 'hidden'
    },
    cardDecoration: {
      position: 'absolute',
      top: '-50%',
      right: '-50%',
      width: '100%',
      height: '200%',
      background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)',
      pointerEvents: 'none'
    },
    header: {
      textAlign: 'center',
      marginBottom: '3rem'
    },
    title: {
      fontSize: '2.5rem',
      color: '#059669',
      fontWeight: '800',
      marginBottom: '1rem',
      letterSpacing: '-0.02em'
    },
    subtitle: {
      fontSize: '1.1rem',
      color: '#6b7280',
      lineHeight: '1.6',
      maxWidth: '500px',
      margin: '0 auto'
    },
    userGreeting: {
      color: '#059669',
      fontWeight: '600'
    },
    loadingContainer: {
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
    },
    loadingText: {
      color: '#6b7280',
      fontSize: '1.1rem'
    },
    branchList: {
      display: 'grid',
      gap: '1.5rem'
    },
    branchCard: {
      background: 'white',
      borderRadius: '1.5rem',
      padding: '2rem',
      border: '2px solid #f3f4f6',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden'
    },
    branchCardHover: {
      transform: 'translateY(-8px)',
      borderColor: '#10b981',
      boxShadow: '0 20px 40px -10px rgba(16, 185, 129, 0.15)'
    },
    branchCardSelected: {
      borderColor: '#10b981',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)'
    },
    branchHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: '0'
    },
    branchInfo: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '1rem',
      flex: 1
    },
    branchIcon: {
      width: '3rem',
      height: '3rem',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      borderRadius: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      flexShrink: 0
    },
    branchDetails: {
      flex: 1
    },
    branchName: {
      fontSize: '1.4rem',
      fontWeight: '700',
      color: '#1f2937',
      marginBottom: '0.75rem'
    },
    branchAddress: {
      color: '#6b7280',
      fontSize: '1rem',
      lineHeight: '1.5',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.5rem'
    },
    arrowButton: {
      width: '3rem',
      height: '3rem',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      borderRadius: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      transition: 'all 0.3s ease',
      flexShrink: 0
    },
    arrowButtonHover: {
      transform: 'translateX(4px)'
    },
    emptyState: {
      textAlign: 'center',
      padding: '4rem 2rem',
      color: '#6b7280'
    },
    emptyIcon: {
      fontSize: '4rem',
      marginBottom: '1rem',
      opacity: 0.5
    }
  };

  // Tambahkan CSS animation untuk spinner
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @media (max-width: 768px) {
      .branch-card { padding: 1.5rem !important; }
      .branch-header { flex-direction: column; gap: 1rem; }
      .main-card { padding: 2rem 1.5rem !important; margin: 1rem !important; }
      .main-title { font-size: 2rem !important; }
    }
    
    @media (max-width: 480px) {
      .branch-info { flex-direction: column; text-align: center; gap: 1rem; }
      .branch-icon { align-self: center; }
      .branch-address { justify-content: center; text-align: center; }
    }
  `;
  if (!document.querySelector('#cabang-styles')) {
    styleSheet.id = 'cabang-styles';
    document.head.appendChild(styleSheet);
  }

  return (
    <div style={styles.container}>
      <div style={styles.card} className="main-card">
        <div style={styles.cardDecoration} />
        
        {/* Header Section */}
        <div style={styles.header}>
          <h1 style={styles.title}>📍 Pilih Cabang</h1>
          <p style={styles.subtitle}>
            Selamat datang, <span style={styles.userGreeting}>{user?.nama_lengkap}</span>! 👋<br />
            Pilih cabang Coffenary yang ingin Anda kunjungi.
          </p>
        </div>

        {/* Branch List */}
        <div style={styles.branchList}>
          {isLoading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.loadingSpinner} />
              <p style={styles.loadingText}>Memuat daftar cabang...</p>
            </div>
          ) : branches.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🏪</div>
              <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>Tidak Ada Cabang Tersedia</h3>
              <p>Silakan hubungi administrator untuk informasi lebih lanjut.</p>
            </div>
          ) : (
            branches.map((branch) => {
              const isSelected = selectedBranchId === branch.id_cabang;
              const isHovered = hoveredBranch === branch.id_cabang;

              return (
                <div
                  key={branch.id_cabang}
                  style={{
                    ...styles.branchCard,
                    ...(isHovered && styles.branchCardHover),
                    ...(isSelected && styles.branchCardSelected)
                  }}
                  onClick={() => handleSelectBranch(branch)}
                  onMouseEnter={() => setHoveredBranch(branch.id_cabang)}
                  onMouseLeave={() => setHoveredBranch(null)}
                  className="branch-card"
                >
                  <div style={styles.branchHeader}>
                    <div style={styles.branchInfo}>
                      <div style={styles.branchIcon}>
                        <Coffee size={20} />
                      </div>
                      <div style={styles.branchDetails}>
                        <h3 style={styles.branchName}>
                          {branch.nama_cabang}
                        </h3>
                        <div style={styles.branchAddress}>
                          <MapPin size={18} style={{ flexShrink: 0, marginTop: '0.125rem' }} />
                          <span>{branch.alamat}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{
                      ...styles.arrowButton,
                      ...(isHovered && styles.arrowButtonHover)
                    }}>
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Note */}
        <div style={{
          textAlign: 'center',
          marginTop: '3rem',
          paddingTop: '2rem',
          borderTop: '1px solid #f3f4f6',
          color: '#9ca3af',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}>
          <Shield size={16} />
          <span>Pengalaman terbaik menanti Anda di Coffenary</span>
        </div>
      </div>
    </div>
  );
};

export default PilihCabangPage;