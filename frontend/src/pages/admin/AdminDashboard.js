import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import Header from '../../components/admin/AdminHeader'; 
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Award,
  Calendar,
  Package,
  ArrowUp,
  Activity
} from 'lucide-react';

const AdminDashboard = () => {
    const { selectedBranch, token } = useContext(AuthContext);
    const [stats, setStats] = useState({ 
        totalOrders: 0, 
        totalRevenue: 0, 
        topMenu: '...',
        totalLifetimeOrders: 0,
        totalLifetimeRevenue: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (selectedBranch && token) {
            const fetchStats = async () => {
                setIsLoading(true);
                try {
                    const config = { headers: { Authorization: `Bearer ${token}` } };
                    const response = await axios.get(`http://localhost:5000/api/pesanan/${selectedBranch.id_cabang}/stats`, config);
                    setStats(response.data);
                } catch (error) {
                    console.error("Gagal memuat statistik", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchStats();
        }
    }, [selectedBranch, token]);

    const styles = {
        container: {
            padding: '2rem',
            maxWidth: '1400px',
            margin: '0 auto'
        },
        header: {
            marginBottom: '2.5rem'
        },
        title: { 
            fontSize: '2.5rem', 
            fontWeight: '800', 
            color: '#1e293b',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
        },
        subtitle: { 
            color: '#64748b', 
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        branchName: {
            fontWeight: '700',
            color: '#059669',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            padding: '0.25rem 0.75rem',
            borderRadius: '0.5rem'
        },
        section: {
            marginBottom: '2rem'
        },
        sectionTitle: {
            fontSize: '1.2rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        grid: { 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '1.5rem'
        },
        card: { 
            backgroundColor: 'white', 
            padding: '1.75rem', 
            borderRadius: '1rem', 
            boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
            border: '1px solid rgba(226, 232, 240, 0.5)',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
        },
        cardHover: {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
        },
        cardHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '1rem'
        },
        cardTitle: { 
            fontWeight: '600', 
            color: '#64748b',
            fontSize: '0.95rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        },
        iconContainer: {
            width: '3rem',
            height: '3rem',
            borderRadius: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.3s ease'
        },
        iconContainerHover: {
            transform: 'scale(1.1) rotate(5deg)'
        },
        cardStat: { 
            fontSize: '2.5rem', 
            fontWeight: '800', 
            color: '#1e293b',
            marginBottom: '0.5rem',
            lineHeight: '1'
        },
        cardStatSmall: { 
            fontSize: '1.75rem', 
            fontWeight: '700', 
            color: '#1e293b',
            marginBottom: '0.5rem',
            lineHeight: '1.2'
        },
        cardFooter: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid #f1f5f9'
        },
        trend: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.85rem',
            fontWeight: '600',
            color: '#10b981'
        },
        loadingSkeleton: {
            backgroundColor: '#f1f5f9',
            borderRadius: '0.5rem',
            height: '2.5rem',
            animation: 'pulse 1.5s ease-in-out infinite'
        },
        loadingSkeletonSmall: {
            backgroundColor: '#f1f5f9',
            borderRadius: '0.5rem',
            height: '1.75rem',
            animation: 'pulse 1.5s ease-in-out infinite'
        },
        decoration: {
            position: 'absolute',
            opacity: 0.05,
            fontSize: '8rem',
            right: '-1rem',
            bottom: '-2rem',
            pointerEvents: 'none'
        }
    };

    const cardConfigs = {
        daily: [
            {
                title: 'Pesanan Hari Ini',
                value: stats.totalOrders,
                icon: <ShoppingBag size={24} />,
                color: '#3b82f6',
                bgColor: 'rgba(59, 130, 246, 0.1)',
                trend: '+12%'
            },
            {
                title: 'Pendapatan Hari Ini',
                value: `Rp ${stats.totalRevenue.toLocaleString('id-ID')}`,
                icon: <DollarSign size={24} />,
                color: '#10b981',
                bgColor: 'rgba(16, 185, 129, 0.1)',
                trend: '+8%'
            },
            {
                title: 'Menu Terlaris',
                value: stats.topMenu,
                icon: <Award size={24} />,
                color: '#f59e0b',
                bgColor: 'rgba(245, 158, 11, 0.1)',
                isSmall: true
            }
        ],
        lifetime: [
            {
                title: 'Total Semua Pesanan',
                value: stats.totalLifetimeOrders,
                icon: <Package size={24} />,
                color: '#8b5cf6',
                bgColor: 'rgba(139, 92, 246, 0.1)',
                trend: 'Lifetime'
            },
            {
                title: 'Total Semua Pendapatan',
                value: `Rp ${stats.totalLifetimeRevenue.toLocaleString('id-ID')}`,
                icon: <TrendingUp size={24} />,
                color: '#ec4899',
                bgColor: 'rgba(236, 72, 153, 0.1)',
                trend: 'Lifetime'
            }
        ]
    };

    const [hoveredCard, setHoveredCard] = useState(null);

    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        @media (max-width: 768px) {
            .dashboard-grid { grid-template-columns: 1fr !important; }
        }
    `;
    if (!document.querySelector('#dashboard-styles')) {
        styleSheet.id = 'dashboard-styles';
        document.head.appendChild(styleSheet);
    }

    const StatCard = ({ config, index, section }) => {
        const cardId = `${section}-${index}`;
        const isHovered = hoveredCard === cardId;

        return (
            <div 
                style={{
                    ...styles.card,
                    ...(isHovered ? styles.cardHover : {})
                }}
                onMouseEnter={() => setHoveredCard(cardId)}
                onMouseLeave={() => setHoveredCard(null)}
            >
                <div style={styles.cardHeader}>
                    <div>
                        <h3 style={styles.cardTitle}>{config.title}</h3>
                    </div>
                    <div 
                        style={{
                            ...styles.iconContainer,
                            backgroundColor: config.bgColor,
                            color: config.color,
                            ...(isHovered ? styles.iconContainerHover : {})
                        }}
                    >
                        {config.icon}
                    </div>
                </div>

                {isLoading ? (
                    <div style={config.isSmall ? styles.loadingSkeletonSmall : styles.loadingSkeleton} />
                ) : (
                    <p style={config.isSmall ? styles.cardStatSmall : styles.cardStat}>
                        {config.value}
                    </p>
                )}

                {config.trend && (
                    <div style={styles.cardFooter}>
                        <div style={styles.trend}>
                            {config.trend !== 'Lifetime' && <ArrowUp size={14} />}
                            {config.trend}
                        </div>
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                            {config.trend === 'Lifetime' ? 'Sejak awal' : 'vs kemarin'}
                        </span>
                    </div>
                )}

                <div style={{ ...styles.decoration, color: config.color }}>
                    {config.icon}
                </div>
            </div>
        );
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>
                    <Activity size={32} />
                    Dashboard Analytics
                </h1>
                <p style={styles.subtitle}>
                    <span>Ringkasan aktivitas untuk cabang:</span>
                    <span style={styles.branchName}>
                        {selectedBranch?.nama_cabang || 'Semua Cabang'}
                    </span>
                </p>
            </div>

            {/* Statistik Hari Ini */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>
                    <Calendar size={20} />
                    Statistik Hari Ini
                </h2>
                <div style={styles.grid} className="dashboard-grid">
                    {cardConfigs.daily.map((config, index) => (
                        <StatCard 
                            key={index} 
                            config={config} 
                            index={index}
                            section="daily"
                        />
                    ))}
                </div>
            </div>

            {/* Statistik Keseluruhan */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>
                    <TrendingUp size={20} />
                    Statistik Keseluruhan
                </h2>
                <div style={styles.grid} className="dashboard-grid">
                    {cardConfigs.lifetime.map((config, index) => (
                        <StatCard 
                            key={index} 
                            config={config} 
                            index={index}
                            section="lifetime"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;