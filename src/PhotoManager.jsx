import { resizeGambar } from './imageUtils';
import { showToast } from './toast';

function PhotoManager({ fotos, onChange, maxFotos = 6 }) {
  const tambahFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (fotos.length >= maxFotos) {
      showToast(`Maksimal ${maxFotos} foto`, 'error');
      e.target.value = '';
      return;
    }
    try {
      const dataUrl = await resizeGambar(file, 500);
      onChange([...fotos, dataUrl]);
    } catch (err) {
      showToast('Gagal memproses foto', 'error');
    }
    e.target.value = '';
  };

  const hapusFoto = (index) => {
    onChange(fotos.filter((_, i) => i !== index));
  };

  return (
    <div className="photo-thumb-grid">
      {fotos.map((f, i) => (
        <div key={i} className="photo-thumb">
          <img src={f} alt={`Foto ${i + 1}`} />
          <button type="button" className="photo-thumb-remove" onClick={() => hapusFoto(i)}>✕</button>
        </div>
      ))}
      {fotos.length < maxFotos && (
        <label className="photo-add-tile">
          +
          <input type="file" accept="image/*" onChange={tambahFoto} />
        </label>
      )}
    </div>
  );
}

export default PhotoManager;