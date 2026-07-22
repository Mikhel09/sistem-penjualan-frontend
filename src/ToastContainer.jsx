import { useState, useEffect, useRef } from 'react';

function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  useEffect(() => {
    const handler = (e) => {
      const id = idRef.current++;
      const toast = { id, ...e.detail };
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    };
    window.addEventListener('app-toast', handler);
    return () => window.removeEventListener('app-toast', handler);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className={`toast-item toast-${t.tipe}`}>
          {t.tipe === 'sukses' ? '✓' : '✕'} {t.pesan}
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;