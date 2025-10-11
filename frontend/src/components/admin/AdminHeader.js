import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Coffee, User, LogOut } from 'lucide-react';

const styles = {
  header: {
    position: 'fixed',
    top: 0,
    left: '250px', // ⬅️ Tambahkan agar tidak menimpa sidebar
    right: 0,
    zIndex: 50,
    background: 'linear-gradient(90deg, #ffffff 0%, #f0fdf4 100%)',
    backdropFilter: 'blur(8px)',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    height: '70px',
    transition: 'left 0.3s ease',
  },
  container: {
    maxWidth: '1150px',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    textDecoration: 'none',
    color: '#065f46',
    fontWeight: '800',
    fontSize: '1.6rem',
  },
  logoIcon: {
    width: '2rem',
    height: '2rem',
    color: '#059669',
  },
  profileDropdown: { position: 'relative' },
  profileButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.6rem 1rem',
    borderRadius: '0.75rem',
    border: '1px solid rgba(0,0,0,0.05)',
    backgroundColor: 'white',
    color: '#374151',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.3s ease',
  },
  profileButtonHover: {
    backgroundColor: '#ecfdf5',
    color: '#047857',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '110%',
    right: 0,
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
    overflow: 'hidden',
    minWidth: '180px',
    animation: 'fadeSlide 0.2s ease',
  },
  dropdownItem: {
    width: '100%',
    padding: '0.75rem 1rem',
    textAlign: 'left',
    background: 'transparent',
    border: 'none',
    color: '#374151',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};

if (!document.querySelector('#fadeSlide-style')) {
  const style = document.createElement('style');
  style.id = 'fadeSlide-style';
  style.textContent = `
    @keyframes fadeSlide {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}

const AdminHeader = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [hover, setHover] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleProfileClick = () => {
    navigate('/admin/profile');
  };

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <Link to="/admin/dashboard" style={styles.logo}>
          <Coffee style={styles.logoIcon} />
          <span>Panel Admin</span>
        </Link>

        <div style={styles.profileDropdown}>
          <button
            style={{
              ...styles.profileButton,
              ...(hover ? styles.profileButtonHover : {}),
            }}
            onClick={() => setProfileOpen(!profileOpen)}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            <User size={18} />
            <span>{user?.nama_lengkap || 'Admin Utama'}</span>
          </button>

          {profileOpen && (
            <div style={styles.dropdownMenu}>
              <button
                style={styles.dropdownItem}
                onClick={handleProfileClick}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = '#ecfdf5')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = 'transparent')
                }
              >
                Profil Saya
              </button>
              <button
                style={styles.dropdownItem}
                onClick={handleLogout}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = '#ecfdf5')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = 'transparent')
                }
              >
                <LogOut size={16} style={{ marginRight: '0.5rem' }} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
