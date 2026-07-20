import { useState, useEffect } from 'react';
import { API_URL } from './api';

function KelolaStaff({ token }) {
  const [staffList, setStaffList] = useState([]);
  const [cabangList, setCabangList] = useState([]);
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('kasir');
  const [storeId, setStoreId] = useState('');
  const [message, setMessage] = useState('');

  const muatStaff = () => {
    fetch(`${API_URL}/api/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then(setStaffList);
  };

  const muatCabang = () => {
    fetch(`${API_URL}/api/stores`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then(setCabangList);
  };

  useEffect(() => {
    muatStaff();
    muatCabang();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!storeId) {
      setMessage('Pilih cabang untuk staff ini');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nama, email, password, role, store_id: Number(storeId) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || 'Gagal menambah staff');
        return;
      }
      setMessage('Staff berhasil ditambahkan!');
      setNama('');
      setEmail('');
      setPassword('');
      setStoreId('');
      muatStaff();
    } catch (err) {
      setMessage('Tidak bisa terhubung ke server');
    }
  };

  return (
    <div>
      <div className="card" style={{ maxWidth: '420px' }}>
        <h2 className="card-title">Tambah Staff Baru</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nama</label>
            <input className="input" value={nama} onChange={(e) => setNama(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Role</label>
              <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="kasir">Kasir</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Cabang</label>
              <select className="input" value={storeId} onChange={(e) => setStoreId(e.target.value)} required>
                <option value="">-- Pilih --</option>
                {cabangList.map((c) => (
                  <option key={c.id} value={c.id}>{c.nama_toko}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Tambah Staff</button>
        </form>
        {message && <div className="alert alert-success" style={{ marginTop: '1rem' }}>{message}</div>}
      </div>

      <div className="card">
        <h2 className="card-title">Daftar Staff</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Nama</th><th>Email</th><th>Role</th><th>Cabang</th></tr></thead>
            <tbody>
              {staffList.map((s) => (
                <tr key={s.id}>
                  <td>{s.nama}</td>
                  <td>{s.email}</td>
                  <td><span className={`badge badge-${s.role}`}>{s.role}</span></td>
                  <td>{s.nama_toko || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {staffList.length === 0 && <div className="empty-state">Belum ada staff.</div>}
        </div>
      </div>
    </div>
  );
}

export default KelolaStaff;