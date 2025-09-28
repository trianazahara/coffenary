import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext"; 

const CheckoutPage = ({ onSuccess }) => {
  const { cartItems, subtotal, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext); 
  const { selectedBranch } = useContext(AuthContext); 

  const [type, setType] = useState("bawa_pulang");
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (type === "makan_di_tempat") {
      axios
        .get(`http://localhost:5000/api/tempat-duduk/${selectedBranch.id_cabang}`)
        .then(res => setTables(res.data))
        .catch(err => console.error(err));
    }
  }, [type, selectedBranch]);

  const handleCheckout = async () => {
    try {
      setLoading(true);

      const payload = {
        id_pengguna: user.id_pengguna, // ✅ bukan hardcode lagi
        id_cabang: selectedBranch.id_cabang,     // dari context login
        tipe_pesanan: type,
        ...(type === "makan_di_tempat" && { id_meja: selectedTable }),
        items: cartItems.map(it => ({
          id_menu: it.id_menu,
          jumlah: it.qty,
          harga: it.harga
        })),
        catatan: note
      };

      const res = await axios.post("http://localhost:5000/api/checkout", payload);
      clearCart();
      alert(`Checkout berhasil! Nomor Pesanan: ${res.data.nomorPesanan}`);
      if (onSuccess) onSuccess(res.data);

    } catch (err) {
      console.error(err);
      alert("Checkout gagal!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: 20 }}>
      <h2>Checkout</h2>

      <div style={{ marginTop: 16 }}>
        <label>Tipe Pesanan:</label><br/>
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="bawa_pulang">Takeaway</option>
          <option value="makan_di_tempat">Dine In</option>
        </select>
      </div>

      {type === "makan_di_tempat" && (
        <div style={{ marginTop: 16 }}>
          <label>Pilih Meja:</label><br/>
          <select
            value={selectedTable}
            onChange={e => setSelectedTable(e.target.value)}
          >
            <option value="">-- Pilih Meja --</option>
            {tables.map(t => (
              <option key={t.id_meja} value={t.id_meja}>
                Meja {t.nomor_meja}
              </option>
            ))}
          </select>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <label>Catatan:</label><br/>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Tambahkan catatan (opsional)"
          rows={3}
        />
      </div>

      <div style={{ marginTop: 16, fontWeight: "bold" }}>
        Total: Rp {subtotal.toLocaleString()}
      </div>

      <button
        onClick={handleCheckout}
        disabled={loading || cartItems.length === 0 || (type === "makan_di_tempat" && !selectedTable)}
        style={{ marginTop: 20, padding: "10px 16px", background: "#059669", color: "#fff", border: "none", borderRadius: 6 }}
      >
        {loading ? "Memproses..." : "Checkout"}
      </button>
    </div>
  );
};

export default CheckoutPage;
