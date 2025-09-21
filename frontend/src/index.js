import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // File CSS utama Anda (dengan Tailwind)
import App from './App';
import { AuthProvider } from './context/AuthContext'; // Impor provider
import { CartProvider } from './context/CartContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    {/* AuthProvider HARUS membungkus komponen App */}
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);