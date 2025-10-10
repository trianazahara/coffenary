import React, { useState, useEffect } from "react";
import EditProfileModal from "../../components/admin/EditProfileModal";
import { Mail, User, Shield, CheckCircle, XCircle } from "lucide-react";

const ProfilePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState(null);
 const token = localStorage.getItem("token"); // atau sesuai key kamu


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/pengguna/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },    
        });
        const data = await res.json();
        setUserData(data);
      } catch (err) {
        console.error("Gagal ambil profil:", err);
      }
    };

    fetchProfile();
  }, [token]);

  const handleSave = async (formData) => {
  const token = localStorage.getItem("authToken") || localStorage.getItem("token");

  if (!token) {
    console.error("Token hilang, tidak bisa update profil!");
    return;
  }

  try {
    const res = await fetch(
      `http://localhost:5000/api/pengguna/${userData.id}/profile`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!res.ok) throw new Error("Gagal update profil");
    const updated = await res.json();
    setUserData(updated);
  } catch (err) {
    console.error(err);
  }
};


  if (!userData) return <p className="p-6 text-center">Memuat profil...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-8">
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border border-green-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-8 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Profil Admin</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2 bg-white text-green-700 font-semibold rounded-lg shadow hover:bg-green-100 transition"
          >
            Edit Profil
          </button>
        </div>

        {/* Body */}
        <div className="p-8 flex flex-col md:flex-row gap-10 items-center md:items-start">
          {/* Foto Profil */}
          <div className="flex flex-col items-center">
            <img
              src={
                userData.foto
                  ? `http://localhost:5000/uploads/${userData.foto}`
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      userData.namaLengkap || "Admin"
                    )}&background=059669&color=fff&size=160`
              }
              alt="Foto Profil"
              className="w-40 h-40 rounded-full border-4 border-green-500 shadow-md object-cover"
            />
            <p className="mt-4 text-lg font-semibold text-gray-800">
              {userData.namaLengkap}
            </p>
            <p className="text-gray-500">{userData.email}</p>
            <span className="mt-2 inline-block px-4 py-1 text-sm rounded-full bg-green-100 text-green-700 font-medium">
              {userData.peran || "Admin"}
            </span>
          </div>

          {/* Detail */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-green-50 border border-green-100 flex items-center gap-3">
              <User className="w-6 h-6 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">Nama Lengkap</p>
                <p className="text-lg font-medium text-gray-800">
                  {userData.namaLengkap}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-green-50 border border-green-100 flex items-center gap-3">
              <Mail className="w-6 h-6 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">E-mail</p>
                <p className="text-lg font-medium text-gray-800">
                  {userData.email}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-green-50 border border-green-100 flex items-center gap-3">
              <Shield className="w-6 h-6 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">Peran</p>
                <p className="text-lg font-medium text-gray-800">
                  {userData.peran || "Admin"}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-green-50 border border-green-100 flex items-center gap-3">
              {userData.status === "aktif" ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600" />
              )}
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p
                  className={`text-lg font-medium ${
                    userData.status === "aktif"
                      ? "text-green-700"
                      : "text-red-600"
                  }`}
                >
                  {userData.status || "Aktif"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Edit */}
      <EditProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={userData}
      />
    </div>
  );
};

export default ProfilePage;
