import React, { useState, useEffect } from 'react';
import axios from 'axios'; // 1. Impor axios
import { Eye, CheckCircle, Clock } from 'lucide-react';

// ... Hapus const dummyOrders ...

const statusStyles = {
    pending: { backgroundColor: '#fffbeb', color: '#f59e0b', text: 'Menunggu Konfirmasi' },
    preparing: { backgroundColor: '#eff6ff', color: '#3b82f6', text: 'Sedang Disiapkan' },
    ready: { backgroundColor: '#f0fdf4', color: '#22c55e', text: 'Siap Diambil' },
    completed: { backgroundColor: '#f5f5f5', color: '#6b7280', text: 'Selesai' },
    cancelled: { backgroundColor: '#fee2e2', color: '#ef4444', text: 'Dibatalkan' },
};

const styles = {
    title: { fontSize: '2.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '2rem' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' },
    card: { backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: '1px solid #e5e7eb', padding: '1.5rem' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '1rem', marginBottom: '1rem' },
    statusBadge: { padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '500' },
    cardBody: { color: '#4b5563' },
    cardFooter: { marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' },
    actionButton: { color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }
};

const AdminPemesanan = () => {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');

    // 2. Buat fungsi untuk mengambil data dari API
    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get('http://localhost:5000/api/orders/admin', config);
            
            // 3. Ubah format data dari backend agar sesuai dengan tampilan
            const formattedOrders = response.data.map(order => ({
                id: order.id_pemesanan,
                displayId: order.nomor_pesanan,
                customer: order.nama_pelanggan,
                time: new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                total: parseFloat(order.total_harga),
                status: order.status
            }));
            setOrders(formattedOrders);
        } catch (err) {
            setError('Gagal mengambil data pesanan.');
            console.error(err);
        }
    };

    // Panggil fetchOrders saat komponen pertama kali dimuat
    useEffect(() => {
        fetchOrders();
    }, []);

    // 4. Perbarui fungsi handleUpdateStatus untuk mengirim request ke API
    const handleUpdateStatus = async (orderId, newStatus) => {
        if (window.confirm(`Apakah Anda yakin ingin mengubah status pesanan menjadi "${statusStyles[newStatus].text}"?`)) {
            try {
                const token = localStorage.getItem('adminToken');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                
                await axios.put(`http://localhost:5000/api/orders/admin/${orderId}/status`, { status: newStatus }, config);
                
                // 5. Ambil ulang data pesanan agar tampilan ter-update
                fetchOrders(); 
            } catch (err) {
                alert('Gagal mengubah status pesanan.');
                console.error(err);
            }
        }
    };

    return (
        <div>
            <h1 style={styles.title}>Manajemen Pemesanan</h1>
            
            {error && <p style={{color: 'red'}}>{error}</p>}

            <div style={styles.grid}>
                {orders.map(order => {
                    const statusInfo = statusStyles[order.status];
                    return (
                        <div key={order.id} style={styles.card}>
                            <div style={styles.cardHeader}>
                                <span style={{ fontWeight: '600', color: '#111827' }}>{order.displayId}</span>
                                <span style={{ ...styles.statusBadge, backgroundColor: statusInfo.backgroundColor, color: statusInfo.color }}>
                                    {statusInfo.text}
                                </span>
                            </div>
                            <div style={styles.cardBody}>
                                <p><strong>Pelanggan:</strong> {order.customer}</p>
                                <p><strong>Waktu:</strong> {order.time}</p>
                                <p><strong>Total:</strong> <span style={{ fontWeight: 'bold' }}>Rp {order.total.toLocaleString('id-ID')}</span></p>
                            </div>
                            <div style={styles.cardFooter}>
                                {/* Tombol untuk mengubah status */}
                                {order.status === 'pending' && <button onClick={() => handleUpdateStatus(order.id, 'preparing')} style={{...styles.actionButton, backgroundColor: '#3b82f6'}}>Siapkan Pesanan</button>}
                                {order.status === 'preparing' && <button onClick={() => handleUpdateStatus(order.id, 'ready')} style={{...styles.actionButton, backgroundColor: '#22c55e'}}>Pesanan Siap</button>}
                                {order.status === 'ready' && <button onClick={() => handleUpdateStatus(order.id, 'completed')} style={{...styles.actionButton, backgroundColor: '#6b7280'}}>Selesaikan</button>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AdminPemesanan;