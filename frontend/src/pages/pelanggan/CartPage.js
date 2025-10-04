// src/pages/pelanggan/CartPage.js
import React, { useContext, useState } from "react";
import { CartContext } from "../../context/CartContext";
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight, Home, CreditCard, Shield, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/pelanggan/Header";

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
    marginBottom: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  subtitle: {
    color: '#64748b',
    fontSize: '1rem'
  },
  cartContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '2rem',
    alignItems: 'start'
  },
  cartItems: {
    backgroundColor: 'white',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(226, 232, 240, 0.5)'
  },
  cartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #e2e8f0'
  },
  cartTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  itemCount: {
    color: '#64748b',
    fontSize: '0.9rem'
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    color: '#64748b'
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
    opacity: 0.5
  },
  emptyTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#374151'
  },
  emptyText: {
    marginBottom: '2rem',
    color: '#6b7280'
  },
  emptyButton: {
    backgroundColor: '#10b981',
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
  emptyButtonHover: {
    backgroundColor: '#059669',
    transform: 'translateY(-1px)'
  },
  cartItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '1px solid #f1f5f9',
    transition: 'all 0.2s ease'
  },
  cartItemHover: {
    backgroundColor: '#f8fafc',
    borderRadius: '0.75rem'
  },
  itemImage: {
    width: '80px',
    height: '80px',
    backgroundColor: '#f1f5f9',
    borderRadius: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#94a3b8',
    fontSize: '1.5rem',
    marginRight: '1rem',
    flexShrink: 0
  },
  itemContent: {
    flex: 1,
    marginRight: '1rem'
  },
  itemName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '0.25rem'
  },
  itemDescription: {
    color: '#64748b',
    fontSize: '0.9rem',
    marginBottom: '0.5rem'
  },
  itemPrice: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#059669'
  },
  quantityControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginRight: '1rem'
  },
  quantityButton: {
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '0.5rem',
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
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1e293b',
    minWidth: '2rem',
    textAlign: 'center'
  },
  itemTotal: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#059669',
    marginRight: '1rem',
    minWidth: '100px',
    textAlign: 'right'
  },
  removeButton: {
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '0.5rem',
    border: '1px solid #fecaca',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  removeButtonHover: {
    backgroundColor: '#dc2626',
    color: 'white'
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(226, 232, 240, 0.5)',
    position: 'sticky',
    top: '2rem'
  },
  summaryTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 0',
    borderBottom: '1px solid #f1f5f9'
  },
  summaryLabel: {
    color: '#64748b',
    fontSize: '0.95rem'
  },
  summaryValue: {
    color: '#1e293b',
    fontWeight: '500',
    fontSize: '0.95rem'
  },
  summaryTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 0',
    borderTop: '2px solid #e2e8f0',
    marginTop: '0.5rem'
  },
  totalLabel: {
    color: '#1e293b',
    fontWeight: '600',
    fontSize: '1.1rem'
  },
  totalValue: {
    color: '#059669',
    fontWeight: '700',
    fontSize: '1.3rem'
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    margin: '1.5rem 0'
  },
  feature: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '1rem',
    backgroundColor: '#f8fafc',
    borderRadius: '0.75rem'
  },
  featureIcon: {
    width: '2rem',
    height: '2rem',
    color: '#10b981',
    marginBottom: '0.5rem'
  },
  featureText: {
    fontSize: '0.8rem',
    color: '#64748b',
    fontWeight: '500'
  },
  checkoutButton: {
    width: '100%',
    backgroundColor: '#10b981',
    color: 'white',
    padding: '1rem 1.5rem',
    borderRadius: '0.75rem',
    border: 'none',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    marginTop: '1rem'
  },
  checkoutButtonHover: {
    backgroundColor: '#059669',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
  },
  clearCartButton: {
    backgroundColor: 'transparent',
    color: '#ef4444',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    border: '1px solid #fecaca',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  clearCartButtonHover: {
    backgroundColor: '#fef2f2'
  }
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @media (max-width: 1024px) {
    .cart-container { grid-template-columns: 1fr !important; }
    .summary-card { position: static !important; }
  }
  
  @media (max-width: 768px) {
    .main-padding { padding: 1rem !important; }
    .cart-item { flex-direction: column; align-items: flex-start; gap: 1rem; }
    .item-content { margin-right: 0; }
    .quantity-control { margin-right: 0; }
    .features { grid-template-columns: 1fr !important; }
    .cart-actions { flex-direction: column; gap: 1rem; }
  }
  
  @media (max-width: 480px) {
    .cart-items { padding: 1rem !important; }
    .summary-card { padding: 1rem !important; }
  }
`;
if (!document.querySelector('#cart-styles')) {
  styleSheet.id = 'cart-styles';
  document.head.appendChild(styleSheet);
}

const CartPage = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    updateQty,
    removeFromCart,
    clearCart,
    subtotal,
  } = useContext(CartContext);

  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoveredButton, setHoveredButton] = useState(null);
  const [hoveredRemove, setHoveredRemove] = useState(null);
  const [hoveredClear, setHoveredClear] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.qty, 0);
  };

  if (cartItems.length === 0) {
    return (
      <div style={styles.container}>
        <Header />
        <main style={styles.main} className="main-padding">
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🛒</div>
            <h3 style={styles.emptyTitle}>Keranjang Belanja Kosong</h3>
            <p style={styles.emptyText}>
              Yuk pilih menu favoritmu terlebih dahulu!
            </p>
            <button
              style={{
                ...styles.emptyButton,
                ...(hoveredButton === 'shop' ? styles.emptyButtonHover : {})
              }}
              onClick={() => navigate('/pelanggan/menu')}
              onMouseEnter={() => setHoveredButton('shop')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <ShoppingBag size={18} />
              Jelajahi Menu
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Header />
      
      <main style={styles.main} className="main-padding">
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>
            <ShoppingBag size={32} />
            Keranjang Belanja
          </h1>
          <p style={styles.subtitle}>
            Review pesanan Anda dan lanjutkan ke pembayaran
          </p>
        </div>

        <div style={styles.cartContainer} className="cart-container">
          {/* Cart Items */}
          <div style={styles.cartItems}>
            <div style={styles.cartHeader}>
              <div>
                <h2 style={styles.cartTitle}>
                  <ShoppingBag size={24} />
                  Item Pesanan
                </h2>
                <p style={styles.itemCount}>
                  {getTotalItems()} item dalam keranjang
                </p>
              </div>
              <button
                style={{
                  ...styles.clearCartButton,
                  ...(hoveredClear ? styles.clearCartButtonHover : {})
                }}
                onClick={clearCart}
                onMouseEnter={() => setHoveredClear(true)}
                onMouseLeave={() => setHoveredClear(false)}
              >
                <Trash2 size={16} />
                Hapus Semua
              </button>
            </div>

            {cartItems.map((item, index) => (
              <div
                key={item.id_menu}
                style={{
                  ...styles.cartItem,
                  ...(hoveredItem === index ? styles.cartItemHover : {})
                }}
                onMouseEnter={() => setHoveredItem(index)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div style={styles.itemImage}>
                  {item.gambar ? (
                    <img 
                      src={`http://localhost:5000/${item.gambar}`} 
                      alt={item.nama_menu}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.75rem' }}
                    />
                  ) : (
                    <ShoppingBag size={24} />
                  )}
                </div>
                
                <div style={styles.itemContent}>
                  <h3 style={styles.itemName}>{item.nama_menu}</h3>
                  <p style={styles.itemDescription}>{item.deskripsi_menu}</p>
                  <div style={styles.itemPrice}>
                    {formatPrice(item.harga)}
                  </div>
                </div>

                <div style={styles.quantityControl}>
                  <button
                    style={{
                      ...styles.quantityButton,
                      ...(item.qty <= 1 ? styles.quantityButtonDisabled : {}),
                      ...(hoveredButton === `decrease-${index}` ? styles.quantityButtonHover : {})
                    }}
                    onClick={() => updateQty(item.id_menu, item.qty - 1)}
                    disabled={item.qty <= 1}
                    onMouseEnter={() => setHoveredButton(`decrease-${index}`)}
                    onMouseLeave={() => setHoveredButton(null)}
                  >
                    <Minus size={16} />
                  </button>
                  <span style={styles.quantity}>{item.qty}</span>
                  <button
                    style={{
                      ...styles.quantityButton,
                      ...(hoveredButton === `increase-${index}` ? styles.quantityButtonHover : {})
                    }}
                    onClick={() => updateQty(item.id_menu, item.qty + 1)}
                    onMouseEnter={() => setHoveredButton(`increase-${index}`)}
                    onMouseLeave={() => setHoveredButton(null)}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div style={styles.itemTotal}>
                  {formatPrice(item.harga * item.qty)}
                </div>

                <button
                  style={{
                    ...styles.removeButton,
                    ...(hoveredRemove === index ? styles.removeButtonHover : {})
                  }}
                  onClick={() => removeFromCart(item.id_menu)}
                  onMouseEnter={() => setHoveredRemove(index)}
                  onMouseLeave={() => setHoveredRemove(null)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div style={styles.summaryCard} className="summary-card">
            <h2 style={styles.summaryTitle}>
              <CreditCard size={20} />
              Ringkasan Pesanan
            </h2>

            <div style={styles.features}>
              <div style={styles.feature}>
                <Shield style={styles.featureIcon} />
                <span style={styles.featureText}>Aman & Terpercaya</span>
              </div>
              <div style={styles.feature}>
                <Truck style={styles.featureIcon} />
                <span style={styles.featureText}>Gratis Ongkir</span>
              </div>
              <div style={styles.feature}>
                <CreditCard style={styles.featureIcon} />
                <span style={styles.featureText}>Beragam Bayar</span>
              </div>
            </div>

            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Subtotal ({getTotalItems()} item)</span>
              <span style={styles.summaryValue}>{formatPrice(subtotal)}</span>
            </div>
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Biaya Layanan</span>
              <span style={styles.summaryValue}>Gratis</span>
            </div>
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>PPN (10%)</span>
              <span style={styles.summaryValue}>{formatPrice(subtotal * 0.1)}</span>
            </div>

            <div style={styles.summaryTotal}>
              <span style={styles.totalLabel}>Total Pembayaran</span>
              <span style={styles.totalValue}>
                {formatPrice(subtotal + subtotal * 0.1)}
              </span>
            </div>

            <button
              style={{
                ...styles.checkoutButton,
                ...(hoveredButton === 'checkout' ? styles.checkoutButtonHover : {})
              }}
              onClick={() => navigate("/checkout")}
              onMouseEnter={() => setHoveredButton('checkout')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <CreditCard size={18} />
              Checkout
              <ArrowRight size={16} />
            </button>

            <button
              style={{
                ...styles.emptyButton,
                marginTop: '0.75rem',
                backgroundColor: 'transparent',
                color: '#64748b',
                border: '1px solid #e2e8f0'
              }}
              onClick={() => navigate('/pelanggan/menu')}
            >
              <Plus size={16} />
              Tambah Item Lain
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CartPage;