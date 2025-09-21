// src/pages/pelanggan/MenuListPage.js
import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import MenuItemCard from '../../components/pelanggan/MenuItemCard';
import CartSummary from '../../components/pelanggan/CartSummary';
import { AuthContext } from '../../context/AuthContext';

const MenuListPage = () => {
  const { token, selectedBranch } = useContext(AuthContext);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMenus = async () => {
      setLoading(true);
      setError('');
      try {
        const config = {};
        if (token) config.headers = { Authorization: `Bearer ${token}` };

        // jika selectedBranch ada gunakan endpoint cabang, jika tidak gunakan all
        if (selectedBranch?.id_cabang) {
          const response = await axios.get(`http://localhost:5000/api/menu/${selectedBranch.id_cabang}`);
          setMenus(response.data || []);
        } else {
          const response = await axios.get('http://localhost:5000/api/menu');
          setMenus(response.data || []);
        }
      } catch (err) {
        console.error('fetch menu error', err);
        setError('Gagal mengambil daftar menu');
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, [token, selectedBranch]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Daftar Menu</h2>
      {selectedBranch && <p>Menampilkan menu untuk: <strong>{selectedBranch.nama_cabang}</strong></p>}
      {loading && <p>Memuat menu...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 16,
        marginTop: 12
      }}>
        {menus.map(menu => <MenuItemCard key={menu.id_menu || menu.id} item={menu} />)}
      </div>

      <CartSummary />
    </div>
  );
};

export default MenuListPage;
