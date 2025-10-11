import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from "../../context/CartContext";
import { 
  Coffee, 
  ShoppingCart, 
  User, 
  Menu as MenuIcon, 
  X,
  Home,
  UtensilsCrossed,
  History,
  LogOut,
  ChevronDown
} from 'lucide-react';

const styles = {
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(16, 185, 129, 0.1)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '72px'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    textDecoration: 'none',
    color: '#059669',
    fontWeight: '800',
    fontSize: '1.75rem',
    letterSpacing: '-0.025em',
    transition: 'all 0.3s ease'
  },
  logoHover: {
    transform: 'scale(1.02)'
  },
  logoIcon: {
    width: '2.5rem',
    height: '2.5rem',
    color: '#059669',
    borderRadius: '0.75rem',
    padding: '0.5rem'
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(243, 244, 246, 0.8)',
    borderRadius: '1rem',
    padding: '0.25rem'
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    textDecoration: 'none',
    color: '#6b7280',
    fontWeight: '600',
    fontSize: '0.95rem',
    padding: '0.75rem 1.25rem',
    borderRadius: '0.75rem',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer'
  },
  navItemActive: {
    color: '#059669',
    background: 'white',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
  },
  navItemHover: {
    color: '#059669',
    background: 'rgba(255, 255, 255, 0.5)'
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  cartButton: {
    position: 'relative',
    padding: '0.75rem',
    borderRadius: '0.75rem',
    border: 'none',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cartButtonHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
  },
  cartBadge: {
    position: 'absolute',
    top: '-0.25rem',
    right: '-0.25rem',
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: 'white',
    borderRadius: '50%',
    width: '1.5rem',
    height: '1.5rem',
    fontSize: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)'
  },
  profileSection: {
    position: 'relative'
  },
  profileButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: '0.75rem',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    background: 'white',
    color: '#374151',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '0.9rem',
    fontWeight: '600'
  },
  profileButtonHover: {
    borderColor: '#10b981',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
    transform: 'translateY(-1px)'
  },
  userAvatar: {
    width: '2rem',
    height: '2rem',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '600',
    fontSize: '0.8rem'
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '0.5rem',
    background: 'white',
    borderRadius: '1rem',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    minWidth: '220px',
    overflow: 'hidden',
    animation: 'dropdownSlide 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    backdropFilter: 'blur(20px)'
  },
  dropdownHeader: {
    padding: '1rem 1.25rem',
    borderBottom: '1px solid #f3f4f6',
    background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 50%)'
  },
  dropdownUserName: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '0.25rem'
  },
  dropdownUserEmail: {
    fontSize: '0.8rem',
    color: '#6b7280'
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    width: '100%',
    padding: '0.875rem 1.25rem',
    textDecoration: 'none',
    color: '#64748b',
    fontSize: '0.9rem',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left',
    fontWeight: '500'
  },
  dropdownItemHover: {
    background: 'rgba(16, 185, 129, 0.08)',
    color: '#059669'
  },
  dropdownDivider: {
    height: '1px',
    background: '#f3f4f6',
    margin: '0.25rem 0'
  },
  mobileMenuButton: {
    display: 'none',
    padding: '0.75rem',
    borderRadius: '0.75rem',
    border: '1px solid #e5e7eb',
    background: 'white',
    color: '#374151',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  mobileMenuButtonHover: {
    borderColor: '#10b981',
    color: '#059669'
  },
  mobileOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 40,
    animation: 'fadeIn 0.3s ease-out'
  },
  mobileMenu: {
    position: 'fixed',
    top: '72px',
    left: 0,
    right: 0,
    background: 'white',
    zIndex: 41,
    borderBottom: '1px solid #e5e7eb',
    animation: 'slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    backdropFilter: 'blur(20px)'
  },
  mobileMenuContent: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  mobileNavItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    textDecoration: 'none',
    color: '#64748b',
    padding: '1rem 1.25rem',
    borderRadius: '0.75rem',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    background: 'white',
    border: '1px solid transparent'
  },
  mobileNavItemActive: {
    color: '#059669',
    background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)'
  },
  mobileNavItemHover: {
    color: '#059669',
    background: 'rgba(16, 185, 129, 0.05)'
  }
};

