import { useState, useEffect } from 'react';
import Login from './Login';
import TambahProduk from './TambahProduk';
import Kasir from './Kasir';
import KelolaStaff from './KelolaStaff';
import { API_URL } from './api';

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [halaman, setHalaman] = useState('produk'); // 'produk' | 'tambah' | 'kasir' | 'staff'
  const [produkDiedit, setProdukDiedit] = useState(null);

  const handleLoginSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
  };

  const muatProduk = () => {
    fetch(`${API_URL}/api/products`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setProducts);
  };

  const hapusProduk = async (id) => {
    const konfirmasi = window.confirm('Yakin mau menghapus produk ini?');
    if (!konfirmasi) return;

    try {
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Gagal menghapus produk');
        return;
      }
      muatProduk();
    } catch (err) {
      alert('Tidak bisa terhubung ke server');
    }
  };

  useEffect(() => {
    if (token) muatProduk();
  }, [token]);

  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>{user?.nama_bisnis} — {user?.nama}</h1>

      <nav style={{ marginBottom: '1rem' }}>
        <button onClick={() => setHalaman('produk')}>Daftar Produk</button>{' '}
        {(user?.role === 'owner' || user?.role === 'admin') && (
          <button onClick={() => { setProdukDiedit(null); setHalaman('tambah'); }}>Tambah Produk</button>
        )}{' '}
        <button onClick={() => setHalaman('kasir')}>Kasir</button>{' '}
        {user?.role === 'owner' && (
          <button onClick={() => setHalaman('staff')}>Kelola Staff</button>
        )}
      </nav>

      {halaman === 'produk' && (
        <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Nama</th>
              <th>Harga</th>
              <th>Stok</th>
              <th>Detail</th>
              {(user?.role === 'owner' || user?.role === 'admin') && <th>Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.nama}</td>
                <td>Rp {Number(p.harga).toLocaleString('id-ID')}</td>
                <td>{p.stok}</td>
                <td>{JSON.stringify(p.attributes)}</td>
                {(user?.role === 'owner' || user?.role === 'admin') && (
                  <td>
                    <button onClick={() => { setProdukDiedit(p); setHalaman('tambah'); }}>Edit</button>{' '}
                    <button onClick={() => hapusProduk(p.id)}>Hapus</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {halaman === 'tambah' && (
        <TambahProduk
          token={token}
          jenisUsaha={user?.jenis_usaha}
          onProdukDitambahkan={muatProduk}
          produkDiedit={produkDiedit}
          onSelesaiEdit={() => { setProdukDiedit(null); setHalaman('produk'); }}
        />
      )}

      {halaman === 'kasir' && <Kasir token={token} jenisUsaha={user?.jenis_usaha} />}

      {halaman === 'staff' && <KelolaStaff token={token} />}
    </div>
  );
}

export default App;