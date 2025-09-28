import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Edit, Plus, X } from 'lucide-react';

const styles = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
    title: { fontSize: '2.25rem', fontWeight: 'bold', color: '#111827' },
    addButton: { backgroundColor: '#10b981', color: 'white', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' },
    tableContainer: { backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden' },
    table: { width: '100%', textAlign: 'left', borderCollapse: 'collapse' },
    th: { padding: '1rem', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb', color: '#4b5563', textTransform: 'uppercase', fontSize: '0.75rem' },
    td: { padding: '1rem', borderBottom: '1px solid #e5e7eb', color: '#374151', verticalAlign: 'middle' },
    statusBadge: { padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '500', display: 'inline-block' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', width: '85%', maxWidth: '420px', position: 'relative', marginTop: '3rem' },
    closeButton: { position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer' },
    formGroup: { marginBottom: '1rem' },
    input: { width: '100%', boxSizing: 'border-box', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', marginTop: '0.5rem' },
    modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' },
};

// ✅ Komponen Modal Notifikasi
const NotificationModal = ({ message, type, onClose }) => {
    return (
        <div style={styles.modalOverlay}>
            <div style={{ ...styles.modalContent, textAlign: 'center' }}>
                <button onClick={onClose} style={styles.closeButton}>
                    <X size={24} color="#6b7280" />
                </button>
                <h2 style={{
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    color: type === 'success' ? '#10b981' : '#ef4444',
                    marginBottom: '1rem'
                }}>
                    {type === 'success' ? 'Berhasil!' : 'Gagal!'}
                </h2>
                <p style={{ color: '#374151' }}>{message}</p>
                
                {/* ✅ Tombol OK ditengah */}
                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                    <button
                        onClick={onClose}
                        style={{ ...styles.addButton, backgroundColor: type === 'success' ? '#10b981' : '#ef4444' }}
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};


const AdminPengguna = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [notif, setNotif] = useState({ open: false, message: '', type: '' }); // ✅ State untuk notif
    const { token } = useContext(AuthContext);

    const fetchUsers = async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get('http://localhost:5000/api/pengguna?tipe=staff', config);
            setUsers(response.data);
        } catch (error) {
            console.error("Gagal mengambil data pengguna:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [token]);
    
    const handleOpenModal = (user = null) => {
        setCurrentUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentUser(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        
        const formData = {
            nama_lengkap: e.target.nama_lengkap.value,
            email: e.target.email.value,
            telepon: e.target.telepon.value,
            peran: e.target.peran.value,
            is_aktif: e.target.is_aktif ? e.target.is_aktif.value : (currentUser ? currentUser.is_aktif : 1),
        };
        
        const password = e.target.password ? e.target.password.value : null;
        if (password && password.trim() !== '') {
            formData.password = password;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            if (currentUser) {
                await axios.put(`http://localhost:5000/api/pengguna/${currentUser.id_pengguna}`, formData, config);
                setNotif({ open: true, message: 'Data pengguna berhasil diperbarui!', type: 'success' });
            } else {
                await axios.post('http://localhost:5000/api/pengguna', formData, config);
                setNotif({ open: true, message: 'Pengguna baru berhasil ditambahkan!', type: 'success' });
            }
            handleCloseModal();
            fetchUsers();
        } catch (error) {
            console.error("Gagal menyimpan data pengguna:", error);
            setNotif({ open: true, message: error.response?.data?.message || 'Gagal menyimpan data.', type: 'error' });
        }
    };

    if (isLoading) return <p>Memuat data pengguna...</p>;

    return (
        <div>
            <div style={styles.header}>
                <h1 style={styles.title}>Manajemen Staff</h1>
                <button onClick={() => handleOpenModal(null)} style={styles.addButton}>
                    <Plus size={20} style={{ marginRight: '0.5rem' }} />
                    Tambah Staff
                </button>
            </div>

            {/* Tabel Pengguna */}
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Nama Lengkap</th>
                            <th style={styles.th}>Email</th>
                            <th style={styles.th}>Peran</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id_pengguna}>
                                <td style={styles.td}>{user.nama_lengkap}</td>
                                <td style={styles.td}>{user.email}</td>
                                <td style={styles.td}>{user.peran}</td>
                                <td style={styles.td}>
                                    <span style={{
                                        ...styles.statusBadge, 
                                        color: user.is_aktif ? '#059669' : '#ef4444', 
                                        backgroundColor: user.is_aktif ? '#ecfdf5' : '#fee2e2'
                                    }}>
                                        {user.is_aktif ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                </td>
                                <td style={styles.td}>
                                    <button onClick={() => handleOpenModal(user)} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }} title="Edit Pengguna">
                                        <Edit size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Tambah/Edit */}
            {isModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <button onClick={handleCloseModal} style={styles.closeButton}><X size={24} color="#6b7280" /></button>
                        <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem'}}>
                            {currentUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
                        </h2>
                        <form onSubmit={handleSave}>
                            <div style={styles.formGroup}>
                                <label>Nama Lengkap</label>
                                <input name="nama_lengkap" type="text" defaultValue={currentUser?.nama_lengkap} style={styles.input} required />
                            </div>
                            <div style={styles.formGroup}>
                                <label>Email</label>
                                <input name="email" type="email" defaultValue={currentUser?.email} style={styles.input} required />
                            </div>
                            <div style={styles.formGroup}>
                                <label>{currentUser ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password Sementara'}</label>
                                <input name="password" type="password" style={styles.input} required={!currentUser} />
                            </div>
                            <div style={styles.formGroup}>
                                <label>Telepon</label>
                                <input name="telepon" type="text" defaultValue={currentUser?.telepon} style={styles.input} />
                            </div>
                            <div style={styles.formGroup}>
                                <label>Peran</label>
                                <select name="peran" defaultValue={currentUser?.peran} style={styles.input} required>
                                    <option value="staff">Staff</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            {currentUser && (
                                <div style={styles.formGroup}>
                                    <label>Status</label>
                                    <select name="is_aktif" defaultValue={currentUser.is_aktif ? 1 : 0} style={styles.input} required>
                                        <option value="1">Aktif</option>
                                        <option value="0">Nonaktif</option>
                                    </select>
                                </div>
                            )}
                            <div style={styles.modalActions}>
                                <button type="button" onClick={handleCloseModal} style={{...styles.addButton, backgroundColor: '#e5e7eb', color: '#374151'}}>Batal</button>
                                <button type="submit" style={styles.addButton}>Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ✅ Modal Notifikasi */}
            {notif.open && (
                <NotificationModal 
                    message={notif.message} 
                    type={notif.type} 
                    onClose={() => setNotif({ ...notif, open: false })} 
                />
            )}
        </div>
    );
};

export default AdminPengguna;
