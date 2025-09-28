// src/components/pelanggan/TopbarPelanggan.js
import React, { useContext } from 'react';
import { Menu, Coffee, LogOut, ShoppingCart } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';

const TopbarPelanggan = ({ onToggleSidebar }) => {
  const { user, selectedBranch, logout } = useContext(AuthContext);
  const { totalQty } = useContext(CartContext);
  const navigate = useNavigate();

  return (
    <header style={{
      position:'fixed', top:0, left:0, right:0, height:64, zIndex:50,
      background:'#ffffff', borderBottom:'1px solid #e5e7eb',
      display:'flex', alignItems:'center', padding:'0 16px', gap:12
    }}>
      <button onClick={onToggleSidebar} style={{border:'1px solid #e5e7eb', borderRadius:8, background:'#fff', width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center'}}>
        <Menu size={20}/>
      </button>

      <div style={{display:'flex', alignItems:'center', gap:8, fontWeight:700, color:'#059669'}}>
        <Coffee size={22}/> COFFENARY
      </div>

      <div style={{marginLeft:'auto', display:'flex', alignItems:'center', gap:12}}>
        {selectedBranch && (
          <div style={{fontSize:14, color:'#6b7280'}}>Cabang: <b>{selectedBranch.nama_cabang}</b></div>
        )}

        <button
          onClick={() => navigate('/pelanggan/cart')}
          style={{position:'relative', border:'1px solid #e5e7eb', borderRadius:8, background:'#fff', width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center'}}
          title="Keranjang"
        >
          <ShoppingCart size={20}/>
          {totalQty > 0 && (
            <span style={{
              position:'absolute', top:-4, right:-4, background:'#ef4444', color:'#fff',
              width:18, height:18, borderRadius:'50%', fontSize:11, display:'flex', alignItems:'center', justifyContent:'center'
            }}>
              {totalQty}
            </span>
          )}
        </button>

        <div style={{fontSize:14, color:'#374151'}}>{user?.nama_lengkap || user?.username || 'Pelanggan'}</div>

        <button onClick={logout} style={{border:'1px solid #e5e7eb', borderRadius:8, background:'#fff', width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center'}} title="Keluar">
          <LogOut size={20}/>
        </button>
      </div>
    </header>
  );
};

export default TopbarPelanggan;
