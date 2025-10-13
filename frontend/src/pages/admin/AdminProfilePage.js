// src/pages/admin/AdminProfilePage.js
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        `http://localhost:5000/api/pengguna/profile/${adminId}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsModalOpen(false);
      setIsSuccessOpen(true);

      // Tutup popup sukses otomatis setelah 2 detik
      setTimeout(() => setIsSuccessOpen(false), 2000);
    } catch (err) {
      console.error('Gagal memperbarui profil:', err);
      setMessage('Gagal memperbarui profil.');
    }
  };

  return (
    <div style={{ marginTop: 100, textAlign: 'left' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: 20 }}>
        Profil Admin
      </h1>

      <div
        style={{
          background: 'white',
          padding: 20,
          borderRadius: 10,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          maxWidth: 500,
        }}
      >
        <label>Nama Lengkap</label>
        <input
          value={formData.nama_lengkap}
          disabled
          style={{ width: '100%', padding: 8, marginBottom: 12 }}
        />

        <label>Email</label>
        <input
          value={formData.email}
          disabled
          style={{ width: '100%', padding: 8, marginBottom: 12 }}
        />

        <label>Telepon</label>
        <input
          value={formData.telepon}
          disabled
          style={{ width: '100%', padding: 8, marginBottom: 12 }}
        />

        <label>Username</label>
        <input
          value={formData.username}
          disabled
          style={{ width: '100%', padding: 8, marginBottom: 12 }}
        />

        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            background: '#10b981',
            color: 'white',
            padding: '8px 16px',
            borderRadius: 6,
          }}
        >
          Edit Profil
        </button>
      </div>

      {/* Modal Edit */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div
            style={{
              background: 'white',
              padding: 25,
              borderRadius: 10,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              width: 400
            }}
          >
            <h2 style={{ marginBottom: 15, fontSize: '1.3rem', fontWeight: 'bold' }}>Edit Profil</h2>

            <label>Nama Lengkap</label>
            <input
              name="nama_lengkap"
              value={formData.nama_lengkap}
              onChange={handleChange}
              style={{ width: '100%', padding: 8, marginBottom: 10 }}
            />

            <label>Email</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={{ width: '100%', padding: 8, marginBottom: 10 }}
            />

            <label>Telepon</label>
            <input
              name="telepon"
              value={formData.telepon}
              onChange={handleChange}
              style={{ width: '100%', padding: 8, marginBottom: 10 }}
            />

            <label>Username</label>
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              style={{ width: '100%', padding: 8, marginBottom: 15 }}
            />

            <div style={{ textAlign: 'right' }}>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: '#d1d5db',
                  color: '#111827',
                  padding: '8px 14px',
                  borderRadius: 6,
                  marginRight: 8
                }}
              >
                Batal
              </button>

              <button
                onClick={handleSave}
                style={{
                  background: '#059669',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: 6,
                }}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Notifikasi Sukses */}
      {isSuccessOpen && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#ecfdf5',
            border: '1px solid #10b981',
            padding: '20px 30px',
            borderRadius: 10,
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            zIndex: 2000,
            color: '#065f46',
            fontWeight: '500',
            textAlign: 'center'
          }}
        >
          ✅ Profil berhasil diperbarui!
        </div>
      )}
    </div>
  );
};

export default AdminProfilePage;