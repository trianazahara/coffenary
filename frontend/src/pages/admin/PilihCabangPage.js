import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { MapPin, ArrowRight } from "lucide-react";
import "../../index"; // pakai file css terpisah

const PilihCabangPage = () => {
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token, selectBranch, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBranches = async () => {
      if (!token) return;
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(
          "http://localhost:5000/api/cabang",
          config
        );
        setBranches(response.data);
      } catch (error) {
        console.error("Gagal mengambil data cabang:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBranches();
  }, [token]);

  const handleSelectBranch = (branch) => {
    selectBranch(branch);

    if (user?.peran === "admin") {
      navigate("/admin/dashboard");
    } else if (user?.peran === "staff") {
      navigate("/admin/dashboard");
    } else if (user?.peran === "pelanggan") {
      navigate("/pelanggan/dashboard");
    } else {
      navigate("/"); // fallback kalau role tidak dikenal
    }
  };

  return (
    <div className="cabang-container">
      <div className="cabang-card">
        <h1 className="cabang-title">✨ Pilih Cabang ✨</h1>
        <p className="cabang-subtitle">
          Selamat datang, <span>{user?.nama_lengkap}</span> 👋  
          Pilih cabang yang ingin Anda kelola.
        </p>

        <div className="cabang-list">
          {isLoading ? (
            <p className="loading">Memuat data cabang...</p>
          ) : (
            branches.map((branch) => (
              <button
                key={branch.id_cabang}
                onClick={() => handleSelectBranch(branch)}
                className="branch-item"
              >
                <div className="branch-info">
                  <MapPin className="branch-icon" />
                  <div>
                    <h3>{branch.nama_cabang}</h3>
                    <p>{branch.alamat}</p>
                  </div>
                </div>
                <ArrowRight className="arrow-icon" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PilihCabangPage;     