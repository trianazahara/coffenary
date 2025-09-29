// src/components/pelanggan/Header.js
import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  Coffee, 
  Search, 
  ShoppingCart, 
  User, 
  Menu as MenuIcon, 
  X,
  Home,
  UtensilsCrossed,
  History,
  Info,
  Phone,
  LogOut
} from 'lucide-react';

const styles = {
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(16, 185, 129, 0.1)',
    boxShadow: '0 2px 20px rgba(0, 0, 0, 0.1)'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '70px'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    textDecoration: 'none',
    color: '#059669',
    fontWeight: '800',
    fontSize: '1.5rem',
    letterSpacing: '1px'
  },
  logoIcon: {
    width: '2rem',
    height: '2rem',
    color: '#059669'
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem'
  },
  navMobile: {
    display: 'none'
  },
  navItem: {
    textDecoration: 'none',
    color: '#64748b',
    fontWeight: '500',
    fontSize: '0.95rem',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    transition: 'all 0.2s ease',
    position: 'relative'
  },
  navItemActive: {
    color: '#059669',
    backgroundColor: 'rgba(16, 185, 129, 0.1)'
  },
  navItemHover: {
    color: '#059669',
    backgroundColor: 'rgba(16, 185, 129, 0.05)'
  },
  searchContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  searchInput: {
    width: '300px',
    padding: '0.6rem 1rem 0.6rem 2.5rem',
    border: '1px solid #e2e8f0',
    borderRadius: '1rem',
    fontSize: '0.9rem',
    backgroundColor: '#f8fafc',
    transition: 'all 0.2s ease',
    outline: 'none'
  },
  searchInputFocus: {
    borderColor: '#10b981',
    backgroundColor: '#ffffff',
    boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)'
  },
  searchIcon: {
    position: 'absolute',
    left: '0.8rem',
    color: '#94a3b8',
    width: '1.1rem',
    height: '1.1rem'
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  cartButton: {
    position: 'relative',
    padding: '0.6rem',
    borderRadius: '0.5rem',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  cartButtonHover: {
    color: '#059669',
    backgroundColor: 'rgba(16, 185, 129, 0.1)'
  },
  cartBadge: {
    position: 'absolute',
    top: '-0.25rem',
    right: '-0.25rem',
    backgroundColor: '#ef4444',
    color: 'white',
    borderRadius: '50%',
    width: '1.2rem',
    height: '1.2rem',
    fontSize: '0.7rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600'
  },
  profileDropdown: {
    position: 'relative'
  },
  profileButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.6rem 1rem',
    borderRadius: '0.5rem',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '0.9rem',
    fontWeight: '500'
  },
  profileButtonHover: {
    color: '#059669',
    backgroundColor: 'rgba(16, 185, 129, 0.1)'
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '0.5rem',
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
    border: '1px solid rgba(226, 232, 240, 0.5)',
    minWidth: '180px',
    overflow: 'hidden',
    animation: 'dropdownSlide 0.2s ease-out'
  },
  dropdownItem: {
    display: 'block',
    width: '100%',
    padding: '0.75rem 1rem',
    textDecoration: 'none',
    color: '#64748b',
    fontSize: '0.9rem',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left'
  },
  dropdownItemHover: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    color: '#059669'
  },
  mobileMenuButton: {
    display: 'none',
    padding: '0.5rem',
    borderRadius: '0.5rem',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748b',
    cursor: 'pointer'
  },
  mobileOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 100,
    animation: 'fadeIn 0.3s ease-out'
  },
  mobileMenu: {
    position: 'fixed',
    top: '70px',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    zIndex: 101,
    borderBottom: '1px solid #e2e8f0',
    animation: 'slideDown 0.3s ease-out'
  },
  mobileMenuContent: {
    padding: '1rem',
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
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    fontSize: '0.95rem',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },
  mobileNavItemActive: {
    color: '#059669',
    backgroundColor: 'rgba(16, 185, 129, 0.1)'
  }
};

// Add CSS animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes dropdownSlide {
    0% { opacity: 0; transform: translateY(-10px); }
    100% { opacity: 1; transform: translateY(0); }
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
    .search-desktop { display: none !important; }
    .mobile-menu-button { display: block !important; }
  }
  
  @media (max-width: 480px) {
    .logo-text { display: none; }
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
  const [searchFocus, setSearchFocus] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartHover, setCartHover] = useState(false);
  const [profileHover, setProfileHover] = useState(false);

  // Mock cart items count - replace with real cart context
  const cartItemsCount = 3;

  const navItems = [
    { path: '/pelanggan/dashboard', label: 'Home', icon: Home },
    { path: '/pelanggan/menu', label: 'Menu', icon: UtensilsCrossed },
    { path: '/pelanggan/history', label: 'History', icon: History },
    { path: '/about', label: 'About Us', icon: Info },
    // { path: '/contact', label: 'Contact', icon: Phone }
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCartClick = () => {
    navigate('/pelanggan/cart');
  };

  const handleProfileClick = () => {
    navigate('/pelanggan/profile');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header style={styles.header}>
        <div style={styles.container}>
          {/* Logo */}
          <Link to="/pelanggan/dashboard" style={styles.logo}>
            <Coffee style={styles.logoIcon} />
            <span className="logo-text">COFFENARY</span>
          </Link>

          {/* Desktop Navigation */}
          <nav style={styles.nav} className="nav-desktop">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  ...styles.navItem,
                  ...(isActive(item.path) ? styles.navItemActive : {})
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div style={styles.searchContainer} className="search-desktop">
            <Search style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Cari menu..."
              style={{
                ...styles.searchInput,
                ...(searchFocus ? styles.searchInputFocus : {})
              }}
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
            />
          </div>

          {/* Actions */}
          <div style={styles.actions}>
            {/* Cart */}
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
                <span style={styles.cartBadge}>{cartItemsCount}</span>
              )}
            </button>

            {/* Profile Dropdown */}
            <div style={styles.profileDropdown}>
              <button
                style={{
                  ...styles.profileButton,
                  ...(profileHover ? styles.profileButtonHover : {})
                }}
                onClick={() => setProfileOpen(!profileOpen)}
                onMouseEnter={() => setProfileHover(true)}
                onMouseLeave={() => setProfileHover(false)}
              >
                <User size={18} />
                <span>{user?.nama_lengkap || 'Profile'}</span>
              </button>

              {profileOpen && (
                <div style={styles.dropdownMenu}>
                  <button
                    style={styles.dropdownItem}
                    onClick={handleProfileClick}
                  >
                    Profile Saya
                  </button>
                  <button
                    style={styles.dropdownItem}
                    onClick={handleLogout}
                  >
                    <LogOut size={16} style={{ marginRight: '0.5rem' }} />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              style={styles.mobileMenuButton}
              className="mobile-menu-button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
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
              {/* Mobile Search */}
              <div style={styles.searchContainer}>
                <Search style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Cari menu..."
                  style={styles.searchInput}
                />
              </div>

              {/* Mobile Navigation */}
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={{
                      ...styles.mobileNavItem,
                      ...(isActive(item.path) ? styles.mobileNavItemActive : {})
                    }}
                    onClick={closeMobileMenu}
                  >
                    <IconComponent size={18} />
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