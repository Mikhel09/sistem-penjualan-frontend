import { useState, useEffect } from 'react';
import Login from './Login';
import TambahProduk from './TambahProduk';
import Kasir from './Kasir';
import { API_URL } from './api';

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [halaman, setHalaman] = useState('produk'); // 'produk' | 'tambah' | 'kasir'

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
        <button onClick={() => setHalaman('tambah')}>Tambah Produk</button>{' '}
        <button onClick={() => setHalaman('kasir')}>Kasir</button>
      </nav>

      {halaman === 'produk' && (
        <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr><th>Nama</th><th>Harga</th><th>Stok</th><th>Detail</th></tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.nama}</td>
                <td>Rp {Number(p.harga).toLocaleString('id-ID')}</td>
                <td>{p.stok}</td>
                <td>{JSON.stringify(p.attributes)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {halaman === 'tambah' && (
        <TambahProduk token={token} jenisUsaha={user?.jenis_usaha} onProdukDitambahkan={muatProduk} />
      )}

      {halaman === 'kasir' && <Kasir token={token} jenisUsaha={user?.jenis_usaha} />}
    </div>
  );
}

export default App;