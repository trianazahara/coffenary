// src/context/CartContext.js
import React, { createContext, useEffect, useState } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const raw = localStorage.getItem('cart_pelanggan');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // simpan ke localStorage setiap kali berubah
  useEffect(() => {
    localStorage.setItem('cart_pelanggan', JSON.stringify(cartItems));
  }, [cartItems]);

  // ➕ tambah item
  const addToCart = (menuItem, qty = 1) => {
    setCartItems(prev => {
      const found = prev.find(i => i.id_menu === menuItem.id_menu);
      if (found) {
        return prev.map(i =>
          i.id_menu === menuItem.id_menu
            ? { ...i, qty: i.qty + qty }
            : i
        );
      }
      return [...prev, { ...menuItem, qty }];
    });
  };

  // 🔄 update jumlah
  const updateQty = (id_menu, qty) => {
    setCartItems(prev =>
      prev
        .map(i =>
          i.id_menu === id_menu ? { ...i, qty: Math.max(0, qty) } : i
        )
        .filter(i => i.qty > 0)
    );
  };

  // ❌ hapus item
  const removeFromCart = (id_menu) => {
    setCartItems(prev => prev.filter(i => i.id_menu !== id_menu));
  };

  // 🧹 clear
  const clearCart = () => {
    setCartItems([]);
  };

  // 💰 hitung subtotal
  const subtotal = cartItems.reduce((s, it) => s + (it.harga * it.qty), 0);

  // opsional: fungsi agar konsisten dengan getTotalPrice()
  const getTotalPrice = () => subtotal;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        subtotal,
        getTotalPrice, // tambahkan ini juga
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
