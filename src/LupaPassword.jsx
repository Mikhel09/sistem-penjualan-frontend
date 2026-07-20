import { useState } from 'react';
import { API_URL } from './api';

function LupaPassword({ onKembali }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/api/auth/lupa-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMessage(data.message || data.error);
    } catch (err) {
      setMessage('Tidak bisa terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">SP</div>
        <h1 className="auth-title">Lupa Password</h1>
        <p className="auth-subtitle">Masukkan email akunmu, kami kirim link untuk membuat password baru.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="input"
              placeholder="nama@bisnis.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Mengirim...' : 'Kirim Link Reset'}
          </button>
        </form>

        {message && <div className="alert alert-success" style={{ marginTop: '1rem' }}>{message}</div>}

        <div className="auth-link-row">
          <button className="auth-link" onClick={onKembali}>← Kembali ke Login</button>
        </div>
      </div>
    </div>
  );
}

export default LupaPassword;