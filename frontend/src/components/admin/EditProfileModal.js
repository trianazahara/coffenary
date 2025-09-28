import React, { useState, useEffect } from "react";
import EditProfileModal from "../../components/admin/EditProfileModal";

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
        body: formData, // penting: biarin FormData, jangan di-JSON.stringify
      });

      if (!res.ok) throw new Error("Gagal update profil");

      const updated = await res.json();
      setUserData(updated); // update data di state
    } catch (err) {
      console.error(err);
    }
  };

  if (!userData) {
    return <p className="p-6">Loading profil...</p>;
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Profil Saya</h1>

        {/* Data singkat */}
        <div className="mb-6 space-y-3 text-gray-700">
          <p>
            <span className="font-medium">Nama: </span>
            {userData.namaLengkap}
          </p>
          <p>
            <span className="font-medium">Identitas: </span>
            {userData.identitas}
          </p>
          {userData.foto && (
            <img
              src={`http://localhost:5000/uploads/${userData.foto}`}
              alt="Foto Profil"
              className="w-24 h-24 object-cover rounded-full border"
            />
          )}
        </div>

        {/* Tombol edit */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
        >
          Edit Profil
        </button>
      </div>

      {/* Modal */}
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
