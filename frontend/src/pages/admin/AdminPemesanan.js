import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import { Eye, X, MessageSquare, Search, Calendar, RefreshCw, CheckCircle, AlertTriangle, Info } from 'lucide-react';

const statusStyles = {
    pending: { backgroundColor: '#fffbeb', color: '#f59e0b', text: 'Menunggu Konfirmasi' },
    terkonfirmasi: { backgroundColor: '#eff6ff', color: '#3b82f6', text: 'Terkonfirmasi' },
    dalam_persiapan: { backgroundColor: '#e0e7ff', color: '#4338ca', text: 'Sedang Disiapkan' },
    siap: { backgroundColor: '#f3f4f6', color: '#f6d518', text: 'Siap Diambil' },
    selesai: { backgroundColor: '#f0fdf4', color: '#16a34a', text: 'Selesai' },
    dibatalkan: { backgroundColor: '#fee2e2', color: '#ef4444', text: 'Dibatalkan' },
};

const styles = {
    container: { padding: '2rem', backgroundColor: '#f9fafb', minHeight: '100vh' },
    header: { marginBottom: '2rem' },
    title: { fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' },
    subtitle: { color: '#6b7280', fontSize: '1rem' },
    filterBar: { 
        display: 'flex', 
        gap: '6rem', 
        marginBottom: '2rem', 
        flexWrap: 'wrap',
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '0.75rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    searchBox: { 
        flex: '1', 
        minWidth: '250px',
        position: 'relative'
    },
    searchIcon: {
        position: 'absolute',
        left: '1rem',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#9ca3af',
        pointerEvents: 'none'
    },
    searchInput: { 
        width: '100%', 
        padding: '0.75rem 1rem 0.75rem 2.75rem', 
        border: '1px solid #e5e7eb', 
        borderRadius: '0.5rem',
        fontSize: '0.95rem',
        outline: 'none',
        transition: 'border-color 0.2s'
    },
    dateFilter: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    },
    dateInput: {
        padding: '0.75rem 1rem',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        fontSize: '0.95rem',
        outline: 'none',
        transition: 'border-color 0.2s'
    },
    clearDateButton: {
        padding: '0.5rem',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#ef4444',
        display: 'flex',
        alignItems: 'center',
        fontSize: '1.2rem'
    },
    refreshButton: {
        padding: '0.75rem 1.25rem',
        backgroundColor: '#10b981',
        color: 'white',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontWeight: '500',
        transition: 'all 0.2s'
    },
    section: { marginBottom: '2.5rem' },
    sectionHeader: {
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: '1rem',
        paddingBottom: '0.75rem',
        borderBottom: '2px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
    },
    sectionCount: {
        fontSize: '0.9rem',
        fontWeight: '500',
        color: '#6b7280',
        marginLeft: '0.5rem'
    },
    grid: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
        gap: '1.5rem' 
    },
    card: { 
        backgroundColor: 'white', 
        borderRadius: '0.75rem', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
        border: '1px solid #e5e7eb', 
        padding: '1.5rem', 
        display: 'flex', 
        flexDirection: 'column', 
        transition: 'all 0.2s ease'
    },
    cardHover: { 
        transform: 'translateY(-2px)', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)' 
    },
    cardHeader: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderBottom: '1px solid #f3f4f6', 
        paddingBottom: '1rem', 
        marginBottom: '1rem' 
    },
    orderNumber: {
        fontWeight: '600',
        color: '#111827',
        fontSize: '1rem'
    },
    statusBadge: { 
        padding: '0.25rem 0.75rem', 
        borderRadius: '9999px', 
        fontSize: '0.75rem', 
        fontWeight: '600' 
    },
    cardBody: { 
        color: '#4b5563', 
        flexGrow: 1,
        fontSize: '0.9rem'
    },
    infoRow: {
        marginBottom: '0.5rem'
    },
    infoLabel: {
        fontWeight: '600',
        color: '#374151'
    },
    cardFooter: { 
        marginTop: '1.5rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        gap: '0.75rem',
        flexWrap: 'wrap'
    },
    actionButton: { 
        color: 'white', 
        padding: '0.6rem 1rem', 
        borderRadius: '0.5rem', 
        border: 'none', 
        cursor: 'pointer', 
        display: 'flex', 
        alignItems: 'center', 
        fontWeight: '500', 
        transition: 'all 0.2s',
        fontSize: '0.85rem'
    },
    detailButton: { 
        backgroundColor: '#6b7280', 
        color: 'white', 
        padding: '0.6rem 1rem', 
        borderRadius: '0.5rem', 
        border: 'none', 
        cursor: 'pointer', 
        display: 'flex', 
        alignItems: 'center', 
        fontWeight: '500',
        fontSize: '0.85rem',
        transition: 'all 0.2s'
    },
    modalOverlay: { 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        backgroundColor: 'rgba(0,0,0,0.6)', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        zIndex: 1000,
        padding: '1rem'
    },
    modalContent: { 
        backgroundColor: 'white', 
        padding: '2rem', 
        borderRadius: '0.75rem', 
        width: '100%', 
        maxWidth: '700px', 
        maxHeight: '90vh', 
        overflowY: 'auto', 
        position: 'relative',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
    },
    closeButton: { 
        position: 'absolute', 
        top: '1rem', 
        right: '1rem', 
        background: 'none', 
        border: 'none', 
        cursor: 'pointer',
        padding: '0.25rem',
        borderRadius: '0.25rem',
        transition: 'background-color 0.2s'
    },
    modalTitle: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        borderBottom: '2px solid #e5e7eb',
        paddingBottom: '1rem',
        marginBottom: '1.5rem',
        color: '#111827'
    },
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
        marginBottom: '1.5rem'
    },
    infoItem: {
        padding: '0.75rem',
        backgroundColor: '#f9fafb',
        borderRadius: '0.5rem'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '1rem'
    },
    th: { 
        padding: '0.75rem', 
        textAlign: 'left', 
        borderBottom: '2px solid #e5e7eb', 
        backgroundColor: '#f9fafb', 
        color: '#4b5563', 
        textTransform: 'uppercase', 
        fontSize: '0.75rem',
        fontWeight: '600'
    },
    td: { 
        padding: '0.75rem', 
        borderBottom: '1px solid #e5e7eb', 
        color: '#374151', 
        verticalAlign: 'top' 
    },
    notesBox: { 
        display: 'flex', 
        alignItems: 'flex-start', 
        gap: '0.5rem', 
        marginTop: '0.5rem', 
        padding: '0.5rem 0.75rem', 
        backgroundColor: '#f0fdf4', 
        border: '1px solid #bbf7d0', 
        borderRadius: '0.5rem', 
        fontSize: '0.85rem', 
        color: '#059669' 
    },
    emptyState: { 
        textAlign: 'center', 
        padding: '4rem 2rem', 
        color: '#9ca3af', 
        backgroundColor: 'white', 
        borderRadius: '0.75rem', 
        border: '2px dashed #e5e7eb' 
    },
    totalRow: {
        textAlign: 'right',
        fontSize: '1.25rem',
        fontWeight: 'bold',
        marginTop: '1.5rem',
        paddingTop: '1rem',
        borderTop: '2px solid #e5e7eb',
        color: '#111827'
    },
    // New styles for status confirmation modal
    statusModalContent: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '1rem',
        width: '100%',
        maxWidth: '480px',
        position: 'relative',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        textAlign: 'center'
    },
    statusIconContainer: {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1.5rem',
        fontSize: '2rem'
    },
    statusModalTitle: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginBottom: '1rem',
        color: '#111827'
    },
    statusModalText: {
        color: '#6b7280',
        marginBottom: '2rem',
        lineHeight: '1.6'
    },
    statusInfoBox: {
        backgroundColor: '#f8fafc',
        padding: '1.25rem',
        borderRadius: '0.75rem',
        marginBottom: '2rem',
        border: '1px solid #e2e8f0',
        textAlign: 'left'
    },
    statusInfoRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.75rem',
        paddingBottom: '0.75rem',
        borderBottom: '1px solid #f1f5f9'
    },
    statusInfoLabel: {
        color: '#64748b',
        fontWeight: '500'
    },
    statusInfoValue: {
        fontWeight: '600',
        color: '#1e293b'
    },
    statusChangeHighlight: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        margin: '1.5rem 0',
        padding: '1rem',
        backgroundColor: '#f0f9ff',
        borderRadius: '0.75rem',
        border: '1px solid #bae6fd'
    },
    statusArrow: {
        color: '#0ea5e9',
        fontSize: '1.5rem',
        fontWeight: 'bold'
    },
    oldStatus: {
        padding: '0.5rem 1rem',
        backgroundColor: '#f1f5f9',
        color: '#64748b',
        borderRadius: '0.5rem',
        fontWeight: '600',
        fontSize: '0.9rem'
    },
    newStatus: {
        padding: '0.5rem 1rem',
        backgroundColor: '#dbeafe',
        color: '#1d4ed8',
        borderRadius: '0.5rem',
        fontWeight: '600',
        fontSize: '0.9rem'
    },
    modalActions: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center'
    },
    cancelButton: {
        padding: '0.75rem 1.5rem',
        backgroundColor: 'white',
        color: '#64748b',
        border: '1px solid #d1d5db',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        fontWeight: '500',
        transition: 'all 0.2s',
        minWidth: '100px'
    },
    confirmButton: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#10b981',
        color: 'white',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        fontWeight: '500',
        transition: 'all 0.2s',
        minWidth: '100px'
    }
};

