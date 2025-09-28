import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LayoutDashboard, Coffee, ClipboardList, LogOut, Building, Users, History } from 'lucide-react';

const Sidebar = () => {
  const { user, selectedBranch, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const styles = {
    sidebar: {
      width: '260px',
      background: 'linear-gradient(180deg, #0f766e, #10b981)',
      color: '#f0fdf4',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      padding: '1rem',
      boxShadow: '4px 0 12px rgba(0,0,0,0.15)',
      overflow: 'hidden',
    },
    backgroundImage: {
      position: 'absolute',
      inset: 0,
      backgroundImage:
        "url('https://images.unsplash.com/photo-1512568400610-62da28bc8a13?auto=format&fit=crop&w=600&q=80')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      opacity: 0.1,
      zIndex: 0,
    },
    contentWrapper: {
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    },
    logoContainer: {
      padding: '1.25rem',
      textAlign: 'center',
      borderBottom: '1px solid rgba(255,255,255,0.2)',
    },
    logoText: {
      fontSize: '1.8rem',
      fontWeight: 'bold',
      color: 'white',
      letterSpacing: '1px',
      textShadow: '2px 2px 6px rgba(0,0,0,0.3)',
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
      transition: 'all 0.3s ease',
      color: 'white',
      fontWeight: '500',
    },
    nav: { flexGrow: 1, marginTop: '1.5rem' },
    link: {
      display: 'flex',
      alignItems: 'center',
      padding: '0.75rem 1rem',
      textDecoration: 'none',
      color: '#ecfdf5',
      borderRadius: '0.75rem',
      margin: '0.5rem 0',
      transition: 'all 0.3s ease',
    },
    activeLink: {
      backgroundColor: 'rgba(255,255,255,0.25)',
      color: '#fff',
      transform: 'scale(1.02)',
    },
    logoutButton: {
      width: '100%',
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      color: '#f0fdf4',
      display: 'flex',
      alignItems: 'center',
      padding: '0.75rem 1rem',
      marginTop: '0.75rem',
      borderRadius: '0.75rem',
      transition: 'all 0.3s ease',
    },
  };

  const handleChangeBranch = () => {
    navigate('/pilih-cabang');
  };

  return (
    <aside style={styles.sidebar}>
      {/* Background kopi samar */}
      <div style={styles.backgroundImage}></div>

      <div style={styles.contentWrapper}>
        {/* Logo */}
        <div style={styles.logoContainer}>
          <h2 style={styles.logoText}>COFFENARY</h2>
        </div>

        {/* Tombol pilih cabang */}
        <button
          onClick={handleChangeBranch}
          style={styles.branchButton}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)')
          }
        >
          <Building size={20} style={{ marginRight: '0.75rem', color: '#d1fae5' }} />
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {selectedBranch ? selectedBranch.nama_cabang : 'Pilih Cabang'}
          </span>
        </button>

        {/* Menu */}
        <nav style={styles.nav}>
          <NavLink
            to="/admin/dashboard"
            style={({ isActive }) => ({
              ...styles.link,
              ...(isActive && styles.activeLink),
            })}
          >
            <LayoutDashboard size={20} style={{ marginRight: '0.75rem' }} />
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/menu"
            style={({ isActive }) => ({
              ...styles.link,
              ...(isActive && styles.activeLink),
            })}
          >
            <Coffee size={20} style={{ marginRight: '0.75rem' }} />
            Menu
          </NavLink>
          <NavLink
            to="/admin/pemesanan"
            style={({ isActive }) => ({
              ...styles.link,
              ...(isActive && styles.activeLink),
            })}
          >
            <ClipboardList size={20} style={{ marginRight: '0.75rem' }} />
            Pemesanan
          </NavLink>
          {user?.peran === 'admin' && (
            <>
              <NavLink
                to="/admin/pengguna"
                style={({ isActive }) => ({
                  ...styles.link,
                  ...(isActive && styles.activeLink),
                })}
              >
                <Users size={20} style={{ marginRight: '0.75rem' }} />
                Pengguna
              </NavLink>
              <NavLink
                to="/admin/log-aktivitas"
                style={({ isActive }) => ({
                  ...styles.link,
                  ...(isActive && styles.activeLink),
                })}
              >
                <History size={20} style={{ marginRight: '0.75rem' }} />
                Log Aktivitas
              </NavLink>
            </>
          )}
        </nav>

        {/* Tombol Logout */}
        <button
          onClick={logout}
          style={styles.logoutButton}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)')
          }
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <LogOut size={20} style={{ marginRight: '0.75rem' }} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
