import { useState, useEffect } from 'react';
import { API_URL } from './api';
import { showToast } from './toast';

function bulatkanAngka(nilai) {
  if (nilai === null || nilai === undefined || nilai === '') return '';
  return String(Math.round(Number(nilai)));
}

function varianBaruKosong() {
  return { ukuran: '', warna: '', harga: '' };
}

function VarianModal({ token, produk, onTutup, onBerubah, onBukaBarcode, onBukaKoreksi }) {
  const [daftarVarian, setDaftarVarian] = useState(produk.variants || []);
  const [editValues, setEditValues] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [formBaru, setFormBaru] = useState(varianBaruKosong());
  const [savingBaru, setSavingBaru] = useState(false);

  useEffect(() => {
    const initial = {};
    for (const v of daftarVarian) {
      initial[v.id] = { harga: bulatkanAngka(v.harga), ukuran: v.ukuran || '', warna: v.warna || '' };
    }
    setEditValues(initial);
  }, []);

  const ubahNilai = (variantId, field, value) => {
    setEditValues((prev) => ({ ...prev, [variantId]: { ...prev[variantId], [field]: value } }));
  };

  const simpanVarian = async (variant) => {
    const nilai = editValues[variant.id];
    setSavingId(variant.id);
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
      const varianBaru = daftarVarian.map((v) => (v.id === data.id ? data : v));
      setDaftarVarian(varianBaru);
      setEditValues((prev) => ({ ...prev, [data.id]: { harga: bulatkanAngka(data.harga), ukuran: data.ukuran || '', warna: data.warna || '' } }));
      onBerubah();
    } catch (err) {
      showToast('Tidak bisa terhubung ke server', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const tambahVarian = async () => {
    if (!formBaru.ukuran && !formBaru.warna) {
      showToast('Isi minimal Ukuran atau Warna', 'error');
      return;
    }
    setSavingBaru(true);
    try {
      const res = await fetch(`${API_URL}/api/products/${produk.id}/variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ukuran: formBaru.ukuran,
          warna: formBaru.warna,
          stok: 0,
          harga: formBaru.harga && formBaru.harga.trim() !== '' ? Number(formBaru.harga) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Gagal menambah varian', 'error');
        return;
      }
      showToast('Varian baru ditambahkan! Isi stoknya lewat menu Restock.');
      const varianBaru = [...daftarVarian, data];
      setDaftarVarian(varianBaru);
      setEditValues((prev) => ({ ...prev, [data.id]: { harga: bulatkanAngka(data.harga), ukuran: data.ukuran || '', warna: data.warna || '' } }));
      setFormBaru(varianBaruKosong());
      onBerubah();
    } catch (err) {
      showToast('Tidak bisa terhubung ke server', 'error');
    } finally {
      setSavingBaru(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '640px', maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h3 style={{ marginTop: 0 }}>Kelola Varian — {produk.nama}</h3>
          <button className="btn btn-secondary btn-sm" onClick={onTutup}>Tutup</button>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
          Stok hanya bisa ditambah lewat menu <strong>Restock</strong>, atau diperbaiki lewat tombol ⚙️ Koreksi.
        </p>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Ukuran</th><th>Warna</th><th>Stok</th><th>Harga</th><th style={{ minWidth: '220px' }}></th></tr>
            </thead>
            <tbody>
              {daftarVarian.map((v) => {
                const sedangSimpan = savingId === v.id;
                return (
                  <tr key={v.id}>
                    <td>
                      <input
                        className="input"
                        style={{ width: '70px' }}
                        value={editValues[v.id]?.ukuran ?? ''}
                        onChange={(e) => ubahNilai(v.id, 'ukuran', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className="input"
                        style={{ width: '90px' }}
                        value={editValues[v.id]?.warna ?? ''}
                        onChange={(e) => ubahNilai(v.id, 'warna', e.target.value)}
                      />
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{v.stok}</td>
                    <td>
                      <div className="input-prefix-group" style={{ width: '130px' }}>
                        <span className="input-prefix">Rp</span>
                        <input
                          className="input"
                          type="number"
                          placeholder={bulatkanAngka(produk.harga)}
                          value={editValues[v.id]?.harga ?? ''}
                          onChange={(e) => ubahNilai(v.id, 'harga', e.target.value)}
                        />
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => onBukaBarcode({
                            kode: v.sku,
                            judul: produk.nama,
                            subJudul: `${[v.ukuran, v.warna].filter(Boolean).join('/')} · Rp ${Number(v.harga ?? produk.harga).toLocaleString('id-ID')}`,
                          })}
                        >
                          🏷️
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => onBukaKoreksi({
                            produkId: produk.id,
                            variantId: v.id,
                            namaTampil: `${produk.nama} (${[v.ukuran, v.warna].filter(Boolean).join('/')})`,
                            stokSaatIni: v.stok,
                          })}
                        >
                          ⚙️
                        </button>
                        <button className="btn btn-primary btn-sm" disabled={sedangSimpan} onClick={() => simpanVarian(v)}>
                          {sedangSimpan ? 'Menyimpan...' : 'Simpan'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              <tr style={{ background: 'var(--color-bg)' }}>
                <td>
                  <input
                    className="input"
                    placeholder="Ukuran"
                    style={{ width: '70px' }}
                    value={formBaru.ukuran}
                    onChange={(e) => setFormBaru((prev) => ({ ...prev, ukuran: e.target.value }))}
                  />
                </td>
                <td>
                  <input
                    className="input"
                    placeholder="Warna"
                    style={{ width: '90px' }}
                    value={formBaru.warna}
                    onChange={(e) => setFormBaru((prev) => ({ ...prev, warna: e.target.value }))}
                  />
                </td>
                <td style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>0 (restock setelahnya)</td>
                <td>
                  <div className="input-prefix-group" style={{ width: '130px' }}>
                    <span className="input-prefix">Rp</span>
                    <input
                      className="input"
                      type="number"
                      placeholder={bulatkanAngka(produk.harga)}
                      value={formBaru.harga}
                      onChange={(e) => setFormBaru((prev) => ({ ...prev, harga: e.target.value }))}
                    />
                  </div>
                </td>
                <td>
                  <button className="btn btn-primary btn-sm" disabled={savingBaru} onClick={tambahVarian}>
                    {savingBaru ? 'Menambah...' : '+ Tambah Varian Baru'}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default VarianModal;