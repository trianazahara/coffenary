import React, { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
    LayoutDashboard, 
    Coffee, 
    ClipboardList, 
    LogOut, 
    Building, 
    Users, 
    History,
    ChevronRight,
    User,
    MapPin
} from 'lucide-react';
import { NotificationContext } from '../../context/NotificationContext';


const Sidebar = () => {
    const { user, selectedBranch, logout } = useContext(AuthContext);
    const { pendingOrdersCount, hasNewOrder } = useContext(NotificationContext);
    const navigate = useNavigate();
    const [hoveredItem, setHoveredItem] = useState(null);

    const sidebarStyle = document.createElement('style');
sidebarStyle.textContent = `
  aside::-webkit-scrollbar {
    width: 6px;
  }
  
  aside::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 10px;
  }
  
  aside::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 10px;
  }
  
  aside::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }
`;
document.head.appendChild(sidebarStyle);

    const styles = {
        sidebar: { 
            width: '280px', 
            background: 'linear-gradient(180deg, #064e3b 0%, #047857 50%, #059669 100%)',
            color: '#f0fdf4', 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100vh', 
            position: 'fixed',
            left: 0,
            top: 0,
            padding: '0',
            boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
            zIndex: 100,
            overflow: 'auto'
        },
        logoContainer: { 
            padding: '1rem 0rem', 
            textAlign: 'center',
            background: 'rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(10px)'
        },
        logoIcon: {
            width: '3rem',
            height: '3rem',
            margin: '0 auto 0rem',
            color: '#d1fae5'
        },
        logoText: { 
            fontSize: '1.5rem', 
            fontWeight: '800', 
            color: 'white', 
            margin: '0rem 0rem',
            letterSpacing: '1px',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
        },
        logoSubtext: {
            fontSize: '0.75rem',
            color: '#a7f3d0',
            marginTop: '0rem',
            letterSpacing: '1px',
            textTransform: 'uppercase'
        },
        branchSection: {
            padding: '1.5rem',
            background: 'rgba(0, 0, 0, 0.1)'
        },
        branchLabel: {
            fontSize: '0.75rem',
            color: '#a7f3d0',
            marginBottom: '0.5rem',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontWeight: '600'
        },
        branchButton: { 
            padding: '1rem', 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            borderRadius: '0.75rem', 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            border: '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.3s ease'
        },
        branchButtonHover: {
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderColor: 'rgba(255,255,255,0.3)',
            transform: 'translateX(4px)'
        },
        branchInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flex: 1,
            minWidth: 0
        },
        branchText: {
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            flex: 1,
            minWidth: 0
        },
        branchName: {
            color: 'white',
            fontWeight: '600',
            fontSize: '0.95rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
        },
        branchAddress: {
            color: '#a7f3d0',
            fontSize: '0.75rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
        },
        nav: { 
            flexGrow: 1, 
            padding: '1.5rem 1rem',
            overflow: 'visible'
        },
        navSection: {
            marginBottom: '1.5rem'
        },
        navSectionTitle: {
            fontSize: '0.75rem',
            color: '#a7f3d0',
            marginBottom: '0.75rem',
            marginLeft: '0.5rem',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontWeight: '600'
        },
        link: { 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '0.875rem 1rem', 
            textDecoration: 'none', 
            color: '#d1fae5', 
            borderRadius: '0.75rem', 
            margin: '0.25rem 0', 
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
        },
        linkContent: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flex: 1
        },
        linkHover: {
            backgroundColor: 'rgba(255,255,255,0.15)',
            color: 'white',
            transform: 'translateX(4px)'
        },
        activeLink: { 
            backgroundColor: 'rgba(255,255,255,0.25)',
            color: 'white',
            fontWeight: '600',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        },
        linkIndicator: {
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '4px',
            backgroundColor: '#d1fae5',
            borderRadius: '0 4px 4px 0',
            opacity: 0,
            transition: 'opacity 0.3s ease'
        },
        linkIndicatorActive: {
            opacity: 1
        },
        chevron: {
            opacity: 0,
            transition: 'opacity 0.3s ease'
        },
        chevronVisible: {
            opacity: 1
        },
        userSection: { 
            borderTop: '1px solid rgba(255,255,255,0.15)', 
            padding: '1.5rem',
            background: 'rgba(0, 0, 0, 0.1)'
        },
        userCard: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1rem',
            padding: '0.75rem',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '0.75rem',
            border: '1px solid rgba(255,255,255,0.1)'
        },
        userAvatar: {
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '700',
            fontSize: '1rem',
            flexShrink: 0
        },
        userInfo: {
            flex: 1,
            minWidth: 0
        },
        userName: {
            color: 'white',
            fontWeight: '700',
            fontSize: '0.95rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
        },
        userRole: {
            color: '#a7f3d0',
            fontSize: '0.75rem',
            textTransform: 'capitalize',
            marginTop: '0.125rem'
        },
        logoutButton: { 
            width: '100%',
            padding: '0.875rem 1rem',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            background: 'rgba(239, 68, 68, 0.1)',
            cursor: 'pointer',
            color: '#138532ff',
            borderRadius: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            fontSize: '0.95rem',
            fontWeight: '600',
            transition: 'all 0.3s ease'
        },
        logoutButtonHover: {
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            borderColor: 'rgba(239, 68, 68, 0.5)',
            color: '#fee2e2'
        },
      badge: {
            position: 'absolute',
            right: '1rem',
            backgroundColor: '#ef4444',
            color: 'white',
            fontSize: '0.7rem',
            fontWeight: '700',
            padding: '0.2rem 0.5rem',
            borderRadius: '9999px',
            minWidth: '22px',
            textAlign: 'center',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)'
        },
        pulseDot: {
            position: 'absolute',
            right: '0.75rem',
            top: '0.5rem',
            width: '8px',
            height: '8px',
            backgroundColor: '#fef2f2',
            borderRadius: '50%',
            animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite'
        }
    };

    const handleChangeBranch = () => {
        navigate('/pilih-cabang');
    };

    const menuItems = [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/menu', icon: Coffee, label: 'Menu' },
        { path: '/admin/pemesanan', icon: ClipboardList, label: 'Pemesanan' }
    ];

    const adminMenuItems = [
        { path: '/admin/pengguna', icon: Users, label: 'Pengguna' },
        { path: '/admin/log-aktivitas', icon: History, label: 'Log Aktivitas' },
         { path: '/admin/daftar-pelanggan', icon: User, label: 'Daftar Pelanggan' } 
    ];

    const getUserInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    return (
        <aside style={styles.sidebar}>
            {/* Logo */}
            <div style={styles.logoContainer}>
                <Coffee style={styles.logoIcon} />
                <h2 style={styles.logoText}>COFFENARY</h2>
                <p style={styles.logoSubtext}>Admin Panel</p>
            </div>
            
            {/* Branch Selection */}
            <div style={styles.branchSection}>
                <div style={styles.branchLabel}>Cabang Aktif</div>
                <button 
                    onClick={handleChangeBranch} 
                    style={{
                        ...styles.branchButton,
                        ...(hoveredItem === 'branch' ? styles.branchButtonHover : {})
                    }}
                    onMouseEnter={() => setHoveredItem('branch')}
                    onMouseLeave={() => setHoveredItem(null)}
                >
                    <div style={styles.branchInfo}>
                        <Building size={20} style={{ color: '#d1fae5', flexShrink: 0 }} />
                        <div style={styles.branchText}>
                            <span style={styles.branchName}>
                                {selectedBranch?.nama_cabang || "Pilih Cabang"}
                            </span>
                            {selectedBranch?.alamat && (
                                <span style={styles.branchAddress}>
                                    {selectedBranch.alamat}
                                </span>
                            )}
                        </div>
                    </div>
                    <ChevronRight size={18} style={{ color: '#a7f3d0', flexShrink: 0 }} />
                </button>
            </div>

            {/* Navigation */}
            <nav style={styles.nav}>
<div style={styles.navSection}>
                    <div style={styles.navSectionTitle}>Menu Utama</div>
                    {menuItems.map((item) => (
                        <NavLink 
                            key={item.path}
                            to={item.path} 
                            style={({ isActive }) => ({
                                ...styles.link,
                                ...(hoveredItem === item.path ? styles.linkHover : {}),
                                ...(isActive ? styles.activeLink : {})
                            })}
                            onMouseEnter={() => setHoveredItem(item.path)}
                            onMouseLeave={() => setHoveredItem(null)}
                        >
                            {({ isActive }) => (
                                <>
                                    <div style={{
                                        ...styles.linkIndicator,
                                        ...(isActive ? styles.linkIndicatorActive : {})
                                    }} />
                                    <div style={styles.linkContent}>
                                        <item.icon size={20} />
                                        {item.label}
                                        
                                        {/* Badge untuk Pemesanan */}
                                        {item.path === '/admin/pemesanan' && pendingOrdersCount > 0 && (
                                            <span style={{
                                                marginLeft: 'auto',
                                                backgroundColor: '#ef4444',
                                                color: 'white',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                padding: '0.125rem 0.5rem',
                                                borderRadius: '1rem',
                                                minWidth: '1.25rem',
                                                textAlign: 'center'
                                            }}>
                                                {pendingOrdersCount}
                                            </span>
                                        )}
                                    </div>
                                    <ChevronRight 
                                        size={16} 
                                        style={{
                                            ...styles.chevron,
                                            ...(hoveredItem === item.path || isActive ? styles.chevronVisible : {})
                                        }} 
                                    />
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>

                {user?.peran === 'admin' && (
                    <div style={styles.navSection}>
                        <div style={styles.navSectionTitle}>Administrasi</div>
                        {adminMenuItems.map((item) => (
                            <NavLink 
                                key={item.path}
                                to={item.path} 
                                style={({ isActive }) => ({
                                    ...styles.link,
                                    ...(hoveredItem === item.path ? styles.linkHover : {}),
                                    ...(isActive ? styles.activeLink : {})
                                })}
                                onMouseEnter={() => setHoveredItem(item.path)}
                                onMouseLeave={() => setHoveredItem(null)}
                            >
                                {({ isActive }) => (
                                    <>
                                        <div style={{
                                            ...styles.linkIndicator,
                                            ...(isActive ? styles.linkIndicatorActive : {})
                                        }} />
                                        <div style={styles.linkContent}>
                                            <item.icon size={20} />
                                            {item.label}
                                        </div>
                                        <ChevronRight 
                                            size={16} 
                                            style={{
                                                ...styles.chevron,
                                                ...(hoveredItem === item.path || isActive ? styles.chevronVisible : {})
                                            }} 
                                        />
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </div>
                )}
            </nav>

            {/* User Info */}
            <div style={styles.userSection}>
                <div style={styles.userCard}>
                    <div style={styles.userAvatar}>
                        {getUserInitials(user?.nama_lengkap)}
                    </div>
                    <div style={styles.userInfo}>
                        <div style={styles.userName}>{user?.nama_lengkap || 'User'}</div>
                        <div style={styles.userRole}>{user?.peran || 'Staff'}</div>
                    </div>
                </div>
                <button 
                    onClick={logout} 
                    style={{
                        ...styles.logoutButton,
                        ...(hoveredItem === 'logout' ? styles.logoutButtonHover : {})
                    }}
                    onMouseEnter={() => setHoveredItem('logout')}
                    onMouseLeave={() => setHoveredItem(null)}
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>

            {/* Animations */}
            <style>{`
                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.7;
                    }
                }
                
                @keyframes ping {
                    75%, 100% {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            `}</style>
        </aside>
    );
};

export default Sidebar;