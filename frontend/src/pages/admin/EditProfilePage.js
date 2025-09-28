import React, { useState, useEffect } from "react";
import EditProfileModal from "../../components/admin/EditProfileModal";
// ganti nama file di sini

const ProfilePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState(null);

  // Ambil token dari localStorage
  const token = localStorage.getItem("token");

  // Fetch data profil user
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/user/profile", {
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
    try {
      const res = await fetch("http://localhost:5000/api/user/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData, // biarin FormData langsung, jangan stringify
      });

      if (!res.ok) throw new Error("Gagal update profil");

      const updated = await res.json();
      setUserData(updated); // update state
    } catch (err) {
      console.error(err);
    }
  };

  if (!userData) {
    return <p className="p-6">Loading profil...</p>;
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Profil Admin</h1>

        {/* Bagian Atas: Foto + Info Singkat */}
        <div className="flex items-center gap-6 border-b pb-6 mb-6">
          <img
            src={
              userData.foto
                ? `http://localhost:5000/uploads/${userData.foto}`
                : "https://ui-avatars.com/api/?name=Admin+Kopi&background=10b981&color=fff&size=128"
            }
            alt="Foto Profil"
            className="w-28 h-28 rounded-full border-4 border-green-500 shadow-md object-cover"
          />
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {userData.namaLengkap}
            </h2>
            <p className="text-gray-500">{userData.email}</p>
            <span className="inline-block mt-2 px-3 py-1 text-sm rounded-full bg-green-100 text-green-700 font-medium">
              {userData.peran || "Admin"}
            </span>
          </div>
        </div>

        {/* Detail Identitas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="p-4 border rounded-lg bg-gray-50">
            <p className="text-sm text-gray-500">Nama Lengkap</p>
            <p className="text-lg font-medium text-gray-800">
              {userData.namaLengkap}
            </p>
          </div>
          <div className="p-4 border rounded-lg bg-gray-50">
            <p className="text-sm text-gray-500">E-mail</p>
            <p className="text-lg font-medium text-gray-800">{userData.email}</p>
          </div>
          <div className="p-4 border rounded-lg bg-gray-50">
            <p className="text-sm text-gray-500">Peran</p>
            <p className="text-lg font-medium text-gray-800">
              {userData.peran || "Admin"}
            </p>
          </div>
          <div className="p-4 border rounded-lg bg-gray-50">
            <p className="text-sm text-gray-500">Status</p>
            <p
              className={`text-lg font-medium ${
                userData.status === "aktif"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {userData.status || "Aktif"}
            </p>
          </div>
        </div>

        {/* Tombol Edit */}
        <div className="flex justify-end">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg shadow hover:bg-green-700 transition"
          >
            Edit Profil
          </button>
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
