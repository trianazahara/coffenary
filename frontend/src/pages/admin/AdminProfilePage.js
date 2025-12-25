// src/pages/admin/AdminProfilePage.js
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { User, Mail, Phone, User as UserIcon, Edit2, CheckCircle, X } from 'lucide-react';

const styles = {
  container: {
    padding: '2rem',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    marginTop: 0
  },
  header: {
    marginBottom: '2rem',
    animation: 'slideDown 0.5s ease-out'
  },
  title: {
    fontSize: '2.25rem',
    fontWeight: 'bold',
    color: '#111827',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.5rem'
  },
  subtitle: {
    color: '#64748b',
    fontSize: '1rem'
  },
  profileCard: {
    background: 'white',
    padding: '2.5rem',
    borderRadius: '1.25rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    maxWidth: '520px',
    animation: 'slideUp 0.6s ease-out'
  },
  fieldGroup: {
    marginBottom: '1.5rem',
    marginRight: '2.2rem',
    animation: 'slideUp 0.4s ease-out'
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem',
    color: '#374151',
    marginBottom: '0.5rem',
    fontWeight: '600'
  },
  input: {
    width: '100%',
    padding: '0.875rem 1rem',
    border: '2px solid #e2e8f0',
    borderRadius: '0.75rem',
    fontSize: '0.95rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    backgroundColor: '#f8fafc'
  },
  inputDisabled: {
    width: '100%',
    padding: '0.875rem 1rem',
    border: '2px solid #f1f5f9',
    borderRadius: '0.75rem',
    fontSize: '0.95rem',
    fontWeight: '500',
    backgroundColor: '#f8fafc',
    color: '#64748b'
  },
  editButton: {
    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    color: 'white',
    padding: '0.875rem 2rem',
    border: 'none',
    borderRadius: '0.75rem',
    cursor: 'pointer',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    animation: 'slideUp 0.8s ease-out'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
    backdropFilter: 'blur(4px)'
  },
  modalContent: {
    background: 'white',
    padding: '2.5rem',
    borderRadius: '1.25rem',
    boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
    width: '100%',
    maxWidth: '480px',
    position: 'relative',
    animation: 'modalEntrance 0.3s ease-out'
  },
  closeButton: {
    position: 'absolute',
    top: '1.25rem',
    right: '1.25rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '0.5rem',
    transition: 'background-color 0.2s',
    color: '#64748b'
  },
  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
    color: '#111827',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    marginTop: '2rem',
    animation: 'slideUp 0.5s ease-out'
  },
  cancelButton: {
    background: 'white',
    color: '#64748b',
    padding: '0.875rem 1.75rem',
    border: '2px solid #e2e8f0',
    borderRadius: '0.75rem',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s ease'
  },
  saveButton: {
    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    color: 'white',
    padding: '0.875rem 1.75rem',
    border: 'none',
    borderRadius: '0.75rem',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
  },
  successPopup: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'white',
    padding: '2rem',
    borderRadius: '1rem',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    zIndex: 2000,
    textAlign: 'center',
    animation: 'modalEntrance 0.3s ease-out',
    border: '1px solid #bbf7d0'
  },
  successIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: '#f0fdf4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem',
    color: '#10b981'
  },
  successText: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#065f46',
    marginBottom: '0.5rem'
  },
  successSubtext: {
    color: '#047857',
    fontSize: '0.9rem'
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
  
  .button-hover:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
  }
  
  .cancel-hover:hover {
    background-color: #f8fafc !important;
    border-color: #cbd5e1 !important;
  }
  
  .input-focus:focus {
    border-color: #10b981 !important;
    background-color: white !important;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    outline: none;
  }
  
  .close-hover:hover {
    background-color: #f1f5f9 !important;
  }
