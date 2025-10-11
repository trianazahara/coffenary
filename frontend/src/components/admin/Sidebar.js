import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import { LayoutDashboard, Coffee, ClipboardList, LogOut, Building, Users, History } from 'lucide-react';

const Sidebar = () => {
    const { user, selectedBranch, logout } = useContext(AuthContext);
    const { pendingOrdersCount, hasNewOrder } = useContext(NotificationContext);
    const navigate = useNavigate();

    const styles = {
        sidebar: { 
            width: '250px', 
            background: 'linear-gradient(180deg, #059669, #10b981)', 
            color: '#f0fdf4', 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100vh', 
            position: 'sticky', 
            top: 0, 
            padding: '1rem',
            boxShadow: '4px 0 12px rgba(0,0,0,0.1)'
        },
        logoContainer: { 
            padding: '1rem', 
            textAlign: 'center', 
            borderBottom: '1px solid rgba(255,255,255,0.2)' 
        },
        logoText: { 
            fontSize: '1.75rem', 
            fontWeight: 'bold', 
            color: 'white', 
            letterSpacing: '1px' 
        },
        branchButton: { 
            marginTop: '1.5rem', 
            padding: '0.75rem', 
            backgroundColor: 'rgba(255,255,255,0.15)', 
            borderRadius: '0.75rem', 
            display: 'flex', 
            alignItems: 'center',
            width: '100%',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.3s ease'
        },
        nav: { 
            flexGrow: 1, 
            marginTop: '1.5rem' 
        },
        link: { 
            display: 'flex', 
            alignItems: 'center', 
            padding: '0.75rem 1rem', 
            textDecoration: 'none', 
            color: '#ecfdf5', 
            borderRadius: '0.75rem', 
            margin: '0.5rem 0', 
            transition: 'all 0.3s ease',
            position: 'relative'
        },
        activeLink: { 
            backgroundColor: 'rgba(255,255,255,0.25)', 
            color: 'white' 
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
        },
        userInfo: { 
            borderTop: '1px solid rgba(255,255,255,0.2)', 
            paddingTop: '1rem', 
            marginTop: '1rem' 
        },
        logoutButton: { 
            width: '100%', 
            border: 'none', 
            background: 'none', 
            cursor: 'pointer',
            color: '#f0fdf4'
        }
    };

    const handleChangeBranch = () => {
        navigate('/pilih-cabang');
    };

    return (
        <aside style={styles.sidebar}>
            <div style={styles.logoContainer}>
                <h2 style={styles.logoText}>COFFENARY</h2>
            </div>
            
            <button 
                onClick={handleChangeBranch} 
                style={styles.branchButton}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
            >
                <Building size={20} style={{ marginRight: '0.75rem', color: '#d1fae5', flexShrink: 0 }} />
                <span style={{ color: 'white', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedBranch ? selectedBranch.nama_cabang : "Pilih Cabang"}
                </span>
            </button>

            <nav style={styles.nav}>
                <NavLink to="/admin/dashboard" style={({ isActive }) => ({ ...styles.link, ...(isActive && styles.activeLink) })}>
                    <LayoutDashboard size={20} style={{ marginRight: '0.75rem' }} />
                    Dashboard
                </NavLink>
                
                <NavLink to="/admin/menu" style={({ isActive }) => ({ ...styles.link, ...(isActive && styles.activeLink) })}>
                    <Coffee size={20} style={{ marginRight: '0.75rem' }} />
                    Menu
                </NavLink>
                
                <NavLink 
                    to="/admin/pemesanan" 
                    style={({ isActive }) => ({ 
                        ...styles.link, 
                        ...(isActive && styles.activeLink) 
                    })}
                >
                    <ClipboardList size={20} style={{ marginRight: '0.75rem' }} />
                    Pemesanan
                    
                    {/* Badge Notifikasi */}
                    {pendingOrdersCount > 0 && (
                        <>
                            <span style={styles.badge}>
                                {pendingOrdersCount}
                            </span>
                            {hasNewOrder && <span style={styles.pulseDot}></span>}
                        </>
                    )}
                </NavLink>
                
                {user?.peran === 'admin' && (
                    <>
                        <NavLink to="/admin/pengguna" style={({ isActive }) => ({ ...styles.link, ...(isActive && styles.activeLink) })}>
                            <Users size={20} style={{ marginRight: '0.75rem' }} />
                            Pengguna
                        </NavLink>
                        
                        <NavLink to="/admin/log-aktivitas" style={({ isActive }) => ({ ...styles.link, ...(isActive && styles.activeLink) })}>
                            <History size={20} style={{ marginRight: '0.75rem' }} />
                            Log Aktivitas
                        </NavLink>
                    </>
                )}
            </nav>

            <div style={styles.userInfo}>
                <p style={{ color: 'white', fontWeight: 'bold' }}>{user?.nama_lengkap}</p>
                <p style={{ color: '#d1fae5', fontSize: '0.875rem' }}>{user?.peran}</p>
                <button onClick={logout} style={{...styles.link, ...styles.logoutButton, marginTop: '0.5rem'}}>
                    <LogOut size={20} style={{ marginRight: '0.75rem' }} />
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