import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Pages
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Import Admin Components
import AdminPrivateRoute from './components/AdminPrivateRoute';
import AdminLayout from './components/admin/AdminLayout'; // Pastikan file ini ada
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMenu from './pages/admin/AdminMenu';
import AdminPemesanan from './pages/admin/AdminPemesanan';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rute Publik & Pelanggan */}
        <Route path="/" element={<HomePage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* ==================================================================== */}
        {/* INI ADALAH STRUKTUR YANG BENAR UNTUK MEMUNCULKAN SIDEBAR */}
        {/* ==================================================================== */}
        <Route
          path="/admin"
          element={
            <AdminPrivateRoute>
              <AdminLayout />
            </AdminPrivateRoute>
          }
        >
          {/* Rute di bawah ini akan dirender di dalam <Outlet/> pada AdminLayout */}
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="menu" element={<AdminMenu />} />
          <Route path="pemesanan" element={<AdminPemesanan />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;