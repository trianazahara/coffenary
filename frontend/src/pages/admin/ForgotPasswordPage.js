import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Coffee, Mail, Lock, KeyRound } from 'lucide-react';

// --- STYLING LENGKAP & ANIMASI (Disalin dari halaman login) ---
const styles = {
    container: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100vw', margin: 0, padding: 0, background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 30%, #6ee7b7 60%, #34d399 100%)', position: 'fixed', top: 0, left: 0, overflow: 'hidden' },
    floatingElements: { position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 },
    coffeeBubble: { position: 'absolute', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.4)', animation: 'bubbleFloat 12s ease-in-out infinite', boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.6)' },
    coffeeBean: { position: 'absolute', width: '20px', height: '30px', background: '#8b4513', borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', animation: 'beanRotate 20s linear infinite', opacity: 0.2 },
    coffeeSteam: { position: 'absolute', width: '4px', height: '60px', background: 'linear-gradient(to top, rgba(255, 255, 255, 0.8), transparent)', borderRadius: '2px', animation: 'steamRise 4s ease-in-out infinite' },
    card: { width: '100%', maxWidth: '380px', padding: '2rem 1.8rem', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(15px)', borderRadius: '1.2rem', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.2)', position: 'relative', zIndex: 10, animation: 'cardEntrance 1s ease-out', border: '1px solid rgba(255, 255, 255, 0.3)' },
    header: { textAlign: 'center', marginBottom: '2rem', animation: 'slideDown 1.2s ease-out' },
    logoContainer: { position: 'relative', display: 'inline-block', marginBottom: '0.8rem' },
    logo: { width: '3.5rem', height: '3.5rem', color: '#059669', animation: 'logoFloat 3s ease-in-out infinite', filter: 'drop-shadow(0 4px 8px rgba(5, 150, 105, 0.3))' },
    logoGlow: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '4.5rem', height: '4.5rem', background: 'radial-gradient(circle, rgba(5, 150, 105, 0.15) 0%, transparent 70%)', borderRadius: '50%', animation: 'glowPulse 2.5s ease-in-out infinite' },
    title: { fontSize: '1.8rem', fontWeight: '800', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '1.5px', marginBottom: '0.3rem' },
    subtitle: { color: '#6b7280', fontSize: '0.9rem', fontWeight: '500' },
    form: { display: 'flex', flexDirection: 'column', gap: '1.2rem' },
    inputContainer: { position: 'relative', display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.9rem 1rem', transition: 'all 0.25s ease', animation: 'slideUp 1.4s ease-out' },
    inputContainerFocus: { borderColor: '#10b981', backgroundColor: '#ffffff', boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)', transform: 'translateY(-1px)' },
    inputIcon: { marginRight: '0.8rem', color: '#94a3b8', transition: 'color 0.25s ease' },
    inputIconFocus: { color: '#10b981' },
    input: { flex: 1, border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: '0.95rem', color: '#1e293b', fontWeight: '500' },
    button: { width: '100%', padding: '1rem', fontWeight: '600', fontSize: '1rem', color: 'white', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', borderRadius: '0.75rem', border: 'none', cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'all 0.25s ease', boxShadow: '0 6px 20px rgba(5, 150, 105, 0.25)', animation: 'slideUp 1.6s ease-out' },
    buttonHover: { transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(5, 150, 105, 0.35)' },
    messageText: { fontSize: '0.9rem', textAlign: 'center', color: '#059669', marginTop: '1rem', padding: '0.6rem', backgroundColor: 'rgba(16, 185, 129, 0.08)', borderRadius: '0.5rem' },
    errorText: { fontSize: '0.85rem', textAlign: 'center', color: '#ef4444', marginTop: '-0.3rem', padding: '0.6rem', backgroundColor: 'rgba(239, 68, 68, 0.08)', borderRadius: '0.5rem', animation: 'errorShake 0.5s ease-in-out' },
    backLinkContainer: { textAlign: 'center', marginTop: '1.5rem', animation: 'slideUp 1.8s ease-out' },
    backLink: { color: '#059669', fontWeight: '600', textDecoration: 'none' }
};

// Inject CSS animations (cukup sekali di-load)
if (!document.getElementById('coffenary-animations')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'coffenary-animations';
    styleSheet.textContent = `
      @keyframes bubbleFloat { 0% { transform: translateY(100vh) scale(0); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(-100px) scale(1); opacity: 0; } }
      @keyframes beanRotate { 0% { transform: rotate(0deg) translateY(100vh); } 100% { transform: rotate(360deg) translateY(-50px); } }
      @keyframes steamRise { 0% { opacity: 0.8; transform: translateY(0) scale(1); } 50% { opacity: 0.4; transform: translateY(-30px) scale(1.2); } 100% { opacity: 0; transform: translateY(-60px) scale(0.8); } }
      @keyframes cardEntrance { 0% { opacity: 0; transform: translateY(30px) scale(0.95); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
      @keyframes slideDown { 0% { opacity: 0; transform: translateY(-20px); } 100% { opacity: 1; transform: translateY(0); } }
      @keyframes slideUp { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
      @keyframes logoFloat { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-5px) rotate(5deg); } }
      @keyframes glowPulse { 0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); } 50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.05); } }
      @keyframes errorShake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
      body, html { margin: 0 !important; padding: 0 !important; overflow-x: hidden; }
    `;
    document.head.appendChild(styleSheet);
}

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [step, setStep] = useState(1);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);
    const [buttonHover, setButtonHover] = useState(false);
    const navigate = useNavigate();
    
    // ... (Fungsi handleRequestOtp & handleResetPassword tetap sama)
    const handleRequestOtp = async (e) => { e.preventDefault(); setIsLoading(true); setError(''); setMessage(''); try { await axios.post('http://localhost:5000/api/auth/forgot-password', { email }); setMessage('OTP telah dikirim ke email Anda.'); setStep(2); } catch (err) { setError(err.response?.data?.message || 'Gagal mengirim OTP.'); } finally { setIsLoading(false); } };
    const handleResetPassword = async (e) => { e.preventDefault(); setIsLoading(true); setError(''); setMessage(''); try { await axios.post('http://localhost:5000/api/auth/reset-password', { email, otp, password }); alert('Password berhasil direset! Anda akan diarahkan ke halaman login.'); navigate('/'); } catch (err) { setError(err.response?.data?.message || 'Gagal mereset password.'); } finally { setIsLoading(false); } };

    const handleInputFocus = (inputName) => setFocusedInput(inputName);
    const handleInputBlur = () => setFocusedInput(null);

    // Elemen animasi (sama seperti halaman login)
    const bubbles = Array.from({ length: 8 }, (_, i) => ( <div key={`bubble-${i}`} style={{...styles.coffeeBubble, width: `${Math.random()*40+20}px`, height: `${Math.random()*40+20}px`, left: `${Math.random()*100}%`, animationDelay: `${Math.random()*8}s`, animationDuration: `${8+Math.random()*6}s`}}/> ));
    const beans = Array.from({ length: 5 }, (_, i) => ( <div key={`bean-${i}`} style={{...styles.coffeeBean, left: `${Math.random()*100}%`, animationDelay: `${Math.random()*15}s`, animationDuration: `${15+Math.random()*10}s`}}/> ));
    const steam = Array.from({ length: 6 }, (_, i) => ( <div key={`steam-${i}`} style={{...styles.coffeeSteam, left: `${20+Math.random()*60}%`, bottom: `${Math.random()*30}%`, animationDelay: `${Math.random()*3}s`}}/> ));

    return (
        <div style={styles.container}>
            <div style={styles.floatingElements}>{bubbles}{beans}{steam}</div>
            <div style={styles.card}>
                <div style={styles.header}>
                    <div style={styles.logoContainer}>
                        <div style={styles.logoGlow}></div>
                        <Coffee style={styles.logo} />
                    </div>
                    <h1 style={styles.title}>{step === 1 ? 'Lupa Password' : 'Reset Password'}</h1>
                </div>

                {step === 1 ? (
                    <form style={styles.form} onSubmit={handleRequestOtp}>
                        <p style={{...styles.subtitle, textAlign: 'center'}}>Masukkan email Anda untuk menerima kode OTP.</p>
                        <div style={{...styles.inputContainer, ...(focusedInput === 'email' ? styles.inputContainerFocus : {})}}>
                            <Mail size={18} style={{...styles.inputIcon, ...(focusedInput === 'email' ? styles.inputIconFocus : {})}} />
                            <input name="email" type="email" placeholder="Email" style={styles.input} value={email} onChange={e => setEmail(e.target.value)} onFocus={() => handleInputFocus('email')} onBlur={handleInputBlur} required/>
                        </div>
                        <button type="submit" style={{...styles.button, ...(buttonHover && !isLoading ? styles.buttonHover : {}), ...(isLoading ? { opacity: 0.8, cursor: 'not-allowed' } : {})}} onMouseEnter={() => setButtonHover(true)} onMouseLeave={() => setButtonHover(false)} disabled={isLoading}>{isLoading ? 'Mengirim...' : 'Kirim OTP'}</button>
                    </form>
                ) : (
                    <form style={styles.form} onSubmit={handleResetPassword}>
                        <p style={{...styles.subtitle, textAlign: 'center'}}>Cek email Anda dan masukkan kode OTP.</p>
                        <div style={{...styles.inputContainer, ...(focusedInput === 'otp' ? styles.inputContainerFocus : {})}}>
                            <KeyRound size={18} style={{...styles.inputIcon, ...(focusedInput === 'otp' ? styles.inputIconFocus : {})}} />
                            <input name="otp" type="text" placeholder="Kode OTP" style={styles.input} value={otp} onChange={e => setOtp(e.target.value)} onFocus={() => handleInputFocus('otp')} onBlur={handleInputBlur} required/>
                        </div>
                        <div style={{...styles.inputContainer, ...(focusedInput === 'password' ? styles.inputContainerFocus : {})}}>
                            <Lock size={18} style={{...styles.inputIcon, ...(focusedInput === 'password' ? styles.inputIconFocus : {})}} />
                            <input name="password" type="password" placeholder="Password Baru" style={styles.input} value={password} onChange={e => setPassword(e.target.value)} onFocus={() => handleInputFocus('password')} onBlur={handleInputBlur} required/>
                        </div>
                        <button type="submit" style={{...styles.button, ...(buttonHover && !isLoading ? styles.buttonHover : {}), ...(isLoading ? { opacity: 0.8, cursor: 'not-allowed' } : {})}} onMouseEnter={() => setButtonHover(true)} onMouseLeave={() => setButtonHover(false)} disabled={isLoading}>{isLoading ? 'Memproses...' : 'Reset Password'}</button>
                    </form>
                )}
                {message && <p style={styles.messageText}>{message}</p>}
                {error && <p style={styles.errorText}>{error}</p>}
                <div style={styles.backLinkContainer}>
                    <Link to="/" style={styles.backLink}>Kembali ke Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;