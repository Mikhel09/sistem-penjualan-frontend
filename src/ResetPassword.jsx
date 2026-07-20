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

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">SP</div>
        <h1 className="auth-title">Buat Password Baru</h1>

        {berhasil ? (
          <>
            <div className="alert alert-success">{message}</div>
            <div className="auth-link-row">
              <a href="/" className="auth-link">Kembali ke halaman login</a>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Password Baru</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Konfirmasi Password</label>
              <input
                type="password"
                className="input"
                value={konfirmasiPassword}
                onChange={(e) => setKonfirmasiPassword(e.target.value)}
                required
              />
            </div>
            {message && <div className="alert alert-error">{message}</div>}
            <button type="submit" className="btn btn-primary btn-block">Simpan Password Baru</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;