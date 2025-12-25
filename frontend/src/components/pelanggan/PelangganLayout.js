// src/components/pelanggan/PelangganLayout.js
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import TopbarPelanggan from './TopbarPelanggan';
import SidebarPelanggan from './SidebarPelanggan';

const PelangganLayout = () => {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <TopbarPelanggan onToggleSidebar={() => setOpen(o=>!o)} />
      <SidebarPelanggan open={open} />
      <main
        style={{
          paddingTop:64,
          paddingLeft: open ? 250 : 0,
          transition:'padding-left .2s ease',
          minHeight:'100vh',
          background:'#f8fafc'
        }}
      >
        {/* beri padding konten */}
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'24px 16px' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default PelangganLayout;
