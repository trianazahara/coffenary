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
    dangerButton: { backgroundColor: '#ef4444', color: 'white' },
    imagePreview: { width: '60px', height: '60px', objectFit: 'cover', borderRadius: '0.5rem' }
};

const AdminMenu = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // ✅ modal delete
    const [deleteTarget, setDeleteTarget] = useState(null); // ✅ target menu yang mau dihapus
    const [currentItem, setCurrentItem] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState('');
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
            } else {
                await axios.post(`http://localhost:5000/api/menu/${selectedBranch.id_cabang}`, formData, config);
            }
            fetchMenuItems();
            handleCloseModal();
            setIsSuccessModalOpen(true);
            setTimeout(() => setIsSuccessModalOpen(false), 3000);
        } catch (err) {
            alert('Gagal menyimpan data!');
            console.error(err);
        }
    };
    
    const confirmDelete = (item) => {
        setDeleteTarget(item);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedBranch || !token || !deleteTarget) return;
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`http://localhost:5000/api/menu/${selectedBranch.id_cabang}/${deleteTarget.id_menu}`, config);
            fetchMenuItems();
            setIsDeleteModalOpen(false);
            setDeleteTarget(null);
        } catch (err) {
            alert('Gagal menghapus data!');
            console.error(err);
        }
    };

    return (
        <div>
            {/* HEADER */}
            <div style={styles.header}>
                <h1 style={styles.title}>Manajemen Menu</h1>
                <button onClick={() => handleOpenModal()} style={styles.addButton}>
                    <Plus size={20} style={{ marginRight: '0.5rem' }} />
                    Tambah Menu
                </button>
            </div>

            {/* TABLE */}
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
                                <button onClick={() => confirmDelete(item)} style={{...styles.actionButton, color: '#ef4444'}}><Trash2 size={20} /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* MODAL FORM TAMBAH/EDIT */}
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

            {/* MODAL SUKSES */}
            {isSuccessModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={{...styles.modalContent, textAlign: 'center'}}>
                        <h2 style={{ color: '#10b981', fontSize: '1.5rem', marginBottom: '1rem' }}>Sukses!</h2>
                        <p>Menu berhasil disimpan 🎉</p>
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                            <button 
                                onClick={() => setIsSuccessModalOpen(false)} 
                                style={{...styles.addButton, ...styles.saveButton}}
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL KONFIRMASI DELETE */}
            {isDeleteModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={{...styles.modalContent, textAlign: 'center'}}>
                        <h2 style={{ color: '#ef4444', fontSize: '1.5rem', marginBottom: '1rem' }}>Hapus Menu?</h2>
                        <p>Apakah Anda yakin ingin menghapus <b>{deleteTarget?.nama_menu}</b>?</p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                            <button 
                                onClick={() => setIsDeleteModalOpen(false)} 
                                style={{...styles.addButton, ...styles.cancelButton}}
                            >
                                Tidak
                            </button>
                            <button 
                                onClick={handleDelete} 
                                style={{...styles.addButton, ...styles.dangerButton}}
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMenu;
