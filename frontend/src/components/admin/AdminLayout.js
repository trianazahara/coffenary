// src/components/admin/AdminLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AdminHeader from './AdminHeader';

const AdminLayout = () => {
    const styles = {
        layout: { display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' },
        mainWrapper: { flexGrow: 1, display: 'flex', flexDirection: 'column' },
        mainContent: { flexGrow: 1, padding: '2rem', overflowY: 'auto', marginTop: '70px' } // tambahkan marginTop agar tidak tertutup header
    };

    return (
        <div style={styles.layout}>
            <Sidebar />
            <div style={styles.mainWrapper}>
                <AdminHeader />
                <main style={styles.mainContent}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
