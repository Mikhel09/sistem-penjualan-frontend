import { useState, useEffect } from 'react';
import { API_URL } from './api';

function Pelanggan({ token }) {
  const [pelangganList, setPelangganList] = useState([]);
  const [nama, setNama] = useState('');
  const [telepon, setTelepon] = useState('');
  const [message, setMessage] = useState('');

  const muatPelanggan = () => {
    fetch(`${API_URL}/api/customers`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then(setPelangganList);
  };

  useEffect(() => {
    muatPelanggan();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/api/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nama, telepon }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || 'Gagal mendaftarkan pelanggan');
        return;
      }
      setMessage('Pelanggan berhasil didaftarkan!');
      setNama('');
      setTelepon('');
      muatPelanggan();
    } catch (err) {
      setMessage('Tidak bisa terhubung ke server');
    }
  };

  return (
    <div>
      <div className="card" style={{ maxWidth: '420px' }}>
        <h2 className="card-title">Daftarkan Pelanggan Baru</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nama</label>
            <input className="input" value={nama} onChange={(e) => setNama(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Nomor Telepon</label>
            <input className="input" value={telepon} onChange={(e) => setTelepon(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary">Daftarkan</button>
        </form>
        {message && <div className="alert alert-success" style={{ marginTop: '1rem' }}>{message}</div>}
      </div>

      <div className="card">
        <h2 className="card-title">Daftar Pelanggan</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Nama</th><th>Telepon</th><th>Poin</th></tr></thead>
            <tbody>
              {pelangganList.map((c) => (
                <tr key={c.id}>
                  <td>{c.nama}</td>
                  <td>{c.telepon}</td>
                  <td className="num">{c.poin}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {pelangganList.length === 0 && <div className="empty-state">Belum ada pelanggan.</div>}
        </div>
      </div>
    </div>
  );
}

export default Pelanggan;