`;
document.head.appendChild(styleSheet);

const AdminProfilePage = () => {
  const { user, token } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    nama_lengkap: user?.nama_lengkap || '',
    email: user?.email || '',
    username: user?.username || '',
    telepon: user?.telepon || ''
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [focusedInput, setFocusedInput] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInputFocus = (inputName) => {
    setFocusedInput(inputName);
  };

  const handleInputBlur = () => {
    setFocusedInput(null);
  };

  const handleSave = async () => {
    try {
      const adminId = user?.id_pengguna;
      if (!adminId) {
        console.error('ID Admin tidak ditemukan di AuthContext:', user);
        setMessage('Gagal menemukan ID admin.');
        return;
      }

      await axios.put(
        `http://localhost:5000/api/pengguna/${adminId}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsModalOpen(false);
      setIsSuccessOpen(true);

      setTimeout(() => setIsSuccessOpen(false), 2000);
    } catch (err) {
      console.error('Gagal memperbarui profil:', err);
      setMessage('Gagal memperbarui profil.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          <User size={32} />
          Profil Admin
        </h1>
        <p style={styles.subtitle}>Kelola informasi profil akun Anda</p>
      </div>

      <div style={styles.profileCard}>
        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            <UserIcon size={18} />
            Nama Lengkap
          </label>
          <input
            value={formData.nama_lengkap}
            disabled
            style={styles.inputDisabled}
          />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            <Mail size={18} />
            Email
          </label>
          <input
            value={formData.email}
            disabled
            style={styles.inputDisabled}
          />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            <Phone size={18} />
            Telepon
          </label>
          <input
            value={formData.telepon || 'Tidak ada telepon'}
            disabled
            style={styles.inputDisabled}
          />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            <UserIcon size={18} />
            Username
          </label>
          <input
            value={formData.username}
            disabled
            style={styles.inputDisabled}
          />
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          style={styles.editButton}
          className="button-hover"
        >
          <Edit2 size={18} />
          Edit Profil
        </button>
      </div>

      {/* Modal Edit */}
      {isModalOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setIsModalOpen(false)} 
              style={styles.closeButton}
              className="close-hover"
            >
              <X size={24} />
            </button>
            
            <h2 style={styles.modalTitle}>
              <Edit2 size={24} />
              Edit Profil
            </h2>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Nama Lengkap</label>
              <input
                name="nama_lengkap"
                value={formData.nama_lengkap}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(focusedInput === 'nama_lengkap' ? { 
                    borderColor: '#10b981', 
                    backgroundColor: 'white', 
                    boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)' 
                  } : {})
                }}
                onFocus={() => handleInputFocus('nama_lengkap')}
                onBlur={handleInputBlur}
                className="input-focus"
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(focusedInput === 'email' ? { 
                    borderColor: '#10b981', 
                    backgroundColor: 'white', 
                    boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)' 
                  } : {})
                }}
                onFocus={() => handleInputFocus('email')}
                onBlur={handleInputBlur}
                className="input-focus"
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Telepon</label>
              <input
                name="telepon"
                value={formData.telepon}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(focusedInput === 'telepon' ? { 
                    borderColor: '#10b981', 
                    backgroundColor: 'white', 
                    boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)' 
                  } : {})
                }}
                onFocus={() => handleInputFocus('telepon')}
                onBlur={handleInputBlur}
                className="input-focus"
                placeholder="Masukkan nomor telepon"
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Username</label>
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(focusedInput === 'username' ? { 
                    borderColor: '#10b981', 
                    backgroundColor: 'white', 
                    boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)' 
                  } : {})
                }}
                onFocus={() => handleInputFocus('username')}
                onBlur={handleInputBlur}
                className="input-focus"
              />
            </div>

            <div style={styles.modalActions}>
              <button
                onClick={() => setIsModalOpen(false)}
                style={styles.cancelButton}
                className="cancel-hover"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                style={styles.saveButton}
                className="button-hover"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Notifikasi Sukses */}
      {isSuccessOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.successPopup}>
            <div style={styles.successIcon}>
              <CheckCircle size={28} />
            </div>
            <div style={styles.successText}>Profil Berhasil Diperbarui!</div>
            <div style={styles.successSubtext}>Perubahan telah disimpan</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfilePage;