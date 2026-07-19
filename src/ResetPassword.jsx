import { useState } from 'react';
import { API_URL } from './api';

function ResetPassword({ token }) {
  const [password, setPassword] = useState('');
  const [konfirmasiPassword, setKonfirmasiPassword] = useState('');
  const [message, setMessage] = useState('');
  const [berhasil, setBerhasil] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (password !== konfirmasiPassword) {
      setMessage('Konfirmasi password tidak cocok');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password_baru: password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || 'Gagal reset password');
        return;
      }
      setMessage(data.message);
      setBerhasil(true);
    } catch (err) {
      setMessage('Tidak bisa terhubung ke server');
    }
  };

  if (berhasil) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '320px' }}>
        <p>{message}</p>
        <a href="/">Kembali ke halaman login</a>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '320px' }}>
      <h2>Buat Password Baru</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Password baru"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '1rem' }}
          required
        />
        <input
          type="password"
          placeholder="Konfirmasi password baru"
          value={konfirmasiPassword}
          onChange={(e) => setKonfirmasiPassword(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '1rem' }}
          required
        />
        <button type="submit" style={{ width: '100%', padding: '8px' }}>Simpan Password Baru</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default ResetPassword;