import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { API_URL } from './api';

function Laporan({ token }) {
  const [dari, setDari] = useState('');
  const [sampai, setSampai] = useState('');
  const [data, setData] = useState(null);
  const [grafikData, setGrafikData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const muatLaporan = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (dari) params.append('dari', dari);
      if (sampai) params.append('sampai', sampai);

      const [resRingkasan, resGrafik] = await Promise.all([
        fetch(`${API_URL}/api/laporan?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/laporan/grafik?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const resultRingkasan = await resRingkasan.json();
      const resultGrafik = await resGrafik.json();

      if (!resRingkasan.ok) {
        setError(resultRingkasan.error || 'Gagal mengambil laporan');
        return;
      }

      setData(resultRingkasan);
      setGrafikData(
        resultGrafik.map((row) => ({
          tanggal: new Date(row.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
          total: Number(row.total_harian),
        }))
      );
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
            <h3 className="card-title">Tren Penjualan Harian</h3>
            {grafikData.length === 0 ? (
              <div className="empty-state">Belum ada data penjualan di periode ini.</div>
            ) : (
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <LineChart data={grafikData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="#E3E6EA" vertical={false} />
                    <XAxis dataKey="tanggal" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={{ stroke: '#E3E6EA' }} />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                      axisLine={{ stroke: '#E3E6EA' }}
                      tickFormatter={(v) => `${(v / 1000).toLocaleString('id-ID')}rb`}
                    />
                    <Tooltip
                      formatter={(value) => [`Rp ${Number(value).toLocaleString('id-ID')}`, 'Omset']}
                      contentStyle={{ borderRadius: 8, border: '1px solid #E3E6EA', fontSize: '0.8rem' }}
                    />
                    <Line type="monotone" dataKey="total" stroke="#0F766E" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
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