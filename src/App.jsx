import { useState, useEffect } from 'react';
import Login from './Login';
import LupaPassword from './LupaPassword';
import ResetPassword from './ResetPassword';
import TambahProduk from './TambahProduk';
import Kasir from './Kasir';
import KelolaStaff from './KelolaStaff';
import KelolaCabang from './KelolaCabang';
import RiwayatTransaksi from './RiwayatTransaksi';
import Laporan from './Laporan';
import Pelanggan from './Pelanggan';
import KelolaSupplier from './KelolaSupplier';
import Restock from './Restock';
import { API_URL } from './api';
import { JENIS_PRODUK_PAKAIAN, TARGET_USIA_PAKAIAN, SEGMEN_PAKAIAN } from './kategoriPakaian';

const MENU = [
  { key: 'produk', label: 'Daftar Produk', icon: '📦', roles: ['owner', 'admin', 'kasir'] },
  { key: 'tambah', label: 'Tambah Produk', icon: '➕', roles: ['owner', 'admin'] },
  { key: 'kasir', label: 'Kasir', icon: '🧾', roles: ['owner', 'admin', 'kasir'] },
  { key: 'riwayat', label: 'Riwayat Transaksi', icon: '🕒', roles: ['owner', 'admin', 'kasir'] },
  { key: 'pelanggan', label: 'Pelanggan', icon: '👤', roles: ['owner', 'admin', 'kasir'] },
  { key: 'laporan', label: 'Laporan', icon: '📊', roles: ['owner', 'admin'] },
  { key: 'supplier', label: 'Supplier', icon: '🚚', roles: ['owner', 'admin'] },
  { key: 'restock', label: 'Restock', icon: '📥', roles: ['owner', 'admin'] },
  { key: 'staff', label: 'Kelola Staff', icon: '🧑‍💼', roles: ['owner'] },
  { key: 'cabang', label: 'Kelola Cabang', icon: '🏬', roles: ['owner'] },
];

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [produkMenipis, setProdukMenipis] = useState([]);
  const [halaman, setHalaman] = useState('produk');
  const [produkDiedit, setProdukDiedit] = useState(null);
  const [tampilanAuth, setTampilanAuth] = useState('login');

  const [filterJenis, setFilterJenis] = useState('');
  const [filterUsia, setFilterUsia] = useState('');
  const [filterSegmen, setFilterSegmen] = useState('');

  const urlParams = new URLSearchParams(window.location.search);
  const resetToken = urlParams.get('token');

  const handleLoginSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setHalaman('produk');
  };

  const muatProduk = () => {
    fetch(`${API_URL}/api/products`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then(setProducts);
  };

  const muatProdukMenipis = () => {
    fetch(`${API_URL}/api/products/stok-menipis/list`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then(setProdukMenipis);
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
      muatProdukMenipis();
    } catch (err) {
      alert('Tidak bisa terhubung ke server');
    }
  };

  useEffect(() => {
    if (token) {
      muatProduk();
      muatProdukMenipis();
    }
  }, [token]);

  if (resetToken) {
    return <ResetPassword token={resetToken} />;
  }

  if (!token) {
    if (tampilanAuth === 'lupa-password') {
      return <LupaPassword onKembali={() => setTampilanAuth('login')} />;
    }
    return <Login onLoginSuccess={handleLoginSuccess} onLupaPassword={() => setTampilanAuth('lupa-password')} />;
  }

  const menuUntukRole = MENU.filter((m) => m.roles.includes(user?.role));
  const isPakaian = user?.jenis_usaha === 'pakaian';

  // Filter produk (khusus kategori pakaian) — dikerjakan di frontend karena datanya sudah dimuat semua
  const productsTampil = products.filter((p) => {
    if (!isPakaian) return true;
    const attrs = p.attributes || {};
    if (filterJenis && attrs.jenis_pakaian !== filterJenis) return false;
    if (filterUsia && attrs.target_usia !== filterUsia) return false;
    if (filterSegmen && attrs.jenis_kelamin !== filterSegmen) return false;
    return true;
  });

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-name">{user?.nama_bisnis}</div>
          <div className="sidebar-brand-sub">{user?.nama_toko ? user.nama_toko : 'Semua Cabang'}</div>
        </div>

        <nav className="sidebar-nav">
          {menuUntukRole.map((m) => (
            <button
              key={m.key}
              className={`sidebar-nav-item ${halaman === m.key ? 'active' : ''}`}
              onClick={() => {
                if (m.key === 'tambah') setProdukDiedit(null);
                setHalaman(m.key);
              }}
            >
              <span className="sidebar-icon">{m.icon}</span>
              {m.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="btn btn-secondary btn-block btn-sm" onClick={handleLogout}>
            Keluar
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div>
            <div className="topbar-title">{MENU.find((m) => m.key === halaman)?.label}</div>
          </div>
          <div className="user-chip">
            <span className={`badge badge-${user?.role}`}>{user?.role}</span>
            <span>{user?.nama}</span>
          </div>
        </header>

        <main className="content">
          {produkMenipis.length > 0 && (
            <div className="alert alert-warning">
              <strong>⚠️ Stok Menipis</strong>
              <ul>
                {produkMenipis.map((p) => (
                  <li key={p.id}>
                    {p.nama} — sisa {p.stok} (batas {p.stok_minimum}){p.nama_toko ? ` · ${p.nama_toko}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {halaman === 'produk' && (
            <div className="card">
              <div className="page-header">
                <div>
                  <h2 className="page-title">Daftar Produk</h2>
                  <p className="page-desc">{productsTampil.length} dari {products.length} produk ditampilkan</p>
                </div>
              </div>

              {isPakaian && (
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <select className="input" style={{ width: 'auto' }} value={filterJenis} onChange={(e) => setFilterJenis(e.target.value)}>
                    <option value="">Semua Jenis Produk</option>
                    {JENIS_PRODUK_PAKAIAN.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <select className="input" style={{ width: 'auto' }} value={filterUsia} onChange={(e) => setFilterUsia(e.target.value)}>
                    <option value="">Semua Usia</option>
                    {TARGET_USIA_PAKAIAN.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <select className="input" style={{ width: 'auto' }} value={filterSegmen} onChange={(e) => setFilterSegmen(e.target.value)}>
                    <option value="">Semua Segmen</option>
                    {SEGMEN_PAKAIAN.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  {(filterJenis || filterUsia || filterSegmen) && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => { setFilterJenis(''); setFilterUsia(''); setFilterSegmen(''); }}
                    >
                      Reset Filter
                    </button>
                  )}
                </div>
              )}

              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Nama</th><th>Harga</th><th>Stok</th><th>Cabang</th><th>Detail</th>
                      {(user?.role === 'owner' || user?.role === 'admin') && <th>Aksi</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {productsTampil.map((p) => (
                      <tr key={p.id}>
                        <td>{p.nama}</td>
                        <td className="num">Rp {Number(p.harga).toLocaleString('id-ID')}</td>
                        <td className="num">{p.stok}</td>
                        <td>{p.nama_toko}</td>
                        <td style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                          {Object.entries(p.attributes || {}).map(([k, v]) => `${k}: ${v}`).join(', ')}
                        </td>
                        {(user?.role === 'owner' || user?.role === 'admin') && (
                          <td>
                            <button className="btn btn-secondary btn-sm" onClick={() => { setProdukDiedit(p); setHalaman('tambah'); }}>Edit</button>{' '}
                            <button className="btn btn-danger btn-sm" onClick={() => hapusProduk(p.id)}>Hapus</button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {productsTampil.length === 0 && <div className="empty-state">Tidak ada produk yang cocok dengan filter ini.</div>}
              </div>
            </div>
          )}

          {halaman === 'tambah' && (
            <TambahProduk
              token={token}
              jenisUsaha={user?.jenis_usaha}
              storeIdUser={user?.store_id}
              onProdukDitambahkan={() => { muatProduk(); muatProdukMenipis(); }}
              produkDiedit={produkDiedit}
              onSelesaiEdit={() => { setProdukDiedit(null); setHalaman('produk'); }}
            />
          )}

          {halaman === 'kasir' && (
            <Kasir token={token} jenisUsaha={user?.jenis_usaha} namaBisnis={user?.nama_bisnis} storeIdUser={user?.store_id} />
          )}

          {halaman === 'riwayat' && <RiwayatTransaksi token={token} />}

          {halaman === 'laporan' && <Laporan token={token} />}

          {halaman === 'supplier' && <KelolaSupplier token={token} />}

          {halaman === 'restock' && <Restock token={token} storeIdUser={user?.store_id} />}

          {halaman === 'staff' && <KelolaStaff token={token} />}

          {halaman === 'cabang' && <KelolaCabang token={token} />}

          {halaman === 'pelanggan' && <Pelanggan token={token} />}
        </main>
      </div>
    </div>
  );
}

export default App;