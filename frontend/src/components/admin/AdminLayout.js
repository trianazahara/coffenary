import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const AdminLayout = () => {
  const styles = {
    layout: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
    },
    mainContent: {
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    },
    outletContainer: {
      flexGrow: 1,
      padding: '2rem',
      overflowY: 'auto',
      position: 'relative',
      zIndex: 10, // ✅ biar selalu di atas background
    },
  };

  return (
    <div style={styles.layout}>
      <Sidebar />
      <div style={styles.mainContent}>
        <Header />
        <main style={styles.outletContainer}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
