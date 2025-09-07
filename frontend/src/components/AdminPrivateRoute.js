import React from 'react';
import { Navigate } from 'react-router-dom';

// 1. Terima 'children' sebagai properti
const AdminPrivateRoute = ({ children }) => { 
    const token = localStorage.getItem('adminToken');

    // Jika tidak ada token, alihkan ke halaman login
    if (!token) {
        return <Navigate to="/admin/login" replace />;
    }

    // 2. Jika ada token, tampilkan "anak"-nya (yaitu komponen AdminLayout)
    return children; 
};

export default AdminPrivateRoute;