// src/pages/UserLoginPage.js
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Coffee, Mail, Lock } from 'lucide-react';

// Enhanced styling with coffee-themed animations
const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    width: '100vw',
    margin: 0,
    padding: 0,
    background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 30%, #6ee7b7 60%, #34d399 100%)',
    position: 'fixed',
    top: 0,
    left: 0,
    overflow: 'hidden'
  },
  floatingElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 1
  },
  coffeeBubble: {
    position: 'absolute',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.4)',
    animation: 'bubbleFloat 12s ease-in-out infinite',
    boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.6)'
  },
  buttonHover: {
        backgroundColor: '#047857'
    },

     linksContainer: {
        marginTop: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.875rem',
        color: '#6b7280',
        animation: 'slideUp 1.8s ease-out'
    },
    link: {
        color: '#059669',
        fontWeight: '600',
        textDecoration: 'none',
        transition: 'color 0.2s'
    },
    forgotLinkContainer: {
        marginTop: '1.5rem',
        textAlign: 'right',
        fontSize: '0.875rem',
    },
    registerContainer: {
        marginTop: '1.25rem',
        textAlign: 'center',
        fontSize: '0.875rem',
        color: '#6b7280'
    },
    link: {
        color: '#059669',
        fontWeight: '600',
        textDecoration: 'none',
        transition: 'color 0.2s'
    },
    registerLink: { // Style khusus untuk link registrasi agar di baris baru
        color: '#059669',
        fontWeight: '600',
        textDecoration: 'none',
        display: 'block',
        marginTop: '0.25rem',
        transition: 'color 0.2s'
    },
    linkHover: {
        color: '#047857'
    },
  coffeeBean: {
    position: 'absolute',
    width: '20px',
    height: '30px',
    background: '#8b4513',
    borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
    animation: 'beanRotate 20s linear infinite',
    opacity: 0.2
  },
  coffeeSteam: {
    position: 'absolute',
    width: '4px',
    height: '60px',
    background: 'linear-gradient(to top, rgba(255, 255, 255, 0.8), transparent)',
    borderRadius: '2px',
    animation: 'steamRise 4s ease-in-out infinite'
  },
  card: {
    width: '100%',
    maxWidth: '350px',
    padding: '2rem 1.8rem',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(15px)',
    borderRadius: '1.2rem',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.2)',
    position: 'relative',
    zIndex: 10,
    animation: 'cardEntrance 1s ease-out',
    border: '1px solid rgba(255, 255, 255, 0.3)'
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
    animation: 'slideDown 1.2s ease-out'
  },
  logoContainer: {
    position: 'relative',
    display: 'inline-block',
    marginBottom: '0.8rem'
  },
  logo: {
    width: '3.5rem',
    height: '3.5rem',
    color: '#059669',
    animation: 'logoFloat 3s ease-in-out infinite',
    filter: 'drop-shadow(0 4px 8px rgba(5, 150, 105, 0.3))'
  },
  logoGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '4.5rem',
    height: '4.5rem',
    background: 'radial-gradient(circle, rgba(5, 150, 105, 0.15) 0%, transparent 70%)',
    borderRadius: '50%',
    animation: 'glowPulse 2.5s ease-in-out infinite'
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '1.5px',
    marginBottom: '0.3rem'
  },
  subtitle: {
    color: '#6b7280',
    fontSize: '0.9rem',
    fontWeight: '500'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.2rem'
  },
  inputContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '0.75rem',
    padding: '0.9rem 1rem',
    transition: 'all 0.25s ease',
    animation: 'slideUp 1.4s ease-out'
  },
  inputContainerFocus: {
    borderColor: '#10b981',
    backgroundColor: '#ffffff',
    boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)',
    transform: 'translateY(-1px)'
  },
  inputIcon: {
    marginRight: '0.8rem',
    color: '#94a3b8',
    transition: 'color 0.25s ease'
  },
  inputIconFocus: {
    color: '#10b981'
  },
  input: {
  flex: 1,
  border: 'none',
  outline: 'none',
  backgroundColor: 'transparent',
  fontSize: '0.95rem',
  color: '#1e293b',
  fontWeight: '500',
  // Tambahkan ini:
  WebkitBoxShadow: '0 0 0 1000px transparent inset',
  WebkitTextFillColor: '#1e293b'
  },
  button: {
    width: '100%',
    padding: '1rem',
    fontWeight: '600',
    fontSize: '1rem',
    color: 'white',
    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    borderRadius: '0.75rem',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.25s ease',
    boxShadow: '0 6px 20px rgba(5, 150, 105, 0.25)',
    animation: 'slideUp 1.6s ease-out'
  },
  buttonHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(5, 150, 105, 0.35)'
  },
  errorText: {
    fontSize: '0.85rem',
    textAlign: 'center',
    color: '#ef4444',
    marginTop: '-0.3rem',
    padding: '0.6rem',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: '0.5rem',
    animation: 'errorShake 0.5s ease-in-out'
  }
};

