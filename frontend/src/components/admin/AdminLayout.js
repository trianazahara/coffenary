import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../pages/admin/Sidebar';

const AdminLayout = () => {
    const layoutStyle = {
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f8fafc' // Warna latar belakang area konten
    };

    const contentStyle = {
        flexGrow: 1, // Mengambil sisa ruang yang tersedia
        padding: '2rem',
        overflowY: 'auto' // Agar bisa di-scroll jika konten panjang
    };

    return (
        <div style={layoutStyle}>
            <Sidebar />
            <main style={contentStyle}>
                {/* Outlet akan merender komponen anak sesuai dengan route yang aktif.
                  Contoh: Jika URL /admin/dashboard, maka komponen AdminDashboard akan dirender di sini.
                */}
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;