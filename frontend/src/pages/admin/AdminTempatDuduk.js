import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Plus, Edit, Trash2, Table, Users, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

const styles = {
  container: { padding: '2rem', backgroundColor: '#f8fafc', minHeight: '100vh' },
  header: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '2rem',
    animation: 'slideDown 0.5s ease-out'
  },
  title: { 
    fontSize: '2.25rem', 
    fontWeight: 'bold', 
    color: '#111827',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  addButton: { 
    backgroundColor: '#10b981', 
    color: 'white', 
    padding: '0.875rem 1.5rem', 
    borderRadius: '0.75rem', 
    border: 'none', 
    cursor: 'pointer', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '0.5rem',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
  },
  tableContainer: { 
    backgroundColor: 'white', 
    borderRadius: '1rem', 
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
    overflow: 'hidden',
    animation: 'slideUp 0.6s ease-out'
  },
  table: { 
    width: '100%', 
    borderCollapse: 'collapse'
  },
  th: { 
    padding: '1.25rem 1rem', 
    textAlign: 'left', 
    borderBottom: '2px solid #f1f5f9', 
    backgroundColor: '#f8fafc', 
    color: '#475569', 
    textTransform: 'uppercase', 
    fontSize: '0.75rem',
    fontWeight: '700',
    letterSpacing: '0.5px'
  },
  td: { 
    padding: '1.25rem 1rem', 
    borderBottom: '1px solid #f1f5f9', 
    color: '#334155', 
    verticalAlign: 'middle',
    fontSize: '0.95rem'
  },
  actionButton: { 
    background: 'none', 
    border: 'none', 
    cursor: 'pointer', 
    padding: '0.5rem',
    borderRadius: '0.5rem',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalOverlay: { 
    position: 'fixed', 
    inset: 0, 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 1000, 
    padding: '1rem',
    backdropFilter: 'blur(4px)'
  },
  modalContent: { 
    backgroundColor: 'white', 
    padding: '2.5rem', 
    borderRadius: '1.25rem', 
    width: '100%', 
    maxWidth: '520px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
    animation: 'modalEntrance 0.3s ease-out'
  },
  formGroup: { 
    marginBottom: '1.5rem',
    animation: 'slideUp 0.4s ease-out'
  },
  label: { 
    display: 'block', 
    fontSize: '0.9rem', 
    color: '#374151', 
    marginBottom: '0.5rem', 
    fontWeight: 600 
  },
  input: { 
    width: '100%', 
    boxSizing: 'border-box', 
    padding: '0.875rem 1rem', 
    border: '2px solid #e2e8f0', 
    borderRadius: '0.75rem',
    fontSize: '0.95rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    backgroundColor: '#f8fafc'
  },
  textarea: { 
    width: '100%', 
    boxSizing: 'border-box', 
    padding: '0.875rem 1rem', 
    border: '2px solid #e2e8f0', 
    borderRadius: '0.75rem', 
    minHeight: 100, 
    resize: 'vertical',
    fontSize: '0.95rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    backgroundColor: '#f8fafc',
    fontFamily: 'inherit'
  },
  modalActions: { 
    display: 'flex', 
    justifyContent: 'flex-end', 
    gap: '1rem', 
    marginTop: '2rem',
    animation: 'slideUp 0.5s ease-out'
  },
  cancelBtn: { 
    backgroundColor: 'white', 
    color: '#64748b', 
    padding: '0.875rem 1.75rem', 
    border: '2px solid #e2e8f0',
    borderRadius: '0.75rem', 
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s ease'
  },
  saveBtn: { 
    backgroundColor: '#10b981', 
    color: 'white', 
    padding: '0.875rem 1.75rem', 
    border: 'none', 
    borderRadius: '0.75rem', 
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
  },
  popupOverlay: { 
    position: 'fixed', 
    inset: 0, 
    backgroundColor: 'rgba(0,0,0,0.4)', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 2000,
    backdropFilter: 'blur(4px)'
  },
  popupBox: { 
    backgroundColor: 'white', 
    padding: '2rem', 
    borderRadius: '1rem', 
    textAlign: 'center', 
    width: 400,
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    animation: 'modalEntrance 0.3s ease-out'
  },
  popupButton: { 
    marginTop: '1.5rem', 
    padding: '0.75rem 2rem', 
    backgroundColor: '#10b981', 
    color: 'white', 
    border: 'none', 
    borderRadius: '0.75rem', 
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s ease'
  },
  confirmBox: { 
    backgroundColor: 'white', 
    padding: '2rem', 
    borderRadius: '1rem', 
    width: 440, 
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    animation: 'modalEntrance 0.3s ease-out'
  },
  confirmTitle: { 
    fontWeight: 700, 
    fontSize: '1.25rem', 
    marginBottom: '0.5rem',
    color: '#111827',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  confirmText: { 
    color: '#64748b',
    lineHeight: '1.6'
  },
  confirmActions: { 
    display: 'flex', 
    justifyContent: 'flex-end', 
    gap: '1rem', 
    marginTop: '2rem'
  },
  dangerButton: { 
    backgroundColor: '#ef4444', 
    color: 'white', 
    border: 'none', 
    borderRadius: '0.75rem', 
    padding: '0.75rem 1.5rem', 
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s ease'
  },
  neutralButton: { 
    backgroundColor: 'white', 
    color: '#64748b', 
    border: '2px solid #e2e8f0',
    borderRadius: '0.75rem', 
    padding: '0.75rem 1.5rem', 
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s ease'
  },
  loadingSpinner: {
    display: 'inline-block',
    width: '20px',
    height: '20px',
    border: '2px solid transparent',
    borderTop: '2px solid currentColor',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    color: '#94a3b8'
  },
  tableRow: {
    transition: 'background-color 0.2s ease'
  }
};

// Add CSS animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes slideDown {
    0% { opacity: 0; transform: translateY(-20px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideUp {
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes modalEntrance {
    0% { opacity: 0; transform: scale(0.9) translateY(-10px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .button-hover:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
  }
  
  .danger-hover:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
  }
  
  .cancel-hover:hover {
    background-color: #f8fafc;
    border-color: #cbd5e1;
  }
  
  .action-hover:hover {
    background-color: #f0f9ff;
    transform: scale(1.05);
  }
  
  .input-focus:focus {
    border-color: #10b981;
    background-color: white;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    outline: none;
  }
  
  .table-row-hover:hover {
    background-color: #f8fafc;
  }
`;
document.head.appendChild(styleSheet);

const AdminTempatDuduk = () => {
  const { selectedBranch, token } = useContext(AuthContext);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [current, setCurrent] = useState(null);

  const [popup, setPopup] = useState({ show: false, message: '' });
  const [confirm, setConfirm] = useState({ show: false, id_meja: null, nomor_meja: null, loading: false });

  const fetchRows = async () => {
    if (!selectedBranch || !token) return;
    try {
      setLoading(true);
      setError('');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`http://localhost:5000/api/tempat-duduk/cabang/${selectedBranch.id_cabang}`, config);
      setRows(res.data);
    } catch (e) {
      console.error(e);
      setError('Gagal memuat data tempat duduk.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRows(); }, [selectedBranch, token]);

  const showPopup = (message) => setPopup({ show: true, message });

  const openModal = (row = null) => { setCurrent(row); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setCurrent(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedBranch || !token) return;

    const cap = e.target.kapasitas.value;
    const body = {
      nomor_meja: e.target.nomor_meja.value,
      kapasitas: cap === '' ? null : Number(cap),
      catatan: e.target.catatan.value || null
    };

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (current) {
        await axios.put(`http://localhost:5000/api/tempat-duduk/${current.id_meja}`, body, config);
        showPopup('Tempat duduk berhasil diperbarui!');
      } else {
        await axios.post(`http://localhost:5000/api/tempat-duduk/${selectedBranch.id_cabang}`, body, config);
        showPopup('Tempat duduk berhasil ditambahkan!');
      }
      closeModal();
      fetchRows();
    } catch (e) {
      console.error(e);
      const msg = e.response?.data?.message || 'Gagal menyimpan data.';
      showPopup(msg);
    }
  };

  const askDelete = (row) => setConfirm({ show: true, id_meja: row.id_meja, nomor_meja: row.nomor_meja, loading: false });

  const confirmDelete = async () => {
    if (!token || !confirm.id_meja) return;
    try {
      setConfirm((c) => ({ ...c, loading: true }));
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`http://localhost:5000/api/tempat-duduk/${confirm.id_meja}`, config);
      setConfirm({ show: false, id_meja: null, nomor_meja: null, loading: false });
      fetchRows();
      showPopup('Tempat duduk berhasil dihapus!');
    } catch (e) {
      console.error(e);
      const msg = e.response?.data?.message || 'Gagal menghapus tempat duduk.';
      setConfirm({ show: false, id_meja: null, nomor_meja: null, loading: false });
      showPopup(msg);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          <Table size={32} />
          Kelola Tempat Duduk
        </h1>
        <button 
          onClick={() => openModal()} 
          style={styles.addButton}
          className="button-hover"
        >
          <Plus size={18} /> Tambah Meja
        </button>
      </div>

      {error && (
        <div style={{ 
          marginBottom: '1.5rem', 
          color: '#ef4444', 
          fontWeight: 500, 
          padding: '1rem', 
          backgroundColor: '#fef2f2', 
          border: '1px solid #fecaca',
          borderRadius: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertTriangle size={18} />
          {error}
        </div>
      )}

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Nomor Meja</th>
              <th style={styles.th}>Kapasitas</th>
              <th style={styles.th}>Catatan</th>
              <th style={styles.th}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td style={{...styles.td, textAlign: 'center'}} colSpan={4}>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}>
                    <div style={styles.loadingSpinner}></div>
                    Memuat data...
                  </div>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td style={styles.emptyState} colSpan={4}>
                  <Table size={48} style={{marginBottom: '1rem', opacity: 0.5}} />
                  <div style={{fontSize: '1.125rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem'}}>
                    Belum ada data meja
                  </div>
                  <div style={{color: '#94a3b8'}}>
                    Mulai dengan menambahkan meja pertama Anda
                  </div>
                </td>
              </tr>
            ) : (
              rows.map(r => (
                <tr key={r.id_meja} style={styles.tableRow} className="table-row-hover">
                  <td style={styles.td}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      <Table size={18} color="#64748b" />
                      <span style={{fontWeight: '600', color: '#1e293b'}}>{r.nomor_meja}</span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      <Users size={16} color="#64748b" />
                      {r.kapasitas ? (
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: '#f0f9ff',
                          color: '#0c4a6e',
                          borderRadius: '0.5rem',
                          fontSize: '0.8rem',
                          fontWeight: '600'
                        }}>
                          {r.kapasitas} orang
                        </span>
                      ) : (
                        <span style={{color: '#94a3b8'}}>-</span>
                      )}
                    </div>
                  </td>
                  <td style={{...styles.td, maxWidth: 480, whiteSpace: 'pre-wrap'}}>
                    {r.catatan ? (
                      <div style={{display: 'flex', alignItems: 'flex-start', gap: '0.5rem'}}>
                        <FileText size={16} color="#64748b" style={{marginTop: '2px', flexShrink: 0}} />
                        <span>{r.catatan}</span>
                      </div>
                    ) : (
                      <span style={{color: '#94a3b8'}}>-</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    <button 
                      title="Edit" 
                      onClick={() => openModal(r)} 
                      style={{ ...styles.actionButton, color: '#3b82f6' }}
                      className="action-hover"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      title="Hapus" 
                      onClick={() => askDelete(r)} 
                      style={{ ...styles.actionButton, color: '#ef4444', marginLeft: 6 }}
                      className="action-hover"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah/Edit */}
      {isModalOpen && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', color: '#111827' }}>
              {current ? 'Edit Tempat Duduk' : 'Tambah Tempat Duduk'}
            </h3>
            <form onSubmit={handleSave}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nomor Meja</label>
                <input
                  name="nomor_meja"
                  type="text"
                  defaultValue={current?.nomor_meja || ''}
                  style={styles.input}
                  className="input-focus"
                  placeholder="contoh: 1 / A1"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Kapasitas (opsional)</label>
                <input
                  name="kapasitas"
                  type="number"
                  min="0"
                  defaultValue={current?.kapasitas ?? ''}
                  style={styles.input}
                  className="input-focus"
                  placeholder="mis: 2, 4, 6..."
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Catatan (opsional)</label>
                <textarea
                  name="catatan"
                  defaultValue={current?.catatan ?? ''}
                  style={styles.textarea}
                  className="input-focus"
                  placeholder="Dekat jendela, akses colokan, dsb."
                />
              </div>

              <div style={styles.modalActions}>
                <button 
                  type="button" 
                  onClick={closeModal} 
                  style={styles.cancelBtn}
                  className="cancel-hover"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  style={styles.saveBtn}
                  className="button-hover"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {confirm.show && (
        <div style={styles.popupOverlay}>
          <div style={styles.confirmBox}>
            <div style={styles.confirmTitle}>
              <AlertTriangle size={24} color="#ef4444" />
              Hapus Tempat Duduk?
            </div>
            <p style={styles.confirmText}>
              Anda akan menghapus meja <strong>"{confirm.nomor_meja}"</strong>. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div style={styles.confirmActions}>
              <button 
                style={styles.neutralButton} 
                disabled={confirm.loading}
                onClick={() => setConfirm({ show: false, id_meja: null, nomor_meja: null, loading: false })}
                className="cancel-hover"
              >
                Batal
              </button>
              <button 
                style={styles.dangerButton} 
                disabled={confirm.loading} 
                onClick={confirmDelete}
                className="danger-hover"
              >
                {confirm.loading ? (
                  <>
                    <div style={styles.loadingSpinner}></div>
                  </>
                ) : (
                  'Hapus'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup info */}
      {popup.show && (
        <div style={styles.popupOverlay}>
          <div style={styles.popupBox}>
            <CheckCircle size={48} color="#10b981" style={{marginBottom: '1rem'}} />
            <p style={{fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem'}}>
              Berhasil!
            </p>
            <p style={{color: '#64748b'}}>{popup.message}</p>
            <button 
              style={styles.popupButton}
              className="button-hover"
              onClick={() => setPopup({ show: false, message: '' })}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTempatDuduk;