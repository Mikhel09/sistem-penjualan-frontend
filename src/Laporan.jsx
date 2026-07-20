import { useState, useEffect } from 'react';
import { API_URL } from './api';

function Laporan({ token }) {
  const [dari, setDari] = useState('');
  const [sampai, setSampai] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const muatLaporan = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (dari) params.append('dari', dari);
      if (sampai) params.append('sampai', sampai);

      const res = await fetch(`${API_URL}/api/laporan?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || 'Gagal mengambil laporan');
        return;
      }
      setData(result);
    } catch (err) {
      setError('Tidak bisa terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    muatLaporan();
  }, []);

  return (
    <div>
      <div className="card">
        <div className="page-header">
          <h2 className="page-title">Laporan Penjualan</h2>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Dari</label>
            <input className="input" type="date" value={dari} onChange={(e) => setDari(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Sampai</label>
            <input className="input" type="date" value={sampai} onChange={(e) => setSampai(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={muatLaporan} disabled={loading}>
            {loading ? 'Memuat...' : 'Tampilkan'}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {data && (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">Total Omset</div>
              <div className="stat-value">Rp {Number(data.total_omset).toLocaleString('id-ID')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Jumlah Transaksi</div>
              <div className="stat-value">{data.jumlah_transaksi}</div>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">Produk Terlaris</h3>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr><th>Produk</th><th>Jumlah Terjual</th><th>Total Omset Produk</th></tr>
                </thead>
                <tbody>
                  {data.produk_terlaris.map((p, index) => (
                    <tr key={index}>
                      <td>{p.nama}</td>
                      <td className="num">{p.total_terjual}</td>
                      <td className="num">Rp {Number(p.total_omset_produk).toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.produk_terlaris.length === 0 && <div className="empty-state">Belum ada penjualan di periode ini.</div>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Laporan;