import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminMenu = () => {
    const [menu, setMenu] = useState([]);
    const [namaMenu, setNamaMenu] = useState('');
    const [harga, setHarga] = useState(0);
    // ... state lainnya untuk form

    const fetchMenu = async () => {
        const { data } = await axios.get('http://localhost:5000/api/menu');
        setMenu(data);
    };

    useEffect(() => {
        fetchMenu();
    }, []);

    const handleAddMenu = async (e) => {
        e.preventDefault();
        
        const token = localStorage.getItem('adminToken');
        if (!token) {
            alert("Anda harus login dulu!");
            return;
        }

        try {
            await axios.post('http://localhost:5000/api/menu', 
                { nama_menu: namaMenu, harga: harga, kategori: 'minuman' /* contoh */ },
                { headers: { Authorization: `Bearer ${token}` } } // Kirim token di header!
            );
            alert('Menu berhasil ditambah!');
            fetchMenu(); // Refresh daftar menu
        } catch (error) {
            console.error('Gagal menambah menu:', error);
            alert('Gagal menambah menu!');
        }
    };

    return (
        <div>
            <h2>Manajemen Menu</h2>
            
            {/* Form Tambah Menu */}
            <form onSubmit={handleAddMenu}>
                <input type="text" value={namaMenu} onChange={(e) => setNamaMenu(e.target.value)} placeholder="Nama Menu" />
                <input type="number" value={harga} onChange={(e) => setHarga(e.target.value)} placeholder="Harga" />
                <button type="submit">Tambah Menu</button>
            </form>

            <hr />

            {/* Daftar Menu */}
            <h3>Daftar Menu Saat Ini</h3>
            <table>
                <thead>
                    <tr>
                        <th>Nama</th>
                        <th>Kategori</th>
                        <th>Harga</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {menu.map((item) => (
                        <tr key={item.id_menu}>
                            <td>{item.nama_menu}</td>
                            <td>{item.kategori}</td>
                            <td>Rp {item.harga}</td>
                            <td>
                                <button>Edit</button>
                                <button>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminMenu;