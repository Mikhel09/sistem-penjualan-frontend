import { useState, useEffect } from 'react';
import { API_URL } from './api';
import { JENIS_PRODUK_PAKAIAN, TARGET_USIA_PAKAIAN, SEGMEN_PAKAIAN } from './kategoriPakaian';

const FIELD_PER_KATEGORI = {
  pakaian: [
    { key: 'jenis_pakaian', label: 'Jenis Produk', type: 'select', options: JENIS_PRODUK_PAKAIAN },
    { key: 'target_usia', label: 'Target Usia', type: 'select', options: TARGET_USIA_PAKAIAN },
    { key: 'jenis_kelamin', label: 'Segmen', type: 'select', options: SEGMEN_PAKAIAN },
    { key: 'ukuran', label: 'Ukuran', type: 'text', placeholder: 'S / M / L / 38 / 27, dst' },
    { key: 'warna', label: 'Warna', type: 'text', placeholder: 'Hitam, Merah, dst' },
    { key: 'bahan', label: 'Bahan (opsional)', type: 'text', placeholder: 'Katun, Denim, Polyester, dst' },
  ],
  makanan_minuman: [
    { key: 'kategori_menu', label: 'Kategori Menu', type: 'text', placeholder: 'Makanan / Minuman' },
    { key: 'level_pedas', label: 'Level Pedas (0-5)', type: 'text', placeholder: '0' },
  ],
  supermarket: [
    { key: 'berat', label: 'Berat/Kemasan', type: 'text', placeholder: '500g, 1L, dst' },
    { key: 'barcode', label: 'Barcode', type: 'text', placeholder: '899...' },
  ],
};

function TambahProduk({ token, jenisUsaha, storeIdUser, onProdukDitambahkan, produkDiedit, onSelesaiEdit }) {
  const [nama, setNama] = useState('');
  const [harga, setHarga] = useState('');
  const [stok, setStok] = useState('');
  const [stokMinimum, setStokMinimum] = useState('5');
  const [attrValues, setAttrValues] = useState({});
  const [cabangList, setCabangList] = useState([]);
  const [storeIdDipilih, setStoreIdDipilih] = useState('');
  const [message, setMessage] = useState('');

  const fieldsKategori = FIELD_PER_KATEGORI[jenisUsaha] || [];
  const isEdit = Boolean(produkDiedit);
  const butuhPilihCabang = !storeIdUser;

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
      setStokMinimum(produkDiedit.stok_minimum ?? 5);
      setAttrValues(produkDiedit.attributes || {});
    } else {
      setNama('');
      setHarga('');
      setStok('');
      setStokMinimum('5');
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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          nama,
          harga: Number(harga),
          stok: Number(stok),
          stok_minimum: Number(stokMinimum),
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
      setStokMinimum('5');
      setAttrValues({});
      if (onProdukDitambahkan) onProdukDitambahkan();
      if (isEdit && onSelesaiEdit) onSelesaiEdit();
    } catch (err) {
      setMessage('Tidak bisa terhubung ke server');
    }
  };

  return (
    <div className="card" style={{ maxWidth: '480px' }}>
      <h2 className="card-title">{isEdit ? 'Edit Produk' : 'Tambah Produk'} · <span className={`badge badge-${jenisUsaha}`}>{jenisUsaha}</span></h2>
      <form onSubmit={handleSubmit}>
        {butuhPilihCabang && !isEdit && (
          <div className="form-group">
            <label className="form-label">Cabang</label>
            <select className="input" value={storeIdDipilih} onChange={(e) => setStoreIdDipilih(e.target.value)}>
              <option value="">-- Pilih Cabang --</option>
              {cabangList.map((c) => (
                <option key={c.id} value={c.id}>{c.nama_toko}</option>
              ))}
            </select>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Nama Produk</label>
          <input className="input" value={nama} onChange={(e) => setNama(e.target.value)} required />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Harga</label>
            <input className="input" type="number" value={harga} onChange={(e) => setHarga(e.target.value)} required />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Stok</label>
            <input className="input" type="number" value={stok} onChange={(e) => setStok(e.target.value)} required />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Stok Minimum</label>
            <input className="input" type="number" value={stokMinimum} onChange={(e) => setStokMinimum(e.target.value)} />
          </div>
        </div>

        {fieldsKategori.map((field) => (
          <div key={field.key} className="form-group">
            <label className="form-label">{field.label}</label>
            {field.type === 'select' ? (
              <select
                className="input"
                value={attrValues[field.key] || ''}
                onChange={(e) => handleAttrChange(field.key, e.target.value)}
              >
                <option value="">-- Pilih --</option>
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                className="input"
                placeholder={field.placeholder}
                value={attrValues[field.key] || ''}
                onChange={(e) => handleAttrChange(field.key, e.target.value)}
              />
            )}
          </div>
        ))}

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <button type="submit" className="btn btn-primary">
            {isEdit ? 'Simpan Perubahan' : 'Simpan Produk'}
          </button>
          {isEdit && (
            <button type="button" className="btn btn-secondary" onClick={onSelesaiEdit}>
              Batal
            </button>
          )}
        </div>
      </form>
      {message && <div className="alert alert-success" style={{ marginTop: '1rem' }}>{message}</div>}
    </div>
  );
}

export default TambahProduk;