import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Pages
// import HomePage from './pages/HomePage'; (dan halaman pelanggan lainnya)
import AdminPrivateRoute from './components/AdminPrivateRoute';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminLayout from './components/admin/AdminLayout';
import PilihCabangPage from './pages/admin/PilihCabangPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMenu from './pages/admin/AdminMenu';
import AdminPemesanan from './pages/admin/AdminPemesanan';
import AdminPengguna from './pages/admin/AdminPengguna'; 
import AdminLog from './pages/admin/AdminLog'; 
import AdminLogAktivitas from "./pages/admin/AdminLogAktivitas";
import EditProfilePage from "./pages/admin/EditProfilePage";



function App() {
  return (
    <Router>
      <Routes>
        {/* Halaman Login Admin (Publik) */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Halaman Pilih Cabang (Dilindungi) */}
        <Route path="/pilih-cabang" element={<AdminPrivateRoute><PilihCabangPage /></AdminPrivateRoute>} />

        {/* Halaman Utama Admin dengan Layout (Dilindungi) */}
        <Route path="/admin" element={<AdminPrivateRoute><AdminLayout /></AdminPrivateRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="menu" element={<AdminMenu />} />
          <Route path="pemesanan" element={<AdminPemesanan />} />
          <Route path="pengguna" element={<AdminPengguna />} /> 
          <Route path="log" element={<AdminLog />} />       
          <Route path="log-aktivitas" element={<AdminLogAktivitas />} /> {/* ✅ Tambahan */}
        </Route>
        <Route path="/edit-profile" element={<EditProfilePage />} />
        </Routes>
        </Router>


  );
}


export default App;
