import React from "react";
import SidebarPelanggan from "../../components/pelanggan/SidebarPelanggan";

const DashboardPelanggan = () => {
  return (
    <div className="flex">
      <SidebarPelanggan />
      <div className="p-6 flex-1">
        <h1 className="text-2xl font-bold">Selamat datang di Dashboard Pelanggan</h1>
        <p>Pilih menu favoritmu dan nikmati pengalaman terbaik!</p>
      </div>
    </div>
  );
};

export default DashboardPelanggan;
