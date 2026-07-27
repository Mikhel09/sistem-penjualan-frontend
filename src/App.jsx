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
import BarcodeLabel from './BarcodeLabel';
import KoreksiStokModal from './KoreksiStokModal';
import VarianModal from './VarianModal';
import ToastContainer from './ToastContainer';
import { showToast } from './toast';
import { API_URL } from './api';
import { JENIS_PRODUK_PAKAIAN, TARGET_USIA_PAKAIAN, SEGMEN_PAKAIAN } from './kategoriPakaian';
import PhotoGalleryModal from './PhotoGalleryModal';

const [galeriDipilih, setGaleriDipilih] = useState(null); // { fotos, judul }

const MENU = [
  { key: 'produk', label: 'Daftar Produk', icon: '📦', roles: ['owner', 'admin', 'kasir'] },
  { key: 'tambah', label: 'Tambah Produk', icon: '➕', roles: ['owner', 'admin'], perm: 'kelola_produk' },
  { key: 'kasir', label: 'Kasir', icon: '🧾', roles: ['owner', 'admin', 'kasir'] },
  { key: 'riwayat', label: 'Riwayat Transaksi', icon: '🕒', roles: ['owner', 'admin', 'kasir'] },
  { key: 'pelanggan', label: 'Pelanggan', icon: '👤', roles: ['owner', 'admin', 'kasir'] },
  { key: 'laporan', label: 'Laporan', icon: '📊', roles: ['owner', 'admin'], perm: 'lihat_laporan' },
  { key: 'supplier', label: 'Supplier', icon: '🚚', roles: ['owner', 'admin'], perm: 'kelola_stok' },
  { key: 'restock', label: 'Restock', icon: '📥', roles: ['owner', 'admin'], perm: 'kelola_stok' },
  { key: 'staff', label: 'Kelola Staff', icon: '👔', roles: ['owner'] },
  { key: 'cabang', label: 'Kelola Cabang', icon: '🏬', roles: ['owner'] },
];

const ICON_KATEGORI = { pakaian: '👕', makanan_minuman: '🍔', supermarket: '🛒' };

function totalStokProduk(p) {
  if (p.variants && p.variants.length > 0) return p.variants.reduce((sum, v) => sum + v.stok, 0);
  return p.stok;
}

