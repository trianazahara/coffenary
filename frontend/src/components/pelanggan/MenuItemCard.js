// src/components/pelanggan/MenuItemCard.js
import React, { useState, useContext } from 'react';
import { Plus, Minus } from 'lucide-react';
import { CartContext } from '../../context/CartContext';

const MenuItemCard = ({ item }) => {
  const imageUrl = item.gambar ? `http://localhost:5000/${item.gambar}` : null;
  const { addToCart } = useContext(CartContext);
  const [qty, setQty] = useState(1);

  const inc = () => setQty(q => q + 1);
  const dec = () => setQty(q => Math.max(1, q - 1));

  return (
    <div style={{
      border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, background: '#fff',
      display: 'flex', flexDirection: 'column', gap: 8
    }}>
      <div style={{ minHeight: 120, display:'flex', alignItems:'center', justifyContent:'center', background:'#f8fafc', borderRadius:6 }}>
        {/* jika ada gambar */}
        {imageUrl ? <img src={imageUrl} alt={item.nama_menu} style={{maxWidth:'100%', maxHeight:110, objectFit:'cover'}} /> : <div style={{color:'#9ca3af'}}>No Image</div>}
      </div>
      <div style={{fontWeight:700}}>{item.nama_menu}</div>
      <div style={{color:'#6b7280', fontSize:14}}>{item.deskripsi || '-'}</div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:6}}>
        <div style={{fontWeight:700}}>Rp {Number(item.harga).toLocaleString()}</div>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <button onClick={dec} style={{border:'1px solid #e5e7eb', padding:6, borderRadius:6}}><Minus size={14} /></button>
          <div style={{minWidth:28, textAlign:'center'}}>{qty}</div>
          <button onClick={inc} style={{border:'1px solid #e5e7eb', padding:6, borderRadius:6}}><Plus size={14} /></button>
        </div>
      </div>
      <button
        onClick={() => addToCart(item, qty)}
        style={{ marginTop:8, padding:'8px 10px', background:'#059669', color:'#fff', border:'none', borderRadius:6, cursor:'pointer' }}
      >
        Tambah ke Keranjang
      </button>
    </div>
  );
};

export default MenuItemCard;
