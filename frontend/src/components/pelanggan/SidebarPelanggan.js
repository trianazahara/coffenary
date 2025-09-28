import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Utensils, ShoppingCart, FileText, User, ChevronLeft, ChevronRight } from "lucide-react";

const SidebarPelanggan = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: "/pelanggan/dashboard", icon: Home, label: "Dashboard" },
    { path: "/pelanggan/menu", icon: Utensils, label: "Menu" },
    { path: "/pelanggan/cart", icon: ShoppingCart, label: "Keranjang" },
    { path: "/pelanggan/invoices", icon: FileText, label: "Invoice" },
    { path: "/pelanggan/profile", icon: User, label: "Profil" },
  ];

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <div className={`sidebar bg-gradient-to-b from-gray-900 to-gray-800 text-white h-screen p-4 transition-all duration-300 relative ${isCollapsed ? 'w-20' : 'w-64'}`}>
      
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-green-500 hover:bg-green-600 text-white p-1 rounded-full shadow-lg transition-all duration-300"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Logo */}
      <div className="flex items-center mb-8 pt-4">
        <div className="bg-green-500 p-2 rounded-lg shadow-lg">
          <Utensils size={24} className="text-white" />
        </div>
        {!isCollapsed && (
          <div className="ml-3">
            <h2 className="text-xl font-bold text-white">RestoApp</h2>
            <p className="text-green-300 text-xs">Pelanggan</p>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <ul className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveLink(item.path);
          
          return (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center p-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <div className={`p-2 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-white text-green-500' 
                    : 'bg-gray-700 group-hover:bg-green-500 group-hover:text-white'
                }`}>
                  <Icon size={20} />
                </div>
                {!isCollapsed && (
                  <span className="ml-3 font-medium">{item.label}</span>
                )}
                
                {/* Tooltip untuk collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* User Profile Section */}
      {!isCollapsed && (
        <div className="absolute bottom-6 left-4 right-4 p-4 bg-gray-700/50 rounded-xl backdrop-blur-sm">
          <div className="flex items-center">
            <div className="bg-green-500 p-2 rounded-full">
              <User size={20} className="text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">John Doe</p>
              <p className="text-xs text-green-300">Pelanggan</p>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed User Icon */}
      {isCollapsed && (
        <div className="absolute bottom-6 left-4 right-4 flex justify-center">
          <div className="bg-green-500 p-2 rounded-full relative group">
            <User size={20} className="text-white" />
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
              John Doe
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SidebarPelanggan;