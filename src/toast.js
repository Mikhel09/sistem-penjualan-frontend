// Fungsi ini bisa dipanggil dari file manapun: showToast('Pesan sukses') atau showToast('Pesan error', 'error')
export function showToast(pesan, tipe = 'sukses') {
  window.dispatchEvent(new CustomEvent('app-toast', { detail: { pesan, tipe } }));
}