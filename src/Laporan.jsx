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
    muatLaporan(); // otomatis muat laporan 30 hari terakhir waktu halaman dibuka
  }, []);

  return (
    <div>
      <h3>Laporan Penjualan</h3>

      <div style={{ marginBottom: '1rem' }}>
        <label>Dari: </label>
        <input type="date" value={dari} onChange={(e) => setDari(e.target.value)} style={{ marginRight: '1rem' }} />
        <label>Sampai: </label>
        <input type="date" value={sampai} onChange={(e) => setSampai(e.target.value)} style={{ marginRight: '1rem' }} />
        <button onClick={muatLaporan} disabled={loading}>
          {loading ? 'Memuat...' : 'Tampilkan'}
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {data && (
        <>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', minWidth: '180px' }}>
              <p style={{ margin: 0, color: '#666' }}>Total Omset</p>
              <h2 style={{ margin: 0 }}>Rp {Number(data.total_omset).toLocaleString('id-ID')}</h2>
            </div>
            <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', minWidth: '180px' }}>
              <p style={{ margin: 0, color: '#666' }}>Jumlah Transaksi</p>
              <h2 style={{ margin: 0 }}>{data.jumlah_transaksi}</h2>
            </div>
          </div>

          <h4>Produk Terlaris</h4>
          {data.produk_terlaris.length === 0 ? (
            <p>Belum ada penjualan di periode ini.</p>
          ) : (
            <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr><th>Produk</th><th>Jumlah Terjual</th><th>Total Omset Produk</th></tr>
              </thead>
              <tbody>
                {data.produk_terlaris.map((p, index) => (
                  <tr key={index}>
                    <td>{p.nama}</td>
                    <td>{p.total_terjual}</td>
                    <td>Rp {Number(p.total_omset_produk).toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}

export default Laporan;