import { useState, useEffect } from 'react';
import { API_URL } from './api';

function KelolaSupplier({ token }) {
  const [supplierList, setSupplierList] = useState([]);
  const [nama, setNama] = useState('');
  const [telepon, setTelepon] = useState('');
  const [alamat, setAlamat] = useState('');
  const [message, setMessage] = useState('');

  const muatSupplier = () => {
    fetch(`${API_URL}/api/suppliers`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then(setSupplierList);
  };

  useEffect(() => {
    muatSupplier();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/api/suppliers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nama, telepon, alamat }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || 'Gagal menambah supplier');
        return;
      }
      setMessage('Supplier berhasil ditambahkan!');
      setNama('');
      setTelepon('');
      setAlamat('');
      muatSupplier();
    } catch (err) {
      setMessage('Tidak bisa terhubung ke server');
    }
  };

  return (
    <div>
      <div className="card" style={{ maxWidth: '420px' }}>
        <h2 className="card-title">Tambah Supplier Baru</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nama Supplier</label>
            <input className="input" value={nama} onChange={(e) => setNama(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Telepon</label>
            <input className="input" value={telepon} onChange={(e) => setTelepon(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Alamat</label>
            <input className="input" value={alamat} onChange={(e) => setAlamat(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary">Tambah Supplier</button>
        </form>
        {message && <div className="alert alert-success" style={{ marginTop: '1rem' }}>{message}</div>}
      </div>

      <div className="card">
        <h2 className="card-title">Daftar Supplier</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Nama</th><th>Telepon</th><th>Alamat</th></tr></thead>
            <tbody>
              {supplierList.map((s) => (
                <tr key={s.id}><td>{s.nama}</td><td>{s.telepon || '-'}</td><td>{s.alamat || '-'}</td></tr>
              ))}
            </tbody>
          </table>
          {supplierList.length === 0 && <div className="empty-state">Belum ada supplier.</div>}
        </div>
      </div>
    </div>
  );
}

export default KelolaSupplier;