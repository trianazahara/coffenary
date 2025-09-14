import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // File CSS utama Anda (dengan Tailwind)
import App from './App';
import { AuthProvider } from './context/AuthContext'; // Impor provider

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    {/* AuthProvider HARUS membungkus komponen App */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);