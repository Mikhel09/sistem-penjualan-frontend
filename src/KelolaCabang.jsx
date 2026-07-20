import { useState, useEffect } from 'react';
import { API_URL } from './api';

function KelolaCabang({ token }) {
  const [cabangList, setCabangList] = useState([]);
  const [namaToko, setNamaToko] = useState('');
  const [alamat, setAlamat] = useState('');
  const [message, setMessage] = useState('');

  const muatCabang = () => {
    fetch(`${API_URL}/api/stores`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then(setCabangList);
  };

  useEffect(() => {
    muatCabang();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/api/stores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nama_toko: namaToko, alamat }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || 'Gagal membuat cabang');
        return;
      }
      setMessage('Cabang berhasil dibuat!');
      setNamaToko('');
      setAlamat('');
      muatCabang();
    } catch (err) {
      setMessage('Tidak bisa terhubung ke server');
    }
  };

  return (
    <div>
      <div className="card" style={{ maxWidth: '420px' }}>
        <h2 className="card-title">Tambah Cabang Baru</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nama Toko/Cabang</label>
            <input className="input" value={namaToko} onChange={(e) => setNamaToko(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Alamat (opsional)</label>
            <input className="input" value={alamat} onChange={(e) => setAlamat(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary">Tambah Cabang</button>
        </form>
        {message && <div className="alert alert-success" style={{ marginTop: '1rem' }}>{message}</div>}
      </div>

      <div className="card">
        <h2 className="card-title">Daftar Cabang</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Nama Toko</th><th>Alamat</th></tr></thead>
            <tbody>
              {cabangList.map((c) => (
                <tr key={c.id}><td>{c.nama_toko}</td><td>{c.alamat || '-'}</td></tr>
              ))}
            </tbody>
          </table>
          {cabangList.length === 0 && <div className="empty-state">Belum ada cabang.</div>}
        </div>
      </div>
    </div>
  );
}

export default KelolaCabang;