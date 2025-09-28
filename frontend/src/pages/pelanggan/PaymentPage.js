// src/pages/pelanggan/PaymentPage.js
import React, { useEffect, useContext, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';

const PaymentPage = ({ order }) => {
  const { user } = useContext(AuthContext);
  const { clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // order contains id_pesanan, total_harga, items
  const handlePay = async () => {
    try {
      setLoading(true);
      // panggil backend untuk inisiasi midtrans
      const res = await axios.post('/api/pembayaran/initiate', {
        id_pesanan: order.id_pesanan,
        total_harga: order.total_harga,
        customer: {
          first_name: user?.nama_lengkap || user?.username || 'Pelanggan',
          email: user?.email || '',
          phone: user?.telepon || ''
        },
        items: order.items
      });
      
      const snapResp = res.data.snap;
      // snapResp bisa berisi token or redirect_url depending on lib
      // If snapResp.token exists -> use snap.pay(token)
      // If snapResp.redirect_url exists -> redirect window.location.href

      if (snapResp && snapResp.token) {
        window.snap.pay(snapResp.token, {
          onSuccess: function(result){
            // payment success - you can optionally call your backend to update
            console.log('success', result);
            clearCart();
            navigate(`/pelanggan/invoice/${order.id_pesanan}`);
          },
          onPending: function(result){
            console.log('pending', result);
            navigate(`/pelanggan/invoice/${order.id_pesanan}`);
          },
          onError: function(result){
            console.log('error', result);
            alert('Pembayaran gagal');
          },
          onClose: function(){
            console.log('User closed payment popup without finishing');
          }
        });
      } else if (snapResp && snapResp.redirect_url) {
        // fallback: redirect to midtrans hosted page
        window.location.href = snapResp.redirect_url;
      } else {
        alert('Gagal membuat transaksi midtrans');
      }

    } catch (err) {
      console.error('initiate midtrans err', err);
      alert('Terjadi kesalahan saat inisiasi pembayaran');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Pembayaran</h2>
      <div>Total: Rp {order.total_harga.toLocaleString()}</div>
      <button onClick={handlePay} disabled={loading} style={{marginTop:12}}>
        {loading ? 'Mempersiapkan...' : 'Bayar Sekarang'}
      </button>
    </div>
  );
};

export default PaymentPage;
