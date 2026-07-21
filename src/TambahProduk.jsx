import { useState, useEffect } from 'react';
import { API_URL } from './api';
import { JENIS_PRODUK_PAKAIAN, TARGET_USIA_PAKAIAN, SEGMEN_PAKAIAN } from './kategoriPakaian';

const FIELD_ATTRIBUT_PAKAIAN = [
  { key: 'jenis_pakaian', label: 'Jenis Produk', options: JENIS_PRODUK_PAKAIAN },
  { key: 'target_usia', label: 'Target Usia', options: TARGET_USIA_PAKAIAN },
  { key: 'jenis_kelamin', label: 'Segmen', options: SEGMEN_PAKAIAN },
];

const FIELD_PER_KATEGORI_LAIN = {
  makanan_minuman: [
    { key: 'kategori_menu', label: 'Kategori Menu', placeholder: 'Makanan / Minuman' },
    { key: 'level_pedas', label: 'Level Pedas (0-5)', placeholder: '0' },
  ],
  supermarket: [
    { key: 'berat', label: 'Berat/Kemasan', placeholder: '500g, 1L, dst' },
    { key: 'barcode', label: 'Barcode', placeholder: '899...' },
  ],
};

function buatVarianKosong() {
  return { ukuran: '', warna: '', stok: '', harga: '' };
}

