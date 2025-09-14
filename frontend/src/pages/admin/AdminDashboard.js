import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const AdminDashboard = () => {
    const { selectedBranch, token } = useContext(AuthContext);
    // 1. Tambahkan state baru di sini
    const [stats, setStats] = useState({ 
        totalOrders: 0, 
        totalRevenue: 0, 
        topMenu: '...',
        totalLifetimeOrders: 0,
        totalLifetimeRevenue: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (selectedBranch && token) {
            const fetchStats = async () => {
                setIsLoading(true);
                try {
                    const config = { headers: { Authorization: `Bearer ${token}` } };
                    const response = await axios.get(`http://localhost:5000/api/pesanan/${selectedBranch.id_cabang}/stats`, config);
                    setStats(response.data);
                } catch (error) {
                    console.error("Gagal memuat statistik", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchStats();
        }
    }, [selectedBranch, token]);

    const styles = {
        title: { fontSize: '2.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' },
        subtitle: { color: '#4b5563', marginBottom: '2rem', fontSize: '1rem' },
        grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' },
        card: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
        cardTitle: { fontWeight: '600', color: '#374151' },
        cardStat: { fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981', margin: '0.5rem 0' },
        cardStatSmall: { fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: '0.5rem 0' }
    };

    return (
        <div>
            <h1 style={styles.title}>Dashboard</h1>
            <p style={styles.subtitle}>
                Ringkasan aktivitas untuk cabang: <span style={{ fontWeight: 'bold' }}>{selectedBranch?.nama_cabang}</span>
            </p>

            <div style={styles.grid}>
                {/* --- Kartu Statistik Harian --- */}
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>Total Pesanan Hari Ini</h3>
                    <p style={styles.cardStat}>{isLoading ? '...' : stats.totalOrders}</p>
                </div>
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>Pendapatan Hari Ini</h3>
                    <p style={styles.cardStat}>{isLoading ? '...' : `Rp ${stats.totalRevenue.toLocaleString('id-ID')}`}</p>
                </div>
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>Menu Terlaris Hari Ini</h3>
                    <p style={styles.cardStatSmall}>{isLoading ? '...' : stats.topMenu}</p>
                </div>
                
                {/* --- 2. Kartu Statistik Keseluruhan (BARU) --- */}
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>Total Seluruh Pesanan</h3>
                    <p style={styles.cardStat}>{isLoading ? '...' : stats.totalLifetimeOrders}</p>
                </div>
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>Total Seluruh Pendapatan</h3>
                    <p style={styles.cardStat}>{isLoading ? '...' : `Rp ${stats.totalLifetimeRevenue.toLocaleString('id-ID')}`}</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;