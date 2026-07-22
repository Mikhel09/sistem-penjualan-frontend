import { useState } from 'react';
import { API_URL } from './api';

function KoreksiStokModal({ token, produkId, variantId, namaTampil, stokSaatIni, onTutup, onSukses }) {
  const [stokBaru, setStokBaru] = useState(String(stokSaatIni));
  const [alasan, setAlasan] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!alasan.trim()) {
      setMessage('Alasan wajib diisi (misal: koreksi input awal, barang rusak, hasil stock opname)');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/stock-adjustments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          product_id: produkId,
          variant_id: variantId || undefined,
          stok_baru: Number(stokBaru),
          alasan,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || 'Gagal menyimpan koreksi');
        return;
      }
      onSukses();
      onTutup();
    } catch (err) {
      setMessage('Tidak bisa terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3 style={{ marginTop: 0 }}>Koreksi Stok</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '-8px' }}>{namaTampil}</p>

        <div className="alert alert-warning" style={{ fontSize: '0.78rem' }}>
          Gunakan ini hanya untuk memperbaiki angka yang salah (bukan barang masuk rutin). Untuk barang masuk dari supplier, gunakan halaman <strong>Restock</strong>.
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Stok Saat Ini</label>
            <input className="input" value={stokSaatIni} disabled style={{ background: 'var(--color-bg)' }} />
          </div>
          <div className="form-group">
            <label className="form-label">Stok Baru (angka yang benar)</label>
            <input
              className="input"
              type="number"
              value={stokBaru}
              onChange={(e) => setStokBaru(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Alasan</label>
            <input
              className="input"
              placeholder="misal: salah input awal, barang rusak, hasil stock opname"
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              required
            />
          </div>

          {message && <div className="alert alert-error">{message}</div>}

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Koreksi'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onTutup}>Batal</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default KoreksiStokModal;