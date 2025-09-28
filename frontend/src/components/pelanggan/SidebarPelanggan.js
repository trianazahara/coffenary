import React from "react";
import { Link } from "react-router-dom";
import { Home, Utensils, ShoppingCart, FileText, User } from "lucide-react";

const SidebarPelanggan = () => {
  return (
    <div className="sidebar bg-gray-800 text-white w-64 h-screen p-4">
      <h2 className="text-xl font-bold mb-6">🍽️ RestoApp</h2>
      <ul className="space-y-4">
        <li><Link to="/pelanggan/dashboard" className="flex items-center"><Home className="mr-2" /> Dashboard</Link></li>
        <li><Link to="/pelanggan/menu" className="flex items-center"><Utensils className="mr-2" /> Menu</Link></li>
        <li><Link to="/pelanggan/cart" className="flex items-center"><ShoppingCart className="mr-2" /> Keranjang</Link></li>
        <li><Link to="/pelanggan/invoices" className="flex items-center"><FileText className="mr-2" /> Invoice</Link></li>
        <li><Link to="/pelanggan/profile" className="flex items-center"><User className="mr-2" /> Profil</Link></li>
      </ul>
    </div>
  );
};

export default SidebarPelanggan;
