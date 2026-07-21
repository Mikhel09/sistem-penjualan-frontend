import { useState, useEffect } from 'react';
import { API_URL } from './api';
import { JENIS_PRODUK_PAKAIAN, TARGET_USIA_PAKAIAN } from './kategoriPakaian';

function Kasir({ token, jenisUsaha, namaBisnis, storeIdUser }) {
  const [cabangList, setCabangList] = useState([]);
  const [storeIdDipilih, setStoreIdDipilih] = useState('');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState('');
  const [noMeja, setNoMeja] = useState('');
  const [catatan, setCatatan] = useState('');
  const [kodeBarcode, setKodeBarcode] = useState('');
  const [strukData, setStrukData] = useState(null);
  const [metodeBayar, setMetodeBayar] = useState('tunai');
  const [teleponCari, setTeleponCari] = useState('');
  const [pelangganDipilih, setPelangganDipilih] = useState(null);
  const [pesanPelanggan, setPesanPelanggan] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [filterUsia, setFilterUsia] = useState('');

  const butuhPilihCabang = !storeIdUser;
  const storeIdAktif = storeIdUser || storeIdDipilih;

  useEffect(() => {
    if (butuhPilihCabang) {
      fetch(`${API_URL}/api/stores`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.json())
        .then(setCabangList);
    }
  }, []);

  useEffect(() => {
    if (!storeIdAktif) return;
    const url = storeIdUser ? `${API_URL}/api/products` : `${API_URL}/api/products?store_id=${storeIdAktif}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then(setProducts);
  }, [storeIdAktif]);

  const productsTampil = products.filter((p) => {
    if (jenisUsaha !== 'pakaian') return true;
    const attrs = p.attributes || {};
    if (filterJenis && attrs.jenis_pakaian !== filterJenis) return false;
    if (filterUsia && attrs.target_usia !== filterUsia) return false;
    return true;
  });

  // Kunci unik tiap baris keranjang: produk tanpa varian pakai product_id saja,
  // produk dengan varian pakai kombinasi product_id + variant_id (karena 1 produk bisa ada banyak varian di keranjang)
  const kunciCart = (productId, variantId) => `${productId}-${variantId || 'x'}`;

  const tambahKeKeranjang = (produk, varian) => {
    const stokTersedia = varian ? varian.stok : produk.stok;
    const key = kunciCart(produk.id, varian?.id);

    setCart((prev) => {
      const sudahAda = prev.find((item) => kunciCart(item.product_id, item.variant_id) === key);
      const qtyDiKeranjang = sudahAda ? sudahAda.qty : 0;

      if (qtyDiKeranjang + 1 > stokTersedia) {
        setMessage('Stok tidak cukup');
        return prev;
      }
      setMessage('');

      if (sudahAda) {
        return prev.map((item) =>
          kunciCart(item.product_id, item.variant_id) === key ? { ...item, qty: item.qty + 1 } : item
        );
      }

      const namaTampil = varian
        ? `${produk.nama} (${[varian.ukuran, varian.warna].filter(Boolean).join('/')})`
        : produk.nama;
      const hargaDipakai = varian ? Number(varian.harga ?? produk.harga) : Number(produk.harga);

      return [
        ...prev,
        {
          product_id: produk.id,
          variant_id: varian ? varian.id : null,
          nama: namaTampil,
          harga: hargaDipakai,
          qty: 1,
        },
      ];
    });
  };

  const cariByBarcode = (e) => {
    e.preventDefault();
    const produk = products.find((p) => p.attributes?.barcode === kodeBarcode);
    if (produk) {
      tambahKeKeranjang(produk, null);
      setMessage('');
    } else {
      setMessage('Barcode tidak ditemukan');
    }
    setKodeBarcode('');
  };

  const cariPelanggan = async (e) => {
    e.preventDefault();
    setPesanPelanggan('');
    try {
      const res = await fetch(`${API_URL}/api/customers/cari?telepon=${teleponCari}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setPesanPelanggan(data.error);
        setPelangganDipilih(null);
        return;
      }
      setPelangganDipilih(data);
    } catch (err) {
      setPesanPelanggan('Tidak bisa terhubung ke server');
    }
  };

  const totalKeranjang = cart.reduce((sum, item) => sum + item.harga * item.qty, 0);

  const bayar = async () => {
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/api/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          items: cart.map((item) => ({
            product_id: item.product_id,
            variant_id: item.variant_id || undefined,
            qty: item.qty,
          })),
          no_meja: jenisUsaha === 'makanan_minuman' ? noMeja : undefined,
          catatan: jenisUsaha === 'makanan_minuman' ? catatan : undefined,
          store_id: Number(storeIdAktif),
          payment_method: metodeBayar,
          customer_id: pelangganDipilih?.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || 'Transaksi gagal');
        return;
      }

      const detailRes = await fetch(`${API_URL}/api/transactions/${data.transaction_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const detailData = await detailRes.json();

      setStrukData(detailData);
      setCart([]);
      setNoMeja('');
      setCatatan('');
      setPelangganDipilih(null);
      setTeleponCari('');

      // Refresh daftar produk supaya stok varian yang baru terjual ikut ter-update
      const url = storeIdUser ? `${API_URL}/api/products` : `${API_URL}/api/products?store_id=${storeIdAktif}`;
      fetch(url, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then(setProducts);
    } catch (err) {
      setMessage('Tidak bisa terhubung ke server');
    }
  };

  const transaksiBaru = () => {
    setStrukData(null);
    setMessage('');
  };

  if (butuhPilihCabang && !storeIdDipilih) {
    return (
      <div className="card" style={{ maxWidth: '360px' }}>
        <h2 className="card-title">Pilih Cabang</h2>
        <select className="input" value={storeIdDipilih} onChange={(e) => setStoreIdDipilih(e.target.value)}>
          <option value="">-- Pilih Cabang --</option>
          {cabangList.map((c) => (
            <option key={c.id} value={c.id}>{c.nama_toko}</option>
          ))}
        </select>
      </div>
    );
  }

  if (strukData) {
    return (
      <div>
        <div className="area-cetak receipt">
          <h3 className="receipt-center" style={{ margin: '0 0 4px 0' }}>{namaBisnis}</h3>
          <p className="receipt-center" style={{ margin: '0 0 8px 0', fontSize: '0.75rem' }}>
            {new Date(strukData.transaksi.created_at).toLocaleString('id-ID')}
          </p>
          <hr />
          {strukData.items.map((item) => (
            <div key={item.id} className="receipt-line">
              <span>
                {item.nama_produk}
                {(item.ukuran || item.warna) && ` (${[item.ukuran, item.warna].filter(Boolean).join('/')})`} x{item.qty}
              </span>
              <span>Rp {(item.qty * item.harga_saat_jual).toLocaleString('id-ID')}</span>
            </div>
          ))}
          <hr />
          <div className="receipt-total">
            <span>TOTAL</span>
            <span>Rp {Number(strukData.transaksi.total).toLocaleString('id-ID')}</span>
          </div>
          <p style={{ fontSize: '0.75rem' }}>Metode Bayar: {strukData.transaksi.payment_method?.toUpperCase()}</p>
          {strukData.transaksi.no_meja && <p style={{ fontSize: '0.75rem' }}>No. Meja: {strukData.transaksi.no_meja}</p>}
          {strukData.transaksi.catatan && <p style={{ fontSize: '0.75rem' }}>Catatan: {strukData.transaksi.catatan}</p>}
          <p className="receipt-center" style={{ marginTop: '1rem', fontSize: '0.8rem' }}>Terima kasih!</p>
        </div>

        <div className="no-print" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-primary" onClick={() => window.print()}>Cetak Struk</button>
          <button className="btn btn-secondary" onClick={transaksiBaru}>Transaksi Baru</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pos-layout">
      <div className="pos-catalog card">
        <h2 className="card-title">Pilih Produk</h2>

        {jenisUsaha === 'supermarket' && (
          <form onSubmit={cariByBarcode} style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
            <input
              className="input"
              placeholder="Scan/ketik barcode lalu Enter"
              value={kodeBarcode}
              onChange={(e) => setKodeBarcode(e.target.value)}
              autoFocus
            />
            <button className="btn btn-secondary" type="submit">Cari</button>
          </form>
        )}

        {jenisUsaha === 'pakaian' && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <select className="input" style={{ width: 'auto' }} value={filterJenis} onChange={(e) => setFilterJenis(e.target.value)}>
              <option value="">Semua Jenis</option>
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
          </div>
        )}

        {productsTampil.map((p) => {
          const punyaVarian = p.variants && p.variants.length > 0;

          if (!punyaVarian) {
            return (
              <button key={p.id} className="product-btn" onClick={() => tambahKeKeranjang(p, null)} disabled={p.stok <= 0}>
                <span>{p.nama} <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>(stok: {p.stok})</span></span>
                <span className="price">Rp {Number(p.harga).toLocaleString('id-ID')}</span>
              </button>
            );
          }

          return (
            <div key={p.id} style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>{p.nama}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {p.variants.map((v) => {
                  const habis = v.stok <= 0;
                  const hargaVarian = Number(v.harga ?? p.harga);
                  const label = [v.ukuran, v.warna].filter(Boolean).join(' / ') || 'Default';
                  return (
                    <button
                      key={v.id}
                      className="btn btn-secondary btn-sm"
                      style={{ opacity: habis ? 0.4 : 1 }}
                      disabled={habis}
                      onClick={() => tambahKeKeranjang(p, v)}
                      title={habis ? 'Stok habis' : ''}
                    >
                      {label} · stok {v.stok} · Rp {hargaVarian.toLocaleString('id-ID')}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        {productsTampil.length === 0 && <div className="empty-state">Belum ada produk di cabang ini.</div>}
      </div>

      <div className="pos-cart card">
        <h2 className="card-title">Keranjang</h2>

        <div className="form-group">
          <form onSubmit={cariPelanggan} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              className="input"
              placeholder="Cari pelanggan (no. telepon)"
              value={teleponCari}
              onChange={(e) => setTeleponCari(e.target.value)}
            />
            <button className="btn btn-secondary btn-sm" type="submit">Cari</button>
          </form>
          {pelangganDipilih && (
            <p style={{ fontSize: '0.8rem', marginTop: '6px' }}>
              👤 {pelangganDipilih.nama} · Poin: {pelangganDipilih.poin}
            </p>
          )}
          {pesanPelanggan && <p style={{ fontSize: '0.8rem', color: 'var(--color-danger)' }}>{pesanPelanggan}</p>}
        </div>

        {jenisUsaha === 'makanan_minuman' && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">No. Meja</label>
              <input className="input" value={noMeja} onChange={(e) => setNoMeja(e.target.value)} />
            </div>
            <div className="form-group" style={{ flex: 2 }}>
              <label className="form-label">Catatan</label>
              <input className="input" value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="tidak pedas, take away" />
            </div>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Metode Bayar</label>
          <select className="input" value={metodeBayar} onChange={(e) => setMetodeBayar(e.target.value)}>
            <option value="tunai">Tunai</option>
            <option value="kartu">Kartu</option>
            <option value="qris">QRIS</option>
          </select>
        </div>

        {cart.length === 0 ? (
          <div className="empty-state">Keranjang kosong</div>
        ) : (
          <>
            {cart.map((item) => (
              <div key={kunciCart(item.product_id, item.variant_id)} className="cart-line">
                <span>{item.nama} x{item.qty}</span>
                <span>Rp {(item.harga * item.qty).toLocaleString('id-ID')}</span>
              </div>
            ))}
            <div className="cart-total-row">
              <span>Total</span>
              <span>Rp {totalKeranjang.toLocaleString('id-ID')}</span>
            </div>
            <button className="btn btn-primary btn-block" style={{ marginTop: '1rem' }} onClick={bayar}>
              Bayar
            </button>
          </>
        )}
        {message && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{message}</div>}
      </div>
    </div>
  );
}

export default Kasir;