// Add CSS animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes bubbleFloat {
    0% { 
      transform: translateY(100vh) scale(0); 
      opacity: 0; 
    }
    10% { 
      opacity: 1; 
    }
    90% { 
      opacity: 1; 
    }
    100% { 
      transform: translateY(-100px) scale(1); 
      opacity: 0; 
    }
  }
  
  @keyframes beanRotate {
    0% { transform: rotate(0deg) translateY(100vh); }
    100% { transform: rotate(360deg) translateY(-50px); }
  }
  
  @keyframes steamRise {
    0% { 
      opacity: 0.8; 
      transform: translateY(0) scale(1); 
    }
    50% { 
      opacity: 0.4; 
      transform: translateY(-30px) scale(1.2); 
    }
    100% { 
      opacity: 0; 
      transform: translateY(-60px) scale(0.8); 
    }
  }
  
  @keyframes cardEntrance {
    0% { 
      opacity: 0; 
      transform: translateY(30px) scale(0.95); 
    }
    100% { 
      opacity: 1; 
      transform: translateY(0) scale(1); 
    }
  }
  
  @keyframes slideDown {
    0% { 
      opacity: 0; 
      transform: translateY(-20px); 
    }
    100% { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }
  
  @keyframes slideUp {
    0% { 
      opacity: 0; 
      transform: translateY(20px); 
    }
    100% { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }
  
  @keyframes logoFloat {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-5px) rotate(5deg); }
  }
  
  @keyframes glowPulse {
    0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
    50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.05); }
  }
  
  @keyframes errorShake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-8px); }
    75% { transform: translateX(8px); }
  }
  
  body, html {
    margin: 0 !important;
    padding: 0 !important;
    overflow-x: hidden;
  }

  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px #f8fafc inset !important;
    -webkit-text-fill-color: #1e293b !important;
    box-shadow: 0 0 0 30px #f8fafc inset !important;
  }

  input:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 30px #ffffff inset !important;
    box-shadow: 0 0 0 30px #ffffff inset !important;
  }
`;
document.head.appendChild(styleSheet);

const UserLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [buttonHover, setButtonHover] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, pengguna } = response.data;

      if (!pengguna) {
        setError('Respon server tidak valid.');
        setIsLoading(false);
        return;
      }

      login(pengguna, token);
      navigate('/pilih-cabang');

    } catch (err) {
      const msg = err.response?.data?.message || 'Email atau password salah.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputFocus = (inputName) => {
    setFocusedInput(inputName);
  };

  const handleInputBlur = () => {
    setFocusedInput(null);
  };

  // Create coffee-themed floating elements
  const bubbles = Array.from({ length: 8 }, (_, i) => (
    <div
      key={`bubble-${i}`}
      style={{
        ...styles.coffeeBubble,
        width: `${Math.random() * 40 + 20}px`,
        height: `${Math.random() * 40 + 20}px`,
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 8}s`,
        animationDuration: `${8 + Math.random() * 6}s`
      }}
    />
  ));

  const beans = Array.from({ length: 5 }, (_, i) => (
    <div
      key={`bean-${i}`}
      style={{
        ...styles.coffeeBean,
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 15}s`,
        animationDuration: `${15 + Math.random() * 10}s`
      }}
    />
  ));

  const steam = Array.from({ length: 6 }, (_, i) => (
    <div
      key={`steam-${i}`}
      style={{
        ...styles.coffeeSteam,
        left: `${20 + Math.random() * 60}%`,
        bottom: `${Math.random() * 30}%`,
        animationDelay: `${Math.random() * 3}s`
      }}
    />
  ));

  return (
    <div style={styles.container}>
      <div style={styles.floatingElements}>
        {bubbles}
        {beans}
        {steam}
      </div>
      
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoContainer}>
            <div style={styles.logoGlow}></div>
            <Coffee style={styles.logo} />
          </div>
          <h1 style={styles.title}>COFFENARY</h1>
          <p style={styles.subtitle}>Login Pengguna</p>
        </div>

        <form style={styles.form} onSubmit={handleSubmit}>
          <div 
            style={{
              ...styles.inputContainer,
              ...(focusedInput === 'email' ? styles.inputContainerFocus : {})
            }}
          >
            <Mail 
              size={18} 
              style={{
                ...styles.inputIcon,
                ...(focusedInput === 'email' ? styles.inputIconFocus : {})
              }} 
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => handleInputFocus('email')}
              onBlur={handleInputBlur}
              style={styles.input}
              required
            />
          </div>
          
          <div 
            style={{
              ...styles.inputContainer,
              ...(focusedInput === 'password' ? styles.inputContainerFocus : {})
            }}
          >
            <Lock 
              size={18} 
              style={{
                ...styles.inputIcon,
                ...(focusedInput === 'password' ? styles.inputIconFocus : {})
              }} 
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => handleInputFocus('password')}
              onBlur={handleInputBlur}
              style={styles.input}
              required
            />
          </div>
          
          {error && <p style={styles.errorText}>{error}</p>}
          
          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...styles.button,
              ...(buttonHover ? styles.buttonHover : {}),
              ...(isLoading ? { opacity: 0.8, cursor: 'not-allowed' } : {})
            }}
            onMouseEnter={() => setButtonHover(true)}
            onMouseLeave={() => setButtonHover(false)}
          >
            {isLoading ? 'Memproses...' : 'Login'}
          </button>
        </form>

        <div style={styles.forgotLinkContainer}>
                    <Link 
                        to="/forgot-password" 
                        style={styles.link}
                        onMouseEnter={(e) => e.currentTarget.style.color = styles.linkHover.color}
                        onMouseLeave={(e) => e.currentTarget.style.color = styles.link.color}
                    >
                        Lupa Password?
                    </Link>
                </div>

                {/* Wadah untuk "Registrasi" di tengah */}
                <div style={styles.registerContainer}>
                    <span>Belum punya akun?</span>
                    <Link 
                        to="/register" 
                        style={styles.registerLink}
                        onMouseEnter={(e) => e.currentTarget.style.color = styles.linkHover.color}
                        onMouseLeave={(e) => e.currentTarget.style.color = styles.registerLink.color}
                    >
                        Registrasi
                    </Link>
                </div>

      </div>
    </div>
  );
};

export default UserLoginPage;