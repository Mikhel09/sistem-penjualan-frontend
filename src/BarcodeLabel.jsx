import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

function BarcodeLabel({ kode, judul, subJudul, onTutup }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (svgRef.current && kode) {
      JsBarcode(svgRef.current, kode, {
        format: 'CODE128',
        width: 2,
        height: 60,
        fontSize: 14,
        margin: 10,
      });
    }
  }, [kode]);

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '340px' }}>
        <div className="area-cetak" style={{ textAlign: 'center', padding: '1rem', background: 'white' }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: 600, fontSize: '0.85rem' }}>{judul}</p>
          {subJudul && <p style={{ margin: '0 0 6px 0', fontSize: '0.75rem', color: '#666' }}>{subJudul}</p>}
          <svg ref={svgRef}></svg>
        </div>
        <div className="no-print" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-primary" onClick={() => window.print()}>Cetak Label</button>
          <button className="btn btn-secondary" onClick={onTutup}>Tutup</button>
        </div>
      </div>
    </div>
  );
}

export default BarcodeLabel;