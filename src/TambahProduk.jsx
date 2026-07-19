import { useState, useEffect } from 'react';
import { API_URL } from './api';

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

function TambahProduk({ token, jenisUsaha, storeIdUser, onProdukDitambahkan, produkDiedit, onSelesaiEdit }) {
  const [nama, setNama] = useState('');
  const [harga, setHarga] = useState('');
  const [stok, setStok] = useState('');
  const [attrValues, setAttrValues] = useState({});
  const [cabangList, setCabangList] = useState([]);
  const [storeIdDipilih, setStoreIdDipilih] = useState('');
  const [message, setMessage] = useState('');

  const fieldsKategori = FIELD_PER_KATEGORI[jenisUsaha] || [];
  const isEdit = Boolean(produkDiedit);
  const butuhPilihCabang = !storeIdUser; // owner tidak punya store_id sendiri

  useEffect(() => {
    if (butuhPilihCabang) {
      fetch(`${API_URL}/api/stores`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.json())
        .then(setCabangList);
    }
  }, []);

  useEffect(() => {
    if (produkDiedit) {
      setNama(produkDiedit.nama);
      setHarga(produkDiedit.harga);
      setStok(produkDiedit.stok);
      setAttrValues(produkDiedit.attributes || {});
    } else {
      setNama('');
      setHarga('');
      setStok('');
      setAttrValues({});
    }
  }, [produkDiedit]);

  const handleAttrChange = (key, value) => {
    setAttrValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (butuhPilihCabang && !isEdit && !storeIdDipilih) {
      setMessage('Pilih cabang untuk produk ini');
      return;
    }

    const url = isEdit ? `${API_URL}/api/products/${produkDiedit.id}` : `${API_URL}/api/products`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nama,
          harga: Number(harga),
          stok: Number(stok),
          attributes: attrValues,
          store_id: storeIdUser || Number(storeIdDipilih),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || 'Gagal menyimpan produk');
        return;
      }
      setMessage(isEdit ? 'Produk berhasil diubah!' : 'Produk berhasil ditambahkan!');
      setNama('');
      setHarga('');
      setStok('');
      setAttrValues({});
      if (onProdukDitambahkan) onProdukDitambahkan();
      if (isEdit && onSelesaiEdit) onSelesaiEdit();
    } catch (err) {
      setMessage('Tidak bisa terhubung ke server');
    }
  };

  return (
    <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '400px' }}>
      <h3>{isEdit ? 'Edit Produk' : 'Tambah Produk'} ({jenisUsaha})</h3>
      <form onSubmit={handleSubmit}>
        {butuhPilihCabang && !isEdit && (
          <div style={{ marginBottom: '0.75rem' }}>
            <label>Cabang</label>
            <select
              value={storeIdDipilih}
              onChange={(e) => setStoreIdDipilih(e.target.value)}
              style={{ width: '100%', padding: '6px' }}
            >
              <option value="">-- Pilih Cabang --</option>
              {cabangList.map((c) => (
                <option key={c.id} value={c.id}>{c.nama_toko}</option>
              ))}
            </select>
          </div>
        )}

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

        <button type="submit" style={{ padding: '8px 16px' }}>
          {isEdit ? 'Simpan Perubahan' : 'Simpan Produk'}
        </button>
        {isEdit && (
          <button type="button" onClick={onSelesaiEdit} style={{ padding: '8px 16px', marginLeft: '8px' }}>
            Batal
          </button>
        )}
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default TambahProduk;