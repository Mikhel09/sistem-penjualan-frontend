import { useState } from 'react';

function PhotoGalleryModal({ fotos, judul, onTutup }) {
  const [index, setIndex] = useState(0);
  if (!fotos || fotos.length === 0) return null;

  const prev = () => setIndex((i) => (i === 0 ? fotos.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === fotos.length - 1 ? 0 : i + 1));

  return (
    <div className="modal-overlay" onClick={onTutup}>
      <div className="modal-card" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>{judul}</h3>
          <button className="btn btn-secondary btn-sm" onClick={onTutup}>Tutup</button>
        </div>
        <div className="gallery-main" style={{ marginTop: '1rem', position: 'relative' }}>
          <img src={fotos[index]} alt={`Foto ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          {fotos.length > 1 && (
            <>
              <button className="btn btn-secondary btn-sm" style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }} onClick={prev}>‹</button>
              <button className="btn btn-secondary btn-sm" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }} onClick={next}>›</button>
            </>
          )}
        </div>
        {fotos.length > 1 && (
          <div className="gallery-thumbs">
            {fotos.map((f, i) => (
              <div key={i} className={`gallery-thumb ${i === index ? 'active' : ''}`} onClick={() => setIndex(i)}>
                <img src={f} alt={`Thumb ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PhotoGalleryModal;