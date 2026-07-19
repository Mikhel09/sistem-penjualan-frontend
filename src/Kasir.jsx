import { useState, useEffect } from 'react';
import { API_URL } from './api';

function Kasir({ token, jenisUsaha, namaBisnis }) {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState('');
  const [noMeja, setNoMeja] = useState('');
  const [catatan, setCatatan] = useState('');
  const [kodeBarcode, setKodeBarcode] = useState('');
  const [strukData, setStrukData] = useState(null); // data transaksi yang sudah selesai, siap dicetak

  useEffect(() => {
    fetch(`${API_URL}/api/products`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setProducts);
  }, [token]);

  const tambahKeKeranjang = (produk) => {
    setCart((prev) => {
      const sudahAda = prev.find((item) => item.product_id === produk.id);
      if (sudahAda) {
        return prev.map((item) =>
          item.product_id === produk.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { product_id: produk.id, nama: produk.nama, harga: produk.harga, qty: 1 }];
    });
  };

  const cariByBarcode = (e) => {
    e.preventDefault();
    const produk = products.find((p) => p.attributes?.barcode === kodeBarcode);
    if (produk) {
      tambahKeKeranjang(produk);
      setMessage('');
    } else {
      setMessage('Barcode tidak ditemukan');
    }
    setKodeBarcode('');
  };

  const totalKeranjang = cart.reduce((sum, item) => sum + item.harga * item.qty, 0);

  const bayar = async () => {
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/api/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cart.map((item) => ({ product_id: item.product_id, qty: item.qty })),
          no_meja: jenisUsaha === 'makanan_minuman' ? noMeja : undefined,
          catatan: jenisUsaha === 'makanan_minuman' ? catatan : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || 'Transaksi gagal');
        return;
      }

      // Ambil detail lengkap transaksi (nama produk, dll) untuk ditampilkan di struk
      const detailRes = await fetch(`${API_URL}/api/transactions/${data.transaction_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const detailData = await detailRes.json();

      setStrukData(detailData);
      setCart([]);
      setNoMeja('');
      setCatatan('');
      fetch(`${API_URL}/api/products`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.json())
        .then(setProducts); // refresh stok setelah transaksi
    } catch (err) {
      setMessage('Tidak bisa terhubung ke server');
    }
  };

  const transaksiBaru = () => {
    setStrukData(null);
    setMessage('');
  };

  // TAMPILAN STRUK (muncul setelah bayar berhasil)
  if (strukData) {
    return (
      <div>
        <div
          className="area-cetak"
          style={{ maxWidth: '300px', fontFamily: 'monospace', border: '1px dashed #333', padding: '1rem' }}
        >
          <h3 style={{ textAlign: 'center', margin: '0 0 4px 0' }}>{namaBisnis}</h3>
          <p style={{ textAlign: 'center', margin: '0 0 8px 0' }}>
            {new Date(strukData.transaksi.created_at).toLocaleString('id-ID')}
          </p>
          <hr />
          {strukData.items.map((item) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{item.nama_produk} x{item.qty}</span>
              <span>Rp {(item.qty * item.harga_saat_jual).toLocaleString('id-ID')}</span>
            </div>
          ))}
          <hr />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
            <span>TOTAL</span>
            <span>Rp {Number(strukData.transaksi.total).toLocaleString('id-ID')}</span>
          </div>
          {strukData.transaksi.no_meja && <p>No. Meja: {strukData.transaksi.no_meja}</p>}
          {strukData.transaksi.catatan && <p>Catatan: {strukData.transaksi.catatan}</p>}
          <p style={{ textAlign: 'center', marginTop: '1rem' }}>Terima kasih!</p>
        </div>

        <div className="no-print" style={{ marginTop: '1rem' }}>
          <button onClick={() => window.print()}>Cetak Struk</button>{' '}
          <button onClick={transaksiBaru}>Transaksi Baru</button>
        </div>
      </div>
    );
  }

  // TAMPILAN KASIR NORMAL (sebelum bayar)
  return (
    <div style={{ display: 'flex', gap: '2rem', padding: '1rem' }}>
      <div>
        <h3>Pilih Produk</h3>
        {jenisUsaha === 'supermarket' && (
          <form onSubmit={cariByBarcode} style={{ marginBottom: '1rem' }}>
            <input
              placeholder="Scan/ketik barcode lalu Enter"
              value={kodeBarcode}
              onChange={(e) => setKodeBarcode(e.target.value)}
              style={{ padding: '6px', width: '220px' }}
              autoFocus
            />
          </form>
        )}
        {products.map((p) => (
          <div key={p.id} style={{ marginBottom: '8px' }}>
            <button onClick={() => tambahKeKeranjang(p)}>
              {p.nama} — Rp {Number(p.harga).toLocaleString('id-ID')} (stok: {p.stok})
            </button>
          </div>
        ))}
      </div>

      <div>
        <h3>Keranjang</h3>
        {jenisUsaha === 'makanan_minuman' && (
          <div style={{ marginBottom: '1rem' }}>
            <div>
              <label>No. Meja: </label>
              <input value={noMeja} onChange={(e) => setNoMeja(e.target.value)} style={{ padding: '4px' }} />
            </div>
            <div>
              <label>Catatan: </label>
              <input
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="misal: tidak pedas, take away"
                style={{ padding: '4px', width: '200px' }}
              />
            </div>
          </div>
        )}

        {cart.length === 0 ? (
          <p>Keranjang kosong</p>
        ) : (
          <>
            {cart.map((item) => (
              <div key={item.product_id}>
                {item.nama} x{item.qty} = Rp {(item.harga * item.qty).toLocaleString('id-ID')}
              </div>
            ))}
            <hr />
            <strong>Total: Rp {totalKeranjang.toLocaleString('id-ID')}</strong>
            <br />
            <button onClick={bayar} style={{ marginTop: '8px', padding: '8px 16px' }}>
              Bayar
            </button>
          </>
        )}
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

export default Kasir;