function tampilanHargaProduk(p) {
  if (p.variants && p.variants.length > 0) {
    const hargaList = p.variants.map((v) => Number(v.harga ?? p.harga));
    const min = Math.min(...hargaList);
    const max = Math.max(...hargaList);
    if (min === max) return `Rp ${min.toLocaleString('id-ID')}`;
    return `Rp ${min.toLocaleString('id-ID')} - Rp ${max.toLocaleString('id-ID')}`;
  }
  return `Rp ${Number(p.harga).toLocaleString('id-ID')}`;
}

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [produkMenipis, setProdukMenipis] = useState([]);
  const [halaman, setHalaman] = useState('produk');
  const [produkDiedit, setProdukDiedit] = useState(null);
  const [tampilanAuth, setTampilanAuth] = useState('login');
  const [varianModalProduk, setVarianModalProduk] = useState(null);
  const [barcodeDipilih, setBarcodeDipilih] = useState(null);
  const [koreksiDipilih, setKoreksiDipilih] = useState(null);

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

  const pindahHalaman = (key) => {
    if (key === 'tambah') setProdukDiedit(null);
    setVarianModalProduk(null);
    setHalaman(key);
  };

  const muatProduk = () => {
    fetch(`${API_URL}/api/products`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
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
        showToast(data.error || 'Gagal menghapus produk', 'error');
        return;
      }
      showToast('Produk berhasil dihapus');
      setProducts((prev) => prev.filter((p) => p.id !== id));
      muatProdukMenipis();
    } catch (err) {
      showToast('Tidak bisa terhubung ke server', 'error');
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

  const isPakaian = user?.jenis_usaha === 'pakaian';
  const bolehKelolaProduk = user?.role === 'owner' || (user?.role === 'admin' && user?.permissions?.kelola_produk);
  const bolehKelolaStok = user?.role === 'owner' || (user?.role === 'admin' && user?.permissions?.kelola_stok);

  const menuUntukRole = MENU.filter((m) => {
    if (!m.roles.includes(user?.role)) return false;
    if (user?.role === 'admin' && m.perm) {
      if (m.perm === 'kelola_produk') return bolehKelolaProduk;
      if (m.perm === 'kelola_stok') return bolehKelolaStok;
      return !!user?.permissions?.[m.perm];
    }
    return true;
  });

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
      <ToastContainer />

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
              onClick={() => pindahHalaman(m.key)}
            >
              <span className="sidebar-icon">{m.icon}</span>
              {m.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="btn btn-secondary btn-block btn-sm" onClick={handleLogout}>Keluar</button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbar-title">{MENU.find((m) => m.key === halaman)?.label}</div>
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
                {produkMenipis.map((p, i) => (
                  <li key={`${p.id}-${i}`}>
                    {p.nama} {p.ukuran || p.warna ? `(${[p.ukuran, p.warna].filter(Boolean).join('/')})` : ''} — sisa {p.stok} (batas {p.stok_minimum}){p.nama_toko ? ` · ${p.nama_toko}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {halaman === 'produk' && (
            <div>
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
                    {JENIS_PRODUK_PAKAIAN.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <select className="input" style={{ width: 'auto' }} value={filterUsia} onChange={(e) => setFilterUsia(e.target.value)}>
                    <option value="">Semua Usia</option>
                    {TARGET_USIA_PAKAIAN.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <select className="input" style={{ width: 'auto' }} value={filterSegmen} onChange={(e) => setFilterSegmen(e.target.value)}>
                    <option value="">Semua Segmen</option>
                    {SEGMEN_PAKAIAN.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  {(filterJenis || filterUsia || filterSegmen) && (
                    <button className="btn btn-secondary btn-sm" onClick={() => { setFilterJenis(''); setFilterUsia(''); setFilterSegmen(''); }}>
                      Reset Filter
                    </button>
                  )}
                </div>
              )}

              <div className="product-grid">
                {productsTampil.map((p) => {
                  const punyaVarian = p.variants && p.variants.length > 0;
                  return (
                    <div key={p.id} className="product-card">
                      <div
                      className="product-card-photo"
                      onClick={() => p.fotos && p.fotos.length > 0 && setGaleriDipilih({ fotos: p.fotos, judul: p.nama })}
                    >
                      {p.fotos && p.fotos.length > 0 ? <img src={p.fotos[0]} alt={p.nama} /> : ICON_KATEGORI[user?.jenis_usaha] || '📦'}
                      {p.fotos && p.fotos.length > 1 && <span className="product-card-photo-badge">+{p.fotos.length - 1}</span>}
                    </div>
                      <div className="product-card-body">
                        <div className="product-card-name">{p.nama}</div>
                        <div className="product-card-price">{tampilanHargaProduk(p)}</div>
                        <div className="product-card-stock">Stok: {totalStokProduk(p)} · {p.nama_toko}</div>
                        {Object.keys(p.attributes || {}).length > 0 && (
                          <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
                            {Object.entries(p.attributes).map(([k, v]) => v).filter(Boolean).join(' · ')}
                          </div>
                        )}
                        {(bolehKelolaProduk || bolehKelolaStok) && (
                          <div className="product-card-actions">
                            {punyaVarian ? (
                              bolehKelolaProduk && (
                                <button className="btn btn-secondary btn-sm" onClick={() => setVarianModalProduk(p)}>Kelola Varian</button>
                              )
                            ) : (
                              <>
                                {bolehKelolaProduk && (
                                  <>
                                    <button className="btn btn-secondary btn-sm" onClick={() => { setProdukDiedit(p); pindahHalaman('tambah'); }}>Edit</button>
                                    <button
                                      className="btn btn-secondary btn-sm"
                                      onClick={() => setBarcodeDipilih({ kode: p.sku, judul: p.nama, subJudul: `Rp ${Number(p.harga).toLocaleString('id-ID')}` })}
                                    >
                                      🏷️
                                    </button>
                                  </>
                                )}
                                {bolehKelolaStok && (
                                  <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setKoreksiDipilih({ produkId: p.id, variantId: null, namaTampil: p.nama, stokSaatIni: p.stok })}
                                  >
                                    ⚙️
                                  </button>
                                )}
                              </>
                            )}
                            {bolehKelolaProduk && (
                              <button className="btn btn-danger btn-sm" onClick={() => hapusProduk(p.id)}>Hapus</button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {productsTampil.length === 0 && <div className="empty-state">Tidak ada produk yang cocok.</div>}
            </div>
          )}

          {halaman === 'tambah' && (
            <TambahProduk
              token={token}
              jenisUsaha={user?.jenis_usaha}
              storeIdUser={user?.store_id}
              onProdukDitambahkan={() => { muatProduk(); muatProdukMenipis(); }}
              produkDiedit={produkDiedit}
              onSelesaiEdit={() => { setProdukDiedit(null); pindahHalaman('produk'); }}
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

      {varianModalProduk && (
          <VarianModal
            token={token}
            produk={varianModalProduk}
            onTutup={() => setVarianModalProduk(null)}
            onBerubah={() => { muatProduk(); muatProdukMenipis(); }}
            onBukaBarcode={setBarcodeDipilih}
            onBukaKoreksi={setKoreksiDipilih}
            onLihatGaleri={setGaleriDipilih}
          />
        )}

      {barcodeDipilih && (
        <BarcodeLabel
          kode={barcodeDipilih.kode}
          judul={barcodeDipilih.judul}
          subJudul={barcodeDipilih.subJudul}
          onTutup={() => setBarcodeDipilih(null)}
        />
      )}

      {koreksiDipilih && (
        <KoreksiStokModal
          token={token}
          produkId={koreksiDipilih.produkId}
          variantId={koreksiDipilih.variantId}
          namaTampil={koreksiDipilih.namaTampil}
          stokSaatIni={koreksiDipilih.stokSaatIni}
          onTutup={() => setKoreksiDipilih(null)}
          onSukses={() => { muatProduk(); muatProdukMenipis(); showToast('Koreksi stok berhasil disimpan!'); }}
        />
      )}

      {galeriDipilih && (
        <PhotoGalleryModal
          fotos={galeriDipilih.fotos}
          judul={galeriDipilih.judul}
          onTutup={() => setGaleriDipilih(null)}
        />
      )}
    </div>
  );
}

export default App;