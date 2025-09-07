import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminPrivateRoute = () => {
    const token = localStorage.getItem('adminToken');
    // Di aplikasi nyata, Anda harus memverifikasi token ini ke backend
    return token ? <Outlet /> : <Navigate to="/admin/login" />;
};

export default AdminPrivateRoute;