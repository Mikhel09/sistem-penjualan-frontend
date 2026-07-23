import { useState, useEffect } from 'react';
import { API_URL } from './api';
import { showToast } from './toast';

function KelolaStaff({ token }) {
  const [staffList, setStaffList] = useState([]);
  const [cabangList, setCabangList] = useState([]);
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('kasir');
  const [storeId, setStoreId] = useState('');
  const [pindahCabangValues, setPindahCabangValues] = useState({}); // { [staffId]: storeIdTujuan }
  const [savingPindahId, setSavingPindahId] = useState(null);

  const muatStaff = () => {
    fetch(`${API_URL}/api/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        setStaffList(data);
        const initial = {};
        for (const s of data) {
          if (s.role !== 'owner') initial[s.id] = String(s.store_id || '');
        }
        setPindahCabangValues(initial);
      });
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
    if (!storeId) {
      showToast('Pilih cabang untuk staff ini', 'error');
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
        showToast(data.error || 'Gagal menambah staff', 'error');
        return;
      }
      showToast('Staff berhasil ditambahkan!');
      setNama('');
      setEmail('');
      setPassword('');
      setStoreId('');
      muatStaff();
    } catch (err) {
      showToast('Tidak bisa terhubung ke server', 'error');
    }
  };

  const pindahkanCabang = async (staff) => {
    const tujuan = pindahCabangValues[staff.id];
    if (!tujuan || Number(tujuan) === staff.store_id) {
      showToast('Pilih cabang yang berbeda dari cabang saat ini', 'error');
      return;
    }
    setSavingPindahId(staff.id);
    try {
      const res = await fetch(`${API_URL}/api/users/${staff.id}/cabang`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ store_id: Number(tujuan) }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Gagal memindahkan cabang', 'error');
        return;
      }
      showToast(`${staff.nama} berhasil dipindahkan ke cabang baru!`);
      muatStaff();
    } catch (err) {
      showToast('Tidak bisa terhubung ke server', 'error');
    } finally {
      setSavingPindahId(null);
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
      </div>

      <div className="card">
        <h2 className="card-title">Daftar Staff</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Nama</th><th>Email</th><th>Role</th><th>Cabang Saat Ini</th><th style={{ minWidth: '260px' }}>Pindah Cabang</th></tr></thead>
            <tbody>
              {staffList.map((s) => (
                <tr key={s.id}>
                  <td>{s.nama}</td>
                  <td>{s.email}</td>
                  <td><span className={`badge badge-${s.role}`}>{s.role}</span></td>
                  <td>{s.nama_toko || '-'}</td>
                  <td>
                    {s.role === 'owner' ? (
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Owner akses semua cabang</span>
                    ) : (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <select
                          className="input"
                          style={{ width: 'auto' }}
                          value={pindahCabangValues[s.id] || ''}
                          onChange={(e) => setPindahCabangValues((prev) => ({ ...prev, [s.id]: e.target.value }))}
                        >
                          {cabangList.map((c) => (
                            <option key={c.id} value={c.id}>{c.nama_toko}</option>
                          ))}
                        </select>
                        <button
                          className="btn btn-secondary btn-sm"
                          disabled={savingPindahId === s.id}
                          onClick={() => pindahkanCabang(s)}
                        >
                          {savingPindahId === s.id ? 'Memindahkan...' : 'Pindahkan'}
                        </button>
                      </div>
                    )}
                  </td>
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