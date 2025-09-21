// src/components/pelanggan/CartSummary.js
import React, { useContext } from 'react';
import { CartContext } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

const CartSummary = () => {
  const { cartItems, subtotal } = useContext(CartContext);
  const navigate = useNavigate();

  if (!cartItems.length) return null;

  return (
    <div style={{
      position: 'fixed', right: 18, bottom: 18, background:'#fff', padding:12, borderRadius:10,
      boxShadow:'0 8px 20px rgba(0,0,0,0.12)', display:'flex', gap:12, alignItems:'center'
    }}>
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <ShoppingCart />
        <div>
          <div style={{fontSize:12, color:'#6b7280'}}>Keranjang</div>
          <div style={{fontWeight:700}}> {cartItems.length} item • Rp {subtotal.toLocaleString()}</div>
        </div>
      </div>
      <button onClick={() => navigate('/pelanggan/cart')} style={{background:'#059669', color:'#fff', padding:'8px 10px', borderRadius:6, border:'none'}}>
        Lihat Keranjang
      </button>
    </div>
  );
};

export default CartSummary;
