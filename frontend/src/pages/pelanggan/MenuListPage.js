// src/pages/pelanggan/MenuListPage.js
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import Header from '../../components/pelanggan/Header';
import { CartContext } from '../../context/CartContext';  

import { 
  Search, 
  Filter, 
  Plus, 
  Minus,
  ShoppingCart,
  Coffee,
  UtensilsCrossed,
  Cookie,
  IceCream,
  X
} from 'lucide-react';

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    paddingTop: '70px'
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem'
  },
  header: {
    marginBottom: '2rem'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '0.5rem'
  },
  subtitle: {
    color: '#64748b',
    fontSize: '1rem'
  },
  filterSection: {
    backgroundColor: 'white',
    borderRadius: '1rem',
    padding: '1.5rem',
    marginBottom: '2rem',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(226, 232, 240, 0.5)'
  },
  filterHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.5rem'
  },
  filterTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  searchContainer: {
    position: 'relative',
    marginBottom: '1rem'
  },
  searchInput: {
    width: '100%',
    padding: '0.75rem 1rem 0.75rem 2.5rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.75rem',
    fontSize: '0.95rem',
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
    left: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94a3b8',
    width: '1.1rem',
    height: '1.1rem'
  },
  categoryFilters: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap'
  },
  categoryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.6rem 1rem',
    borderRadius: '0.5rem',
    border: '1px solid #e2e8f0',
    backgroundColor: 'white',
    color: '#64748b',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  categoryButtonActive: {
    backgroundColor: '#10b981',
    color: 'white',
    borderColor: '#10b981'
  },
  menuGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  menuCard: {
    backgroundColor: 'white',
    borderRadius: '1rem',
    overflow: 'hidden',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(226, 232, 240, 0.5)',
    transition: 'all 0.3s ease',
    position: 'relative'
  },
  menuCardHover: {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
  },
  menuImage: {
    width: '100%',
    height: '200px',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#94a3b8',
    fontSize: '3rem',
    position: 'relative'
  },
  availabilityBadge: {
    position: 'absolute',
    top: '0.75rem',
    right: '0.75rem',
    padding: '0.25rem 0.75rem',
    borderRadius: '1rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'white'
  },
  availableBadge: {
    backgroundColor: '#10b981'
  },
  unavailableBadge: {
    backgroundColor: '#ef4444'
  },
  menuContent: {
    padding: '1.25rem'
  },
  menuHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.75rem'
  },
  menuTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1e293b',
    flex: 1
  },
  menuPrice: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#059669'
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
  categoryTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.75rem',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    color: '#059669',
    borderRadius: '1rem',
    fontSize: '0.8rem',
    fontWeight: '500'
  },
  quantityControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  quantityButton: {
    width: '2rem',
    height: '2rem',
    borderRadius: '50%',
    border: '1px solid #e2e8f0',
    backgroundColor: 'white',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  quantityButtonHover: {
    backgroundColor: '#10b981',
    color: 'white',
    borderColor: '#10b981'
  },
  quantityButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  quantity: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1e293b',
    minWidth: '1.5rem',
    textAlign: 'center'
  },
  addToCartButton: {
    backgroundColor: '#10b981',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    border: 'none',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  addToCartButtonHover: {
    backgroundColor: '#059669',
    transform: 'translateY(-1px)'
  },
  addToCartButtonDisabled: {
    backgroundColor: '#94a3b8',
    cursor: 'not-allowed',
    transform: 'none'
  },
  loadingState: {
    textAlign: 'center',
    padding: '3rem',
    color: '#64748b'
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    color: '#64748b'
  },
  floatingCart: {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    backgroundColor: '#10b981',
    color: 'white',
    padding: '1rem',
    borderRadius: '50%',
    boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    zIndex: 40
  },
  floatingCartHover: {
    transform: 'scale(1.1)',
    boxShadow: '0 12px 35px rgba(16, 185, 129, 0.5)'
  },
  cartBadge: {
    position: 'absolute',
    top: '-0.5rem',
    right: '-0.5rem',
    backgroundColor: '#ef4444',
    color: 'white',
    borderRadius: '50%',
    width: '1.5rem',
    height: '1.5rem',
    fontSize: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600'
  }
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @media (max-width: 768px) {
    .menu-grid { grid-template-columns: 1fr !important; }
    .filter-categories { flex-direction: column; }
    .floating-cart { bottom: 1rem !important; right: 1rem !important; }
    .main-padding { padding: 1rem !important; }
  }
  
  @media (max-width: 480px) {
    .filter-section { padding: 1rem !important; }
    .menu-card { margin: 0 !important; }
  }
`;
if (!document.querySelector('#menu-styles')) {
  styleSheet.id = 'menu-styles';
  document.head.appendChild(styleSheet);
}

const MenuListPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();


  const { cartItems, addToCart, updateQty } = useContext(CartContext);

  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('semua');
  const [searchFocus, setSearchFocus] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [cart, setCart] = useState({});
  const [cartNotes, setCartNotes] = useState({}); // Untuk menyimpan catatan per item
  const [cartHover, setCartHover] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentNoteItem, setCurrentNoteItem] = useState(null);
  
  const categories = [
    { id: 'semua', label: 'Semua', icon: <Filter size={16} /> },
    { id: 'minuman', label: 'Minuman', icon: <Coffee size={16} /> },
    { id: 'makanan', label: 'Makanan', icon: <UtensilsCrossed size={16} /> },
    { id: 'snack', label: 'Snack', icon: <Cookie size={16} /> },
    { id: 'dessert', label: 'Dessert', icon: <IceCream size={16} /> }
  ];

  useEffect(() => {
    fetchMenuItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [menuItems, searchTerm, selectedCategory]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const stored = JSON.parse(localStorage.getItem('selectedBranch') || 'null');
      const idCabang = stored?.id_cabang || user?.id_cabang || 1;

      // pastikan proxy atau baseURL sudah benar
      const res = await axios.get(`/api/menu/${idCabang}`);

      const transformedMenu = res.data.map(item => ({
        id: item.id_menu,
        name: item.nama_menu,
        description: item.deskripsi_menu,
        price: Number(item.harga) || 0,           // ⬅️ pastikan number (hindari NaN)
        category: item.kategori,
        image: item.gambar,
        available: item.is_tersedia === 1
      }));
      setMenuItems(transformedMenu);
    } catch (err) {
      console.error('Error fetching menu:', err);
      setError('Gagal memuat menu');
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = menuItems;
    if (selectedCategory !== 'semua') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    if (searchTerm) {
      filtered = filtered.filter(item =>
        (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredItems(filtered);
  };

  // helper: ubah item UI -> format legacy yang dipakai CartContext
  const toLegacyCartItem = (it) => ({
    id_menu: it.id,
    nama_menu: it.name,
    deskripsi_menu: it.description,
    kategori: it.category,
    gambar: it.image,
    harga: Number(it.price) || 0, // ⬅️ pastikan numeric
  });

  const getCategoryIcon = (category) => {
    const categoryData = categories.find(cat => cat.id === category);
    return categoryData ? categoryData.icon : <UtensilsCrossed size={16} />;
  };

  const getTotalCartItems = () =>
    cartItems.reduce((sum, i) => sum + (Number(i.qty) || 0), 0);

  const formatPrice = (price) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })
      .format(Number(price) || 0);

  const handleCartClick = () => {
    // CartContext sudah menyimpan ke localStorage di dalamnya, jadi langsung navigate
    navigate('/pelanggan/cart');
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <Header />
        <div style={styles.loadingState}>
          <Coffee size={48} style={{ color: '#10b981', marginBottom: '1rem' }} />
          <p>Memuat menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <Header />
        <div style={styles.emptyState}>
          <X size={48} style={{ color: '#ef4444', marginBottom: '1rem' }} />
          <p>{error}</p>
          <button onClick={fetchMenuItems} style={styles.addToCartButton}>
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Header />

      <main style={styles.main} className="main-padding">
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Menu Coffenary</h1>
          <p style={styles.subtitle}>
            Pilih menu favorit Anda dan nikmati pengalaman coffee shop terbaik
          </p>
        </div>

        {/* Filter Section */}
        <div style={styles.filterSection} className="filter-section">
          <div style={styles.filterHeader}>
            <h2 style={styles.filterTitle}>
              <Filter size={20} />
              Filter & Pencarian
            </h2>
          </div>

          {/* Search */}
          <div style={styles.searchContainer}>
            <Search style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Cari menu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                ...styles.searchInput,
                ...(searchFocus ? styles.searchInputFocus : {})
              }}
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
            />
          </div>

          {/* Category Filters */}
          <div style={styles.categoryFilters} className="filter-categories">
            {categories.map(category => (
              <button
                key={category.id}
                style={{
                  ...styles.categoryButton,
                  ...(selectedCategory === category.id ? styles.categoryButtonActive : {})
                }}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.icon}
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        {filteredItems.length === 0 ? (
          <div style={styles.emptyState}>
            <Coffee size={48} style={{ color: '#94a3b8', marginBottom: '1rem' }} />
            <p>Tidak ada menu yang ditemukan</p>
          </div>
        ) : (
          <div style={styles.menuGrid} className="menu-grid">
            {filteredItems.map((item, index) => {
              // cari qty yang sudah ada di CartContext
              const inCart = cartItems.find(ci => ci.id_menu === item.id);
              const qty = inCart?.qty || 0;

              return (
                <div
                  key={item.id}
                  style={{
                    ...styles.menuCard,
                    ...(hoveredCard === index ? styles.menuCardHover : {}),
                    ...((!item.available) ? { opacity: 0.7 } : {})
                  }}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Image */}
                  <div style={styles.menuImage}>
                    {item.image ? (
                      <img
                        src={`http://localhost:5000/${item.image}`}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : getCategoryIcon(item.category)}
                    <div style={{
                      ...styles.availabilityBadge,
                      ...(item.available ? styles.availableBadge : styles.unavailableBadge)
                    }}>
                      {item.available ? 'Tersedia' : 'Habis'}
                    </div>
                  </div>

                  {/* Content */}
                  <div style={styles.menuContent}>
                    <div style={styles.menuHeader}>
                      <h3 style={styles.menuTitle}>{item.name}</h3>
                      <span style={styles.menuPrice}>{formatPrice(item.price)}</span>
                    </div>

                    <p style={styles.menuDescription}>{item.description}</p>

                    <div style={styles.menuFooter}>
                      <div style={styles.categoryTag}>
                        {getCategoryIcon(item.category)}
                        {item.category}
                      </div>

                      {item.available ? (
                        qty > 0 ? (
                          <div style={styles.quantityControl}>
                            <button
                              style={styles.quantityButton}
                              onClick={() => updateQty(item.id, Math.max(0, qty - 1))} // ⬅️ id_menu = item.id
                            >
                              <Minus size={14} />
                            </button>
                            <span style={styles.quantity}>{qty}</span>
                            <button
                              style={styles.quantityButton}
                              onClick={() => updateQty(item.id, qty + 1)}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        ) : (
                          <button
                            style={styles.addToCartButton}
                            onClick={() => addToCart(toLegacyCartItem(item), 1)} // ⬅️ konversi ke legacy
                          >
                            <Plus size={16} /> Tambah
                          </button>
                        )
                      ) : (
                        <button
                          style={{ ...styles.addToCartButton, ...styles.addToCartButtonDisabled }}
                          disabled
                        >
                          Habis
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Floating Cart Button */}
        {getTotalCartItems() > 0 && (
          <button
            style={{
              ...styles.floatingCart,
              ...(cartHover ? styles.floatingCartHover : {})
            }}
            onClick={handleCartClick}
            onMouseEnter={() => setCartHover(true)}
            onMouseLeave={() => setCartHover(false)}
          >
            <ShoppingCart size={24} />
            <div style={styles.cartBadge}>
              {getTotalCartItems()}
            </div>
          </button>
        )}
      </main>
    </div>
  );
};

export default MenuListPage;