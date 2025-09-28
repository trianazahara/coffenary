// src/pages/pelanggan/CartPage.js
import React, { useContext } from "react";
import { CartContext } from "../../context/CartContext";
import { Plus, Minus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    updateQty,
    removeFromCart,
    clearCart,
    subtotal,
  } = useContext(CartContext);

  if (cartItems.length === 0) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <h2>🛒 Keranjang Kosong</h2>
        <p>Yuk pilih menu favoritmu terlebih dahulu!</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 20 }}>🛒 Keranjang Belanja</h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: 20,
          background: "#fff",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <thead style={{ background: "#f3f4f6" }}>
          <tr>
            <th style={{ padding: 12, textAlign: "left" }}>Menu</th>
            <th style={{ padding: 12 }}>Qty</th>
            <th style={{ padding: 12 }}>Harga</th>
            <th style={{ padding: 12 }}>Total</th>
            <th style={{ padding: 12 }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map((item) => (
            <tr key={item.id_menu} style={{ borderBottom: "1px solid #e5e7eb" }}>
              <td style={{ padding: 12 }}>{item.nama_menu}</td>
              <td style={{ padding: 12, textAlign: "center" }}>
                <button
                  onClick={() => updateQty(item.id_menu, item.qty - 1)}
                  style={{
                    border: "1px solid #d1d5db",
                    padding: "4px 6px",
                    borderRadius: 6,
                    background: "#fff",
                    cursor: "pointer",
                    marginRight: 6,
                  }}
                >
                  <Minus size={14} />
                </button>
                {item.qty}
                <button
                  onClick={() => updateQty(item.id_menu, item.qty + 1)}
                  style={{
                    border: "1px solid #d1d5db",
                    padding: "4px 6px",
                    borderRadius: 6,
                    background: "#fff",
                    cursor: "pointer",
                    marginLeft: 6,
                  }}
                >
                  <Plus size={14} />
                </button>
              </td>
              <td style={{ padding: 12, textAlign: "right" }}>
                Rp {Number(item.harga).toLocaleString()}
              </td>
              <td style={{ padding: 12, textAlign: "right" }}>
                Rp {(item.harga * item.qty).toLocaleString()}
              </td>
              <td style={{ padding: 12, textAlign: "center" }}>
                <button
                  onClick={() => removeFromCart(item.id_menu)}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: "#dc2626",
                  }}
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 20,
        }}
      >
        <button
          onClick={clearCart}
          style={{
            padding: "10px 16px",
            background: "#ef4444",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Hapus Semua
        </button>

        <div style={{ fontWeight: "bold", fontSize: 18 }}>
          Total: Rp {subtotal.toLocaleString()}
        </div>
      </div>

      <div style={{ textAlign: "right", marginTop: 20 }}>
        <button
          style={{
            padding: "12px 20px",
            background: "#059669",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: "bold",
          }}
          onClick={() => navigate("/checkout")}
        >
          Lanjut ke Pembayaran
        </button>
      </div>
    </div>
  );
};

export default CartPage;
