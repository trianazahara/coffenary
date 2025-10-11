// src/pages/auth/RegisterPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, Phone, User, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import Header from '../components/pelanggan/Header';

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f8fafc', paddingTop: 70 },
  main: { maxWidth: 480, margin: '0 auto', padding: '2rem 1rem' },
  card: {
    background: '#fff',
    borderRadius: '1rem',
    padding: '2rem',
    boxShadow: '0 4px 15px rgba(0,0,0,.08)',
    border: '1px solid rgba(226,232,240,.5)',
  },
  title: { fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', gap: 8, alignItems: 'center' },
  subtitle: { color: '#64748b', marginTop: 6 },
  field: { marginTop: 14 },
  label: { display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 },
  inputWrap: { position: 'relative' },
  input: {
    width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: 12,
    border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none',
  },
  icon: { position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' },
  eyeBtn: { position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 0, cursor: 'pointer' },
  btn: {
    width: '100%', marginTop: 16, padding: '0.85rem 1rem', border: 0, borderRadius: 12,
    background: '#10b981', color: '#fff', fontWeight: 700, cursor: 'pointer',
  },
  muted: { fontSize: 14, color: '#64748b', marginTop: 12, textAlign: 'center' },
  error: { display:'flex', gap:8, alignItems:'center', background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca', padding:12, borderRadius:10, marginTop:12 },
  ok: { display:'flex', gap:8, alignItems:'center', background:'#f0fdf4', color:'#16a34a', border:'1px solid #bbf7d0', padding:12, borderRadius:10, marginTop:12 },
};

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    nama_lengkap: '',
    email: '',
    telepon: '',
    password: '',
    confirm: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msgErr, setMsgErr] = useState('');
  const [msgOk, setMsgOk] = useState('');

  const onChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.username || !form.nama_lengkap || !form.email || !form.password) return 'Semua field wajib diisi (telepon opsional).';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Email tidak valid.';
    if (form.password.length < 6) return 'Password minimal 6 karakter.';
    if (form.password !== form.confirm) return 'Konfirmasi password tidak cocok.';
    return null;
    };

  const submit = async (e) => {
    e.preventDefault();
    setMsgErr(''); setMsgOk('');
    const v = validate();
    if (v) { setMsgErr(v); return; }

    try {
      setLoading(true);
      await axios.post('http://localhost:5000/api/auth/register', {
        username: form.username,
        email: form.email,
        password: form.password,
        nama_lengkap: form.nama_lengkap,
        telepon: form.telepon || null,
      });

      setMsgOk('Registrasi berhasil! Silakan masuk.');
      // Redirect kecil setelah beberapa detik
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      setMsgErr(err.response?.data?.message || 'Registrasi gagal. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Kalau halaman pelanggan selalu tampil header pelanggan */}
      <Header />

      <main style={styles.main}>
        <div style={styles.card}>
          <h1 style={styles.title}><UserPlus size={24} /> Buat Akun</h1>
          <p style={styles.subtitle}>Daftar sebagai pelanggan Coffenary</p>

          {msgErr && <div style={styles.error}><AlertCircle size={18} />{msgErr}</div>}
          {msgOk && <div style={styles.ok}><CheckCircle size={18} />{msgOk}</div>}

          <form onSubmit={submit}>
            <div style={styles.field}>
              <label style={styles.label}>Nama Lengkap</label>
              <div style={styles.inputWrap}>
                <User size={18} style={styles.icon} />
                <input
                  style={styles.input}
                  name="nama_lengkap"
                  value={form.nama_lengkap}
                  onChange={onChange}
                  placeholder="Budi Budiman"
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Username</label>
              <div style={styles.inputWrap}>
                <User size={18} style={styles.icon} />
                <input
                  style={styles.input}
                  name="username"
                  value={form.username}
                  onChange={onChange}
                  placeholder="budi123"
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <div style={styles.inputWrap}>
                <Mail size={18} style={styles.icon} />
                <input
                  style={styles.input}
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="nama@email.com"
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Telepon (opsional)</label>
              <div style={styles.inputWrap}>
                <Phone size={18} style={styles.icon} />
                <input
                  style={styles.input}
                  name="telepon"
                  value={form.telepon}
                  onChange={onChange}
                  placeholder="08xxxxxxxxxx"
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrap}>
                <Lock size={18} style={styles.icon} />
                <input
                  style={styles.input}
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={onChange}
                  placeholder="Minimal 6 karakter"
                />
                <button type="button" style={styles.eyeBtn} onClick={() => setShowPass(s => !s)}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Konfirmasi Password</label>
              <div style={styles.inputWrap}>
                <Lock size={18} style={styles.icon} />
                <input
                  style={styles.input}
                  name="confirm"
                  type={showPass ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={onChange}
                  placeholder="Ulangi password"
                />
              </div>
            </div>

            <button disabled={loading} style={styles.btn} type="submit">
              {loading ? 'Memproses...' : 'Daftar'}
            </button>

            <p style={styles.muted}>
              Sudah punya akun? <Link to="/login">Masuk</Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
