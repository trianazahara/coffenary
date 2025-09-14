import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const AdminLayout = () => {
    const styles = {
        layout: { display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' },
        mainContent: { flexGrow: 1, padding: '2rem', overflowY: 'auto' }
    };

    return (
        <div style={styles.layout}>
            <Sidebar />
            <main style={styles.mainContent}>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;