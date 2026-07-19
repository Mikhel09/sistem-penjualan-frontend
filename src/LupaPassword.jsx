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
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '320px' }}>
      <h2>Lupa Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '1rem' }}
          required
        />
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '8px' }}>
          {loading ? 'Mengirim...' : 'Kirim Link Reset'}
        </button>
      </form>
      {message && <p>{message}</p>}
      <button onClick={onKembali} style={{ marginTop: '1rem' }}>← Kembali ke Login</button>
    </div>
  );
}

export default LupaPassword;