import { useState, useEffect } from 'react';
import { API_URL } from './api';

function KelolaCabang({ token }) {
  const [cabangList, setCabangList] = useState([]);
  const [namaToko, setNamaToko] = useState('');
  const [alamat, setAlamat] = useState('');
  const [message, setMessage] = useState('');

  const muatCabang = () => {
    fetch(`${API_URL}/api/stores`, {
      headers: { Authorization: `Bearer ${token}` },
    })
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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
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
      <h3>Tambah Cabang Baru</h3>
      <form onSubmit={handleSubmit} style={{ maxWidth: '320px', marginBottom: '2rem' }}>
        <input
          placeholder="Nama Toko/Cabang"
          value={namaToko}
          onChange={(e) => setNamaToko(e.target.value)}
          required
          style={{ width: '100%', padding: '6px', marginBottom: '8px' }}
        />
        <input
          placeholder="Alamat (opsional)"
          value={alamat}
          onChange={(e) => setAlamat(e.target.value)}
          style={{ width: '100%', padding: '6px', marginBottom: '8px' }}
        />
        <button type="submit" style={{ padding: '8px 16px' }}>Tambah Cabang</button>
      </form>
      {message && <p>{message}</p>}

      <h3>Daftar Cabang</h3>
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
        <thead><tr><th>Nama Toko</th><th>Alamat</th></tr></thead>
        <tbody>
          {cabangList.map((c) => (
            <tr key={c.id}><td>{c.nama_toko}</td><td>{c.alamat || '-'}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default KelolaCabang;