const AdminPemesanan = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { selectedBranch, token } = useContext(AuthContext);
    const { markAsViewed, refreshPendingCount } = useContext(NotificationContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [hoveredCard, setHoveredCard] = useState(null);
    
    // New states for status confirmation modal
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [pendingStatusUpdate, setPendingStatusUpdate] = useState(null);

    const fetchOrders = async () => {
        if (!selectedBranch || !token) return;
        try {
            setError('');
            setIsRefreshing(true);
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(`http://localhost:5000/api/pesanan/${selectedBranch.id_cabang}`, config);
            
            const formattedOrders = response.data.map(order => ({
                id: order.id_pesanan,
                displayId: order.nomor_pesanan,
                customer: order.nama_pelanggan,
                time: new Date(order.tanggal_dibuat).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                date: new Date(order.tanggal_dibuat),
                total: parseFloat(order.total_harga),
                status: order.status
            }));
            setOrders(formattedOrders);
            setFilteredOrders(formattedOrders);
            refreshPendingCount();
        } catch (err) {
            setError('Gagal mengambil data pesanan.');
            console.error(err);
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        markAsViewed();
    }, [selectedBranch, token]);

    // Filter dan Search
    useEffect(() => {
        let result = [...orders];

        if (searchQuery) {
            result = result.filter(order => 
                order.displayId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.customer.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedDate) {
            result = result.filter(order => {
                const orderDate = order.date.toISOString().split('T')[0];
                return orderDate === selectedDate;
            });
        }

        setFilteredOrders(result);
    }, [searchQuery, selectedDate, orders]);

    const groupOrdersByDate = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const todayOrders = filteredOrders.filter(order => {
            const orderDate = new Date(order.date);
            orderDate.setHours(0, 0, 0, 0);
            return orderDate.getTime() === today.getTime();
        });

        const yesterdayOrders = filteredOrders.filter(order => {
            const orderDate = new Date(order.date);
            orderDate.setHours(0, 0, 0, 0);
            return orderDate.getTime() === yesterday.getTime();
        });

        const olderOrders = filteredOrders.filter(order => {
            const orderDate = new Date(order.date);
            orderDate.setHours(0, 0, 0, 0);
            return orderDate.getTime() < yesterday.getTime();
        });

        return { todayOrders, yesterdayOrders, olderOrders };
    };

    // Modified handleUpdateStatus to use modal
    const handleUpdateStatusClick = (orderId, currentStatus, newStatus) => {
        const order = orders.find(o => o.id === orderId);
        setPendingStatusUpdate({
            orderId,
            currentStatus,
            newStatus,
            orderNumber: order.displayId,
            customerName: order.customer
        });
        setIsStatusModalOpen(true);
    };

    const handleConfirmStatusUpdate = async () => {
        if (!pendingStatusUpdate) return;
        
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`http://localhost:5000/api/pesanan/${pendingStatusUpdate.orderId}/status`, 
                { status: pendingStatusUpdate.newStatus }, config);
            
            fetchOrders();
            setIsStatusModalOpen(false);
            setPendingStatusUpdate(null);
        } catch (err) {
            alert('Gagal mengubah status pesanan.');
            console.error(err);
            setIsStatusModalOpen(false);
            setPendingStatusUpdate(null);
        }
    };

    const handleCancelStatusUpdate = () => {
        setIsStatusModalOpen(false);
        setPendingStatusUpdate(null);
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

    const { todayOrders, yesterdayOrders, olderOrders } = groupOrdersByDate();

    const renderOrderCard = (order) => {
        const statusInfo = statusStyles[order.status] || { 
            text: order.status.replace(/_/g, ' ').toUpperCase(), 
            backgroundColor: '#e5e7eb', 
            color: '#4b5563' 
        };
        
        return (
            <div 
                key={order.id} 
                style={{
                    ...styles.card,
                    ...(hoveredCard === order.id ? styles.cardHover : {})
                }}
                onMouseEnter={() => setHoveredCard(order.id)}
                onMouseLeave={() => setHoveredCard(null)}
            >
                <div style={styles.cardHeader}>
                    <span style={styles.orderNumber}>{order.displayId}</span>
                    <span style={{ 
                        ...styles.statusBadge, 
                        backgroundColor: statusInfo.backgroundColor, 
                        color: statusInfo.color 
                    }}>
                        {statusInfo.text}
                    </span>
                </div>
                
                <div style={styles.cardBody}>
                    <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Pelanggan: </span>
                        <span>{order.customer}</span>
                    </div>
                    <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Waktu: </span>
                        <span>{order.time}</span>
                    </div>
                    <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Total: </span>
                        <span style={{ fontWeight: '700', color: '#059669' }}>
                            Rp {order.total.toLocaleString('id-ID')}
                        </span>
                    </div>
                </div>
                
                <div style={styles.cardFooter}>
                    {order.status === 'pending' && (
                        <button 
                            onClick={() => handleUpdateStatusClick(order.id, order.status, 'terkonfirmasi')} 
                            style={{...styles.actionButton, backgroundColor: '#3b82f6'}}
                        >
                            Konfirmasi
                        </button>
                    )}
                    {order.status === 'terkonfirmasi' && (
                        <button 
                            onClick={() => handleUpdateStatusClick(order.id, order.status, 'dalam_persiapan')} 
                            style={{...styles.actionButton, backgroundColor: '#6366f1'}}
                        >
                            Siapkan
                        </button>
                    )}
                    {order.status === 'dalam_persiapan' && (
                        <button 
                            onClick={() => handleUpdateStatusClick(order.id, order.status, 'siap')} 
                            style={{...styles.actionButton, backgroundColor: '#f6d518'}}
                        >
                            Siap Diambil
                        </button>
                    )}
                    {order.status === 'siap' && (
                        <button 
                            onClick={() => handleUpdateStatusClick(order.id, order.status, 'selesai')} 
                            style={{...styles.actionButton, backgroundColor: '#16a34a'}}
                        >
                            Selesaikan
                        </button>
                    )}
                    
                    <button 
                        onClick={() => handleOpenModal(order.id)} 
                        style={styles.detailButton}
                    >
                        <Eye size={16} style={{ marginRight: '0.5rem' }} /> 
                        Detail
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Manajemen Pemesanan</h1>
                <p style={styles.subtitle}>Kelola dan pantau semua pesanan yang masuk</p>
            </div>

            {error && <p style={{color: '#ef4444', marginBottom: '1rem', fontWeight: '500'}}>{error}</p>}

            {/* Filter Bar */}
            <div style={styles.filterBar}>
                <div style={styles.searchBox}>
                    <Search size={18} style={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Cari nomor pesanan atau nama pelanggan..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={styles.searchInput}
                    />
                </div>
                
                <div style={styles.dateFilter}>
                    <Calendar size={18} color="#6b7280" />
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={styles.dateInput}
                    />
                    {selectedDate && (
                        <button 
                            onClick={() => setSelectedDate('')}
                            style={styles.clearDateButton}
                            title="Hapus filter tanggal"
                        >
                            ✕
                        </button>
                    )}
                </div>

                <button 
                    onClick={fetchOrders} 
                    style={styles.refreshButton}
                    disabled={isRefreshing}
                >
                    <RefreshCw 
                        size={16} 
                        style={{ 
                            animation: isRefreshing ? 'spin 1s linear infinite' : 'none' 
                        }} 
                    />
                    Refresh
                </button>
            </div>

            {/* Today's Orders */}
            {todayOrders.length > 0 && (
                <div style={styles.section}>
                    <h2 style={styles.sectionHeader}>
                        📅 Hari Ini
                        <span style={styles.sectionCount}>
                            ({todayOrders.length} pesanan)
                        </span>
                    </h2>
                    <div style={styles.grid}>
                        {todayOrders.map(renderOrderCard)}
                    </div>
                </div>
            )}

            {/* Yesterday's Orders */}
            {yesterdayOrders.length > 0 && (
                <div style={styles.section}>
                    <h2 style={styles.sectionHeader}>
                        📆 Kemarin
                        <span style={styles.sectionCount}>
                            ({yesterdayOrders.length} pesanan)
                        </span>
                    </h2>
                    <div style={styles.grid}>
                        {yesterdayOrders.map(renderOrderCard)}
                    </div>
                </div>
            )}

            {/* Older Orders */}
            {olderOrders.length > 0 && (
                <div style={styles.section}>
                    <h2 style={styles.sectionHeader}>
                        📋 Lebih Lama
                        <span style={styles.sectionCount}>
                            ({olderOrders.length} pesanan)
                        </span>
                    </h2>
                    <div style={styles.grid}>
                        {olderOrders.map(renderOrderCard)}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {filteredOrders.length === 0 && (
                <div style={styles.emptyState}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📦</div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                        {searchQuery || selectedDate ? 'Tidak Ada Hasil' : 'Belum Ada Pesanan'}
                    </h3>
                    <p style={{ color: '#6b7280', fontSize: '1rem' }}>
                        {searchQuery || selectedDate 
                            ? 'Coba ubah kriteria pencarian Anda' 
                            : 'Pesanan akan muncul di sini ketika ada pelanggan yang memesan'}
                    </p>
                </div>
            )}

            {/* Modal Detail */}
            {isModalOpen && (
                <div style={styles.modalOverlay} onClick={handleCloseModal}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <button 
                            onClick={handleCloseModal} 
                            style={styles.closeButton}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <X size={24} color="#6b7280" />
                        </button>
                        
                        {isLoadingDetails ? (
                            <div style={{ textAlign: 'center', padding: '3rem' }}>
                                <p>Memuat detail pesanan...</p>
                            </div>
                        ) : selectedOrderDetails ? (
                            <div>
                                <h2 style={styles.modalTitle}>Detail Pesanan</h2>
                                
                                <div style={styles.infoGrid}>
                                    <div style={styles.infoItem}>
                                        <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#6b7280', fontSize: '0.85rem' }}>
                                            Nomor Pesanan
                                        </strong>
                                        <span style={{ fontWeight: '600', color: '#111827' }}>
                                            {selectedOrderDetails.nomor_pesanan}
                                        </span>
                                    </div>
                                    
                                    <div style={styles.infoItem}>
                                        <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#6b7280', fontSize: '0.85rem' }}>
                                            Pelanggan
                                        </strong>
                                        <span style={{ fontWeight: '600', color: '#111827' }}>
                                            {selectedOrderDetails.nama_pelanggan}
                                        </span>
                                    </div>
                                    
                                    <div style={styles.infoItem}>
                                        <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#6b7280', fontSize: '0.85rem' }}>
                                            Tipe Pesanan
                                        </strong>
                                        <span style={{ fontWeight: '600', color: '#111827' }}>
                                            {selectedOrderDetails.tipe_pesanan.replace(/_/g, ' ').toUpperCase()}
                                        </span>
                                    </div>
                                    
                                    <div style={styles.infoItem}>
                                        <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#6b7280', fontSize: '0.85rem' }}>
                                            Status
                                        </strong>
                                        <span style={{ 
                                            ...styles.statusBadge,
                                            backgroundColor: statusStyles[selectedOrderDetails.status]?.backgroundColor,
                                            color: statusStyles[selectedOrderDetails.status]?.color,
                                            display: 'inline-block',
                                            marginTop: '0.25rem'
                                        }}>
                                            {statusStyles[selectedOrderDetails.status]?.text}
                                        </span>
                                    </div>
                                    
                                    {selectedOrderDetails.nomor_meja && (
                                        <div style={styles.infoItem}>
                                            <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#6b7280', fontSize: '0.85rem' }}>
                                                Nomor Meja
                                            </strong>
                                            <span style={{ fontWeight: '600', color: '#111827' }}>
                                                Meja {selectedOrderDetails.nomor_meja}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                
                                {selectedOrderDetails.catatan && (
                                    <div style={{ 
                                        padding: '1rem', 
                                        backgroundColor: '#fffbeb', 
                                        borderRadius: '0.5rem',
                                        marginBottom: '1.5rem',
                                        border: '1px solid #fde68a'
                                    }}>
                                        <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#92400e' }}>
                                            Catatan Pesanan:
                                        </strong>
                                        <p style={{ color: '#78350f', margin: 0 }}>
                                            {selectedOrderDetails.catatan}
                                        </p>
                                    </div>
                                )}
                                
                                <h3 style={{
                                    fontSize: '1.25rem',
                                    fontWeight: 'bold',
                                    marginTop: '1.5rem',
                                    borderBottom: '2px solid #e5e7eb',
                                    paddingBottom: '0.75rem',
                                    marginBottom: '1rem',
                                    color: '#111827'
                                }}>
                                    Item Dipesan
                                </h3>
                                
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.th}>Menu</th>
                                            <th style={styles.th}>Jumlah & Harga</th>
                                            <th style={{...styles.th, textAlign: 'right'}}>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrderDetails.items.map(item => (
                                            <tr key={item.id_item}>
                                                <td style={styles.td}>
                                                    <div style={{fontWeight: '600', marginBottom: '0.25rem', color: '#111827'}}>
                                                        {item.nama_menu}
                                                    </div>
                                                    {item.catatan && (
                                                        <div style={styles.notesBox}>
                                                            <MessageSquare size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                                                            <span style={{fontStyle: 'italic'}}>{item.catatan}</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={styles.td}>
                                                    {item.jumlah} x Rp {parseFloat(item.harga_satuan).toLocaleString('id-ID')}
                                                </td>
                                                <td style={{...styles.td, textAlign: 'right', fontWeight: '600'}}>
                                                    Rp {parseFloat(item.subtotal).toLocaleString('id-ID')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                
                                <p style={styles.totalRow}>
                                    Total: Rp {parseFloat(selectedOrderDetails.total_harga).toLocaleString('id-ID')}
                                </p>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '3rem' }}>
                                <p style={{ color: '#ef4444', fontWeight: '500' }}>Gagal memuat detail pesanan.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Status Confirmation Modal */}
            {isStatusModalOpen && pendingStatusUpdate && (
                <div style={styles.modalOverlay} onClick={handleCancelStatusUpdate}>
                    <div style={styles.statusModalContent} onClick={(e) => e.stopPropagation()}>
                        <button 
                            onClick={handleCancelStatusUpdate} 
                            style={styles.closeButton}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <X size={20} color="#6b7280" />
                        </button>
                        
                        <div style={{
                            ...styles.statusIconContainer,
                            backgroundColor: '#f0f9ff'
                        }}>
                            <Info size={32} color="#0ea5e9" />
                        </div>
                        
                        <h2 style={styles.statusModalTitle}>
                            Konfirmasi Perubahan Status
                        </h2>
                        
                        <p style={styles.statusModalText}>
                            Anda akan mengubah status pesanan berikut:
                        </p>
                        
                        <div style={styles.statusInfoBox}>
                            <div style={styles.statusInfoRow}>
                                <span style={styles.statusInfoLabel}>Nomor Pesanan:</span>
                                <span style={styles.statusInfoValue}>{pendingStatusUpdate.orderNumber}</span>
                            </div>
                            <div style={styles.statusInfoRow}>
                                <span style={styles.statusInfoLabel}>Pelanggan:</span>
                                <span style={styles.statusInfoValue}>{pendingStatusUpdate.customerName}</span>
                            </div>
                        </div>
                        
                        <div style={styles.statusChangeHighlight}>
                            <span style={styles.oldStatus}>
                                {statusStyles[pendingStatusUpdate.currentStatus]?.text || pendingStatusUpdate.currentStatus}
                            </span>
                            <span style={styles.statusArrow}>→</span>
                            <span style={styles.newStatus}>
                                {statusStyles[pendingStatusUpdate.newStatus]?.text || pendingStatusUpdate.newStatus}
                            </span>
                        </div>
                        
                        <p style={{...styles.statusModalText, fontSize: '0.9rem', color: '#ef4444', fontWeight: '500'}}>
                            ⚠️ Tindakan ini tidak dapat dibatalkan
                        </p>
                        
                        <div style={styles.modalActions}>
                            <button 
                                onClick={handleCancelStatusUpdate}
                                style={{
                                    ...styles.cancelButton,
                                    ':hover': { backgroundColor: '#f3f4f6' }
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                            >
                                Batal
                            </button>
                            <button 
                                onClick={handleConfirmStatusUpdate}
                                style={{
                                    ...styles.confirmButton,
                                    ':hover': { backgroundColor: '#059669' }
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                            >
                                Ya, Ubah Status
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Animations */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default AdminPemesanan;