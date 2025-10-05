// src/pages/pelanggan/ProfilePage.js
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import Header from '../../components/pelanggan/Header';
import { 
  User, 
  Mail, 
  Phone, 
  Lock,
  Edit2,
  Save,
  X,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Camera
} from 'lucide-react';

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    paddingTop: '70px'
  },
  main: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem 1rem'
  },
  header: {
    marginBottom: '2rem'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '0.5rem'
  },
  subtitle: {
    color: '#64748b',
    fontSize: '1rem'
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: '1rem',
    padding: '2rem',
    marginBottom: '1.5rem',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(226, 232, 240, 0.5)'
  },
  avatarSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '2rem',
    paddingBottom: '2rem',
    borderBottom: '1px solid #e2e8f0'
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: '1rem'
  },
  avatar: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    backgroundColor: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '3rem',
    color: 'white',
    fontWeight: '700',
    border: '4px solid white',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
  },
  avatarButton: {
    position: 'absolute',
    bottom: '0',
    right: '0',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    color: 'white',
    border: '3px solid white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  avatarButtonHover: {
    backgroundColor: '#059669',
    transform: 'scale(1.1)'
  },
  userName: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '0.25rem'
  },
  userRole: {
    fontSize: '0.9rem',
    color: '#64748b',
    padding: '0.25rem 0.75rem',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: '1rem',
    display: 'inline-block'
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  editButton: {
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    border: '1px solid #e2e8f0',
    backgroundColor: 'white',
    color: '#64748b',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  editButtonActive: {
    backgroundColor: '#10b981',
    color: 'white',
    borderColor: '#10b981'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1.25rem'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '500',
    color: '#475569',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  inputContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem 0.75rem 2.5rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.75rem',
    fontSize: '0.95rem',
    backgroundColor: '#f8fafc',
    transition: 'all 0.2s ease',
    outline: 'none',
    color: '#1e293b'
  },
  inputFocus: {
    borderColor: '#10b981',
    backgroundColor: '#ffffff',
    boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)'
  },
  inputDisabled: {
    backgroundColor: '#f1f5f9',
    color: '#94a3b8',
    cursor: 'not-allowed'
  },
  inputIcon: {
    position: 'absolute',
    left: '0.75rem',
    color: '#94a3b8',
    width: '1.1rem',
    height: '1.1rem'
  },
  togglePassword: {
    position: 'absolute',
    right: '0.75rem',
    color: '#94a3b8',
    cursor: 'pointer',
    transition: 'color 0.2s ease'
  },
  togglePasswordHover: {
    color: '#10b981'
  },
  buttonGroup: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '1rem'
  },
  button: {
    flex: 1,
    padding: '0.75rem 1.5rem',
    borderRadius: '0.75rem',
    border: 'none',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem'
  },
  buttonPrimary: {
    backgroundColor: '#10b981',
    color: 'white'
  },
  buttonSecondary: {
    backgroundColor: 'white',
    color: '#64748b',
    border: '1px solid #e2e8f0'
  },
  buttonHover: {
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed'
  },
  alert: {
    padding: '1rem',
    borderRadius: '0.75rem',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.9rem'
  },
  alertSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    color: '#059669',
    border: '1px solid rgba(16, 185, 129, 0.2)'
  },
  alertError: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#dc2626',
    border: '1px solid rgba(239, 68, 68, 0.2)'
  },
  helperText: {
    fontSize: '0.8rem',
    color: '#64748b',
    marginTop: '0.25rem'
  }
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @media (max-width: 768px) {
    .main-padding { padding: 1rem !important; }
    .profile-card { padding: 1.5rem !important; }
    .button-group { flex-direction: column; }
    .avatar { width: 100px !important; height: 100px !important; font-size: 2.5rem !important; }
  }
`;
if (!document.querySelector('#profile-styles')) {
  styleSheet.id = 'profile-styles';
  document.head.appendChild(styleSheet);
}

const ProfilePage = () => {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // State management
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [avatarHover, setAvatarHover] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    email: '',
    telepon: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nama_lengkap: user.nama_lengkap || '',
        email: user.email || '',
        telepon: user.telepon || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    if (successMessage || errorMessage) {
      setSuccessMessage('');
      setErrorMessage('');
    }
  };

  const validateForm = () => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage('Format email tidak valid');
      return false;
    }

    // Validate phone number (Indonesian format)
    const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
    if (formData.telepon && !phoneRegex.test(formData.telepon)) {
      setErrorMessage('Format nomor telepon tidak valid');
      return false;
    }

    // If changing password, validate password fields
    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        setErrorMessage('Password baru minimal 6 karakter');
        return false;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setErrorMessage('Konfirmasi password tidak cocok');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const updateData = {
        nama_lengkap: formData.nama_lengkap,
        email: formData.email,
        telepon: formData.telepon
      };

      // Add password to update data if user wants to change it
      if (formData.newPassword) {
        updateData.password = formData.newPassword;
      }

      const response = await axios.put(
        `/api/pengguna/${user.id_pengguna}`, 
        updateData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Update user context with new data
      const updatedUser = {
        ...user,
        nama_lengkap: formData.nama_lengkap,
        email: formData.email,
        telepon: formData.telepon
      };
      login(updatedUser, localStorage.getItem('token'));

      setSuccessMessage('Profile berhasil diperbarui!');
      setIsEditing(false);
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage(
        error.response?.data?.message || 'Gagal memperbarui profile. Silakan coba lagi.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original user data
    setFormData({
      nama_lengkap: user.nama_lengkap || '',
      email: user.email || '',
      telepon: user.telepon || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsEditing(false);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div style={styles.container}>
      <Header />
      
      <main style={styles.main} className="main-padding">
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Profile Saya</h1>
          <p style={styles.subtitle}>
            Kelola informasi pribadi Anda
          </p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div style={{ ...styles.alert, ...styles.alertSuccess }}>
            <CheckCircle size={20} />
            {successMessage}
          </div>
        )}
        
        {errorMessage && (
          <div style={{ ...styles.alert, ...styles.alertError }}>
            <AlertCircle size={20} />
            {errorMessage}
          </div>
        )}

        {/* Profile Card */}
        <div style={styles.profileCard} className="profile-card">
          {/* Avatar Section */}
          <div style={styles.avatarSection}>
            <div style={styles.avatarContainer}>
              <div style={styles.avatar}>
                {getInitials(formData.nama_lengkap)}
              </div>
              <div 
                style={{
                  ...styles.avatarButton,
                  ...(avatarHover ? styles.avatarButtonHover : {})
                }}
                onMouseEnter={() => setAvatarHover(true)}
                onMouseLeave={() => setAvatarHover(false)}
              >
                <Camera size={16} />
              </div>
            </div>
            <div style={styles.userName}>{formData.nama_lengkap || 'Nama Pengguna'}</div>
            <div style={styles.userRole}>Pelanggan</div>
          </div>

          {/* Form Section */}
          <div style={styles.sectionTitle}>
            Informasi Pribadi
            <button
              style={{
                ...styles.editButton,
                ...(isEditing ? styles.editButtonActive : {})
              }}
              onClick={() => setIsEditing(!isEditing)}
              disabled={loading}
            >
              {isEditing ? (
                <>
                  <X size={16} />
                  Batal
                </>
              ) : (
                <>
                  <Edit2 size={16} />
                  Edit
                </>
              )}
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              {/* Nama Lengkap */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <User size={16} />
                  Nama Lengkap
                </label>
                <div style={styles.inputContainer}>
                  <User style={styles.inputIcon} />
                  <input
                    type="text"
                    name="nama_lengkap"
                    value={formData.nama_lengkap}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedInput('nama_lengkap')}
                    onBlur={() => setFocusedInput(null)}
                    style={{
                      ...styles.input,
                      ...(focusedInput === 'nama_lengkap' ? styles.inputFocus : {}),
                      ...(!isEditing ? styles.inputDisabled : {})
                    }}
                    disabled={!isEditing}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <Mail size={16} />
                  Email
                </label>
                <div style={styles.inputContainer}>
                  <Mail style={styles.inputIcon} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                    style={{
                      ...styles.input,
                      ...(focusedInput === 'email' ? styles.inputFocus : {}),
                      ...(!isEditing ? styles.inputDisabled : {})
                    }}
                    disabled={!isEditing}
                    required
                  />
                </div>
              </div>

              {/* Telepon */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <Phone size={16} />
                  Nomor Telepon
                </label>
                <div style={styles.inputContainer}>
                  <Phone style={styles.inputIcon} />
                  <input
                    type="tel"
                    name="telepon"
                    value={formData.telepon}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedInput('telepon')}
                    onBlur={() => setFocusedInput(null)}
                    style={{
                      ...styles.input,
                      ...(focusedInput === 'telepon' ? styles.inputFocus : {}),
                      ...(!isEditing ? styles.inputDisabled : {})
                    }}
                    placeholder="081234567890"
                    disabled={!isEditing}
                  />
                </div>
                <div style={styles.helperText}>
                  Format: 08xxxxxxxxxx atau +62xxxxxxxxxx
                </div>
              </div>

              {/* Password Section - Only shown when editing */}
              {isEditing && (
                <>
                  <div style={{ 
                    marginTop: '1rem', 
                    paddingTop: '1.5rem', 
                    borderTop: '1px solid #e2e8f0' 
                  }}>
                    <div style={{ 
                      fontSize: '1rem', 
                      fontWeight: '600', 
                      color: '#1e293b', 
                      marginBottom: '1rem' 
                    }}>
                      Ubah Password (Opsional)
                    </div>
                  </div>

                  {/* New Password */}
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>
                      <Lock size={16} />
                      Password Baru
                    </label>
                    <div style={styles.inputContainer}>
                      <Lock style={styles.inputIcon} />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedInput('newPassword')}
                        onBlur={() => setFocusedInput(null)}
                        style={{
                          ...styles.input,
                          ...(focusedInput === 'newPassword' ? styles.inputFocus : {})
                        }}
                        placeholder="Minimal 6 karakter"
                      />
                      <div
                        style={styles.togglePassword}
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </div>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>
                      <Lock size={16} />
                      Konfirmasi Password Baru
                    </label>
                    <div style={styles.inputContainer}>
                      <Lock style={styles.inputIcon} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedInput('confirmPassword')}
                        onBlur={() => setFocusedInput(null)}
                        style={{
                          ...styles.input,
                          ...(focusedInput === 'confirmPassword' ? styles.inputFocus : {})
                        }}
                        placeholder="Ulangi password baru"
                      />
                      <div
                        style={styles.togglePassword}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons - Only shown when editing */}
            {isEditing && (
              <div style={styles.buttonGroup} className="button-group">
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    ...styles.button,
                    ...styles.buttonSecondary
                  }}
                  disabled={loading}
                >
                  <X size={18} />
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    ...styles.button,
                    ...styles.buttonPrimary,
                    ...(loading ? styles.buttonDisabled : {})
                  }}
                  disabled={loading}
                >
                  <Save size={18} />
                  {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;