import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Plus, Edit, Trash2 } from 'lucide-react';

const styles = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
    title: { fontSize: '2.25rem', fontWeight: 'bold', color: '#111827' },
    addButton: { backgroundColor: '#10b981', color: 'white', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' },
    table: { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', borderRadius: '0.5rem', overflow: 'hidden' },
    th: { padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb', color: '#4b5563', textTransform: 'uppercase', fontSize: '0.75rem' },
    td: { padding: '1rem', borderBottom: '1px solid #e5e7eb', color: '#374151', verticalAlign: 'middle' },
    actionButton: { background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', width: '500px', maxHeight: '90vh', overflowY: 'auto' },
    input: { width: '100%', boxSizing: 'border-box', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', marginTop: '0.5rem' },
    formGroup: { marginBottom: '1rem' },
    modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' },
    saveButton: { backgroundColor: '#10b981', color: 'white' },
    cancelButton: { backgroundColor: '#e5e7eb', color: '#374151' },
    imagePreview: { width: '60px', height: '60px', objectFit: 'cover', borderRadius: '0.5rem' },

    // popup tambahan
    popupOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
    popupBox: { backgroundColor: 'white', padding: '1.5rem 2rem', borderRadius: '0.5rem', textAlign: 'center', width: '350px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' },
    popupButton: { marginTop: '1rem', padding: '0.5rem 1.2rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }
};

const AdminMenu = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState('');
    const [popup, setPopup] = useState({ show: false, message: '' });
    const { selectedBranch, token } = useContext(AuthContext);

    const fetchMenuItems = async () => {
        if (!selectedBranch) return;
        try {
            const response = await axios.get(`http://localhost:5000/api/menu/${selectedBranch.id_cabang}`);
            setMenuItems(response.data);
        } catch (err) {
            setError('Gagal mengambil data menu.');
            console.error(err);
        }
    };

    useEffect(() => {
        if (selectedBranch) {
            fetchMenuItems();
        }
    }, [selectedBranch]);

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };
    
    const handleOpenModal = (item = null) => {
        setCurrentItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
        setSelectedFile(null);
    };

    const showPopup = (message) => {
        setPopup({ show: true, message });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!selectedBranch || !token) return alert('Silakan pilih cabang atau login ulang.');

        const formData = new FormData();
        formData.append('nama_menu', e.target.nama_menu.value);
        formData.append('deskripsi_menu', e.target.deskripsi_menu.value);
        formData.append('kategori', e.target.kategori.value);
        formData.append('harga', e.target.harga.value);
        formData.append('is_tersedia', e.target.is_tersedia.value);
        formData.append('stok', e.target.stok.value || null);
        
        if (selectedFile) {
            formData.append('gambar', selectedFile);
        } else if (currentItem) {
            formData.append('gambar', currentItem.gambar);
        }

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            if (currentItem) {
                await axios.put(`http://localhost:5000/api/menu/${selectedBranch.id_cabang}/${currentItem.id_menu}`, formData, config);
                showPopup('Menu berhasil diperbarui!');
            } else {
                await axios.post(`http://localhost:5000/api/menu/${selectedBranch.id_cabang}`, formData, config);
                showPopup('Menu berhasil ditambahkan!');
            }
            fetchMenuItems();
            handleCloseModal();
        } catch (err) {
            console.error(err);
            showPopup('Gagal menyimpan data!');
        }
    };
    
    const handleDelete = async (id_menu) => {
        if (!selectedBranch || !token) return alert('Silakan pilih cabang atau login ulang.');
        
        if (window.confirm('Apakah Anda yakin ingin menghapus menu ini?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await axios.delete(`http://localhost:5000/api/menu/${selectedBranch.id_cabang}/${id_menu}`, config);
                fetchMenuItems();
                showPopup('Menu berhasil dihapus!');
            } catch (err) {
                console.error(err);
                showPopup('Gagal menghapus data!');
            }
        }
    };

    return (
        <div>
            <div style={styles.header}>
                <h1 style={styles.title}>Manajemen Menu</h1>
                <button onClick={() => handleOpenModal()} style={styles.addButton}>
                    <Plus size={20} style={{ marginRight: '0.5rem' }} />
                    Tambah Menu
                </button>
            </div>

            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Gambar</th>
                        <th style={styles.th}>Nama Menu</th>
                        <th style={styles.th}>Kategori</th>
                        <th style={styles.th}>Harga</th>
                        <th style={styles.th}>Stok</th>
                        <th style={styles.th}>Ketersediaan</th>
                        <th style={styles.th}>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {menuItems.map(item => (
                        <tr key={item.id_menu}>
                            <td style={styles.td}>
                                {item.gambar ? (
                                    <img 
                                        src={`http://localhost:5000/${item.gambar.replace(/\\/g, '/')}`} 
                                        alt={item.nama_menu}
                                        style={styles.imagePreview}
                                    />
                                ) : (
                                    <div style={{width: '60px', height: '60px', backgroundColor: '#f3f4f6', borderRadius: '0.5rem'}}></div>
                                )}
                            </td>
                            <td style={styles.td}>{item.nama_menu}</td>
                            <td style={styles.td}>{item.kategori}</td>
                            <td style={styles.td}>Rp {parseFloat(item.harga).toLocaleString('id-ID')}</td>
                            <td style={styles.td}>{item.stok ?? 'Tidak dilacak'}</td>
                            <td style={styles.td}>{item.is_tersedia ? 'Tersedia' : 'Habis'}</td>
                            <td style={styles.td}>
                                <button onClick={() => handleOpenModal(item)} style={{...styles.actionButton, color: '#3b82f6'}}><Edit size={20} /></button>
                                <button onClick={() => handleDelete(item.id_menu)} style={{...styles.actionButton, color: '#ef4444'}}><Trash2 size={20} /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {isModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <h2>{currentItem ? 'Edit Menu' : 'Tambah Menu Baru'}</h2>
                        <form onSubmit={handleSave}>
                            <div style={styles.formGroup}>
                                <label>Nama Menu</label>
                                <input name="nama_menu" type="text" defaultValue={currentItem?.nama_menu} style={styles.input} required />
                            </div>
                            <div style={styles.formGroup}>
                                <label>Deskripsi</label>
                                <textarea name="deskripsi_menu" defaultValue={currentItem?.deskripsi_menu} style={styles.input} rows="3"></textarea>
                            </div>
                            <div style={styles.formGroup}>
                                <label>Kategori</label>
                                <select name="kategori" defaultValue={currentItem?.kategori} style={styles.input} required>
                                    <option value="minuman">Minuman</option>
                                    <option value="makanan">Makanan</option>
                                    <option value="snack">Snack</option>
                                    <option value="dessert">Dessert</option>
                                </select>
                            </div>
                            <div style={styles.formGroup}>
                                <label>Harga</label>
                                <input name="harga" type="number" defaultValue={currentItem?.harga} style={styles.input} required />
                            </div>
                            <div style={styles.formGroup}>
                                <label>Gambar (PNG/JPG)</label>
                                <input name="gambar" type="file" onChange={handleFileChange} accept="image/png, image/jpeg" style={styles.input} />
                            </div>
                            <div style={styles.formGroup}>
                                <label>Ketersediaan</label>
                                <select name="is_tersedia" defaultValue={currentItem ? (currentItem.is_tersedia ? 1 : 0) : 1} style={styles.input} required>
                                    <option value="1">Tersedia</option>
                                    <option value="0">Habis</option>
                                </select>
                            </div>
                            <div style={styles.formGroup}>
                                <label>Stok (kosongkan jika tidak perlu dilacak)</label>
                                <input name="stok" type="number" defaultValue={currentItem?.stok} style={styles.input} />
                            </div>
                            <div style={styles.modalActions}>
                                <button type="button" onClick={handleCloseModal} style={{...styles.addButton, ...styles.cancelButton}}>Batal</button>
                                <button type="submit" style={{...styles.addButton, ...styles.saveButton}}>Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {popup.show && (
                <div style={styles.popupOverlay}>
                    <div style={styles.popupBox}>
                        <p>{popup.message}</p>
                        <button style={styles.popupButton} onClick={() => setPopup({ show: false, message: '' })}>OK</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMenu;
