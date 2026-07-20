import { useState, useEffect } from 'react';
import { API_URL } from './api';

function RiwayatTransaksi({ token }) {
  const [transaksiList, setTransaksiList] = useState([]);
  const [detailTransaksi, setDetailTransaksi] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/transactions`, { headers: { Authorization: `Bearer ${token}` } })
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

  const formatTanggal = (isoString) =>
    new Date(isoString).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

  if (detailTransaksi) {
    return (
      <div className="card" style={{ maxWidth: '520px' }}>
        <button className="btn btn-secondary btn-sm" style={{ marginBottom: '1rem' }} onClick={() => setDetailTransaksi(null)}>
          ← Kembali ke Daftar
        </button>
        <h2 className="card-title">Transaksi #{detailTransaksi.transaksi.id}</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '2px 0' }}>
          {formatTanggal(detailTransaksi.transaksi.created_at)}
        </p>
        <p style={{ fontSize: '0.85rem', margin: '2px 0' }}>Kasir: {detailTransaksi.transaksi.nama_kasir}</p>
        <p style={{ fontSize: '0.85rem', margin: '2px 0' }}>Cabang: {detailTransaksi.transaksi.nama_toko}</p>
        <p style={{ fontSize: '0.85rem', margin: '2px 0' }}>Metode Bayar: {detailTransaksi.transaksi.payment_method?.toUpperCase()}</p>
        {detailTransaksi.transaksi.nama_pelanggan && (
          <p style={{ fontSize: '0.85rem', margin: '2px 0' }}>Pelanggan: {detailTransaksi.transaksi.nama_pelanggan}</p>
        )}
        {detailTransaksi.transaksi.no_meja && <p style={{ fontSize: '0.85rem', margin: '2px 0' }}>No. Meja: {detailTransaksi.transaksi.no_meja}</p>}
        {detailTransaksi.transaksi.catatan && <p style={{ fontSize: '0.85rem', margin: '2px 0' }}>Catatan: {detailTransaksi.transaksi.catatan}</p>}

        <div className="table-wrap" style={{ marginTop: '1rem' }}>
          <table className="data-table">
            <thead>
              <tr><th>Produk</th><th>Qty</th><th>Harga</th><th>Subtotal</th></tr>
            </thead>
            <tbody>
              {detailTransaksi.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.nama_produk}</td>
                  <td className="num">{item.qty}</td>
                  <td className="num">Rp {Number(item.harga_saat_jual).toLocaleString('id-ID')}</td>
                  <td className="num">Rp {(item.qty * item.harga_saat_jual).toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="cart-total-row" style={{ marginTop: '1rem' }}>
          <span>Total</span>
          <span>Rp {Number(detailTransaksi.transaksi.total).toLocaleString('id-ID')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="page-header">
        <div>
          <h2 className="page-title">Riwayat Transaksi</h2>
          <p className="page-desc">{transaksiList.length} transaksi tercatat</p>
        </div>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>ID</th><th>Tanggal</th><th>Kasir</th><th>Cabang</th><th>Total</th><th></th></tr>
          </thead>
          <tbody>
            {transaksiList.map((t) => (
              <tr key={t.id}>
                <td>#{t.id}</td>
                <td>{formatTanggal(t.created_at)}</td>
                <td>{t.nama_kasir}</td>
                <td>{t.nama_toko}</td>
                <td className="num">Rp {Number(t.total).toLocaleString('id-ID')}</td>
                <td>
                  <button className="btn btn-secondary btn-sm" onClick={() => lihatDetail(t.id)} disabled={loading}>
                    Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {transaksiList.length === 0 && <div className="empty-state">Belum ada transaksi.</div>}
      </div>
    </div>
  );
}

export default RiwayatTransaksi;