import { useState, useEffect } from 'react';
import { API_URL } from './api';

function Restock({ token, storeIdUser }) {
  const [products, setProducts] = useState([]);
  const [supplierList, setSupplierList] = useState([]);
  const [riwayat, setRiwayat] = useState([]);
  const [productId, setProductId] = useState('');
  const [variantId, setVariantId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [qty, setQty] = useState('');
  const [hargaBeli, setHargaBeli] = useState('');
  const [message, setMessage] = useState('');

  const muatData = () => {
    fetch(`${API_URL}/api/products`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then(setProducts);
    fetch(`${API_URL}/api/suppliers`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then(setSupplierList);
    fetch(`${API_URL}/api/purchases`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then(setRiwayat);
  };

  useEffect(() => {
    muatData();
  }, []);

  const produkDipilih = products.find((p) => p.id === Number(productId));
  const punyaVarian = produkDipilih?.variants && produkDipilih.variants.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (punyaVarian && !variantId) {
      setMessage('Pilih varian (ukuran/warna) yang mau di-restock');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/purchases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          product_id: Number(productId),
          variant_id: punyaVarian ? Number(variantId) : undefined,
          supplier_id: supplierId ? Number(supplierId) : null,
          qty: Number(qty),
          harga_beli: Number(hargaBeli),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || 'Gagal mencatat restock');
        return;
      }
      setMessage('Restock berhasil dicatat, stok otomatis bertambah!');
      setProductId('');
      setVariantId('');
      setSupplierId('');
      setQty('');
      setHargaBeli('');
      muatData();
    } catch (err) {
      setMessage('Tidak bisa terhubung ke server');
    }
  };

  const formatTanggal = (isoString) =>
    new Date(isoString).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div>
      <div className="card" style={{ maxWidth: '440px' }}>
        <h2 className="card-title">Catat Restock Barang</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Produk</label>
            <select
              className="input"
              value={productId}
              onChange={(e) => { setProductId(e.target.value); setVariantId(''); }}
              required
            >
              <option value="">-- Pilih Produk --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.nama}</option>
              ))}
            </select>
          </div>

          {punyaVarian && (
            <div className="form-group">
              <label className="form-label">Varian (Ukuran/Warna)</label>
              <select className="input" value={variantId} onChange={(e) => setVariantId(e.target.value)} required>
                <option value="">-- Pilih Varian --</option>
                {produkDipilih.variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {[v.ukuran, v.warna].filter(Boolean).join(' / ') || 'Default'} (stok saat ini: {v.stok})
                  </option>
                ))}
              </select>
            </div>
          )}

          {productId && !punyaVarian && produkDipilih && (
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '-8px' }}>
              Stok saat ini: {produkDipilih.stok}
            </p>
          )}

          <div className="form-group">
            <label className="form-label">Supplier (opsional)</label>
            <select className="input" value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
              <option value="">-- Tanpa Supplier --</option>
              {supplierList.map((s) => (
                <option key={s.id} value={s.id}>{s.nama}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Qty Masuk</label>
              <input className="input" type="number" value={qty} onChange={(e) => setQty(e.target.value)} required />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Harga Beli/Satuan</label>
              <input className="input" type="number" value={hargaBeli} onChange={(e) => setHargaBeli(e.target.value)} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Catat Restock</button>
        </form>
        {message && <div className="alert alert-success" style={{ marginTop: '1rem' }}>{message}</div>}
      </div>

      <div className="card">
        <h2 className="card-title">Riwayat Restock</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Tanggal</th><th>Produk</th><th>Varian</th><th>Supplier</th><th>Qty</th><th>Harga Beli</th><th>Total</th></tr>
            </thead>
            <tbody>
              {riwayat.map((r) => (
                <tr key={r.id}>
                  <td>{formatTanggal(r.created_at)}</td>
                  <td>{r.nama_produk}</td>
                  <td>{[r.ukuran, r.warna].filter(Boolean).join('/') || '-'}</td>
                  <td>{r.nama_supplier || '-'}</td>
                  <td className="num">{r.qty}</td>
                  <td className="num">Rp {Number(r.harga_beli).toLocaleString('id-ID')}</td>
                  <td className="num">Rp {(r.qty * r.harga_beli).toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {riwayat.length === 0 && <div className="empty-state">Belum ada riwayat restock.</div>}
        </div>
      </div>
    </div>
  );
}

export default Restock;