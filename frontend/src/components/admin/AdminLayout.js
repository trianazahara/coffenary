// src/components/admin/AdminLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const AdminLayout = () => {
  const styles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f8fafc'
    },
    mainContent: {
      marginLeft: '280px', // Sesuai width sidebar
      flex: 1,
      padding: '2rem',
      overflowY: 'auto',
      width: 'calc(100% - 280px)'
    }
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <main style={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;