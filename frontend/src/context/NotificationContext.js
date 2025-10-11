// src/context/NotificationContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [lastCheckedTime, setLastCheckedTime] = useState(Date.now());
  const [hasNewOrder, setHasNewOrder] = useState(false);
  const { token, user, selectedBranch } = useContext(AuthContext);

  // Polling interval (30 detik)
  const POLLING_INTERVAL = 30000;

  // Function untuk fetch pending orders
  const fetchPendingOrders = async () => {
    if (!token || !selectedBranch || !user) return;
    
    // Hanya untuk admin dan staff
    if (user.peran !== 'admin' && user.peran !== 'staff') return;

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(
        `http://localhost:5000/api/pesanan/${selectedBranch.id_cabang}/pending-count`,
        config
      );
      
      const newCount = response.data.count;
      
      // Cek apakah ada pesanan baru
      if (newCount > pendingOrdersCount && pendingOrdersCount !== 0) {
        setHasNewOrder(true);
        playNotificationSound();
        showBrowserNotification(newCount);
      }
      
      setPendingOrdersCount(newCount);
      setLastCheckedTime(Date.now());
    } catch (error) {
      console.error('Error fetching pending orders:', error);
    }
  };

  // Play notification sound
  const playNotificationSound = () => {
    try {
      // Buat simple beep sound menggunakan Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Sound notification not available');
    }
  };

  // Show browser notification
  const showBrowserNotification = (count) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pesanan Baru! 🔔', {
        body: `Ada ${count} pesanan menunggu konfirmasi`,
        icon: '/logo192.png',
        tag: 'new-order',
      });
    }
  };

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Polling untuk cek pesanan baru
  useEffect(() => {
    if (!token || !selectedBranch || !user) return;
    if (user.peran !== 'admin' && user.peran !== 'staff') return;

    // Fetch pertama kali
    fetchPendingOrders();

    // Set interval polling
    const interval = setInterval(fetchPendingOrders, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [token, selectedBranch, user, pendingOrdersCount]);

  // Reset hasNewOrder setelah admin lihat halaman pemesanan
  const markAsViewed = () => {
    setHasNewOrder(false);
  };

  const value = {
    pendingOrdersCount,
    hasNewOrder,
    markAsViewed,
    refreshPendingCount: fetchPendingOrders,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};