function TambahProduk({ token, jenisUsaha, storeIdUser, onProdukDitambahkan, produkDiedit, onSelesaiEdit }) {
  const [nama, setNama] = useState('');
  const [harga, setHarga] = useState('');
  const [stok, setStok] = useState('');
  const [stokMinimum, setStokMinimum] = useState('5');
  const [attrValues, setAttrValues] = useState({});
  const [modeHarga, setModeHarga] = useState('sama'); // 'sama' | 'berbeda'
  const [varianList, setVarianList] = useState([buatVarianKosong()]);
  const [cabangList, setCabangList] = useState([]);
  const [storeIdDipilih, setStoreIdDipilih] = useState('');
  const [message, setMessage] = useState('');

  const isPakaian = jenisUsaha === 'pakaian';
  const isEdit = Boolean(produkDiedit);
  const butuhPilihCabang = !storeIdUser;
  const fieldLainKategori = FIELD_PER_KATEGORI_LAIN[jenisUsaha] || [];

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
      setModeHarga('sama');
      setVarianList([buatVarianKosong()]);
    }
  }, [produkDiedit]);

  const handleAttrChange = (key, value) => {
    setAttrValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleVarianChange = (index, field, value) => {
    setVarianList((prev) => prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  };

  const tambahBarisVarian = () => setVarianList((prev) => [...prev, buatVarianKosong()]);
  const hapusBarisVarian = (index) => setVarianList((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (butuhPilihCabang && !isEdit && !storeIdDipilih) {
      setMessage('Pilih cabang untuk produk ini');
      return;
    }

    const url = isEdit ? `${API_URL}/api/products/${produkDiedit.id}` : `${API_URL}/api/products`;
    const method = isEdit ? 'PUT' : 'POST';

    const body = {
      nama,
      harga: Number(harga),
      stok_minimum: Number(stokMinimum),
      attributes: attrValues,
      store_id: storeIdUser || Number(storeIdDipilih),
    };

    if (isPakaian && !isEdit) {
      const varianValid = varianList.filter((v) => v.ukuran || v.warna);
      if (varianValid.length === 0) {
        setMessage('Tambahkan minimal 1 varian (ukuran/warna)');
        return;
      }
      body.varian = varianValid.map((v) => ({
        ukuran: v.ukuran,
        warna: v.warna,
        stok: Number(v.stok) || 0,
        harga: modeHarga === 'berbeda' && v.harga ? Number(v.harga) : undefined,
      }));
    } else if (!isPakaian) {
      body.stok = Number(stok);
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
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
      setModeHarga('sama');
      setVarianList([buatVarianKosong()]);
      if (onProdukDitambahkan) onProdukDitambahkan();
      if (isEdit && onSelesaiEdit) onSelesaiEdit();
    } catch (err) {
      setMessage('Tidak bisa terhubung ke server');
    }
  };

  return (
    <div className="card" style={{ maxWidth: '600px' }}>
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
            <label className="form-label">
              {isPakaian ? 'Harga Dasar' : 'Harga'}
            </label>
            <input className="input" type="number" value={harga} onChange={(e) => setHarga(e.target.value)} required />
          </div>
          {!isPakaian && (
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Stok</label>
              <input className="input" type="number" value={stok} onChange={(e) => setStok(e.target.value)} required />
            </div>
          )}
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Stok Minimum</label>
            <input className="input" type="number" value={stokMinimum} onChange={(e) => setStokMinimum(e.target.value)} />
          </div>
        </div>

        {isPakaian &&
          FIELD_ATTRIBUT_PAKAIAN.map((field) => (
            <div key={field.key} className="form-group">
              <label className="form-label">{field.label}</label>
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
            </div>
          ))}

        {isPakaian && (
          <div className="form-group">
            <label className="form-label">Bahan (opsional)</label>
            <input
              className="input"
              placeholder="Katun, Denim, Polyester, dst"
              value={attrValues.bahan || ''}
              onChange={(e) => handleAttrChange('bahan', e.target.value)}
            />
          </div>
        )}

        {!isPakaian &&
          fieldLainKategori.map((field) => (
            <div key={field.key} className="form-group">
              <label className="form-label">{field.label}</label>
              <input
                className="input"
                placeholder={field.placeholder}
                value={attrValues[field.key] || ''}
                onChange={(e) => handleAttrChange(field.key, e.target.value)}
              />
            </div>
          ))}

        {isPakaian && !isEdit && (
          <div className="form-group">
            <label className="form-label">Harga Tiap Varian</label>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input type="radio" checked={modeHarga === 'sama'} onChange={() => setModeHarga('sama')} />
                Sama untuk semua varian (pakai Harga Dasar)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input type="radio" checked={modeHarga === 'berbeda'} onChange={() => setModeHarga('berbeda')} />
                Berbeda tiap varian
              </label>
            </div>

            <label className="form-label">Varian (Ukuran / Warna / Stok{modeHarga === 'berbeda' ? ' / Harga' : ''})</label>
            {varianList.map((v, index) => (
              <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  className="input"
                  placeholder="Ukuran"
                  value={v.ukuran}
                  onChange={(e) => handleVarianChange(index, 'ukuran', e.target.value)}
                  style={{ flex: 1 }}
                />
                <input
                  className="input"
                  placeholder="Warna"
                  value={v.warna}
                  onChange={(e) => handleVarianChange(index, 'warna', e.target.value)}
                  style={{ flex: 1 }}
                />
                <input
                  className="input"
                  type="number"
                  placeholder="Stok"
                  value={v.stok}
                  onChange={(e) => handleVarianChange(index, 'stok', e.target.value)}
                  style={{ width: '80px' }}
                />
                {modeHarga === 'berbeda' && (
                  <input
                    className="input"
                    type="number"
                    placeholder="Harga"
                    value={v.harga}
                    onChange={(e) => handleVarianChange(index, 'harga', e.target.value)}
                    style={{ width: '100px' }}
                  />
                )}
                {varianList.length > 1 && (
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => hapusBarisVarian(index)}>✕</button>
                )}
              </div>
            ))}
            <button type="button" className="btn btn-secondary btn-sm" onClick={tambahBarisVarian}>
              + Tambah Varian
            </button>
          </div>
        )}

        {isPakaian && isEdit && (
          <div className="alert alert-warning">
            Untuk pakaian, stok & harga per varian diubah lewat tombol <strong>Kelola Varian</strong> di halaman Daftar Produk (bukan lewat form ini).
          </div>
        )}

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