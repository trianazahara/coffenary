import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Membuat Context
export const AuthContext = createContext(null);

// 2. Membuat Provider (Penyedia Data)
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [loading, setLoading] = useState(true); // State untuk loading awal

    // 3. Efek untuk memeriksa localStorage saat aplikasi pertama kali dimuat
    useEffect(() => {
        try {
            const storedToken = localStorage.getItem('adminToken');
            const storedUser = localStorage.getItem('adminUser');
            const storedBranch = localStorage.getItem('selectedBranch');
            
            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
            if (storedBranch) {
                setSelectedBranch(JSON.parse(storedBranch));
            }
        } catch (error) {
            console.error("Gagal memuat data dari localStorage", error);
        } finally {
            setLoading(false); // Selesai loading
        }
    }, []);

    // 4. Fungsi untuk diekspos ke komponen lain
    const login = (userData, userToken) => {
        localStorage.setItem('adminUser', JSON.stringify(userData));
        localStorage.setItem('adminToken', userToken);
        setUser(userData);
        setToken(userToken);
    };

    const logout = () => {
        localStorage.removeItem('adminUser');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('selectedBranch');
        setUser(null);
        setToken(null);
        setSelectedBranch(null);
        window.location.href = '/';
    };

    const selectBranch = (branchData) => {
        localStorage.setItem('selectedBranch', JSON.stringify(branchData));
        setSelectedBranch(branchData);
    };

    // 5. Menyediakan data dan fungsi ke seluruh aplikasi
    const value = { user, token, selectedBranch, loading, login, logout, selectBranch };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};