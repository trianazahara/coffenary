// src/context/CartContext.js
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const cartKey = user ? `cart_pelanggan_${user.id_user}` : 'cart_pelanggan_guest';

  const [cartItems, setCartItems] = useState([]);
  const [ready, setReady] = useState(false);
  const prevKeyRef = useRef(cartKey);

  // Load cart setelah auth siap
  useEffect(() => {
    if (authLoading) return;
    try {
      const raw = localStorage.getItem(cartKey);
      setCartItems(raw ? JSON.parse(raw) : []);
    } catch {
      setCartItems([]);
    } finally {
      setReady(true);
    }
  }, [authLoading, cartKey]);

  // Jika key berubah (mis. login/logout), pindah ke cart sesuai key baru
  useEffect(() => {
    if (!ready) return;
    if (prevKeyRef.current !== cartKey) {
      try {
        const raw = localStorage.getItem(cartKey);
        setCartItems(raw ? JSON.parse(raw) : []);
      } catch {
        setCartItems([]);
      }
      prevKeyRef.current = cartKey;
    }
  }, [cartKey, ready]);

  // Persist saat berubah
  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(cartKey, JSON.stringify(cartItems));
  }, [cartItems, cartKey, ready]);

  // API
  const addToCart = (menuItem, qty = 1, notes = '') => {
    setCartItems(prev => {
      const found = prev.find(i => i.id_menu === menuItem.id_menu);
      if (found) {
        return prev.map(i =>
          i.id_menu === menuItem.id_menu ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { ...menuItem, qty, notes }];
    });
  };

  const updateQty = (id_menu, qty) => {
    setCartItems(prev =>
      prev
        .map(i => (i.id_menu === id_menu ? { ...i, qty: Math.max(0, qty) } : i))
        .filter(i => i.qty > 0)
    );
  };

  // Tambahkan function untuk update notes
  const updateItemNotes = (id_menu, notes) => {
    setCartItems(prev =>
      prev.map(i => (i.id_menu === id_menu ? { ...i, notes } : i))
    );
  };

  const removeFromCart = (id_menu) => {
    setCartItems(prev => prev.filter(i => i.id_menu !== id_menu));
  };

  const clearCart = () => setCartItems([]);

  const subtotal = cartItems.reduce((s, it) => s + (Number(it.harga) * Number(it.qty)), 0);
  const getTotalPrice = () => subtotal;

  const value = {
    cartItems, 
    addToCart, 
    updateQty, 
    updateItemNotes, // Export function baru
    removeFromCart, 
    clearCart, 
    subtotal, 
    getTotalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};