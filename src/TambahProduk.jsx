import { useState } from 'react';
import { API_URL } from './api';
// Field unik per jenis usaha
const FIELD_PER_KATEGORI = {
  pakaian: [
    { key: 'ukuran', label: 'Ukuran', placeholder: 'S / M / L / XL' },
    { key: 'warna', label: 'Warna', placeholder: 'Hitam, Merah, dst' },
  ],
  makanan_minuman: [
    { key: 'kategori_menu', label: 'Kategori Menu', placeholder: 'Makanan / Minuman' },
    { key: 'level_pedas', label: 'Level Pedas (0-5)', placeholder: '0' },
  ],
  supermarket: [
    { key: 'berat', label: 'Berat/Kemasan', placeholder: '500g, 1L, dst' },
    { key: 'barcode', label: 'Barcode', placeholder: '899...' },
  ],
};

function TambahProduk({ token, jenisUsaha, onProdukDitambahkan }) {
  const [nama, setNama] = useState('');
  const [harga, setHarga] = useState('');
  const [stok, setStok] = useState('');
  const [attrValues, setAttrValues] = useState({});
  const [message, setMessage] = useState('');

  const fieldsKategori = FIELD_PER_KATEGORI[jenisUsaha] || [];

  const handleAttrChange = (key, value) => {
    setAttrValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nama,
          harga: Number(harga),
          stok: Number(stok),
          attributes: attrValues,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || 'Gagal menambah produk');
        return;
      }
      setMessage('Produk berhasil ditambahkan!');
      setNama('');
      setHarga('');
      setStok('');
      setAttrValues({});
      if (onProdukDitambahkan) onProdukDitambahkan();
    } catch (err) {
      setMessage('Tidak bisa terhubung ke server');
    }
  };

  return (
    <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '400px' }}>
      <h3>Tambah Produk ({jenisUsaha})</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '0.75rem' }}>
          <label>Nama Produk</label>
          <input value={nama} onChange={(e) => setNama(e.target.value)} required style={{ width: '100%', padding: '6px' }} />
        </div>
        <div style={{ marginBottom: '0.75rem' }}>
          <label>Harga</label>
          <input type="number" value={harga} onChange={(e) => setHarga(e.target.value)} required style={{ width: '100%', padding: '6px' }} />
        </div>
        <div style={{ marginBottom: '0.75rem' }}>
          <label>Stok</label>
          <input type="number" value={stok} onChange={(e) => setStok(e.target.value)} required style={{ width: '100%', padding: '6px' }} />
        </div>

        {/* Field yang muncul otomatis sesuai jenis usaha */}
        {fieldsKategori.map((field) => (
          <div key={field.key} style={{ marginBottom: '0.75rem' }}>
            <label>{field.label}</label>
            <input
              placeholder={field.placeholder}
              value={attrValues[field.key] || ''}
              onChange={(e) => handleAttrChange(field.key, e.target.value)}
              style={{ width: '100%', padding: '6px' }}
            />
          </div>
        ))}

        <button type="submit" style={{ padding: '8px 16px' }}>Simpan Produk</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default TambahProduk;