import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Coffee, Mail, Lock } from 'lucide-react';

const styles = {
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #10b981 100%)',
        padding: '1rem'
    },
    card: {
        width: '100%',
        maxWidth: '400px',
        padding: '2.5rem',
        backgroundColor: '#ffffff',
        borderRadius: '1rem',
        boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
    },
    header: {
        textAlign: 'center',
        marginBottom: '2rem'
    },
    logo: {
        width: '3.5rem',
        height: '3.5rem',
        margin: '0 auto',
        color: '#047857'
    },
    title: {
        marginTop: '1rem',
        fontSize: '1.8rem',
        fontWeight: '700',
        color: '#111827',
        letterSpacing: '1px'
    },
    subtitle: {
        color: '#6b7280',
        fontSize: '0.95rem'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
    },
    inputContainer: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        border: '1px solid #d1d5db',
        borderRadius: '0.5rem',
        padding: '0.75rem 1rem'
    },
    inputIcon: {
        marginRight: '0.75rem',
        color: '#9ca3af'
    },
    input: {
        flex: 1,
        border: 'none',
        outline: 'none',
        backgroundColor: 'transparent',
        fontSize: '1rem',
        color: '#111827'
    },
    button: {
        width: '100%',
        padding: '0.9rem',
        fontWeight: '600',
        fontSize: '1rem',
        color: 'white',
        backgroundColor: '#059669',
        borderRadius: '0.5rem',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    buttonHover: {
        backgroundColor: '#047857'
    },
    errorText: {
        fontSize: '0.9rem',
        textAlign: 'center',
        color: '#dc2626',
        marginTop: '-0.5rem'
    },
    linksContainer: {
        marginTop: '1.5rem',
        textAlign: 'center',
        fontSize: '0.875rem',
        color: '#6b7280'
    },
    link: {
        color: '#059669',
        fontWeight: '500',
        textDecoration: 'none',
        marginLeft: '0.25rem'
    }
};

// --- NAMA KOMPONEN DISESUAIKAN KEMBALI ---
const AdminLoginPage = () => { 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            const { token, pengguna } = response.data;
            
            login(pengguna, token);

            if (pengguna.peran === 'admin' || pengguna.peran === 'staff') {
                navigate('/pilih-cabang');
            } else { 
                navigate('/menu'); 
            }
        } catch (err) {
            setError('Email atau password salah.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <Coffee style={styles.logo} />
                    <h1 style={styles.title}>COFFENARY</h1>
                    <p style={styles.subtitle}>Selamat Datang Kembali</p>
                </div>

                <form style={styles.form} onSubmit={handleSubmit}>
                    <div style={styles.inputContainer}>
                        <Mail size={20} style={styles.inputIcon} />
                        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} required />
                    </div>
                    <div style={styles.inputContainer}>
                        <Lock size={20} style={styles.inputIcon} />
                        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} required />
                    </div>
                    {error && <p style={styles.errorText}>{error}</p>}
                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            ...styles.button,
                            ...(isLoading ? { opacity: 0.7, cursor: 'not-allowed' } : {})
                        }}
                        onMouseOver={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor; }}
                        onMouseOut={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = styles.button.backgroundColor; }}
                    >
                        {isLoading ? 'Memproses...' : 'Login'}
                    </button>
                </form>

                <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '1.5rem'}}>
                    <Link 
                        to="/" 
                        style={{color: '#059669', textDecoration: 'underline', fontSize: '0.9rem', fontWeight: '500'}}
                    >
                        Registrasi Pelanggan
                    </Link>
                    <Link 
                        to="/admin/forgot-password" 
                        style={{color: '#059669', textDecoration: 'underline', fontSize: '0.9rem', fontWeight: '500'}}
                    >
                        Lupa Password?
                    </Link>
                </div>
            </div>
        </div>
    );
};

// --- NAMA EKSPOR DISESUAIKAN KEMBALI ---
export default AdminLoginPage;