import { useState, useEffect, Fragment } from 'react';
import { API_URL } from './api';
import { showToast } from './toast';

const DAFTAR_IZIN = [
  { key: 'kelola_produk', label: 'Kelola Produk', desc: 'Tambah, edit, hapus produk & varian' },
  { key: 'kelola_stok', label: 'Kelola Stok', desc: 'Restock, koreksi stok, kelola supplier' },
  { key: 'lihat_laporan', label: 'Lihat Laporan', desc: 'Akses laporan penjualan & grafik' },
  { key: 'kelola_staff', label: 'Kelola Staff (khusus Admin)', desc: 'Tambah & atur izin akun kasir' },
];

function KelolaStaff({ token, viewerRole }) {
  const [staffList, setStaffList] = useState([]);
  const [cabangList, setCabangList] = useState([]);
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('kasir');
  const [storeId, setStoreId] = useState('');
  const [pindahCabangValues, setPindahCabangValues] = useState({});
  const [savingPindahId, setSavingPindahId] = useState(null);
  const [izinDibuka, setIzinDibuka] = useState(null);
  const [izinValues, setIzinValues] = useState({});
  const [savingIzinId, setSavingIzinId] = useState(null);

  const isOwner = viewerRole === 'owner';

  const muatStaff = () => {
  fetch(`${API_URL}/api/users`, { headers: { Authorization: `Bearer ${token}` } })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Anda tidak memiliki akses ke halaman ini', 'error');
        setStaffList([]);
        return;
      }
      setStaffList(data);
      const initialCabang = {};
      const initialIzin = {};
      for (const s of data) {
        if (s.role !== 'owner') {
          initialCabang[s.id] = String(s.store_id || '');
          initialIzin[s.id] = s.permissions || {};
        }
      }
      setPindahCabangValues(initialCabang);
      setIzinValues(initialIzin);
    })
    .catch(() => showToast('Tidak bisa terhubung ke server', 'error'));
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
        body: JSON.stringify({ nama, email, password, role: isOwner ? role : 'kasir', store_id: Number(storeId) }),
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

  const toggleIzin = (staffId, key) => {
    setIzinValues((prev) => ({
      ...prev,
      [staffId]: { ...prev[staffId], [key]: !prev[staffId]?.[key] },
    }));
  };

  const simpanIzin = async (staff) => {
    setSavingIzinId(staff.id);
    try {
      const res = await fetch(`${API_URL}/api/users/${staff.id}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ permissions: izinValues[staff.id] || {} }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Gagal menyimpan izin', 'error');
        return;
      }
      showToast(`Izin akses ${staff.nama} berhasil diperbarui!`);
      muatStaff();
    } catch (err) {
      showToast('Tidak bisa terhubung ke server', 'error');
    } finally {
      setSavingIzinId(null);
    }
  };

  return (
    <div>
      <div className="card" style={{ maxWidth: '420px' }}>
        <h2 className="card-title">Tambah Staff Baru</h2>
        {!isOwner && (
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '-8px' }}>
            Sebagai Admin, staff yang kamu tambahkan otomatis berperan sebagai Kasir.
          </p>
        )}
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
            {isOwner && (
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Role</label>
                <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="kasir">Kasir</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}
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
        <h2 className="card-title">Daftar Staff {!isOwner && '(Kasir)'}</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Nama</th><th>Email</th><th>Role</th><th>Cabang Saat Ini</th><th style={{ minWidth: '260px' }}>Pindah Cabang</th><th></th></tr></thead>
            <tbody>
              {staffList.map((s) => (
                <Fragment key={s.id}>
                  <tr>
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
                    <td>
                      {(s.role === 'admin' || s.role === 'kasir') && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setIzinDibuka(izinDibuka === s.id ? null : s.id)}
                        >
                          {izinDibuka === s.id ? 'Tutup Izin' : '🔐 Atur Izin'}
                        </button>
                      )}
                    </td>
                  </tr>
                  {izinDibuka === s.id && (
                    <tr>
                      <td colSpan={6} style={{ background: 'var(--color-bg)' }}>
                        <div style={{ padding: '0.85rem' }}>
                          <strong style={{ fontSize: '0.82rem' }}>Izin Akses untuk {s.nama}</strong>
                          <div className="permission-row" style={{ marginTop: '0.6rem', marginBottom: '0.75rem' }}>
                            {DAFTAR_IZIN.filter((izin) => izin.key !== 'kelola_staff' || s.role === 'admin').map((izin) => (
                              <label key={izin.key} title={izin.desc}>
                                <input
                                  type="checkbox"
                                  checked={!!izinValues[s.id]?.[izin.key]}
                                  onChange={() => toggleIzin(s.id, izin.key)}
                                />
                                {izin.label}
                                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>({izin.desc})</span>
                              </label>
                            ))}
                          </div>
                          <button
                            className="btn btn-primary btn-sm"
                            disabled={savingIzinId === s.id}
                            onClick={() => simpanIzin(s)}
                          >
                            {savingIzinId === s.id ? 'Menyimpan...' : 'Simpan Izin'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
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