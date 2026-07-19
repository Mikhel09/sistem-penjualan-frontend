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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
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
      <h3>Tambah Staff Baru</h3>
      <form onSubmit={handleSubmit} style={{ maxWidth: '300px', marginBottom: '2rem' }}>
        <input placeholder="Nama" value={nama} onChange={(e) => setNama(e.target.value)} required style={{ width: '100%', padding: '6px', marginBottom: '8px' }} />
        <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '6px', marginBottom: '8px' }} />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '6px', marginBottom: '8px' }} />
        <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%', padding: '6px', marginBottom: '8px' }}>
          <option value="kasir">Kasir</option>
          <option value="admin">Admin</option>
        </select>
        <select value={storeId} onChange={(e) => setStoreId(e.target.value)} required style={{ width: '100%', padding: '6px', marginBottom: '8px' }}>
          <option value="">-- Pilih Cabang --</option>
          {cabangList.map((c) => (
            <option key={c.id} value={c.id}>{c.nama_toko}</option>
          ))}
        </select>
        <button type="submit" style={{ padding: '8px 16px' }}>Tambah Staff</button>
      </form>
      {message && <p>{message}</p>}

      <h3>Daftar Staff</h3>
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
        <thead><tr><th>Nama</th><th>Email</th><th>Role</th><th>Cabang</th></tr></thead>
        <tbody>
          {staffList.map((s) => (
            <tr key={s.id}><td>{s.nama}</td><td>{s.email}</td><td>{s.role}</td><td>{s.nama_toko || '-'}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default KelolaStaff;