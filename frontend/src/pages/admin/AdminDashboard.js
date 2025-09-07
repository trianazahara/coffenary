import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        topMenu: 'Memuat...'
    });
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                if (!token) {
                    setError('Otentikasi Gagal.');
                    return;
                }
                
                const config = {
                    headers: { Authorization: `Bearer ${token}` }
                };

                // Panggil endpoint statistik yang baru dibuat
                const response = await axios.get('http://localhost:5000/api/orders/admin/stats', config);
                setStats(response.data);

            } catch (err) {
                setError('Gagal memuat data statistik.');
                console.error(err);
            }
        };

        fetchStats();
    }, []);

    const cardStyle = {
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        border: '1px solid #e5e7eb'
    };

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem'
    };

    return (
        <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
                Dashboard
            </h1>
            <p style={{ color: '#4b5563', marginBottom: '2rem' }}>
                Selamat datang kembali, Admin! Berikut ringkasan aktivitas hari ini.
            </p>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div style={gridStyle}>
                <div style={cardStyle}>
                    <h3 style={{ fontWeight: '600', color: '#374151' }}>Total Pesanan Hari Ini</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981', margin: '0.5rem 0' }}>
                        {stats.totalOrders}
                    </p>
                </div>
                <div style={cardStyle}>
                    <h3 style={{ fontWeight: '600', color: '#374151' }}>Pendapatan Hari Ini</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981', margin: '0.5rem 0' }}>
                        Rp {stats.totalRevenue.toLocaleString('id-ID')}
                    </p>
                </div>
                <div style={cardStyle}>
                    <h3 style={{ fontWeight: '600', color: '#374151' }}>Menu Terlaris</h3>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: '0.5rem 0' }}>
                        {stats.topMenu}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;