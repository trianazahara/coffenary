import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Eye, X } from 'lucide-react';

// Objek untuk styling status, pastikan key-nya sama persis dengan ENUM di database
const statusStyles = {
    pending: { backgroundColor: '#fffbeb', color: '#f59e0b', text: 'Menunggu Konfirmasi' },
    terkonfirmasi: { backgroundColor: '#eff6ff', color: '#3b82f6', text: 'Terkonfirmasi' },
    dalam_persiapan: { backgroundColor: '#e0e7ff', color: '#4338ca', text: 'Sedang Disiapkan' },
    siap: { backgroundColor: '#f0fdf4', color: '#16a34a', text: 'Siap Diambil' },
    selesai: { backgroundColor: '#f3f4f6', color: '#6b7280', text: 'Selesai' },
    dibatalkan: { backgroundColor: '#fee2e2', color: '#ef4444', text: 'Dibatalkan' },
};

// Objek untuk styling komponen
const styles = {
    title: { fontSize: '2.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '2rem' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' },
    card: { backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', padding: '1.5rem', display: 'flex', flexDirection: 'column' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '1rem', marginBottom: '1rem' },
    statusBadge: { padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600' },
    cardBody: { color: '#4b5563', flexGrow: 1 },
    cardFooter: { marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' },
    actionButton: { color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', fontWeight: '500' },
    detailButton: { backgroundColor: '#4b5563', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', fontWeight: '500' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: 'white', padding: '2rem', borderRadius: '0.75rem', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' },
    closeButton: { position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer' },
    th: { padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb', color: '#4b5563', textTransform: 'uppercase', fontSize: '0.75rem' },
    td: { padding: '0.75rem', borderBottom: '1px solid #e5e7eb', color: '#374151' }
};

const AdminPemesanan = () => {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');
    const { selectedBranch, token } = useContext(AuthContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    const fetchOrders = async () => {
        if (!selectedBranch || !token) return;
        try {
            setError('');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(`http://localhost:5000/api/pesanan/${selectedBranch.id_cabang}`, config);
            
            const formattedOrders = response.data.map(order => ({
                id: order.id_pesanan,
                displayId: order.nomor_pesanan,
                customer: order.nama_pelanggan,
                time: new Date(order.tanggal_dibuat).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                total: parseFloat(order.total_harga),
                status: order.status
            }));
            setOrders(formattedOrders);
        } catch (err) {
            setError('Gagal mengambil data pesanan. Pastikan server backend berjalan.');
            console.error(err);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [selectedBranch, token]);

    const handleUpdateStatus = async (orderId, newStatus) => {
        if (window.confirm(`Anda yakin ingin mengubah status pesanan menjadi "${statusStyles[newStatus]?.text}"?`)) {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await axios.put(`http://localhost:5000/api/pesanan/${orderId}/status`, { status: newStatus }, config);
                fetchOrders(); 
            } catch (err) {
                alert('Gagal mengubah status pesanan.');
                console.error(err);
            }
        }
    };

    const handleOpenModal = async (orderId) => {
        setIsModalOpen(true);
        setIsLoadingDetails(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(`http://localhost:5000/api/pesanan/detail/${orderId}`, config);
            setSelectedOrderDetails(response.data);
        } catch (err) {
            console.error("Gagal mengambil detail pesanan", err);
            alert("Gagal mengambil detail pesanan.");
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOrderDetails(null);
    };

    return (
        <div>
            <h1 style={styles.title}>Manajemen Pemesanan</h1>
            
            {error && <p style={{color: 'red', marginBottom: '1rem'}}>{error}</p>}

            <div style={styles.grid}>
                {orders.map(order => {
                    const statusInfo = statusStyles[order.status] || { text: order.status.replace('_', ' ').toUpperCase(), backgroundColor: '#e5e7eb', color: '#4b5563' };
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
                                <div>
                                    {order.status === 'pending' && <button onClick={() => handleUpdateStatus(order.id, 'terkonfirmasi')} style={{...styles.actionButton, backgroundColor: '#3b82f6'}}>Konfirmasi</button>}
                                    {order.status === 'terkonfirmasi' && <button onClick={() => handleUpdateStatus(order.id, 'dalam_persiapan')} style={{...styles.actionButton, backgroundColor: '#6366f1'}}>Siapkan</button>}
                                    {order.status === 'dalam_persiapan' && <button onClick={() => handleUpdateStatus(order.id, 'siap')} style={{...styles.actionButton, backgroundColor: '#22c55e'}}>Siap Diambil</button>}
                                    {order.status === 'siap' && <button onClick={() => handleUpdateStatus(order.id, 'selesai')} style={{...styles.actionButton, backgroundColor: '#6b7280'}}>Selesaikan</button>}
                                </div>
                                <button onClick={() => handleOpenModal(order.id)} style={styles.detailButton}>
                                    <Eye size={16} style={{ marginRight: '0.5rem' }} /> Detail
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {isModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <button onClick={handleCloseModal} style={styles.closeButton}><X size={24} color="#6b7280" /></button>
                        {isLoadingDetails ? (
                            <p>Memuat detail pesanan...</p>
                        ) : selectedOrderDetails ? (
                            <div>
                                <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem', marginBottom: '1rem'}}>Detail Pesanan</h2>
                                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                                    <p><strong>Nomor Pesanan:</strong><br/>{selectedOrderDetails.nomor_pesanan}</p>
                                    <p><strong>Pelanggan:</strong><br/>{selectedOrderDetails.nama_pelanggan}</p>
                                    <p><strong>Tipe:</strong><br/>{selectedOrderDetails.tipe_pesanan.replace('_', ' ').toUpperCase()}</p>
                                    <p><strong>Status:</strong><br/>{statusStyles[selectedOrderDetails.status]?.text}</p>
                                    {selectedOrderDetails.nomor_meja && <p><strong>Meja:</strong><br/>{selectedOrderDetails.nomor_meja}</p>}
                                </div>
                                <p style={{marginTop: '1rem'}}><strong>Catatan:</strong><br/>{selectedOrderDetails.catatan || '-'}</p>
                                <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', marginTop: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1rem'}}>Item Dipesan</h3>
                                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                                    <thead>
                                        <tr>
                                            <th style={styles.th}>Menu</th>
                                            <th style={styles.th}>Jumlah & Harga Satuan</th>
                                            <th style={{...styles.th, textAlign: 'right'}}>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrderDetails.items.map(item => (
                                            <tr key={item.id_item}>
                                                <td style={styles.td}>{item.nama_menu}</td>
                                                <td style={styles.td}>{item.jumlah} x {parseFloat(item.harga_satuan).toLocaleString('id-ID')}</td>
                                                <td style={{...styles.td, textAlign: 'right'}}>Rp {parseFloat(item.subtotal).toLocaleString('id-ID')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <p style={{textAlign: 'right', fontSize: '1.25rem', fontWeight: 'bold', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb'}}>
                                    Total: Rp {parseFloat(selectedOrderDetails.total_harga).toLocaleString('id-ID')}
                                </p>
                            </div>
                        ) : (
                            <p>Gagal memuat detail.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPemesanan;