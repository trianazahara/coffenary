import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Plus, Edit, Trash2, X, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  title: { fontSize: '2.25rem', fontWeight: 'bold', color: '#111827' },
  addButton: { 
    backgroundColor: '#10b981', 
    color: 'white', 
    padding: '0.75rem 1.5rem', 
    borderRadius: '0.75rem', 
    border: 'none', 
    cursor: 'pointer', 
    display: 'flex', 
    alignItems: 'center',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
  },
  addButtonHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)'
  },
  table: { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', borderRadius: '1rem', overflow: 'hidden' },
  th: { padding: '1.25rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f8fafc', color: '#4b5563', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '700' },
  td: { padding: '1.25rem', borderBottom: '1px solid #f1f5f9', color: '#374151', verticalAlign: 'middle' },
  actionButton: { 
    background: 'none', 
    border: 'none', 
    cursor: 'pointer', 
    padding: '0.5rem',
    borderRadius: '0.5rem',
    transition: 'all 0.2s ease'
  },
  actionButtonHover: {
    backgroundColor: '#f8fafc'
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
    backdropFilter: 'blur(4px)'
  },
  modalContent: { 
    backgroundColor: 'white', 
    padding: '2rem', 
    borderRadius: '1.5rem', 
    width: '500px', 
    maxHeight: '90vh', 
    overflowY: 'auto',
    scrollbarWidth: 'none',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    position: 'relative'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    paddingBottom: '1rem',
    borderBottom: '2px solid #f1f5f9'
  },
  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937',
    margin: 0
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '0.5rem',
    color: '#64748b',
    transition: 'all 0.2s ease'
  },
  closeButtonHover: {
    backgroundColor: '#f1f5f9',
    color: '#374151'
  },
  input: { 
    width: '100%', 
    boxSizing: 'border-box', 
    padding: '0.875rem', 
    border: '2px solid #f1f5f9', 
    borderRadius: '0.75rem', 
    marginTop: '0.5rem',
    fontSize: '0.95rem',
    transition: 'all 0.2s ease',
    backgroundColor: '#f8fafc'
  },
  inputFocus: {
    borderColor: '#10b981',
    backgroundColor: '#ffffff',
    boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)'
  },
  formGroup: { marginBottom: '1.5rem' },
  formLabel: {
    display: 'block',
    fontWeight: '600',
    color: '#374151',
    fontSize: '0.9rem',
    marginBottom: '0.25rem'
  },
  modalActions: { 
    display: 'flex', 
    justifyContent: 'flex-end', 
    gap: '1rem', 
    marginTop: '2rem',
    paddingTop: '1.5rem',
    borderTop: '2px solid #f1f5f9'
  },
  saveButton: { 
    backgroundColor: '#10b981', 
    color: 'white',
    padding: '0.875rem 1.5rem',
    borderRadius: '0.75rem',
    border: 'none',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
  },
  saveButtonHover: {
    transform: 'translateY(-1px)',
    boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)'
  },
  cancelButton: { 
    backgroundColor: 'transparent', 
    color: '#64748b',
    padding: '0.875rem 1.5rem',
    borderRadius: '0.75rem',
    border: '2px solid #e5e7eb',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  cancelButtonHover: {
    backgroundColor: '#f8fafc',
    borderColor: '#d1d5db'
  },
  imagePreview: { 
    width: '60px', 
    height: '60px', 
    objectFit: 'cover', 
    borderRadius: '0.75rem',
    border: '2px solid #f1f5f9'
  },

  // popup info
  popupOverlay: { 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 2000,
    backdropFilter: 'blur(4px)'
  },
  popupBox: { 
    backgroundColor: 'white', 
    padding: '2rem', 
    borderRadius: '1.5rem', 
    textAlign: 'center', 
    width: '380px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  popupIcon: {
    width: '4rem',
    height: '4rem',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem',
    backgroundColor: '#f0fdf4',
    color: '#10b981'
  },
  popupMessage: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '1.5rem'
  },
  popupButton: { 
    marginTop: '1rem', 
    padding: '0.875rem 2rem', 
    backgroundColor: '#10b981', 
    color: 'white', 
    border: 'none', 
    borderRadius: '0.75rem', 
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.95rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
  },
  popupButtonHover: {
    transform: 'translateY(-1px)',
    boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)'
  },

  // modal konfirmasi
  confirmBox: { 
    backgroundColor: 'white', 
    padding: '2.5rem', 
    borderRadius: '1.5rem', 
    width: '460px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    textAlign: 'center'
  },
  confirmIcon: {
    width: '4rem',
    height: '4rem',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem',
    backgroundColor: '#fef2f2',
    color: '#ef4444'
  },
  confirmTitle: { 
    fontWeight: 700, 
    fontSize: '1.375rem', 
    marginBottom: '0.75rem',
    color: '#1f2937'
  },
  confirmText: { 
    color: '#64748b',
    fontSize: '1rem',
    lineHeight: '1.5'
  },
  confirmItemName: {
    color: '#ef4444',
    fontWeight: '600'
  },
  confirmActions: { 
    display: 'flex', 
    justifyContent: 'center', 
    gap: '1rem', 
    marginTop: '2rem'
  },
  dangerButton: { 
    backgroundColor: '#ef4444', 
    color: 'white', 
    border: 'none', 
    borderRadius: '0.75rem', 
    padding: '0.875rem 1.5rem', 
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
  },
  dangerButtonHover: {
    transform: 'translateY(-1px)',
    boxShadow: '0 6px 20px rgba(239, 68, 68, 0.4)'
  },
  dangerButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
    transform: 'none'
  },
  neutralButton: { 
    backgroundColor: 'transparent', 
    color: '#64748b', 
    border: '2px solid #e5e7eb', 
    borderRadius: '0.75rem', 
    padding: '0.875rem 1.5rem', 
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.3s ease'
  },
  neutralButtonHover: {
    backgroundColor: '#f8fafc',
    borderColor: '#d1d5db'
  }
};

const AdminMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [popup, setPopup] = useState({ show: false, message: '' });

  const [confirm, setConfirm] = useState({ show: false, id_menu: null, nama_menu: null, loading: false });
  const [hoverStates, setHoverStates] = useState({});

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

  useEffect(() => { if (selectedBranch) fetchMenuItems(); }, [selectedBranch]);

  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

  const handleOpenModal = (item = null) => { setCurrentItem(item); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setCurrentItem(null); setSelectedFile(null); };

  const showPopup = (message) => setPopup({ show: true, message });

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedBranch || !token) return alert('Silakan pilih cabang atau login ulang.');

    const formData = new FormData();
    formData.append('nama_menu', e.target.nama_menu.value);
    formData.append('deskripsi_menu', e.target.deskripsi_menu.value);
    formData.append('kategori', e.target.kategori.value);
    formData.append('harga', e.target.harga.value);
    formData.append('is_tersedia', e.target.is_tersedia.value);
    if (selectedFile) formData.append('gambar', selectedFile);
    else if (currentItem) formData.append('gambar', currentItem.gambar);

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

  const askDelete = (item) => setConfirm({ show: true, id_menu: item.id_menu, nama_menu: item.nama_menu, loading: false });

  const confirmDelete = async () => {
    if (!selectedBranch || !token || !confirm.id_menu) return;
    try {
      setConfirm((c) => ({ ...c, loading: true }));
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`http://localhost:5000/api/menu/${selectedBranch.id_cabang}/${confirm.id_menu}`, config);
      setConfirm({ show: false, id_menu: null, nama_menu: null, loading: false });
      fetchMenuItems();
      showPopup('Menu berhasil dihapus!');
    } catch (err) {
      console.error(err);
      setConfirm({ show: false, id_menu: null, nama_menu: null, loading: false });
      showPopup('Gagal menghapus data!');
    }
  };

  const updateHoverState = (key, value) => {
    setHoverStates(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Manajemen Menu</h1>
        <button 
          onClick={() => handleOpenModal()} 
          style={{
            ...styles.addButton,
            ...(hoverStates.addButton && styles.addButtonHover)
          }}
          onMouseEnter={() => updateHoverState('addButton', true)}
          onMouseLeave={() => updateHoverState('addButton', false)}
        >
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
                  <div style={{ width: '60px', height: '60px', backgroundColor: '#f3f4f6', borderRadius: '0.75rem' }} />
                )}
              </td>
              <td style={styles.td}>{item.nama_menu}</td>
              <td style={styles.td}>{item.kategori}</td>
              <td style={styles.td}>Rp {parseFloat(item.harga).toLocaleString('id-ID')}</td>
              <td style={styles.td}>{item.is_tersedia ? 'Tersedia' : 'Tidak Tersedia'}</td>
              <td style={styles.td}>
                <button 
                  onClick={() => handleOpenModal(item)} 
                  style={{ 
                    ...styles.actionButton, 
                    color: '#3b82f6',
                    ...(hoverStates[`edit-${item.id_menu}`] && styles.actionButtonHover)
                  }}
                  onMouseEnter={() => updateHoverState(`edit-${item.id_menu}`, true)}
                  onMouseLeave={() => updateHoverState(`edit-${item.id_menu}`, false)}
                >
                  <Edit size={20} />
                </button>
                <button 
                  onClick={() => askDelete(item)} 
                  style={{ 
                    ...styles.actionButton, 
                    color: '#ef4444',
                    ...(hoverStates[`delete-${item.id_menu}`] && styles.actionButtonHover)
                  }}
                  onMouseEnter={() => updateHoverState(`delete-${item.id_menu}`, true)}
                  onMouseLeave={() => updateHoverState(`delete-${item.id_menu}`, false)}
                >
                  <Trash2 size={20} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal tambah/edit */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{currentItem ? 'Edit Menu' : 'Tambah Menu Baru'}</h2>
              <button 
                onClick={handleCloseModal}
                style={{
                  ...styles.closeButton,
                  ...(hoverStates.closeModal && styles.closeButtonHover)
                }}
                onMouseEnter={() => updateHoverState('closeModal', true)}
                onMouseLeave={() => updateHoverState('closeModal', false)}
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Nama Menu</label>
                <input 
                  name="nama_menu" 
                  type="text" 
                  defaultValue={currentItem?.nama_menu} 
                  style={styles.input} 
                  required 
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Deskripsi</label>
                <textarea 
                  name="deskripsi_menu" 
                  defaultValue={currentItem?.deskripsi_menu} 
                  style={styles.input} 
                  rows="3" 
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Kategori</label>
                <select 
                  name="kategori" 
                  defaultValue={currentItem?.kategori} 
                  style={styles.input} 
                  required
                >
                  <option value="minuman">Minuman</option>
                  <option value="makanan">Makanan</option>
                  <option value="snack">Snack</option>
                  <option value="dessert">Dessert</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Harga</label>
                <input 
                  name="harga" 
                  type="number" 
                  defaultValue={currentItem?.harga} 
                  style={styles.input} 
                  required 
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Gambar (PNG/JPG)</label>
                <input 
                  name="gambar" 
                  type="file" 
                  onChange={handleFileChange} 
                  accept="image/png, image/jpeg" 
                  style={styles.input} 
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Ketersediaan</label>
                <select 
                  name="is_tersedia" 
                  defaultValue={currentItem ? (currentItem.is_tersedia ? 1 : 0) : 1} 
                  style={styles.input} 
                  required
                >
                  <option value="1">Tersedia</option>
                  <option value="0">Tidak Tersedia</option>
                </select>
              </div>
              
              <div style={styles.modalActions}>
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  style={{
                    ...styles.cancelButton,
                    ...(hoverStates.cancelButton && styles.cancelButtonHover)
                  }}
                  onMouseEnter={() => updateHoverState('cancelButton', true)}
                  onMouseLeave={() => updateHoverState('cancelButton', false)}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  style={{
                    ...styles.saveButton,
                    ...(hoverStates.saveButton && styles.saveButtonHover)
                  }}
                  onMouseEnter={() => updateHoverState('saveButton', true)}
                  onMouseLeave={() => updateHoverState('saveButton', false)}
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal konfirmasi hapus */}
      {confirm.show && (
        <div style={styles.modalOverlay}>
          <div style={styles.confirmBox}>
            <div style={styles.confirmIcon}>
              <AlertTriangle size={24} />
            </div>
            <div style={styles.confirmTitle}>Hapus Menu?</div>
            <p style={styles.confirmText}>
              Anda akan menghapus menu: <span style={styles.confirmItemName}>{confirm.nama_menu}</span>
              <br />
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div style={styles.confirmActions}>
              <button 
                onClick={() => setConfirm({ show: false, id_menu: null, nama_menu: null, loading: false })} 
                style={{
                  ...styles.neutralButton,
                  ...(hoverStates.cancelDelete && styles.neutralButtonHover)
                }}
                onMouseEnter={() => updateHoverState('cancelDelete', true)}
                onMouseLeave={() => updateHoverState('cancelDelete', false)}
                disabled={confirm.loading}
              >
                Batal
              </button>
              <button 
                onClick={confirmDelete} 
                style={{
                  ...styles.dangerButton,
                  ...(hoverStates.confirmDelete && styles.dangerButtonHover),
                  ...(confirm.loading && styles.dangerButtonDisabled)
                }}
                onMouseEnter={() => updateHoverState('confirmDelete', true)}
                onMouseLeave={() => updateHoverState('confirmDelete', false)}
                disabled={confirm.loading}
              >
                {confirm.loading ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup info */}
      {popup.show && (
        <div style={styles.popupOverlay}>
          <div style={styles.popupBox}>
            <div style={styles.popupIcon}>
              <CheckCircle size={24} />
            </div>
            <div style={styles.popupMessage}>{popup.message}</div>
            <button 
              style={{
                ...styles.popupButton,
                ...(hoverStates.popupOk && styles.popupButtonHover)
              }}
              onClick={() => setPopup({ show: false, message: '' })}
              onMouseEnter={() => updateHoverState('popupOk', true)}
              onMouseLeave={() => updateHoverState('popupOk', false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMenu;