import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Edit, Plus, X, CheckCircle, AlertCircle, User, Mail, Phone, Lock, Shield, UserCheck } from 'lucide-react';

const styles = {
    container: { padding: '2rem', backgroundColor: '#f9fafb', minHeight: '100vh' },
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
        padding: '0.75rem 1.5rem', 
        borderRadius: '0.75rem', 
        border: 'none', 
        cursor: 'pointer', 
        display: 'flex', 
        alignItems: 'center',
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
    table: { width: '100%', textAlign: 'left', borderCollapse: 'collapse' },
    th: { 
        padding: '1.25rem 1rem', 
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
    statusBadge: { 
        padding: '0.4rem 1rem', 
        borderRadius: '9999px', 
        fontSize: '0.8rem', 
        fontWeight: '600', 
        display: 'inline-block',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    actionButton: { 
        color: '#3b82f6', 
        background: 'none', 
        border: 'none', 
        cursor: 'pointer', 
        padding: '0.5rem',
        borderRadius: '0.5rem',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
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
        padding: '1rem',
        backdropFilter: 'blur(4px)'
    },
    modalContent: { 
        backgroundColor: 'white', 
        padding: '2.5rem', 
        borderRadius: '1.25rem', 
        width: '90%', 
        maxWidth: '520px', 
        position: 'relative',
        boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
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
    formGroup: { 
        marginBottom: '1.5rem',
        animation: 'slideUp 0.4s ease-out'
    },
    label: {
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: '600',
        color: '#374151',
        fontSize: '0.9rem'
    },
    inputContainer: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
    },
    inputIcon: {
        position: 'absolute',
        left: '1rem',
        color: '#94a3b8',
        zIndex: 2
    },
    input: { 
        width: '100%', 
        boxSizing: 'border-box', 
        padding: '0.875rem 1rem 0.875rem 3rem', 
        border: '2px solid #e2e8f0', 
        borderRadius: '0.75rem', 
        fontSize: '0.95rem',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        backgroundColor: '#f8fafc'
    },
    select: {
        width: '100%', 
        boxSizing: 'border-box', 
        padding: '0.875rem 1rem', 
        border: '2px solid #e2e8f0', 
        borderRadius: '0.75rem', 
        fontSize: '0.95rem',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        backgroundColor: '#f8fafc',
        cursor: 'pointer'
    },
    modalActions: { 
        display: 'flex', 
        justifyContent: 'flex-end', 
        gap: '1rem', 
        marginTop: '2.5rem',
        animation: 'slideUp 0.5s ease-out'
    },
    cancelButton: {
        padding: '0.875rem 1.75rem',
        backgroundColor: 'white',
        color: '#64748b',
        border: '2px solid #e2e8f0',
        borderRadius: '0.75rem',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'all 0.2s ease'
    },
    saveButton: {
        padding: '0.875rem 1.75rem',
        backgroundColor: '#10b981',
        color: 'white',
        border: 'none',
        borderRadius: '0.75rem',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
    },
    // New styles for confirmation modal
    confirmationModal: {
        backgroundColor: 'white',
        padding: '2.5rem',
        borderRadius: '1.25rem',
        width: '90%',
        maxWidth: '440px',
        position: 'relative',
        boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
        animation: 'modalEntrance 0.3s ease-out',
        textAlign: 'center'
    },
    confirmationIcon: {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1.5rem',
        fontSize: '2rem'
    },
    confirmationTitle: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginBottom: '1rem',
        color: '#111827'
    },
    confirmationText: {
        color: '#64748b',
        marginBottom: '2rem',
        lineHeight: '1.6'
    },
    confirmationActions: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center'
    },
    confirmButton: {
        padding: '0.875rem 2rem',
        backgroundColor: '#10b981',
        color: 'white',
        border: 'none',
        borderRadius: '0.75rem',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'all 0.2s ease',
        minWidth: '100px'
    },
    loadingSpinner: {
        display: 'inline-block',
        width: '20px',
        height: '20px',
        border: '2px solid transparent',
        borderTop: '2px solid currentColor',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
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
    
    .input-focus {
        border-color: #10b981 !important;
        background-color: white !important;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }
    
    .button-hover:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
    }
    
    .cancel-hover:hover {
        background-color: #f8fafc !important;
        border-color: #cbd5e1 !important;
    }
    
    .action-hover:hover {
        background-color: #f0f9ff !important;
        transform: scale(1.05);
    }
`;
document.head.appendChild(styleSheet);

const AdminPengguna = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState(null);
    const [focusedInput, setFocusedInput] = useState(null);
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
        setFormData(null);
    };

    const handleInputFocus = (inputName) => {
        setFocusedInput(inputName);
    };

    const handleInputBlur = () => {
        setFocusedInput(null);
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

        setFormData(formData);
        setIsConfirmationOpen(true);
    };

    const confirmSave = async () => {
        setIsSaving(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            if (currentUser) {
                await axios.put(`http://localhost:5000/api/pengguna/${currentUser.id_pengguna}`, formData, config);
            } else {
                await axios.post('http://localhost:5000/api/pengguna', formData, config);
            }
            
            setIsConfirmationOpen(false);
            handleCloseModal();
            fetchUsers();
            
            // Show success message
            setTimeout(() => {
                // You can add a toast notification here if needed
            }, 300);
            
        } catch (error) {
            console.error("Gagal menyimpan data pengguna:", error);
            alert(error.response?.data?.message || 'Gagal menyimpan data.');
            setIsConfirmationOpen(false);
        } finally {
            setIsSaving(false);
        }
    };

    const cancelSave = () => {
        setIsConfirmationOpen(false);
        setFormData(null);
    };

    if (isLoading) return (
        <div style={styles.container}>
            <div style={{textAlign: 'center', padding: '4rem', color: '#64748b'}}>
                <div style={styles.loadingSpinner}></div>
                <p style={{marginTop: '1rem'}}>Memuat data pengguna...</p>
            </div>
        </div>
    );

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>
                    <UserCheck size={32} />
                    Manajemen Staff
                </h1>
                <button 
                    onClick={() => handleOpenModal(null)} 
                    style={styles.addButton}
                    className="button-hover"
                >
                    <Plus size={20} style={{ marginRight: '0.5rem' }} />
                    Tambah Staff
                </button>
            </div>
            
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
                                <td style={styles.td}>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            backgroundColor: '#f0f9ff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#0ea5e9',
                                            fontWeight: '600'
                                        }}>
                                            {user.nama_lengkap.charAt(0).toUpperCase()}
                                        </div>
                                        {user.nama_lengkap}
                                    </div>
                                </td>
                                <td style={styles.td}>{user.email}</td>
                                <td style={styles.td}>
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.4rem 0.75rem',
                                        backgroundColor: user.peran === 'admin' ? '#fef3c7' : '#f0f9ff',
                                        color: user.peran === 'admin' ? '#92400e' : '#0c4a6e',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.8rem',
                                        fontWeight: '600'
                                    }}>
                                        <Shield size={14} />
                                        {user.peran}
                                    </span>
                                </td>
                                <td style={styles.td}>
                                    <span style={{
                                        ...styles.statusBadge, 
                                        color: user.is_aktif ? '#059669' : '#dc2626', 
                                        backgroundColor: user.is_aktif ? '#f0fdf4' : '#fef2f2',
                                        border: user.is_aktif ? '1px solid #bbf7d0' : '1px solid #fecaca'
                                    }}>
                                        {user.is_aktif ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                </td>
                                <td style={styles.td}>
                                    <button 
                                        onClick={() => handleOpenModal(user)} 
                                        style={styles.actionButton}
                                        className="action-hover"
                                        title="Edit Pengguna"
                                    >
                                        <Edit size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Main Modal */}
            {isModalOpen && (
                <div style={styles.modalOverlay} onClick={handleCloseModal}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <button 
                            onClick={handleCloseModal} 
                            style={styles.closeButton}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <X size={24} />
                        </button>
                        <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#111827'}}>
                            {currentUser ? 'Edit Staff' : 'Tambah Staff Baru'}
                        </h2>
                        <form onSubmit={handleSave}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Nama Lengkap</label>
                                <div style={styles.inputContainer}>
                                    <User size={18} style={styles.inputIcon} />
                                    <input 
                                        name="nama_lengkap" 
                                        type="text" 
                                        defaultValue={currentUser?.nama_lengkap} 
                                        style={{
                                            ...styles.input,
                                            ...(focusedInput === 'nama_lengkap' ? { borderColor: '#10b981', backgroundColor: 'white', boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)' } : {})
                                        }}
                                        onFocus={() => handleInputFocus('nama_lengkap')}
                                        onBlur={handleInputBlur}
                                        required 
                                    />
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Email</label>
                                <div style={styles.inputContainer}>
                                    <Mail size={18} style={styles.inputIcon} />
                                    <input 
                                        name="email" 
                                        type="email" 
                                        defaultValue={currentUser?.email} 
                                        style={{
                                            ...styles.input,
                                            ...(focusedInput === 'email' ? { borderColor: '#10b981', backgroundColor: 'white', boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)' } : {})
                                        }}
                                        onFocus={() => handleInputFocus('email')}
                                        onBlur={handleInputBlur}
                                        required 
                                    />
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    {currentUser ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password Sementara'}
                                </label>
                                <div style={styles.inputContainer}>
                                    <Lock size={18} style={styles.inputIcon} />
                                    <input 
                                        name="password" 
                                        type="password" 
                                        style={{
                                            ...styles.input,
                                            ...(focusedInput === 'password' ? { borderColor: '#10b981', backgroundColor: 'white', boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)' } : {})
                                        }}
                                        onFocus={() => handleInputFocus('password')}
                                        onBlur={handleInputBlur}
                                        required={!currentUser}
                                        placeholder={currentUser ? "Biarkan kosong untuk mempertahankan password" : "Masukkan password sementara"}
                                    />
                                </div>
                            </div>
                            
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Telepon</label>
                                <div style={styles.inputContainer}>
                                    <Phone size={18} style={styles.inputIcon} />
                                    <input 
                                        name="telepon" 
                                        type="text" 
                                        defaultValue={currentUser?.telepon} 
                                        style={{
                                            ...styles.input,
                                            ...(focusedInput === 'telepon' ? { borderColor: '#10b981', backgroundColor: 'white', boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)' } : {})
                                        }}
                                        onFocus={() => handleInputFocus('telepon')}
                                        onBlur={handleInputBlur}
                                    />
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Peran</label>
                                <select 
                                    name="peran" 
                                    defaultValue={currentUser?.peran || 'staff'} 
                                    style={{
                                        ...styles.select,
                                        ...(focusedInput === 'peran' ? { borderColor: '#10b981', backgroundColor: 'white', boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)' } : {})
                                    }}
                                    onFocus={() => handleInputFocus('peran')}
                                    onBlur={handleInputBlur}
                                    required
                                >
                                    <option value="staff">Staff</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            {currentUser && (
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Status</label>
                                    <select 
                                        name="is_aktif" 
                                        defaultValue={currentUser.is_aktif ? 1 : 0} 
                                        style={{
                                            ...styles.select,
                                            ...(focusedInput === 'is_aktif' ? { borderColor: '#10b981', backgroundColor: 'white', boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)' } : {})
                                        }}
                                        onFocus={() => handleInputFocus('is_aktif')}
                                        onBlur={handleInputBlur}
                                        required
                                    >
                                        <option value="1">Aktif</option>
                                        <option value="0">Nonaktif</option>
                                    </select>
                                </div>
                            )}

                            <div style={styles.modalActions}>
                                <button 
                                    type="button" 
                                    onClick={handleCloseModal} 
                                    style={styles.cancelButton}
                                    className="cancel-hover"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    style={styles.saveButton}
                                    className="button-hover"
                                >
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {isConfirmationOpen && (
                <div style={styles.modalOverlay} onClick={cancelSave}>
                    <div style={styles.confirmationModal} onClick={(e) => e.stopPropagation()}>
                        <div style={{
                            ...styles.confirmationIcon,
                            backgroundColor: '#f0fdf4'
                        }}>
                            <CheckCircle size={32} color="#10b981" />
                        </div>
                        
                        <h2 style={styles.confirmationTitle}>
                            Konfirmasi {currentUser ? 'Perubahan' : 'Penambahan'}
                        </h2>
                        
                        <p style={styles.confirmationText}>
                            {currentUser 
                                ? `Anda akan mengubah data staff "${currentUser.nama_lengkap}". Pastikan semua data sudah benar.` 
                                : 'Anda akan menambahkan staff baru. Pastikan semua data sudah benar sebelum menyimpan.'
                            }
                        </p>
                        
                        <div style={styles.confirmationActions}>
                            <button 
                                onClick={cancelSave}
                                style={styles.cancelButton}
                                className="cancel-hover"
                                disabled={isSaving}
                            >
                                Batal
                            </button>
                            <button 
                                onClick={confirmSave}
                                style={styles.confirmButton}
                                className="button-hover"
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <>
                                        <div style={styles.loadingSpinner}></div>
                                    </>
                                ) : (
                                    'Ya, Simpan'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};  

export default AdminPengguna;