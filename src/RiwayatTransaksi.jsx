import { useState, useEffect } from 'react';
import { API_URL } from './api';

function RiwayatTransaksi({ token }) {
  const [transaksiList, setTransaksiList] = useState([]);
  const [detailTransaksi, setDetailTransaksi] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/transactions`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setTransaksiList);
  }, [token]);

  const lihatDetail = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDetailTransaksi(data);
    } catch (err) {
      alert('Gagal mengambil detail transaksi');
    } finally {
      setLoading(false);
    }
  };

  const formatTanggal = (isoString) => {
    return new Date(isoString).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
  };

  if (detailTransaksi) {
    return (
      <div>
        <button onClick={() => setDetailTransaksi(null)} style={{ marginBottom: '1rem' }}>
          ← Kembali ke Daftar
        </button>
        <h3>Detail Transaksi #{detailTransaksi.transaksi.id}</h3>
        <p>Tanggal: {formatTanggal(detailTransaksi.transaksi.created_at)}</p>
        <p>Kasir: {detailTransaksi.transaksi.nama_kasir}</p>
        {detailTransaksi.transaksi.no_meja && <p>No. Meja: {detailTransaksi.transaksi.no_meja}</p>}
        {detailTransaksi.transaksi.catatan && <p>Catatan: {detailTransaksi.transaksi.catatan}</p>}

        <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr><th>Produk</th><th>Qty</th><th>Harga Satuan</th><th>Subtotal</th></tr>
          </thead>
          <tbody>
            {detailTransaksi.items.map((item) => (
              <tr key={item.id}>
                <td>{item.nama_produk}</td>
                <td>{item.qty}</td>
                <td>Rp {Number(item.harga_saat_jual).toLocaleString('id-ID')}</td>
                <td>Rp {(item.qty * item.harga_saat_jual).toLocaleString('id-ID')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 style={{ marginTop: '1rem' }}>
          Total: Rp {Number(detailTransaksi.transaksi.total).toLocaleString('id-ID')}
        </h3>
      </div>
    );
  }

  return (
    <div>
      <h3>Riwayat Transaksi</h3>
      {transaksiList.length === 0 ? (
        <p>Belum ada transaksi.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr><th>ID</th><th>Tanggal</th><th>Kasir</th><th>Total</th><th></th></tr>
          </thead>
          <tbody>
            {transaksiList.map((t) => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>{formatTanggal(t.created_at)}</td>
                <td>{t.nama_kasir}</td>
                <td>Rp {Number(t.total).toLocaleString('id-ID')}</td>
                <td>
                  <button onClick={() => lihatDetail(t.id)} disabled={loading}>
                    Lihat Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default RiwayatTransaksi;