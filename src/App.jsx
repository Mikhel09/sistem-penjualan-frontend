import { useState, useEffect, Fragment } from 'react';
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
import ToastContainer from './ToastContainer';
import { showToast } from './toast';
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
  { key: 'staff', label: 'Kelola Staff', icon: '👔', roles: ['owner'] },
  { key: 'cabang', label: 'Kelola Cabang', icon: '🏬', roles: ['owner'] },
];

function bulatkanAngka(nilai) {
  if (nilai === null || nilai === undefined || nilai === '') return '';
  return String(Math.round(Number(nilai)));
}

function totalStokProduk(p) {
  if (p.variants && p.variants.length > 0) {
    return p.variants.reduce((sum, v) => sum + v.stok, 0);
  }
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

function varianBaruKosong() {
  return { ukuran: '', warna: '', harga: '' };
}

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [produkMenipis, setProdukMenipis] = useState([]);
  const [halaman, setHalaman] = useState('produk');
  const [produkDiedit, setProdukDiedit] = useState(null);
  const [tampilanAuth, setTampilanAuth] = useState('login');
  const [produkDiperluas, setProdukDiperluas] = useState(null);
  const [editVarianValues, setEditVarianValues] = useState({});
  const [savingVariantId, setSavingVariantId] = useState(null);
  const [formVarianBaru, setFormVarianBaru] = useState(varianBaruKosong());
  const [savingVarianBaru, setSavingVarianBaru] = useState(false);
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
    setProdukDiperluas(null);
    setEditVarianValues({});
    setFormVarianBaru(varianBaruKosong());
    setHalaman(key);
  };

  const muatProduk = () => {
  fetch(`${API_URL}/api/products`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
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

  const bukaKelolaVarian = (produk) => {
    if (produkDiperluas === produk.id) {
      setProdukDiperluas(null);
      return;
    }
    setProdukDiperluas(produk.id);
    const initial = {};
    for (const v of produk.variants) {
      initial[v.id] = { harga: bulatkanAngka(v.harga), ukuran: v.ukuran || '', warna: v.warna || '' };
    }
    setEditVarianValues(initial);
    setFormVarianBaru(varianBaruKosong());
  };

  const ubahNilaiVarian = (variantId, field, value) => {
    setEditVarianValues((prev) => ({
      ...prev,
      [variantId]: { ...prev[variantId], [field]: value },
    }));
  };

  // Update langsung dari respons server — tidak menunggu refetch, supaya tidak ada jeda tampilan
  const perbaruiVarianDiState = (produkId, variantBaru) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== produkId) return p;
        const sudahAda = p.variants.some((v) => v.id === variantBaru.id);
        const variantsBaru = sudahAda
          ? p.variants.map((v) => (v.id === variantBaru.id ? variantBaru : v))
          : [...p.variants, variantBaru];
        return { ...p, variants: variantsBaru };
      })
    );
  };

  const simpanVarian = async (produk, variant) => {
    const nilai = editVarianValues[variant.id];
    setSavingVariantId(variant.id);

    try {
      const res = await fetch(`${API_URL}/api/products/${produk.id}/variants/${variant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ukuran: nilai.ukuran,
          warna: nilai.warna,
          stok: variant.stok,
          harga: nilai.harga && nilai.harga.trim() !== '' ? Number(nilai.harga) : null,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Gagal menyimpan', 'error');
        return;
      }

      showToast('Varian berhasil diperbarui!');
      const produkTerbaru = await fetch(`${API_URL}/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      }).then((r) => r.json());
      setProducts(produkTerbaru);
      muatProdukMenipis();
    } catch (err) {
      showToast('Tidak bisa terhubung ke server', 'error');
    } finally {
      setSavingVariantId(null);
    }
  };

  const tambahVarianBaru = async (produk) => {
    if (!formVarianBaru.ukuran && !formVarianBaru.warna) {
      showToast('Isi minimal Ukuran atau Warna', 'error');
      return;
    }
    setSavingVarianBaru(true);
    try {
      const res = await fetch(`${API_URL}/api/products/${produk.id}/variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ukuran: formVarianBaru.ukuran,
          warna: formVarianBaru.warna,
          stok: 0,
          harga: formVarianBaru.harga && formVarianBaru.harga.trim() !== '' ? Number(formVarianBaru.harga) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Gagal menambah varian', 'error');
        return;
      }
      showToast('Varian baru ditambahkan! Isi stoknya lewat menu Restock.');
      const produkTerbaru = await fetch(`${API_URL}/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      }).then((r) => r.json());
      setProducts(produkTerbaru);
      setFormVarianBaru(varianBaruKosong());
      muatProdukMenipis();
    } catch (err) {
      showToast('Tidak bisa terhubung ke server', 'error');
    } finally {
      setSavingVarianBaru(false);
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
                {produkMenipis.map((p, i) => (
                  <li key={`${p.id}-${i}`}>
                    {p.nama} {p.ukuran || p.warna ? `(${[p.ukuran, p.warna].filter(Boolean).join('/')})` : ''} — sisa {p.stok} (batas {p.stok_minimum}){p.nama_toko ? ` · ${p.nama_toko}` : ''}
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
                      <th>Nama</th><th style={{ textAlign: 'center' }}>Harga</th><th>Total Stok</th><th>Cabang</th><th>Detail</th>
                      {(user?.role === 'owner' || user?.role === 'admin') && <th>Aksi</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {productsTampil.map((p) => {
                      const punyaVarian = p.variants && p.variants.length > 0;
                      return (
                        <Fragment key={p.id}>
                          <tr>
                            <td>{p.nama}</td>
                            <td style={{ fontFamily: 'var(--font-mono)', textAlign: 'center' }}>{tampilanHargaProduk(p)}</td>
                            <td className="num">{totalStokProduk(p)}</td>
                            <td>{p.nama_toko}</td>
                            <td style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                              {Object.entries(p.attributes || {}).map(([k, v]) => `${k}: ${v}`).join(', ')}
                            </td>
                            {(user?.role === 'owner' || user?.role === 'admin') && (
                              <td>
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                  {punyaVarian ? (
                                    <button className="btn btn-secondary btn-sm" onClick={() => bukaKelolaVarian(p)}>
                                      {produkDiperluas === p.id ? 'Tutup' : 'Kelola Varian'}
                                    </button>
                                  ) : (
                                    <>
                                      <button className="btn btn-secondary btn-sm" onClick={() => { setProdukDiedit(p); pindahHalaman('tambah'); }}>Edit</button>
                                      <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => setBarcodeDipilih({ kode: p.sku, judul: p.nama, subJudul: `Rp ${Number(p.harga).toLocaleString('id-ID')}` })}
                                      >
                                        🏷️
                                      </button>
                                      <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => setKoreksiDipilih({ produkId: p.id, variantId: null, namaTampil: p.nama, stokSaatIni: p.stok })}
                                      >
                                        ⚙️ Koreksi
                                      </button>
                                    </>
                                  )}
                                  <button className="btn btn-danger btn-sm" onClick={() => hapusProduk(p.id)}>Hapus</button>
                                </div>
                              </td>
                            )}
                          </tr>
                          {produkDiperluas === p.id && punyaVarian && (
                            <tr>
                              <td colSpan={6} style={{ background: 'var(--color-bg)' }}>
                                <div style={{ padding: '0.75rem' }}>
                                  <strong style={{ fontSize: '0.8rem' }}>Varian Produk</strong>
                                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '4px 0 8px 0' }}>
                                    Stok di sini hanya bisa ditambah lewat menu <strong>Restock</strong>, atau diperbaiki lewat tombol <strong>⚙️</strong>.
                                  </p>
                                  <table className="data-table" style={{ marginTop: '0.5rem' }}>
                                    <thead>
                                      <tr><th>Ukuran</th><th>Warna</th><th>Stok</th><th>Harga</th><th style={{ minWidth: '200px' }}></th></tr>
                                    </thead>
                                    <tbody>
                                      {p.variants.map((v) => {
                                        const sedangSimpan = savingVariantId === v.id;
                                        return (
                                          <tr key={v.id}>
                                            <td>
                                              <input
                                                className="input"
                                                style={{ width: '70px' }}
                                                value={editVarianValues[v.id]?.ukuran ?? ''}
                                                onChange={(e) => ubahNilaiVarian(v.id, 'ukuran', e.target.value)}
                                              />
                                            </td>
                                            <td>
                                              <input
                                                className="input"
                                                style={{ width: '90px' }}
                                                value={editVarianValues[v.id]?.warna ?? ''}
                                                onChange={(e) => ubahNilaiVarian(v.id, 'warna', e.target.value)}
                                              />
                                            </td>
                                            <td style={{ fontFamily: 'var(--font-mono)' }}>{v.stok}</td>
                                            <td>
                                              <div className="input-prefix-group" style={{ width: '130px' }}>
                                                <span className="input-prefix">Rp</span>
                                                <input
                                                  className="input"
                                                  type="number"
                                                  placeholder={bulatkanAngka(p.harga)}
                                                  value={editVarianValues[v.id]?.harga ?? ''}
                                                  onChange={(e) => ubahNilaiVarian(v.id, 'harga', e.target.value)}
                                                />
                                              </div>
                                            </td>
                                            <td>
                                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <button
                                                  className="btn btn-secondary btn-sm"
                                                  onClick={() => setBarcodeDipilih({
                                                    kode: v.sku,
                                                    judul: p.nama,
                                                    subJudul: `${[v.ukuran, v.warna].filter(Boolean).join('/')} · Rp ${Number(v.harga ?? p.harga).toLocaleString('id-ID')}`,
                                                  })}
                                                >
                                                  🏷️
                                                </button>
                                                <button
                                                  className="btn btn-secondary btn-sm"
                                                  onClick={() => setKoreksiDipilih({
                                                    produkId: p.id,
                                                    variantId: v.id,
                                                    namaTampil: `${p.nama} (${[v.ukuran, v.warna].filter(Boolean).join('/')})`,
                                                    stokSaatIni: v.stok,
                                                  })}
                                                >
                                                  ⚙️
                                                </button>
                                                <button
                                                  className="btn btn-primary btn-sm"
                                                  disabled={sedangSimpan}
                                                  onClick={() => simpanVarian(p, v)}
                                                >
                                                  {sedangSimpan ? 'Menyimpan...' : 'Simpan'}
                                                </button>
                                              </div>
                                            </td>
                                          </tr>
                                        );
                                      })}

                                      <tr style={{ background: 'var(--color-surface)' }}>
                                        <td>
                                          <input
                                            className="input"
                                            placeholder="Ukuran"
                                            style={{ width: '70px' }}
                                            value={formVarianBaru.ukuran}
                                            onChange={(e) => setFormVarianBaru((prev) => ({ ...prev, ukuran: e.target.value }))}
                                          />
                                        </td>
                                        <td>
                                          <input
                                            className="input"
                                            placeholder="Warna"
                                            style={{ width: '90px' }}
                                            value={formVarianBaru.warna}
                                            onChange={(e) => setFormVarianBaru((prev) => ({ ...prev, warna: e.target.value }))}
                                          />
                                        </td>
                                        <td style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>0 (restock setelahnya)</td>
                                        <td>
                                          <div className="input-prefix-group" style={{ width: '130px' }}>
                                            <span className="input-prefix">Rp</span>
                                            <input
                                              className="input"
                                              type="number"
                                              placeholder={bulatkanAngka(p.harga)}
                                              value={formVarianBaru.harga}
                                              onChange={(e) => setFormVarianBaru((prev) => ({ ...prev, harga: e.target.value }))}
                                            />
                                          </div>
                                        </td>
                                        <td>
                                          <button
                                            className="btn btn-primary btn-sm"
                                            disabled={savingVarianBaru}
                                            onClick={() => tambahVarianBaru(p)}
                                          >
                                            {savingVarianBaru ? 'Menambah...' : '+ Tambah Varian Baru'}
                                          </button>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
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
    </div>
  );
}

export default App;