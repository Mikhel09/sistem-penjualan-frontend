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
      <h3>Daftarkan Pelanggan Baru</h3>
      <form onSubmit={handleSubmit} style={{ maxWidth: '300px', marginBottom: '2rem' }}>
        <input placeholder="Nama" value={nama} onChange={(e) => setNama(e.target.value)} required style={{ width: '100%', padding: '6px', marginBottom: '8px' }} />
        <input placeholder="Nomor Telepon" value={telepon} onChange={(e) => setTelepon(e.target.value)} required style={{ width: '100%', padding: '6px', marginBottom: '8px' }} />
        <button type="submit" style={{ padding: '8px 16px' }}>Daftarkan</button>
      </form>
      {message && <p>{message}</p>}

      <h3>Daftar Pelanggan</h3>
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
        <thead><tr><th>Nama</th><th>Telepon</th><th>Poin</th></tr></thead>
        <tbody>
          {pelangganList.map((c) => (
            <tr key={c.id}><td>{c.nama}</td><td>{c.telepon}</td><td>{c.poin}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Pelanggan;