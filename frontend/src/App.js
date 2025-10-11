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
import UserLoginPage from './pages/UserLoginPage';
import DashboardPelanggan from "./pages/pelanggan/DashboardPelanggan";
import MenuListPage from "./pages/pelanggan/MenuListPage";
import CartPage from "./pages/pelanggan/CartPage";
import InvoicePage from "./pages/pelanggan/InvoicePage";
import PaymentPage from "./pages/pelanggan/PaymentPage";
import TableSelectionPage from "./pages/pelanggan/TableSelectionPage";
import ReceiptPage from "./pages/pelanggan/ReceiptPage";
import ProfilePage from "./pages/pelanggan/ProfilePage";
import OrderHistoryPage from "./pages/pelanggan/OrderHistoryPage";
import CheckoutPage from "./pages/pelanggan/CheckoutPage";
import OrderDetailPage from "./pages/pelanggan/OrderDetailPage";
import ForgotPasswordPage from './pages/admin/ForgotPasswordPage'; 
import RegisterPage from './pages/RegisterPage';


function App() {
  return (
    <Router>
      <Routes>
        {/* Halaman Login Admin (Publik) */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/" element={<UserLoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin/forgot-password" element={<ForgotPasswordPage />} /> {/* Route untuk lupa password admin */}

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

        {/* Tambahkan rute untuk pelanggan di sini */}
        <Route path="/pelanggan/dashboard" element={<DashboardPelanggan />} />
        <Route path="/pelanggan/menu" element={<MenuListPage />} />
        <Route path="/pelanggan/cart" element={<CartPage />} />
        <Route path="/pelanggan/invoices" element={<InvoicePage />} />
        <Route path="/pelanggan/payment" element={<PaymentPage />} />
        <Route path="/pelanggan/table" element={<TableSelectionPage />} />
        <Route path="/pelanggan/receipt" element={<ReceiptPage />} />
        <Route path="/pelanggan/profile" element={<ProfilePage />} />
        <Route path="/pelanggan/history" element={<OrderHistoryPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/pelanggan/payment/:id_pesanan" element={<PaymentPage />} />
        <Route path="/pelanggan/status-pesanan/:id_pesanan" element={<OrderDetailPage />} />




        {/* <Route path="/" element={<HomePage />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
