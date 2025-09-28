import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext"; 
import { useNavigate } from "react-router-dom"; // ✅ tambahin ini

const Header = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate(); // ✅ buat navigasi

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 2rem",
        background: "linear-gradient(90deg, #064e3b, #10b981)",
        color: "#fff",
        borderBottom: "2px solid #059669",
        position: "relative",
        zIndex: 50,
      }}
    >
      {/* Background kopi samar */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "url('https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1600&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.15,
          zIndex: -1,
        }}
      />

      {/* Judul */}
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: "bold",
          letterSpacing: "1px",
        }}
      >
        ☕ Kedai Kopi
      </h1>

      {/* Profil User */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <span style={{ fontWeight: 500 }}>
          {user ? user.nama_lengkap : "Guest"}
        </span>

        {/* Avatar bisa diklik */}
        <button
          onClick={() => navigate("/edit-profile")}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <img
            src={`https://ui-avatars.com/api/?name=${
              user ? user.nama_lengkap : "Guest"
            }&background=059669&color=fff&size=128`}
            alt="Profile"
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              border: "2px solid #fff",
              objectFit: "cover",
            }}
          />
        </button>
      </div>
    </header>
  );
};

export default Header;