// Add CSS animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes dropdownSlide {
    0% { opacity: 0; transform: translateY(-10px) scale(0.95); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
  
  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  
  @keyframes slideDown {
    0% { opacity: 0; transform: translateY(-20px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  
  @media (max-width: 768px) {
    .nav-desktop { display: none !important; }
    .mobile-menu-button { display: flex !important; }
  }
  
  @media (max-width: 480px) {
    .logo-text { display: none; }
    .profile-name { display: none; }
    .container { padding: 0 1rem; }
  }
`;
if (!document.querySelector('#header-styles')) {
  styleSheet.id = 'header-styles';
  document.head.appendChild(styleSheet);
}

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartHover, setCartHover] = useState(false);
  const [profileHover, setProfileHover] = useState(false);
  const [logoHover, setLogoHover] = useState(false);
  const [mobileMenuHover, setMobileMenuHover] = useState(false);

  const { cartItems } = useContext(CartContext);     
  const cartItemsCount = (cartItems || []).reduce(   
    (sum, it) => sum + Number(it.qty || 0),
    0
  );

  const navItems = [
    { path: '/pelanggan/dashboard', label: 'Home', icon: Home },
    { path: '/pelanggan/menu', label: 'Menu', icon: UtensilsCrossed },
    { path: '/pelanggan/history', label: 'History', icon: History },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileOpen(false);
  };

  const handleCartClick = () => {
    navigate('/pelanggan/cart');
  };

  const handleProfileClick = () => {
    navigate('/pelanggan/profile');
    setProfileOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const getUserInitial = () => {
    return user?.nama_lengkap?.charAt(0)?.toUpperCase() || 'U';
  };

  return (
    <>
      <header style={styles.header}>
        <div style={styles.container}>
          {/* Logo */}
          <Link 
            to="/pelanggan/dashboard" 
            style={{
              ...styles.logo,
              ...(logoHover ? styles.logoHover : {})
            }}
            onMouseEnter={() => setLogoHover(true)}
            onMouseLeave={() => setLogoHover(false)}
          >
            <Coffee style={styles.logoIcon} />
            <span className="logo-text">COFFENARY</span>
          </Link>

          {/* Desktop Navigation */}
          <nav style={styles.nav} className="nav-desktop">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    ...styles.navItem,
                    ...(active ? styles.navItemActive : {})
                  }}
                >
                  <IconComponent size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div style={styles.actions}>
            {/* Cart Button */}
            <button
              style={{
                ...styles.cartButton,
                ...(cartHover ? styles.cartButtonHover : {})
              }}
              onClick={handleCartClick}
              onMouseEnter={() => setCartHover(true)}
              onMouseLeave={() => setCartHover(false)}
            >
              <ShoppingCart size={20} />
              {cartItemsCount > 0 && (
                <span style={styles.cartBadge}>
                  {cartItemsCount > 99 ? '99+' : cartItemsCount}
                </span>
              )}
            </button>

            {/* Profile Dropdown */}
            <div style={styles.profileSection}>
              <button
                style={{
                  ...styles.profileButton,
                  ...(profileHover ? styles.profileButtonHover : {})
                }}
                onClick={() => setProfileOpen(!profileOpen)}
                onMouseEnter={() => setProfileHover(true)}
                onMouseLeave={() => setProfileHover(false)}
              >
                <div style={styles.userAvatar}>
                  {getUserInitial()}
                </div>
                <span className="profile-name">
                  {user?.nama_lengkap || 'User'}
                </span>
                <ChevronDown size={16} />
              </button>

              {profileOpen && (
                <div style={styles.dropdownMenu}>
                  {/* Dropdown Header */}
                  <div style={styles.dropdownHeader}>
                    <div style={styles.dropdownUserName}>
                      {user?.nama_lengkap || 'User'}
                    </div>
                    <div style={styles.dropdownUserEmail}>
                      {user?.email || 'Pelanggan Coffenary'}
                    </div>
                  </div>

                  {/* Dropdown Items */}
                  <button
                    style={styles.dropdownItem}
                    onClick={handleProfileClick}
                  >
                    <User size={18} />
                    Profile Saya
                  </button>
                  
                  <div style={styles.dropdownDivider} />
                  
                  <button
                    style={styles.dropdownItem}
                    onClick={handleLogout}
                  >
                    <LogOut size={18} />
                    Keluar
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              style={{
                ...styles.mobileMenuButton,
                ...(mobileMenuHover ? styles.mobileMenuButtonHover : {})
              }}
              className="mobile-menu-button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              onMouseEnter={() => setMobileMenuHover(true)}
              onMouseLeave={() => setMobileMenuHover(false)}
            >
              {mobileMenuOpen ? <X size={20} /> : <MenuIcon size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          <div style={styles.mobileOverlay} onClick={closeMobileMenu} />
          <div style={styles.mobileMenu}>
            <div style={styles.mobileMenuContent}>
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const active = isActive(item.path);
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={{
                      ...styles.mobileNavItem,
                      ...(active ? styles.mobileNavItemActive : {})
                    }}
                    onClick={closeMobileMenu}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.target.style.background = styles.mobileNavItemHover.background;
                        e.target.style.color = styles.mobileNavItemHover.color;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.target.style.background = styles.mobileNavItem.background;
                        e.target.style.color = styles.mobileNavItem.color;
                      }
                    }}
                  >
                    <IconComponent size={20} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Header;