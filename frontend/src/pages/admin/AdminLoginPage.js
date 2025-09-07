import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Coffee, Lock, Mail, AlertCircle } from 'lucide-react';

const AdminLoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [logoError, setLogoError] = useState(false);
    const navigate = useNavigate();

    // Konfigurasi logo - File di folder public
    const LOGO_CONFIG = {
        imagePath: '/logo_coffenary.png', // Nama file logo Anda
        fallbackText: 'bg',
        fallbackColor: '#047857'
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setError('');

        try {
            // Simulasi API call - ganti dengan endpoint yang sebenarnya
            const response = await fetch('http://localhost:5000/api/auth/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

           if (response.ok) {
            const data = await response.json();
            console.log('Login berhasil:', data);

            // 1. Simpan token ke localStorage agar status login tidak hilang
            localStorage.setItem('adminToken', data.token);

            // 2. Arahkan pengguna ke halaman dashboard admin
            navigate('/admin/dashboard'); 
}
        } catch (err) {
            setError('Email atau password salah!');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const containerStyle = {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdfa 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    };

    const cardStyle = {
        width: '100%',
        maxWidth: '400px',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        padding: '32px',
        border: '1px solid #d1fae5'
    };

    const logoContainerStyle = {
        textAlign: 'center',
        marginBottom: '32px'
    };

    const logoCircleStyle = {
        backgroundColor: 'white',
        borderRadius: '50%',
        padding: '16px',
        width: '80px',
        height: '80px',
        margin: '0 auto 16px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    };

    const logoTextStyle = {
        color: '#047857',
        fontWeight: 'bold',
        fontSize: '24px'
    };

    const titleStyle = {
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#065f46',
        marginBottom: '8px'
    };

    const subtitleStyle = {
        color: '#059669'
    };

    const headerStyle = {
        textAlign: 'center',
        marginBottom: '24px'
    };

    const welcomeTitleStyle = {
        fontSize: '24px',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '8px'
    };

    const welcomeSubtitleStyle = {
        color: '#6b7280'
    };

    const inputGroupStyle = {
        marginBottom: '20px'
    };

    const labelStyle = {
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151',
        display: 'block',
        marginBottom: '8px'
    };

    const inputContainerStyle = {
        position: 'relative'
    };

    const inputStyle = {
        width: '100%',
        paddingLeft: '48px',
        paddingRight: '48px',
        paddingTop: '12px',
        paddingBottom: '12px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        backgroundColor: '#f9fafb',
        fontSize: '16px',
        transition: 'all 0.2s',
        boxSizing: 'border-box'
    };

    const inputFocusStyle = {
        ...inputStyle,
        backgroundColor: 'white',
        borderColor: '#10b981',
        boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)',
        outline: 'none'
    };

    const iconStyle = {
        position: 'absolute',
        left: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#10b981',
        width: '20px',
        height: '20px'
    };

    const eyeIconStyle = {
        position: 'absolute',
        right: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#9ca3af',
        cursor: 'pointer',
        width: '20px',
        height: '20px'
    };

    const errorStyle = {
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        padding: '12px',
        display: 'flex',
        alignItems: 'center',
        color: '#dc2626',
        fontSize: '14px',
        marginBottom: '20px'
    };

    const buttonStyle = {
        width: '100%',
        background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
        color: 'white',
        padding: '12px 16px',
        borderRadius: '8px',
        fontWeight: '500',
        border: 'none',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'all 0.2s',
        opacity: isLoading ? 0.5 : 1
    };

    const footerStyle = {
        marginTop: '24px',
        paddingTop: '24px',
        borderTop: '1px solid #f3f4f6',
        textAlign: 'center',
        fontSize: '14px',
        color: '#6b7280'
    };

    const demoStyle = {
        marginTop: '24px',
        backgroundColor: '#ecfdf5',
        borderRadius: '8px',
        padding: '16px',
        border: '1px solid #bbf7d0',
        textAlign: 'center',
        fontSize: '14px',
        color: '#047857'
    };

    const spinnerStyle = {
        width: '20px',
        height: '20px',
        border: '2px solid transparent',
        borderTop: '2px solid white',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    };

    return (
        <div style={containerStyle}>
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
            <div style={{ width: '100%', maxWidth: '400px' }}>
                {/* Logo dan Header */}
                <div style={logoContainerStyle}>
                    <div style={logoCircleStyle}>
                        {!logoError ? (
                            <img 
                                src={LOGO_CONFIG.imagePath}
                                alt="Coffenary Logo" 
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    objectFit: 'contain'
                                }}
                                onError={() => setLogoError(true)}
                            />
                        ) : (
                            // Fallback jika gambar tidak ditemukan
                            <div style={{
                                ...logoTextStyle,
                                color: LOGO_CONFIG.fallbackColor
                            }}>
                                {LOGO_CONFIG.fallbackText}
                            </div>
                        )}
                    </div>
                    <h1 style={titleStyle}>COFFENARY</h1>
                    <p style={subtitleStyle}>Admin Panel</p>
                </div>

                {/* Form Login */}
                <div style={cardStyle}>
                    <div style={headerStyle}>
                        <h2 style={welcomeTitleStyle}>Selamat Datang</h2>
                        <p style={welcomeSubtitleStyle}>Masuk ke panel admin Coffenary</p>
                    </div>

                    <div>
                        {/* Email Input */}
                        <div style={inputGroupStyle}>
                            <label htmlFor="email" style={labelStyle}>Email</label>
                            <div style={inputContainerStyle}>
                                <Mail style={iconStyle} />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@coffenary.com"
                                    required
                                    style={inputStyle}
                                    onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                                    onBlur={(e) => Object.assign(e.target.style, inputStyle)}
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div style={inputGroupStyle}>
                            <label htmlFor="password" style={labelStyle}>Password</label>
                            <div style={inputContainerStyle}>
                                <Lock style={iconStyle} />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    style={inputStyle}
                                    onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                                    onBlur={(e) => Object.assign(e.target.style, inputStyle)}
                                />
                                <div
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={eyeIconStyle}
                                >
                                    {showPassword ? <EyeOff /> : <Eye />}
                                </div>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div style={errorStyle}>
                                <AlertCircle style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Login Button */}
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isLoading}
                            style={buttonStyle}
                            onMouseOver={(e) => {
                                if (!isLoading) {
                                    e.target.style.background = 'linear-gradient(135deg, #047857 0%, #0f766e 100%)';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (!isLoading) {
                                    e.target.style.background = 'linear-gradient(135deg, #059669 0%, #0d9488 100%)';
                                }
                            }}
                        >
                            {isLoading ? (
                                <div style={spinnerStyle}></div>
                            ) : (
                                <>
                                    <span>Masuk</span>
                                    <Coffee style={{ width: '20px', height: '20px' }} />
                                </>
                            )}
                        </button>
                    </div>

                    {/* Footer */}
                    <div style={footerStyle}>
                        <p>© 2024 Coffenary. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;